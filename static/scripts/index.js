
let windowHeight = window.innerHeight
const maxScroll = windowHeight * 0.35
const onClickLink = document.getElementById('title').onclick
const navButtons = document.getElementsByClassName('dropbtn');
const lanButtons = document.getElementsByClassName('language');
const cartButton = document.getElementsByClassName('shopping-cart');
const cartCircle = document.getElementsByClassName('cercle-carret');
const menuButton = document.getElementsByClassName('icon-menu-simple');
const title = document.getElementById('title');


function scrollToTop() {
  window.scrollTo({top: 0, behavior: 'smooth'});
}


function updateScroll() {
    let scroll = $(window).scrollTop()

    if (scroll >= maxScroll) {
        scroll = maxScroll;
        title.style.cursor = "pointer";
    } else {
        title.style.cursor = "default";
    }
    title.style.top = String(35 - (35 * scroll / maxScroll)).concat("dvh");
    title.style.height = String(20 - (13 * scroll / maxScroll)).concat("dvh");
    title.style.left = String(20 + (20 * scroll / maxScroll)).concat("dvw");
    title.style.width = String(60 - (40 * scroll / maxScroll)).concat("dvw");
    title.style.paddingBottom = String(5 - (5 * scroll / maxScroll)).concat("dvh");
    title.style.paddingTop = String(5 - (5 * scroll / maxScroll)).concat("dvh");

    if ($(window).scrollTop() >= windowHeight) {
        navButtons[0].style.color = "black";
        navButtons[1].style.color = "black";
        navButtons[2].style.color = "black";
        navButtons[2].style.color = "black";
        lanButtons[0].style.color = "black";
        lanButtons[1].style.color = "black";
	if (cartCircle.length != 0) {
        	cartCircle[0].style.color = "white";
        	cartCircle[0].style.backgroundColor = "black";
	}
        cartButton[0].src = "/static/media/bag-black.svg";
        menuButton[0].src = "/static/media/menu-black.svg";
        title.style.backgroundImage = "url(\"/static/media/logo-complet.png\")";
    } else {
        navButtons[0].style.color = "white";
        navButtons[1].style.color = "white";
        navButtons[2].style.color = "white";
        lanButtons[0].style.color = "white";
        lanButtons[1].style.color = "white";
	if (cart_circle.length != 0){
        	cartCircle[0].style.color = "black";
        	cartCircle[0].style.backgroundColor = "white";
	}
        cartButton[0].src = "/static/media/bag.svg";
        menuButton[0].src = "/static/media/menu-white.svg";
        title.style.backgroundImage = "url(\"/static/media/logo-complet-blanc.png\")";
    }

};

$(window).onload = updateScroll();

$(window).scroll(updateScroll);
