
function print(...args){
    console.log(...args);
}
function imageUrl(bucket, filename){
    return "https://firebasestorage.googleapis.com/v0/b/panson.firebasestorage.app/o/media%2F"+bucket+"%2F"+filename+"?alt=media"
}

document.documentElement.scrollTo({top:0,left:0, behavior: "instant"})


const loader = document.getElementById("loader");
const loaderIcon =document.getElementById("loader-icon");


window.addEventListener('load', function () {

	loader.remove();
	print(" * Page loaded!");
    loadAllImages();

})

let imagesToPreload = [];

loadImages("fast");

function loadAllImages() {
    loadImages("fast");
    loadImages("normal");
    loadImages("slow");
    loadImages("video");
    //preloadHiddenImages();
}


async function preloadHiddenImages(){
	console.log("preloading "+imagesToPreload.length+" images");
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

function sourceToSrc(trigger){
	let url = trigger.attributes.srcUrl.value;
	trigger.src = trigger.attributes.srcUrl.value;
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
    print(" * "+ selection +" images loaded (" + changedImages + ") videos: "+changedVideos);

}



window.addEventListener('orientationchange', function () {
	console.log("Rotation change!");
	closeCart();
    closeMenu();
})


function dynamicallyLoadScript(url) {
    var script = document.createElement("script");  // create a script DOM node
    script.src = url;  // set its src to the provided URL
    document.head.appendChild(script);  // add it to the end of the head section of the page (could change 'head' to 'body' to add it to the end of the body section instead)
}
function dynamicallyLoadCSS(url) {
    var css = document.createElement("link");  // create a script DOM node
    css.href = url;  // set its src to the provided URL
    css.rel = "stylesheet";
    document.head.appendChild(css);  // add it to the end of the head section of the page (could change 'head' to 'body' to add it to the end of the body section instead)
}
function addFavicon() {
    var fav = document.createElement("link");  // create a script DOM node
    fav.href = ("/static/media/favicon.ico");  // set its src to the provided URL
    fav.rel = "icon";
    fav.type = "image/x-icon"
    document.head.appendChild(fav);  // add it to the end of the head section of the page (could change 'head' to 'body' to add it to the end of the body section instead)
}
// dynamicallyLoadCSS("/static/normalize.css")
//dynamicallyLoadScript("/scripts/cart.js")
//dynamicallyLoadCSS("/style/carret.css")
//dynamicallyLoadCSS("/style/footer.css")
if (false) {
    addFavicon()
}

function scrollOnLoad(id) {
    console.log("scrolling to " +id);
    target = document.getElementById(id);
    console.log("target is " +target);
    target.scrollIntoView({ behavior: "smooth", block: "center" });
}



async function acceptCookies(){
    let acceptedAnalytics = "denied";
    if(document.getElementById("accept-analytics").checked === true){
        acceptedAnalytics = "granted";
        consentAnalytics()
    }
    console.log(acceptedAnalytics);


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






let menuOpen = false;
const menu = document.getElementById('menu');
const navigation = document.getElementsByClassName("navigation")[0];
const navLeft = document.getElementById('nav-left');
const botoMenu = document.getElementById('menu-button');
const botoProjecte = document.getElementById('projecte');
const botoContacte = document.getElementById('contacte');
const botoMenuSimple = document.getElementsByClassName('icon-menu-simple')[0];
const contacteMenu = document.getElementById("contacte-menu");
const projecteMenu = document.getElementById('projecte-menu');
const menuContent = document.getElementsByClassName('titol-submenu');
const menuClosers = document.getElementsByClassName("menu-closer");

const navButtons = document.getElementsByClassName('dropbtn');
const lanButtons = document.getElementsByClassName('language');

const menuButton = document.getElementsByClassName('icon-menu-simple');


const cartIcon = document.getElementsByClassName('shopping-cart');
const cartCircle = document.getElementsByClassName('cercle-carret');
const navTitle = document.getElementById("title")

const camaleonElements = [...navButtons, ...lanButtons, navTitle, ...cartCircle, ...cartIcon, botoMenuSimple, menu];

menu.style.width = "0px";
closeMenu();

function openMenu() {
    if (menuOpen) {return}
    closeCart()
    //console.log('Open menu');
    if(window.innerHeight > window.innerWidth){
       menu.style.width = "100%";
	    //print(menuClosers);
       menuClosers[0].style.width = "20dvw";
       menuClosers[1].style.width = "20dvw";
       contacteMenu.style.display = "block";
        projecteMenu.style.display = "block";
	    try{
	    navTitle.classList.add("black");
	    } catch {}
}
    else {
        menu.style.width = String(navLeft.offsetWidth) + "px";
	menuClosers[0].style.width = String(window.innerWidth - navLeft.offsetWidth) + "px";
	menuClosers[1].style.width = String(window.innerWidth - navLeft.offsetWidth) + "px";
    }
    menuClosers[0].style.display = "flex";
    menuClosers[1].style.display = "flex";
    for (i = 0; i < navButtons.length; i++) {
        navButtons[i].classList.add("black");
    }
    botoMenuSimple.classList.add("black");
    try {
        menu.classList.add('open');
        botoMenuSimple.classList.add('open');
    }catch(e){}
    for (let i = 0; i < menuContent.length; i++) {
        menuContent[i].classList.add('shown');
        if (menuContent[i].classList.contains('submenu')) {
            menuContent[i].setAttribute("onclick", "showDropdown(this)");
        }
    }
    menuOpen = true;
    setTimeout(showMenuContent, 300);


}



function showMenuContent() {
    if (menuOpen){
        if (menu.offsetWidth >= navLeft.offsetWidth / 2) {
            if (!(menuContent[0].style.color == "black")) {
                for (var i = 0; i < menuContent.length; i++) {
                    menuContent[i].style.color = "black";
                }
            }
        } else {
            setTimeout(showMenuContent, 100);
        }
    }
}

function closeMenu() {
    //console.log('Close menu');
    menu.style.width = "0px";
    for (i = 0; i < navButtons.length; i++) {
        navButtons[i].classList.remove("black");
    }
    botoMenuSimple.classList.remove("black");
	try{
	navTitle.classList.remove("black");
	} catch {}
    
    try{
        updateScroll()
    } catch(e){}
    for(var i = 0; i < menuContent.length; i++) {
        menuContent[i].style.color = "rgba(0,0,0,0)";
    }
    menuClosers[0].style.display = "none";
	menuClosers[1].style.display = "none";
    let hideContent = document.getElementsByClassName('menu-content');
    for(var i = 0; i < hideContent.length; i++) {
        hideContent[i].classList.remove('shown');
        hideContent[i].classList.remove('dropdown-show');
        if (hideContent[i].classList.contains('submenu')) {
            hideDropdown(hideContent[i]);
        }
    }

    try {
        menu.classList.remove('open');
        botoMenuSimple.classList.remove('open');
    } catch (error) {}
    contacteMenu.style.display = "none";
    projecteMenu.style.display = "none";

menuOpen = false;

}

function switchMenu(){
  if (menuOpen){
    closeMenu();
  } else {
    openMenu();
  }
}



function showDropdown (submenu) {
    let submenuContent = [...submenu.getElementsByClassName('item-submenu')];
    let submenuIndicators = [...submenu.getElementsByClassName('menu-indicator')];
    submenu.setAttribute("onclick", "hideDropdown(this)");
    submenuContent.forEach(submenuItem => {submenuItem.classList.add('dropdown-show');})
    submenuIndicators.forEach(submenuIndicator => {submenuIndicator.classList.add('dropdown-show');})


}
function hideDropdown (submenu) {
    let submenuContent = submenu.getElementsByClassName('item-submenu');
    submenu.setAttribute("onclick", "showDropdown(this)");
    for (let i = 0; i < submenuContent.length; i++) {
        submenuContent[i].classList.remove('dropdown-show');
    }
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









function goBlack(){
    for (let i = 0; i < camaleonElements.length; i++) {
        if (camaleonElements[i] !== null) {
            camaleonElements[i].classList.remove('white');
        }
    }
}

function goWhite(){
    for (let i = 0; i < camaleonElements.length; i++) {
        if (camaleonElements[i] !== null) {
            camaleonElements[i].classList.add('white');
        }
    }
}

function checkColor() {
    const colorElement = document.getElementById("nav-color")
    //print(colorElement);
    if (colorElement !== null) {
        try {
            let targetColour = colorElement.attributes.color.value;
            if (targetColour === "white") {
                goWhite();
            } else if (targetColour === "black") {
                goBlack();
            }
        } catch {}
        try{
            let navColour = colorElement.attributes.navColor.value;
            if (navColour === "translucid") {
                navigation.classList.remove("opaque");
            } else if (navColour === "opaque") {
                navigation.classList.add("opaque");
            }
        } catch {}
    }
}

const c = checkColor()
if (c != null) {
   print(" * Nav colour: ", c);
}


function background_to_url(background){
    return  background.replace(/"/g, "").split("(")[1].split(")")[0];
}


function getImageBrightness(url) {
    console.log(url)
    const newImg = document.createElement("img");


    newImg.style.zIndex = "-999";
    newImg.src = url
    newImg.classList.add("hidden");


    let colorSum = 0;
    newImg.onload = function() {
        let canvas = document.createElement("canvas");
        canvas.width = this.width;
        canvas.height = this.height;
        var ctx = canvas.getContext("2d");
        ctx.drawImage(this,0,0);

        var imageData = ctx.getImageData(0,0,canvas.width,canvas.height);
        var data = imageData.data;
        var r,g,b,avg;

        for(var x = 0, len = data.length; x < len; x+=4) {
            r = data[x];
            g = data[x+1];
            b = data[x+2];

            avg = Math.floor((r+g+b)/3);
            colorSum += avg;
        }

        let brightness = Math.floor(colorSum / (this.width*this.height));
      console.log(brightness);
      newImg.setAttribute("brightness", brightness);
    }
    return newImg.getAttribute("brightness");
}

function getImageBrightnessSO(image,callback) {
    var thisImgID = image.attr("id");

    const img = document.createElement("img");
    img.src = image.attr("src");

    img.style.display = "none";
    document.body.appendChild(img);

    let colorSum = 0;

    img.onload = function() {
        // create canvas
        var canvas = document.createElement("canvas");
        canvas.width = this.width;
        canvas.height = this.height;

        var ctx = canvas.getContext("2d");
        ctx.drawImage(this,0,0);

        var imageData = ctx.getImageData(0,0,canvas.width,canvas.height);
        var data = imageData.data;
        var r,g,b,avg;

          for(var x = 0, len = data.length; x < len; x+=4) {
            r = data[x];
            g = data[x+1];
            b = data[x+2];

            avg = Math.floor((r+g+b)/3);
            colorSum += avg;
        }

        var brightness = Math.floor(colorSum / (this.width*this.height));
        callback(thisImgID, brightness);
    }
}





let blackObserver = new IntersectionObserver((triggers) => {colorScroll(triggers);} ,{threshold: 0.06}
);


function colorScroll(triggers){
    if (!triggers[0].isIntersecting) {
        goBlack();
        navigation.classList.add("opaque");
    } else {
        checkColor();
        navigation.classList.remove("opaque");
    }
}



try{
    blackObserver.observe(document.getElementById("producte-images"));
    console.log(1)
} catch {}

try{
    blackObserver.observe(document.getElementsByClassName("imatge-collecio")[0]);
    camaleonElements.push(document.getElementsByClassName("titol-collecio")[0])
    document.getElementsByClassName("titol-collecio")[0].addEventListener("click", function() {
        let galleries = [...document.getElementsByClassName('content-galeria')];
        galleries.forEach(g => {if (g.offsetParent !== null){g.scrollIntoView({block: 'end'})}});
    });
    console.log(2)
} catch {}







print(" * Navigation JS ready")
