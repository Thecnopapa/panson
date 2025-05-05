let slideIndex = 0;
showSlides();

function showSlides() {
  let i;
  let slides = document.getElementsByClassName("slide-content");
  for (i = 0; i < slides.length; i++) {
    slides[i].style.translate = "-100%";
    slides[i].style.zIndex = -10;



  }


  slides[slideIndex].style.zIndex = -1;
  slides[slideIndex].style.translate = "0";
  console.log(slideIndex, slides.length);
  if (slideIndex+1 > slides.length-1) {slideIndex = 0; slides[0].style.translate = "100%";}
  else {slides[slideIndex+1].style.translate = "100%"; slideIndex++;}






  setTimeout(showSlides, 5000); // Change image every 2 seconds
}