
function print(...args){
    console.log(...args);
}
function imageUrl(bucket, filename){
    return "https://firebasestorage.googleapis.com/v0/b/panson.firebasestorage.app/o/"+bucket+"%2F"+filename+"?alt=media"
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
    preloadHiddenImages();
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
		console.log(newImage);
		setTimeout(sourceToSrc,3000, newImage);
	}
	imagesToPreload =[];
}

function sourceToSrc(trigger){
	trigger.src = trigger.attributes.srcUrl.value;
	console.log(trigger);
}

async function loadImages(selection){
    let selectedImages = document.getElementsByClassName(selection+"-image");
    //console.log(selection);
    //console.log(selectedImages);
    let changedImages = 0
    for (let i = 0; i < selectedImages.length; i++){
        try{
            const url = selectedImages[i].attributes.background.value
            selectedImages[i].style.backgroundImage = "url('"+url+"')";
            selectedImages[i].removeAttribute("background");
            changedImages++;
	    imagesToPreload.push(url);
        } catch(err){}
    }
    print(" * "+ selection +" images loaded (" + changedImages + ") ");

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



function acceptCookies(){
	fetch("/acceptar_cookies", {method:"POST"});
	const banner = document.getElementById("cookies");
	banner.style.display = "none";
}






let menuOpen = false;
const menu = document.getElementById('menu');
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

const navElements = [...navButtons, ...lanButtons, navTitle, ...cartCircle, ...cartIcon];

menu.style.width = "0px";
closeMenu();

function openMenu() {
    if (menuOpen) {return}
    closeCart()
    //console.log('Open menu');
    if(window.innerHeight > window.innerWidth){
       menu.style.width = "80%";
	    //print(menuClosers);
       menuClosers[0].style.width = "20dvw";
	    menuClosers[1].style.width = "20dvw";
       contacteMenu.style.display = "block";
        projecteMenu.style.display = "block";
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
    cartIcon[0].src = "/static/media/bag-black.svg";
    menuButton[0].src = "/static/media/menu-black.svg";
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


};

function showDropdown (submenu) {
    let submenuContent = submenu.getElementsByClassName('item-submenu');
    submenu.setAttribute("onclick", "hideDropdown(this)");
    for (let i = 0; i < submenuContent.length; i++) {
        submenuContent[i].classList.add('dropdown-show');
    }

}
function hideDropdown (submenu) {
    let submenuContent = submenu.getElementsByClassName('item-submenu');
    submenu.setAttribute("onclick", "showDropdown(this)");
    for (let i = 0; i < submenuContent.length; i++) {
        submenuContent[i].classList.remove('dropdown-show');
    }
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
    checkColor()
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

};

function switchMenu(){
  if (menuOpen){
    closeMenu();
  } else {
    openMenu();
  }
}


function goBlack(){
    for (let i = 0; i < navElements.length; i++) {
        if (navElements[i] !== null) {
            navElements[i].classList.remove('white');
        }
    }
    cartIcon[0].src = "/static/media/bag-black.svg";
    menuButton[0].src = "/static/media/menu-black.svg";
}
function goWhite(){
    for (let i = 0; i < navElements.length; i++) {
        if (navElements[i] !== null) {
            //print(navElements[i]);
            navElements[i].classList.add('white');
        }
    }
    cartIcon[0].src = "/static/media/bag.svg";
    menuButton[0].src = "/static/media/menu-white.svg";
}

function checkColor() {
    const colorElement = document.getElementById("nav-color")
    //print(colorElement);
    if (colorElement !== null) {
        targetColour = colorElement.attributes.color.value;

        if (targetColour === "white") {
            goWhite();
            return "white";
        } else if (targetColour === "black") {
            goBlack();
            return "black";
        }
    }
}

const c = checkColor()
if (c != null) {
   print(" * Nav colour: ", c);
}


print(" * Navigation JS ready")
