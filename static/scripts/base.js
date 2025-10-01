


let camaleonElements = [];
let imagesToPreload = [];




function print(...args){
    console.log(...args);
}
function imageUrl(bucket, filename){
    return "https://firebasestorage.googleapis.com/v0/b/panson.firebasestorage.app/o/media%2F"+bucket+"%2F"+filename+"?alt=media"
}


function dynamicallyLoadScript(url) {
    let script = document.createElement("script");  // create a script DOM node
    script.src = url;  // set its src to the provided URL
    document.head.appendChild(script);  // add it to the end of the head section of the page (could change 'head' to 'body' to add it to the end of the body section instead)
}
function dynamicallyLoadCSS(url) {
    let css = document.createElement("link");  // create a script DOM node
    css.href = url;  // set its src to the provided URL
    css.rel = "stylesheet";
    document.head.appendChild(css);  // add it to the end of the head section of the page (could change 'head' to 'body' to add it to the end of the body section instead)
}



async function acceptCookies(){
    let acceptedAnalytics = "denied";
    if(document.getElementById("accept-analytics").checked === true){
        acceptedAnalytics = "granted";
        consentAnalytics()
    }
    //console.log(acceptedAnalytics);


	await fetch("/accept-cookies", {
        	method:"POST",
        	headers: {
            		"content-type": "application/json"
        	},
       		body: JSON.stringify({
			"cookies":{
          			'ad_storage': 'denied',
          			'ad_user_data': 'denied',
          			'ad_personalization': 'denied',
          			'analytics_storage': acceptedAnalytics
        		},
			"essential": true,
		})
    	});
	const banner = document.getElementById("cookies");
	banner.style.display = "none";
    //window.location.reload()
}







function showPopup(popupContent, cross=true) {
	console.log("Showing Popup");
    popupContent = popupContent.cloneNode(true);
    popupContent.addEventListener("click", function(event) {event.stopPropagation()});
    popupContent.style.display = "block";
    document.body.style.cursor = undefined;
    hideBackgound(popupContent, cross);
    document.documentElement.style.overflow = "hidden";
    return popupContent
}

function hidePopup(source, sourceElement) {
    let popupContent = undefined;
    if (source == "cross") {
        popupContent = sourceElement.parentElement;
    } else if (source == "backdrop") {
        popupContent = sourceElement.firstChild;
    } else {
        popupContent = source;
    }
    popupContent.style.display = "none";
    let template = document.getElementsByClassName(popupContent.className);
    console.log(template);
    if (template.length === 2) {
        popupContent.parentElement.remove();
        template[0].after(popupContent);
        template[0].remove();
    } else {
        popupContent.parentElement.remove();
        popupContent.remove()
    }

    document.documentElement.style.overflow = "unset";
}

function hideBackgound(popupContent, cross=true) {
    var translucidScreen = document.createElement("div");
    translucidScreen.className = "translucid-screen";
    translucidScreen.setAttribute("onclick","event.preventDefault(hidePopup('backdrop', this))");
    document.documentElement.appendChild(translucidScreen);
    translucidScreen.appendChild(popupContent);
    if (cross) {
        addPopupCross(popupContent);
    }
}
function addPopupCross(popupContent) {
    var cross = document.createElement("button");
    cross.className = "popup-cross";
    cross.innerHTML = "x";
    cross.type = "button";
    cross.setAttribute("onclick","hidePopup('cross', this)")
    popupContent.appendChild(cross);
}








async function loadImages(selection){
    let selectedImages = document.getElementsByClassName(selection+"-image");
    //console.log(selection);
    //console.log(selectedImages);
    let changedImages = 0;
    let changedVideos = 0;
    for (let i = 0; i < selectedImages.length; i++) {
	    try{
            	const url = selectedImages[i].attributes.background.value;
		    //console.log(url.endsWith(".mp4"));
		if (url.includes(".mp4?")){
			try{
			console.log("video: ", url);
                	let videoContainer = document.createElement("video");
			videoContainer.setAttribute("autoplay", "true");
			videoContainer.setAttribute("muted", "true");
			videoContainer.setAttribute("loop", "true");
			videoContainer.setAttribute("disableremoteplayback", "true");
			videoContainer.setAttribute("x-webkit-airplay", "deny");
			videoContainer.setAttribute("disablepictureinpicture", "true");
			videoContainer.classList.add("video");
			videoContainer.src = url;
			selectedImages[i].appendChild(videoContainer);
			changedVideos++;
			} catch(err) {console.log(err)}
		} else {
			//console.log("image: ", url);
            		selectedImages[i].style.backgroundImage = "url('"+url+"')";
	    		imagesToPreload.push(url);
			changedImages++;
		}
		    selectedImages[i].removeAttribute("background");
		    selectedImages.classList.remove(selection-"-image");
	    } catch(err){}
    }
    console.log(" * "+ selection +" images loaded (" + changedImages + ") videos: "+changedVideos);

}

function sourceToSrc(trigger){
	let url = trigger.attributes.srcUrl.value;
	trigger.src = trigger.attributes.srcUrl.value;
}

async function preloadHiddenImages(){
	console.log(" * Preloading "+imagesToPreload.length+" images");
	for (let i = 0; i < imagesToPreload.length; i++){
		newImage = document.createElement("img");
		newImage.classList.add("hidden");
		newImage.zIndex = "-999";
		newImage.width = "0";
		newImage.height = "0";

		newImage.setAttribute("srcUrl", imagesToPreload[i]);
		document.getElementById("hidden-images").appendChild(newImage);
		//console.log(newImage);
		setTimeout(sourceToSrc,3000, newImage);
	}
	imagesToPreload =[];
}


function loadAllImages() {
    loadImages("fast");
    loadImages("normal");
    loadImages("slow");
    loadImages("video");
    //preloadHiddenImages();
}





loadImages("fast");



window.addEventListener('load', function () {
	console.log(" * Page loaded!");
    console.log(" * "+ String(camaleonElements.length) + "camaleon elements");
    loadAllImages();
})

