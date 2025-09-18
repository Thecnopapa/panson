

const toFirst = document.getElementById("to-first");
const toSecond = document.getElementById("to-second");
const sectionContainer = document.getElementById("sections-fetamida");
const menuContainer = document.getElementById("section-menu");
let currentSection = 1;


window.addEventListener("orientationchange", () => {setTimeout( toSection, 2000,currentSection);});


function toSection(targetSection) {
    if (targetSection === null) {
        targetSection = 1;
    }
	if (targetSection > 2 || targetSection < 0){return;}
    window.history.replaceState(document.title, "", document.location.pathname+"?page=" + targetSection);
    const sectionWidth = window.innerWidth;
    print("TO: ", targetSection);
    currentSection = targetSection;

    if (window.innerWidth >= window.innerHeight) {
        menuContainer.parentElement.scrollTo(0, 0);
        sectionContainer.scrollTo(sectionWidth * targetSection, 0, {behavior: "smooth"});
        sectionContainer.style.maxHeight = String(sectionContainer.getElementsByClassName("fetamida-section")[targetSection].offsetHeight) + "px";
        sectionContainer.children[targetSection].scrollTo(0, 0);
        sectionContainer.children[targetSection].firstElementChild.scrollTo(0, 0);
    } else {
        console.log(sectionContainer.children[targetSection].offsetTop,  menuContainer.offsetHeight );
        sectionContainer.scrollTo(0, sectionContainer.children[targetSection].offsetTop + menuContainer.offsetHeight);
        sectionContainer.children[targetSection].scrollTo(0, 0);
        sectionContainer.children[targetSection].firstElementChild.scrollTo(0, 0);
    }
}



toSection(Number(new URL(document.URL).searchParams.get("page")));
window.addEventListener('load', function () {
    toSection(Number(new URL(document.URL).searchParams.get("page")));
})
/*
let touchStart = 0;
let touchEnd = 0;
menuContainer.addEventListener("touchstart", function(event){
	touchStart = event.changedTouches[0].screenX;
	print("TouchStart: ", touchStart);
});
menuContainer.addEventListener("touchend", function(event){
	touchEnd = event.changedTouches[0].screenX;
	const touchX = touchEnd - touchStart;
	print("TouchEnd: ", touchEnd, "Total: ", touchX, window.innerWidth);
	if (touchX >= window.innerWidth*0.2){
		toSection(currentSection - 1);
	} else if (touchX*(-1) >= window.innerWidth*0.2){
		toSection(currentSection + 1);
	}
});
*/

sectionContainer.addEventListener("scroll", (event) => {document.documentElement.scrollTo(0,0);});


function showEmailForm(content){
    content = showPopup(content);
    console.log(content.getElementsByClassName("submit-email"));
    content.getElementsByClassName("email-form")[0].addEventListener("submit", function(event) {
        alert("Correu enviat correctament!");
        hidePopup(event.target.parentElement);
    })

}





print(" * Bespoke JS ready")

