console.log(" * Initialising Menu JS");





let menuOpen = false;

const menu = document.getElementById('menu');
const menuContent = [...document.getElementsByClassName('menu-content')];
const menuClosers = [...document.getElementsByClassName("menu-closer")];
const botoMenuSimple = document.getElementsByClassName('icon-menu-simple')[0];
const submenus = [...document.getElementsByClassName('submenu')];


camaleonElements.push(menu, botoMenuSimple);




async function openMenu() {
    hideSearch();
    if (menuOpen) {return;}
    closeCart();
    menuOpen = true;
    let targetWidth = undefined;
    console.log(isMobile());
    if (isMobile()){
        forceNavTitle("menu")
        targetWidth =  window.innerWidth * 0.9;
        menu.style.width = String(targetWidth) + "px";
        try{
            navTitle.classList.add("force-black");
        } catch {}
        document.documentElement.style.overflow = "hidden";
    } else {
        targetWidth = navLeft.offsetWidth;
        menu.style.width = String(targetWidth) + "px";
    }
        menuClosers.forEach(closer => {
            closer.style.width = String(window.innerWidth - targetWidth) + "px";
            closer.style.display = "flex";
        });
        navButtons.forEach(button => {
            button.classList.add("force-black");
        });
    
    menu.style.left = "0";
    menu.classList.add('open');
    menu.classList.remove('closed');
    botoMenuSimple.classList.add('open');
    botoMenuSimple.classList.add("force-black");


    menuContent.forEach(item => {
        item.classList.add('shown');
    });

}




function closeMenu() {
    let targetWidth = undefined;
    unforceNavTitle("menu")
    if (isMobile()){
        targetWidth =  window.innerWidth * 0.9;
        menu.style.width = String(targetWidth) + "px";
    } else {
        targetWidth = navLeft.offsetWidth;
        menu.style.width = String(targetWidth) + "px";
        navButtons.forEach(button => {
            button.classList.remove("force-black");
        });
    }
    //console.log('Close menu');
    menu.style.left = String(-targetWidth) + "px";


	try{
        navTitle.classList.remove("force-black");
	} catch {}

    menu.classList.remove('open');
    botoMenuSimple.classList.remove('open');
    botoMenuSimple.classList.remove("force-black");
    document.documentElement.style.overflow = "";


    menuContent.forEach(item => {
        item.classList.remove('shown');
    })
    menuClosers[0].style.display = "none";
	menuClosers[1].style.display = "none";

    submenus.forEach(submenu => {
        hideDropdown(submenu);
    });
    menuOpen = false;
    setTimeout(() => {menu.classList.add("closed");}, 1000);

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


window.addEventListener('load', function(){
	closeMenu();

})

console.log(" * Menu JS initialised");
