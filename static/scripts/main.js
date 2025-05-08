
function main() {
  console.log("Hello, World!");


}

main();

let previousHeight = $(window).scrollTop()

$(window).scroll(function () {
  const title = document.getElementById('title');
  console.log($(window).scrollTop() ,$(title).offset().top, $(window).scrollTop() >= $(title).offset().top);
  if (title.style.position == "absolute" && ($(window).scrollTop() >= previousHeight)) {
      if ($(window).scrollTop() >= $(title).offset().top) {
        console.log($(title).offset().top, previousHeight);
        previousHeight = $(window).scrollTop()
        document.getElementById('title').style.transition = "height 0.3s ease";
        document.getElementById('title').style.position = "fixed";
        document.getElementById('title').style.top = "0";
        document.getElementById('title').style.height = "7dvh";
        document.getElementById('title').style.paddingBottom = "0";
        document.getElementById('title').style.paddingTop = "0";
      }
  }
  else if (title.style.position == "fixed" && ($(window).scrollTop() < previousHeight)){
      if ($(window).scrollTop() <= window.innerHeight / 2 ) {
        console.log($(title).offset().top, previousHeight);
        previousHeight = $(window).scrollTop()
        document.getElementById('title').style.transition = "0.3s ease";
        document.getElementById('title').style.height = "20dvh";

        document.getElementById('title').style.top = "30dvh";

        document.getElementById('title').style.paddingBottom = "5dvh";
        document.getElementById('title').style.paddingTop = "5dvh";
        document.getElementById('title').style.position = "absolute";
      }
    }
});