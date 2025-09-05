

const toFirst = document.getElementById("to-first");
const toSecond = document.getElementById("to-second");
const toThird = document.getElementById("to-third");


function toSection(targetSection) {
    if (targetSection === null) {
        targetSection = 1;
    }
    window.history.replaceState(document.title, "", document.location.pathname+"?page=" + targetSection);
    const sectionWidth = window.innerWidth;
    const sectionContainer = document.getElementById("sections-fetamida");
    print("TO: ", targetSection);
    sectionContainer.scrollTo(sectionWidth * targetSection, 0 , {behavior: "smooth"});
    if (targetSection === 0 ) {
        toFirst.style.left = "0";
        toSecond.style.left = "calc(100% - " + String(toSecond.offsetWidth + toThird.offsetWidth + sectionWidth*0.02) + "px)";
        toThird.style.left = "calc(100% - " + String(toThird.offsetWidth) + "px)";
    } else if (targetSection === 1) {
        toFirst.style.left = "0";
        toSecond.style.left = "calc(50% - " + String(toSecond.offsetWidth / 2) + "px)";
        toThird.style.left = "calc(100% - " + String(toThird.offsetWidth) + "px)";

    } else if (targetSection === 2) {
        toFirst.style.left = "0";
        toSecond.style.left = String(toFirst.offsetWidth + sectionWidth*0.02) + "px";
        toThird.style.left = "calc(100% - " + String(toThird.offsetWidth) + "px)";
    }
}
window.addEventListener('load', function () {
    toSection(Number(new URL(document.URL).searchParams.get("page")));
})
