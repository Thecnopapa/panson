
function main() {
  console.log("Hello, World!");


}

main();
let windowHeight = window.innerHeight
const maxScroll = windowHeight * 0.35
const onClickLink = document.getElementById('title').onclick
const navButtons = document.getElementsByClassName('dropbtn');
const lanButtons = document.getElementsByClassName('language');
const cartButton = document.getElementsByClassName('shopping-cart');
console.log(onClickLink)
const title = document.getElementById('title');


function updateScroll() {
    let scroll = $(window).scrollTop()

    if (scroll >= maxScroll) {
        scroll = maxScroll;
        title.onclick = onClickLink;
        title.style.cursor = "pointer";
    } else {
        title.onclick = "";
        title.style.cursor = "default";
    }
    console.log(scroll, scroll / maxScroll);
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
        cartButton.src = "/static/media/bag-black.svg";
        title.style.backgroundImage = "url(\"/static/media/logo-complet.png\")";
    } else {
        navButtons[0].style.color = "white";
        navButtons[1].style.color = "white";
        navButtons[2].style.color = "white";
        lanButtons[0].style.color = "white";
        lanButtons[1].style.color = "white";
        cartButton.src = "/static/media/bag.svg";
        title.style.backgroundImage = "/static/media/bag.svg";
    }

};

$(window).onload = updateScroll();

$(window).scroll(updateScroll);
