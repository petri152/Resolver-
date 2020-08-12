var page = document.location.pathname.toLowerCase();

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
		//big boy page
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