
const menu = document.getElementById('menu');
const navLeft = document.getElementById('nav-left');
const botoMenu = document.getElementById('menu-button');
const botoProjecte = document.getElementById('projecte');
const botoContacte = document.getElementById('contacte');
const botoMenuSimple = document.getElementsByClassName('icon-menu-simple')[0];
const collecionsMenu = document.getElementById("collecions-menu");
const pecesMenu = document.getElementById('peces-menu');
const menuContent = document.getElementsByClassName('menuConetnt');
let c
for (c in menuContent) {
    c.addEventListener('mouseover', openMenu())
}


menu.style.width = "0px";
function openMenu(event) {

    console.log('open menu');
    if(window.innerHeight > window.innerWidth){
       menu.style.width = "80%";
}
    else {
        menu.style.width = String(navLeft.offsetWidth) + "px";
    }
    botoMenu.style.color = "black";
    botoProjecte.style.color = "black";
    botoContacte.style.color = "black";
    botoMenuSimple.src = "/static/media/menu-black.svg";
    try {
        menu.classList.add('open');
        botoMenuSimple.classList.add('open');
    }catch(e){}
    collecionsMenu.style.display = "block";
    pecesMenu.style.display = "block";

}



function closeMenu() {
    console.log('close menu');
    menu.style.width = "0px";
    window.scrollTo(window.scrollX, window.scrollY - 1);
    window.scrollTo(window.scrollX, window.scrollY + 1);

    try {
        menu.classList.remove('open');
        botoMenuSimple.classList.remove('open');
    } catch (error) {}
    collecionsMenu.style.display = "none";
    pecesMenu.style.display = "none";


}