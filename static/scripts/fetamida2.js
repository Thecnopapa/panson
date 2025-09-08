

const toFirst = document.getElementById("to-first");
const toSecond = document.getElementById("to-second");
const toThird = document.getElementById("to-third");
const sectionContainer = document.getElementById("sections-fetamida");
let currentSection = 1;

function toSection(targetSection) {
    if (targetSection === null) {
        targetSection = 1;
    }
	if (targetSection > 2 || targetSection < 0){return;};
    window.history.replaceState(document.title, "", document.location.pathname+"?page=" + targetSection);
    const sectionWidth = window.innerWidth;
    print("TO: ", targetSection);
	currentSection = targetSection;
    sectionContainer.scrollTo(sectionWidth * targetSection, 0 , {behavior: "smooth"});
    sectionContainer.style.maxHeight = String(sectionContainer.getElementsByClassName("fetamida-section")[targetSection].offsetHeight) + "px";
    if (targetSection === 0 ) {
        toFirst.style.left = "calc(50% - " + String(toFirst.offsetWidth / 2) + "px)";
        toSecond.style.left = "calc(100% - " + String(toSecond.offsetWidth + toThird.offsetWidth + sectionWidth*0.02) + "px)";
        toThird.style.left = "calc(100% - " + String(toThird.offsetWidth) + "px)";
    } else if (targetSection === 1) {
        toFirst.style.left = "0";
        toSecond.style.left = "calc(50% - " + String(toSecond.offsetWidth / 2) + "px)";
        toThird.style.left = "calc(100% - " + String(toThird.offsetWidth) + "px)";

    } else if (targetSection === 2) {
        toFirst.style.left = "0";
        toSecond.style.left = String(toFirst.offsetWidth + sectionWidth*0.02) + "px";
        toThird.style.left = "calc(50% - " + String(toThird.offsetWidth / 2) + "px)";
    }
}
toSection(Number(new URL(document.URL).searchParams.get("page")));
window.addEventListener('load', function () {
    toSection(Number(new URL(document.URL).searchParams.get("page")));
})

let touchStart = 0;
let touchEnd = 0;
sectionContainer.addEventListener("touchstart", function(event){
	touchStart = event.changedTouches[0].screenX;
	print("TouchStart: ", touchStart);
});
sectionContainer.addEventListener("touchend", function(event){
	touchEnd = event.changedTouches[0].screenX;
	const touchX = touchEnd - touchStart;
	print("TouchEnd: ", touchEnd, "Total: ", touchX, window.innerWidth);
	if (touchX >= window.innerWidth*0.2){
		toSection(currentSection - 1);
	} else if (touchX*(-1) >= window.innerWidth*0.2){
		toSection(currentSection + 1);
	}
});


print(" * Bespoke JS ready")

