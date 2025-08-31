


function toSection(targetSection) {
    const sectionWidth = window.innerWidth;
    const sectionContainer = document.getElementById("sections-fetamida");
    print(sectionContainer, sectionWidth * targetSection);
    sectionContainer.scrollTo(sectionWidth * targetSection, 0 , {behavior: "smooth"});




}