
const onClickLink = document.getElementById('title').onclick
const navButtons = document.getElementsByClassName('dropbtn');
const lanButtons = document.getElementsByClassName('language');

const menuButton = document.getElementsByClassName('icon-menu-simple');
const title = document.getElementById('title');


function scrollToTop() {
  window.scrollTo(0, 0, {behavior: 'smooth'});
}

print("a");
function updateScroll() {
	let windowHeight = window.innerHeight;
	const maxScroll = windowHeight * 0.35;
    let scroll = document.documentElement.scrollTop;
	//print("Scroll detected", scroll);
	var oscroll = scroll;
    if (scroll >= maxScroll) {
        scroll = maxScroll;
        title.style.cursor = "pointer";
    } else {
        title.style.cursor = "default";
    }
    title.style.top = String(35 - (35 * scroll / maxScroll)).concat("dvh");

    if (window.innerHeight > window.innerWidth){
        title.style.height = String(20 - (14 * scroll / maxScroll)).concat("dvh");
        title.style.width = String(60 - (0 * scroll / maxScroll)).concat("dvw");
        title.style.left = String(20 + (0 * scroll / maxScroll)).concat("dvw");
	    }else {
        title.style.height = String(20 - (13 * scroll / maxScroll)).concat("dvh");
        title.style.width = String(60 - (40 * scroll / maxScroll)).concat("dvw");
        title.style.left = String(20 + (20 * scroll / maxScroll)).concat("dvw");
    }


    title.style.paddingBottom = String(5 - (5 * scroll / maxScroll)).concat("dvh");
    title.style.paddingTop = String(5 - (5 * scroll / maxScroll)).concat("dvh");
    //print(oscroll, windowHeight*0.97);
    if (oscroll >= windowHeight*0.97) {
        for (let i = 0; i < navButtons.length; i++) {
            navButtons[i].style.color = "black";
        }
        for (let i = 0; i < lanButtons.length; i++) {
            lanButtons[i].style.color = "black";
        }
	if (cartCircle.length != 0) {
        	cartCircle[0].style.color = "white";
        	cartCircle[0].style.backgroundColor = "black";
	}
        cartIcon[0].src = "/static/media/bag-black.svg";
        menuButton[0].src = "/static/media/menu-black.svg";
        title.style.backgroundImage = "url(\"/static/media/logo-complet.png\")";
        title.style.zIndex = 10;
    } else {
        if (!(menu.classList.contains('open'))) {
            for (let i = 0; i < navButtons.length; i++) {
            navButtons[i].style.color = "white";
        }
            menuButton[0].src = "/static/media/menu-white.svg";
        }
        for (let i = 0; i < lanButtons.length; i++) {
            lanButtons[i].style.color = "white";
        }

	if (cartCircle.length != 0){
        	cartCircle[0].style.color = "black";
        	cartCircle[0].style.backgroundColor = "white";
	}
        cartIcon[0].src = "/static/media/bag.svg";

        title.style.backgroundImage = "url(\"/static/media/logo-complet-blanc.png\")";
        title.style.zIndex = 4;
    }

};

print("b");
setInterval(updateScroll, 0.1);
