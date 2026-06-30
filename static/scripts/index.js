console.log(" * Initialising Index JS")

const onClickLink = document.getElementById('title-logo').onclick
const title = document.getElementById('title-logo');


function scrollToTop() {
  window.scrollTo(0, 0, {behavior: 'smooth'});
}

let maxIndexScrolls = 100;
let alreadyScrolling = false;
function updateScroll() {
    if (alreadyScrolling){return}
    alreadyScrolling = true;

	let windowHeight = window.innerHeight;
	const maxScroll = windowHeight * 0.35;
    let scroll = document.documentElement.scrollTop;
	//console.log("Scroll detected");
	const oscroll = scroll;
    if (scroll >= maxScroll) {
        scroll = maxScroll;
        title.style.cursor = "pointer";
    } else {
        title.style.cursor = "default";
    }


    if (isMobile()){
        title.style.top = String(26.5 - (25.75 * scroll / maxScroll)).concat("vh");
        title.style.height = String(20 - (14.5 * scroll / maxScroll)).concat("vh");
        title.style.width = String(50 - (0 * scroll / maxScroll)).concat("vw");
        title.style.left = String(25 + (0 * scroll / maxScroll)).concat("vw");
	    }else {
        title.style.top = String(40 - (39.25 * scroll / maxScroll)).concat("vh");
        title.style.height = String(20 - (15.5 * scroll / maxScroll)).concat("vh");
        title.style.width = String(60 - (40 * scroll / maxScroll)).concat("vw");
        title.style.left = String(20 + (20 * scroll / maxScroll)).concat("vw");
    }


    //title.style.paddingBottom = String(5 - (5 * scroll / maxScroll)).concat("vh");
    //title.style.paddingTop = String(5 - (5 * scroll / maxScroll)).concat("vh");
    //print(oscroll, windowHeight*0.97);
    if (oscroll >= windowHeight*0.35) {
        forceNavTitle("index")

    } else {
        unforceNavTitle("index")
    }
    // if ((oscroll >= windowHeight*0.94) && (window.innerWidth > desktopThreshold) || (oscroll >= windowHeight*0.69) && (window.innerWidth <= desktopThreshold)) {
    //     goBlack();
    //     title.classList.remove('white');
    //     //title.style.backgroundImage = "url(\"/static/media/logo-complet.png\")";
    //     navigation.classList.add("opaque");
    //
    // } else {
    //     goWhite();
    //     title.classList.add('white');
    //     //title.style.backgroundImage = "url(\"/static/media/logo-complet-blanc.png\")";
    //     navigation.classList.remove("opaque");
    // }
    alreadyScrolling = false

    if (maxIndexScrolls > 0) {
        maxIndexScrolls = maxIndexScrolls -1;
        //setTimeout(updateScroll, 0.01);
    } else {
    }

}



try{
    blackObserver.observe(document.querySelector(".slideshow"));

} catch {}

function resetScrollMax(){
    maxIndexScrolls = 100;
}

document.addEventListener("scroll", resetScrollMax)

document.addEventListener("scroll", updateScroll)
//setInterval(updateScroll, 0.01);
window.addEventListener("load", (e) =>{
	checkColor();
    updateScroll();

});
console.log(" * Index JS initialised")
