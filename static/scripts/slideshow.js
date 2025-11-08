let slideIndex = 0;
showSlides();

function showSlides() {
  let i;
  let slides = document.getElementsByClassName("slide-content");
  if (slides.length < 3){
	return;
  }

  if (slideIndex == 0) {
    slides[slides.length - 2].style.display = "none";
    slides[slides.length - 1].style.zIndex = "-10";
    slides[slides.length - 1].style.translate = "-100%";
  } else if (slideIndex == 1){
    slides[slides.length - 1].style.display = "none";
    slides[slides.length - 1].style.zIndex = "-10";
    slides[slideIndex - 1].style.translate = "-100%";

  }
  else {
    slides[slideIndex - 2].style.display = "none";
    slides[slideIndex - 1].style.zIndex = "-10";
    slides[slideIndex - 1].style.translate = "-100%";
  }

  slides[slideIndex].style.translate = "0";
  slides[slideIndex].style.zIndex = "-1";


  if (slideIndex + 1 > slides.length - 1) {
    slides[0].style.translate = "100%";
    slides[0].style.display = "block";
    slideIndex = 0;
  }
  else {
    slides[slideIndex+1].style.translate = "100%";
    slides[slideIndex+1].style.display = "block";
    slideIndex++;}


  setTimeout(showSlides, 5000); // Change image every 2 seconds
}



print(" * Slideshow JS ready")
