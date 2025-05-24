let menuOpen = False;
const menu = document.getElementById('menu');
const navLeft = document.getElementById('nav-left');
const botoMenu = document.getElementById('menu-button');
const botoProjecte = document.getElementById('projecte');
const botoContacte = document.getElementById('contacte');
const botoMenuSimple = document.getElementsByClassName('icon-menu-simple')[0];
const contacteMenu = document.getElementById("contacte-menu");
const projecteMenu = document.getElementById('projecte-menu');
const menuContent = document.getElementsByClassName('menu-content');

for(var i = 0; i < menuContent.length; i++) {
    menuContent[i].addEventListener('mouseover', openMenu());
}


menu.style.width = "0px";
closeMenu();
function openMenu(event) {

    console.log('open menu');
    if(window.innerHeight > window.innerWidth){
       menu.style.width = "80%";
       contacteMenu.style.display = "block";
        projecteMenu.style.display = "block";
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

    for(var i = 0; i < menuContent.length; i++) {
        menuContent[i].classList.add('shown');
    }
menuOpen = True;
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
    contacteMenu.style.display = "none";
    projecteMenu.style.display = "none";
    for(var i = 0; i < menuContent.length; i++) {
        menuContent[i].classList.remove('shown');
memuOpen = False;
    }


}

Function switchMenu(){
  if (menuOpen){
    closeMenu();
  } else {
    openMenu();
  }
}

