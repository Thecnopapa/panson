let slideIndex = 0;
showSlides();

function showSlides() {
  let i;
  let slides = document.getElementsByClassName("slide-content");
  for (i = 0; i < slides.length; i++) {
    slides[i].style.translate = "-100%";
    slides[i].style.zIndex = -10;



  }
  slideIndex++;
  slides[slideIndex].style.translate = "100%";
  if (slideIndex > slides.length) {slideIndex = 1}
  slides[slideIndex-1].style.zIndex = -1;
  slides[slideIndex-1].style.translate = "0";


  setTimeout(showSlides, 5000); // Change image every 2 seconds
}