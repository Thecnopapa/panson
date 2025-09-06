
const onClickLink = document.getElementById('title-logo').onclick
const title = document.getElementById('title-logo');


function scrollToTop() {
  window.scrollTo(0, 0, {behavior: 'smooth'});
}

print("a");
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
    title.style.top = String(35 - (35 * scroll / maxScroll)).concat("dvh");
	//print(oscroll, scroll, maxScroll, title.style.top );

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
        goBlack()
        title.style.backgroundImage = "url(\"/static/media/logo-complet.png\")";
        title.style.zIndex = 10;
    } else {
        goWhite()
        title.style.backgroundImage = "url(\"/static/media/logo-complet-blanc.png\")";
        title.style.zIndex = 4;
    }

};

print("b");
setInterval(updateScroll, 0.1);


