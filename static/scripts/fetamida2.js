

const toFirst = document.getElementById("to-first");
const toSecond = document.getElementById("to-second");
const toThird = document.getElementById("to-third");


function toSection(targetSection) {
    const sectionWidth = window.innerWidth;
    const sectionContainer = document.getElementById("sections-fetamida");
    print("TO: ", targetSection);
    sectionContainer.scrollTo(sectionWidth * targetSection, 0 , {behavior: "smooth"});
    if (targetSection === 0 ) {
        toFirst.style.left = "0";
        toSecond.style.left = "calc(100% - " + String(toSecond.offsetWidth) + "px)";
        toThird.style.left = "calc(100% + " + String(toSecond.offsetWidth) + "px + 4dvh)";
    } else if (targetSection === 1) {
        toFirst.style.left = "0";
        toSecond.style.left = "calc(50% - " + String(toSecond.offsetWidth / 2) + "px)";
        toThird.style.left = "calc(100% - " + String(toThird.offsetWidth) + "px)";

    } else if (targetSection === 2) {
        toFirst.style.left = "calc(-" + String(toFirst.offsetWidth*2) + "px - 4dvh)";
        toSecond.style.left = "0";
        toThird.style.left = "calc(100% - " + String(toThird.offsetWidth) + "px)";
    }
}
toSection(1)