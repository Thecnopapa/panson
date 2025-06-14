const cartIcon = document.getElementsByClassName('shopping-cart');
const cartCircle = document.getElementsByClassName('cercle-carret');

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

dynamicallyLoadScript("/static/scripts/cart.js")
dynamicallyLoadCSS("/static/carret.css")



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

for(var i = 0; i < menuContent.length; i++) {
    menuContent[i].addEventListener('mouseover', openMenu());
}


menu.style.width = "0px";
closeMenu();


function openMenu() {
    if (menuOpen) {return}
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
        if (menuContent[i].classList.contains('submenu')) {
            menuContent[i].setAttribute("onclick", "showDropdown(this)");
        }
        console.log("SHOWN")
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
        console.log(menu.offsetWidth >= navLeft.offsetWidth / 3, !(menuContent[0].style.color == "black"))
        if (menu.offsetWidth >= navLeft.offsetWidth / 2) {
            if (!(menuContent[0].style.color == "black")) {
                for (var i = 0; i < menuContent.length; i++) {
                    menuContent[i].style.color = "black";
                    console.log("PAINTED")
                }
            }
        } else {
            setTimeout(showMenuContent, 100);
        }
    }
}

function closeMenu() {
    closeCart()
    console.log('close menu');
    menu.style.width = "0px";
    window.scrollTo(window.scrollX, window.scrollY - 1);
    window.scrollTo(window.scrollX, window.scrollY + 1);
    for(var i = 0; i < menuContent.length; i++) {
        menuContent[i].style.color = "rgba(0,0,0,0)";
    }

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

