





let menuOpen = false;

const menu = document.getElementById('menu');
const menuContent = [...document.getElementsByClassName('menu-content')];
const menuClosers = [...document.getElementsByClassName("menu-closer")];
const botoMenuSimple = document.getElementsByClassName('icon-menu-simple')[0];
const submenus = [...document.getElementsByClassName('submenu')];


camaleonElements.push(menu, botoMenuSimple);




async function openMenu() {
    if (menuOpen) {return;}
    closeCart();
    menuOpen = true;
    let targetWidth = undefined;
    if (window.innerHeight > window.innerWidth){
        targetWidth =  window.innerWidth;
        menu.style.width = String(targetWidth) + "px";
        try{
            navTitle.classList.add("black");
        } catch {}
        document.documentElement.style.overflow = "hidden";
    } else {
        targetWidth = navLeft.offsetWidth;
        menu.style.width = String(targetWidth) + "px";
        menuClosers.forEach(closer => {
            closer.style.width = String(window.innerWidth - targetWidth) + "px";
            closer.style.display = "flex";
        });
    }
    menu.style.left = "0";
    menu.classList.add('open');
    menu.classList.remove('closed');
    botoMenuSimple.classList.add('open');
    botoMenuSimple.classList.add("black");
    navButtons.forEach(button => {
        button.classList.add("black");
    });

    menuContent.forEach(item => {
        item.classList.add('shown');
    });

}




function closeMenu(override=true) {
    if (!override && menuOpen) {return;}
    let targetWidth = undefined;
    if (window.innerHeight > window.innerWidth){
        targetWidth =  window.innerWidth;
        menu.style.width = String(targetWidth) + "px";
        document.documentElement.style.overflow = "unset";
    } else {
        targetWidth = navLeft.offsetWidth;
        menu.style.width = String(targetWidth) + "px";
    }
    //console.log('Close menu');
    menu.style.left = String(-targetWidth) + "px";


	try{
        navTitle.classList.remove("black");
	} catch {}

    menu.classList.remove('open');
    botoMenuSimple.classList.remove('open');
    botoMenuSimple.classList.remove("black");
    navButtons.forEach(button => {
        button.classList.remove("black");
    });

    menuContent.forEach(item => {
        item.classList.remove('shown');
    })
    menuClosers[0].style.display = "none";
	menuClosers[1].style.display = "none";

    submenus.forEach(submenu => {
        hideDropdown(submenu);
    });
    menuOpen = false;
    setTimeout(() => {menu.classList.add("closed");}, 1000)

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
    let submenuContent = [...submenu.getElementsByClassName('item-submenu')];
    let submenuIndicators = [...submenu.getElementsByClassName('menu-indicator')];
    submenu.setAttribute("onclick", "showDropdown(this)");
    submenuContent.forEach(submenuItem => {submenuItem.classList.remove('dropdown-show');})
    submenuIndicators.forEach(submenuIndicator => {submenuIndicator.classList.remove('dropdown-show');})
}



if (window.innerHeight > window.innerWidth){
    targetWidth =  window.innerWidth;
    menu.style.width = String(targetWidth) + "px";
} else {
    targetWidth = navLeft.offsetWidth;
    menu.style.width = String(targetWidth) + "px";
}
menu.style.left = String(-targetWidth+1) + "px";


window.addEventListener('load', function(){

})