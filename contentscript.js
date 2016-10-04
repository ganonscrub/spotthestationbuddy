var ImageURLs = {
	upload_before: chrome.extension.getURL( "images/upload_before.png" ),
	upload_during: chrome.extension.getURL( "images/upload_during.gif" ),
	upload_after: chrome.extension.getURL( "images/upload_after.png" )
};

var PageEvents = [];
var PendingEvents = [];

function handleButtonClick(){
	var num = parseInt( this.id.replace( "stsb", '' ) );
	var data = { data: JSON.stringify( eventToGoogleEvent( PageEvents[num] ) ), eventNum: num };
	chrome.runtime.sendMessage( { 'data': data, 'type': 'addEvent' }, function(resp){} );
	$("#stsb" + num + " img").attr( "src", ImageURLs.upload_during );
	PendingEvents.push( num );
}

function eventToGoogleEvent( e ){		
	var googleEvent = {
		'summary': 'ISS Sighting',
		'description': e.info,
		'location': 'Lowell, MA 01854',
		'start': {
			'dateTime': e.start,
			'timeZone': 'America/New_York'
		},
		'end': {
			'dateTime': e.end,
			'timeZone': 'America/New_York'
		}
	};
	
	return googleEvent;
}

function addButtons(){
	PageEvents = [];
	var todayDate = new Date();
	var rows = $("table")[0].getElementsByTagName( "tr" );
	for ( var i = 1; i < rows.length; i++ ){
		var columns = rows[i].getElementsByTagName( "td" );
		
		var start = new Date( columns[0].innerHTML );
		start.setYear( todayDate.getYear() + 1900 );
		var end = new Date( columns[0].innerHTML );
		end.setYear( start.getYear() + 1900 );
		end.setMinutes( start.getMinutes() + parseInt( columns[1].innerHTML.replace( '&lt; ', '' ).replace( ' min', '' ) ) );
		
		var maxHeight = columns[2].innerHTML;
		var appears = columns[3].innerHTML;
		var disappears = columns[4].innerHTML;
		
		PageEvents.push( { "start": start.toISOString(), "end": end.toISOString(), "info": "Max height: " + maxHeight + "\nAppears: " + appears + "\nDisappears: " + disappears } );
		
		if ( !document.getElementById( "stsb" + (i-1).toString() ) )
			$(columns[5]).append( "<a id='stsb" + (i-1).toString() + "' class='stsb-button'><img style='margin-left:6px;cursor:pointer' src='" + ImageURLs.upload_before + "' width=14 height=14></a>" );
	}
	
	$(".stsb-button").click( handleButtonClick );
}

$(window).ready( function(){
	addButtons();
});

chrome.runtime.onMessage.addListener(
	function( request, sender, sendResponse ) {
		switch ( request.type ){
		case 'addEventSuccess':
			//console.log( "success of " + request.eventNum );	
			$("#stsb" + request.eventNum + " img").attr( "src", ImageURLs.upload_after );
			PendingEvents.splice( PendingEvents.indexOf( request.eventNum ), 1 );
			break;
		case 'addEventFailure':
			//console.log( "failure of " + request.eventNum );
			break;
		default:
			sendResponse( { type: request.type, error: 'Unhandled request type given' } );
		}
	}
);