var page = document.location.pathname.toLowerCase();
window.teamName = null;
window.teamMembers = null;

window.showFilters = showFilters;
window.copyToClipboard = copyToClipboard;
window.startRefreshTimer = startRefreshTimer;
window.inc_loadFilter = inc_loadFilter;


switch (page){
	case "/login_locate_sso.do":
		buildLoginPage();
		break;
	case "/common/site/signin.aspx":
		window.location.replace("https://iaas.service-now.com/login_locate_sso.do");
		break;
	case "/navpage.do":
		window.location.replace("https://iaas.service-now.com/sourceSSO_nav.do");
		break;
	case "/incidents/incidentmanagement.aspx":
		makeResolverGreatAgain();
}

function buildLoginPage(){
	var ccLogo = document.createElement("div");
	ccLogo.id = "newLogoDiv";
	var reference = document.getElementById('loginPage').firstChild.firstChild.firstChild.firstChild;
	reference.appendChild(ccLogo);
	var style = `
		table tbody tr:last-of-type > td {
			display: none;
		}
		div#page_timing_div {
			display: none;
		}
		#loginPage table{
			margin: 0 auto;
		}
		#newLogoDiv{
			background-image: url('6669f0ac0f05a200fd92ed1be1050ea0.iix');
			height: 50px;
			width: auto;
			background-size: contain;
			background-repeat: no-repeat;
			margin-bottom: 5px;
		}
	`
	var stylesheet = document.createElement("style");
	stylesheet.type = "text/css"
	stylesheet.innerText = style;
	document.head.appendChild(stylesheet);
}

function makeResolverGreatAgain(){
		document.getElementById('lnkResolver').innerHTML = "Resolver&#10133;";
        document.getElementById('search_filter_title').parentElement.innerHTML += "<input type=\"button\" style=\"display: none; margin-right: 10px;\" name=\"addFilterButton\" value=\"Add Filter\" onclick=\"$('#addFilterWindow').data('kendoWindow').open();\" id=\"addFilterButton\" class=\"k-button\"><input type=\"button\" name=\"showFilterButton\" value=\"Show Filters\" onclick=\"showFilters();\" id=\"showFilterButton\" class=\"k-button\"><input type=\"button\" style=\"margin-left: 5px;\" name=\"refreshButton\" value=\"Refresh\" onclick=\"refresh();\" id=\"refreshButton\" class=\"k-button\"><input id=\"enableRefresh\" type=\"checkbox\"><label for=\"enableRefresh\">Auto-refresh values every </label><input id=\"refreshMinutes\" type=\"number\" min=\"3\" value=\"5\"><label for=\"refreshMinutes\"> minutes.</label> <input type=\"button\" onclick=\"startRefreshTimer();\" value=\"Submit\">";
        $('#panelbar-leftnav').append('<li id="liMyTeam" class="k-item k-state-default" role="menuitem"><span class="k-link k-header">My Team</span><ul id="inc_leftnav_savedFilters" class="leftnavSavedFilters leftnavSavedTeam k-group k-panel" role="group"></li>')

		getTeamName();
		getTeamMembers();
        ticketCount();
        document.getElementById('lblIncident').outerHTML += "<input type=\"button\" style=\"margin-left: 5px;\" name=\"copyTicketButton\" value=\"Copy\" onclick=\"copyToClipboard(IncidentNumber);\" id=\"copyTicketButton\" class=\"Button\">";
}

function getTeamName(){
	var requestBody = "{\"take\":1,\"skip\":0,\"page\":1,\"pageSize\":1,\"sort\":[{\"field\":\"number\",\"dir\":\"asc\"}],\"filter\":{\"logic\":\"and\",\"filters\":[{\"field\":\"listtype\",\"operator\":\"=\",\"value\":\"myincidents\"}]},\"choiceListSelections\":\"\"}";
	    
	$.ajax({
        type: "POST",
        contentType: "application/json; charset=utf-8",
        async: true,
        data: requestBody,
        url: "https://support.compucom.com/Incidents/WebMethods/IncidentWS.asmx/getIncidentLite_SaveLastAppliedFilters",
        error: function(){
			console.log("unable to obtain teamname");
        },
        success: function(data){
           teamName = data.d.Data.Items[0].assignment_group;
		   AskInfo('A|'+data.d.Data.Items[0].number);
        }
    });
}

function getTeamMembers(){
	var requestBody = "{\"company\":\""+COMPANY+"\",\"take\":10,\"skip\":0,\"page\":1,\"pageSize\":10,\"sort\":[{\"field\":\"user.last_name\",\"dir\":\"asc\"}],\"filter\":{\"logic\":\"and\",\"filters\":[{\"field\":\"group.name\",\"operator\":\"=\",\"value\":\""+teamName+"\",\"logic\":\"\"},{\"field\":\"user\",\"operator\":\"LIKE\",\"value\":\"\",\"logic\":\"\"}]}}";
	
	$.ajax({
        type: "POST",
        contentType: "application/json; charset=utf-8",
        async: true,
        data: requestBody,
        url: "https://support.compucom.com/SNDataEntities/SNGroupMember/WebMethods/SNGroupMemberWS.asmx/getGroupMember",
        error: function(){
			console.log("unable to obtain team members");
        },
        success: function(data){
			$.each(data.d.Data.Items, function(){});
        }
    });
	
}
// *****************************************************************************
function inc_loadFilter(strFilters, filtername, additionaldata) {
	objFilter = JSON.parse(strFilters);

	var objSort = null;
	try {
		objSort = JSON.parse(JSON.parse(additionaldata).sort); //eg of additionaldata: {sort:[{field:"category",dir:"asc"}], xyz:[{a:"b"},{c:"d"}]}
	} catch (e) {
		objSort = null;
	}

	//$("#incident_grid").data("kendoGrid").dataSource.filter(objFilter);  //!!!
	queryGridDataSource("incident_grid", objFilter, objSort);

	$.publish('incidents/filterWindow/AddFilterButtons');
	$.publish('incidents/searchFilter/setSearchFilterTitle', [filtername]);
	$.publish('incidents/filterWindow/setFilteredListItemColor', ['green']);
	var addFilterWindow = $("#addFilterWindow");
	if (addFilterWindow.is(":visible")) addFilterWindow.data("kendoWindow").close();
	//inc_setListTypeStyle(objFilter.filters);
}
//***********************************************************************************


function showFilters(){
  if(document.getElementById('filterButtons').style.display == "" || document.getElementById('filterButtons').style.display == "none"){
    document.getElementById('filterButtons').style.display = "inline";
    document.getElementById('addFilterButton').style.display = "inline";
    document.getElementById('showFilterButton').value = "Hide Filters";
  }else{
    document.getElementById('filterButtons').style.display = "none";
    document.getElementById('addFilterButton').style.display = "none";
    document.getElementById('showFilterButton').value = "Show Filters";
  }
}

function copyToClipboard(text){
    var dummy = document.createElement("input");
    document.body.appendChild(dummy);
    dummy.setAttribute('value', text);
    dummy.select();
    document.execCommand("copy");
    document.body.removeChild(dummy);
}

function startRefreshTimer(){
    if($('#enableRefresh')[0].value="off" && window.refreshTimer != 0){
        clearInterval(window.refreshTimer);
        window.refreshTimer = 0;
    }else if($('#enableRefresh')[0].value="on" && window.refreshTimer != 0){
        clearInterval(window.refreshTimer);
        var time = $('#refreshMinutes')[0].valueAsNumber;
        var mins = time * 60000;
        window.refreshTimer = setInterval(function(){
            refresh();
        },mins);
    }else{
        var time = $('#refreshMinutes')[0].valueAsNumber;
        var mins = time * 60000;
        window.refreshTimer = setInterval(function(){
            refresh();
        },mins);
    }
}