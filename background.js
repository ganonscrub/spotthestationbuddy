var URLs = {
	calendarList: 'https://www.googleapis.com/calendar/v3/users/me/calendarList',
	addEvent: 'https://www.googleapis.com/calendar/v3/calendars/{calendarID}/events/'
};

function goToWebpage(){
	chrome.storage.local.get( [ "country", "region", "city" ], function( items ) {
		if ( items.country && items.region && items.city ){
			var URL = "https://spotthestation.nasa.gov/sightings/view.cfm?";
			URL += "country=" + items.country + "&region=" +
				items.region + "&city=" + items.city;
			chrome.tabs.create( { url: URL } );
		}
		else{
			chrome.tabs.create( { url: 'http://spotthestation.nasa.gov/' } );
		}
	});
}

function addEvent( queryData ){
	chrome.storage.local.get( "calendarID", function( item ){
		if ( item.calendarID ){
			chrome.identity.getAuthToken( { 'interactive': true }, function(token){
				$.ajax({
					url: URLs.addEvent.replace( "{calendarID}", item.calendarID ),
					type: 'POST',
					data: queryData.data,
					contentType: 'application/json; charset=utf-8',
					dataType: 'json',
					headers: { 'Authorization': 'Bearer ' + token },
					success: function( response ){
						chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
							chrome.tabs.sendMessage(tabs[0].id, { type: 'addEventSuccess', eventNum: queryData.eventNum }, function(response) {
								//console.log(response.farewell);
							});
						});
					},
					error: function( response ) { console.log( "error:", response ); }
				});
			});
		}
		else{
			chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
				chrome.tabs.sendMessage(tabs[0].id, { type: "addEventFailure", eventNum: queryData.eventNum }, function(response) {
					//console.log(response.farewell);
				});
			});
			console.error( "Couldn't get calendarID" );
		}
	});
}

function openOptionsTab(){
	chrome.tabs.create( { url: 'options.html' } );
}

chrome.browserAction.onClicked.addListener(goToWebpage);

chrome.runtime.onMessage.addListener(
	function( request, sender, sendResponse ) {
		switch ( request.type ){
		case 'addEvent':
			if ( request.data ){
				addEvent( request.data );
				sendResponse( { type: request.type } );
			}
			else
				sendResponse( { type: request.type, error: 'No data property supplied in request' } );
			break;
		case 'openOptionsTab':
			openOptionsTab();
			break;
		default:
			sendResponse( { type: request.type, error: 'Unhandled request type given' } );
		}
	}
);