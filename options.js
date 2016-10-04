var calendars = [];

function getCalendarList(){
	chrome.identity.getAuthToken( { 'interactive': true }, function(token){
		$.ajax({
			url: 'https://www.googleapis.com/calendar/v3/users/me/calendarList',
			type: 'GET',
			headers: { 'Authorization': 'Bearer ' + token },
			beforeSend: function(){
				$("#setCalendarIDButton").val( "Getting calendars..." );
			},
			success: function( resp ){
				$("#setCalendarIDButton").val( "Set Selected Calendar" );
				$("#calendarList").html("");
				for ( item of resp.items ){
					calendars.push( { summary:item.summary,id:item.id } );
					$("#calendarList").append( "<input type='radio' class='calRadio' summary='" + item.summary + "'></input>" + item.summary + "<br>" );
				}
				$("#changeCalendar").append( "<div id='cancelButton'><input type='button' value='Cancel'></input></div>" );
				$(".calRadio").click( function(){
					for ( r of $(".calRadio" ) ){
						if ( r == this ) r.checked = true;
						else r.checked = false;
					}
				});
				$("#cancelButton").click( function(){
					$("#changeCalendarIDButton").css( { display:'initial' } );
					$("#setCalendarIDButton").css( { display:'none' } );
					$("#calendarList").html( "" );
					calendars = [];
					this.remove();
				});
			},
			error: function( resp ){
				console.error( resp );
			}
		});
	});
}

function handleCalendarIDChangeButtonClick(){
	$("#changeCalendarIDButton").css( { display:'none' } );
	$("#setCalendarIDButton").css( { display:'initial' } );
	getCalendarList();
}

function getIDFromSummary( summary ){
	for ( c of calendars ){
		if ( c.summary == summary )
			return c.id;
	}	
	return null;
}

function getSelectedCalendarID(){
	for ( r of $(".calRadio" ) ){
		if ( r.checked )
			return getIDFromSummary( r.getAttribute( "summary" ) );
	}
	return null;
}

function handleSetCalendarIDButtonClick(){
	var id = getSelectedCalendarID();
	if ( id ){
		chrome.storage.local.set( { calendarID: id }, function(){
			$("#changeCalendarIDButton").css( { display: 'inline' } );
			$("#setCalendarIDButton").css( { display: 'none' } );
			$("#calendarList").html( "" );
			$("#calendarID").html( id );
			$("#deleteCalendar").css( { 'display': 'inline' } );
			$("#cancelButton").remove();
			calendars = [];
		});
	}
	else
		console.error( "Problem getting the selected calendar" );
}

function deleteCalendarButtonClick(){
	chrome.storage.local.remove( "calendarID", function(){
		$("#calendarID").html( "Calendar has not been set." );
		$("#deleteCalendar").css( { 'display': 'none' } );
	});
}

window.onload = function(){
	$("#changeCalendarIDButton").click( handleCalendarIDChangeButtonClick );
	$("#setCalendarIDButton").click( handleSetCalendarIDButtonClick );
	$("#deleteCalendarButton").click( deleteCalendarButtonClick );
	
	chrome.storage.local.get( "calendarID", function(items){
		if ( items.calendarID ){
			$("#calendarID").html( items.calendarID );
			$("#deleteCalendar").css( { 'display': 'inline' } );
		}
		else{
			$("#calendarID").html( "Calendar has not been set." );
			$("#deleteCalendar").css( { 'display': 'none' } );
		}
	});
}