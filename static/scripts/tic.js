

async function updateCookiesTic(container){
	let inputAnalytic = container.getElementsByClassName("analytic")[0];
	let inputEssential = container.getElementsByClassName("essential")[0];
	let acceptedAnalytics = "denied";
    	if (inputAnalytic.checked === true){
        	acceptedAnalytics = "granted";
        	consentAnalytics()
    	}
	console.log(inputAnalytic.checked, inputEssential.checked);
	let r = await fetch("/accept-cookies", {
		method:"POST",
		headers: {
			"content-type": "application/json",
		},
		body: JSON.stringify({ 
			"cookies": {
          			'ad_storage': 'denied',
          			'ad_user_data': 'denied',
          			'ad_personalization': 'denied',
          			'analytics_storage': acceptedAnalytics,
        		},
			"essential": inputEssential.checked,
		})
	});
	location.reload();

}

window.addEventListener("load", () => {
	//document.documentElement.scrollTo({top:0});
})
