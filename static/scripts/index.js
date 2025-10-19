
const onClickLink = document.getElementById('title-logo').onclick
const title = document.getElementById('title-logo');


function scrollToTop() {
  window.scrollTo(0, 0, {behavior: 'smooth'});
}

function updateScroll() {
	let windowHeight = window.innerHeight;
	const maxScroll = windowHeight * 0.35;
    let scroll = document.documentElement.scrollTop;
	//print("Scroll detected", scroll);
	const oscroll = scroll;
    if (scroll >= maxScroll) {
        scroll = maxScroll;
        title.style.cursor = "pointer";
    } else {
        title.style.cursor = "default";
    }


    if (window.innerWidth <= 1025){
        title.style.top = String(26.5 - (25.5 * scroll / maxScroll)).concat("vh");
        title.style.height = String(20 - (15 * scroll / maxScroll)).concat("vh");
        title.style.width = String(50 - (0 * scroll / maxScroll)).concat("vw");
        title.style.left = String(25 + (0 * scroll / maxScroll)).concat("vw");
	    }else {
        title.style.top = String(40 - (39 * scroll / maxScroll)).concat("vh");
        title.style.height = String(20 - (15 * scroll / maxScroll)).concat("vh");
        title.style.width = String(60 - (40 * scroll / maxScroll)).concat("vw");
        title.style.left = String(20 + (20 * scroll / maxScroll)).concat("vw");
    }


    //title.style.paddingBottom = String(5 - (5 * scroll / maxScroll)).concat("vh");
    //title.style.paddingTop = String(5 - (5 * scroll / maxScroll)).concat("vh");
    //print(oscroll, windowHeight*0.97);
    if (oscroll >= windowHeight*0.35) {
        title.style.zIndex = 60;
    } else {
        title.style.zIndex = 40;
    }
    if ((oscroll >= windowHeight*0.94) && (window.innerWidth > desktopThreshold) || (oscroll >= windowHeight*0.69) && (window.innerWidth <= desktopThreshold)) {
        goBlack();
        title.classList.remove('white');
        //title.style.backgroundImage = "url(\"/static/media/logo-complet.png\")";
        navigation.classList.add("opaque");

    } else {
        goWhite();
        title.classList.add('white');
        //title.style.backgroundImage = "url(\"/static/media/logo-complet-blanc.png\")";
        navigation.classList.remove("opaque");
    }

}



setInterval(updateScroll, 0.1);
goWhite();
print(" * Index JS ready")
