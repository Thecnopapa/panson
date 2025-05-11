
function main() {
  console.log("Hello, World!");


}

main();
let windowHeight = window.innerHeight
let previousHeight = $(window).scrollTop()
let maxScroll = windowHeight * 0.35
const onClickLink = document.getElementById('title').onclick
console.log(onClickLink)
const title = document.getElementById('title');


$(window).scroll(function () {
  let scroll = $(window).scrollTop()
  console.log(scroll);
  if (scroll >= maxScroll){
    let scroll = maxScroll;
    title.style.position = "fixed";
    title.style.left = "40dvw";
  } else {
    title.style.position = "absolute";
    title.style.left = "20dvw";
  }
  title.style.height = String(20-(13*scroll/maxScroll)).concat("dvh");
  title.style.width = String(60 - (40*scroll/maxScroll)).concat("dvw");
  title.style.paddingBottom = String(5 - (5*scroll/maxScroll)).concat("dvh");
  title.style.paddingTop = String(5 - (5*scroll/maxScroll)).concat("dvh");


  if (title.style.position == "absolute" && ($(window).scrollTop() >= previousHeight ) && false) {
      if ($(window).scrollTop() >= $(title).offset().top) {
        console.log($(title).offset().top, previousHeight);
        previousHeight = $(window).scrollTop()
        document.getElementById('title').style.transition = "height 0.3s ease";
        document.getElementById('title').style.position = "fixed";
        document.getElementById('title').style.top = "0";
        document.getElementById('title').style.left = "40%" ;
        document.getElementById('title').style.height = "7dvh";
        document.getElementById('title').style.paddingBottom = "0";
        document.getElementById('title').style.paddingTop = "0";
        document.getElementById('title').onclick = onClickLink;
        document.getElementById('title').style.cursor = "pointer";
        document.getElementById('title').style.width = "20dvw";
      }
  }
  else if (title.style.position == "fixed" && ($(window).scrollTop() < previousHeight)&& false){
      if ($(window).scrollTop() <= window.innerHeight / 2 ) {
        console.log($(title).offset().top, previousHeight);
        previousHeight = $(window).scrollTop()
        document.getElementById('title').style.transition = "0.3s ease";
        document.getElementById('title').style.height = "20dvh";
        document.getElementById('title').style.top = "30dvh";
        document.getElementById('title').style.paddingBottom = "5dvh";
        document.getElementById('title').style.paddingTop = "5dvh";
        document.getElementById('title').style.position = "absolute";
        document.getElementById('title').onclick = "";
        document.getElementById('title').style.cursor = "default";
        document.getElementById('title').style.width = "60%";
        document.getElementById('title').style.left = "20%" ;
      }
    }
});