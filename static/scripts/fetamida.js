

var currentSection = 0;
const sectionJumps = [0,65,130];
const container = document.getElementById("content-fetamida");
const nSections = sectionJumps.length-1;
const sections = document.getElementsByClassName("fetamida-section");
const sectionMenu = document.getElementById("section-menu");
const sectionMenuChildren = document.getElementsByClassName("to-section");
const scrollLeft = document.getElementById("scroll-left");
const scrollRight = document.getElementById("scroll-right");


console.log(currentSection);
toSection(currentSection);

function nextSection() {
    if (currentSection < nSections) {
        currentSection = currentSection +1;
        toSection(currentSection);
    }
}
function prevSection() {
    if (currentSection > 0) {
        currentSection = currentSection -1;
        toSection(currentSection);
    }
}

function toSection(target) {
    console.log(target);
    container.scrollTo(window.innerWidth*sectionJumps[target]/100, container.scrollHeight, {behavior: "smooth"});

    scrollLeft.style.left = String(window.innerWidth*sectionJumps[target]/100) + "px";
    scrollRight.style.left = String(window.innerWidth*(sectionJumps[target]+75)/100) + "px";


    for (let i = 0; i <= nSections; i++) {
        console.log(sectionMenuChildren[0], sectionMenuChildren[1], sectionMenuChildren[2]);
        console.log(target, i);
        if(target === 0) {
            scrollLeft.style.display = "none";
        }else{
            scrollLeft.style.display = "block";
        }
        if (target === nSections) {
            scrollRight.style.display = "none";
        }else{
            scrollRight.style.display = "block";
        }

        if (target === i) {
            sections[i].classList.add("current-section");
            sections[i].classList.remove("right-section", "left-section");
            sectionMenuChildren[i].classList.add("current-section");
            sectionMenuChildren[i].classList.remove("right-section", "left-section");
        }
        else if (i > target) {
            sections[i].classList.add("right-section");
            sections[i].classList.remove("current-section", "left-section");
            sectionMenuChildren[i].classList.add("right-section");
            sectionMenuChildren[i].classList.remove("current-section", "left-section");
        }
        else if (i < target) {
            sections[i].classList.add("left-section");
            sections[i].classList.remove("current-section", "right-section");
            sectionMenuChildren[i].classList.add("left-section");
            sectionMenuChildren[i].classList.remove("current-section", "right-section");
        }
    }
}