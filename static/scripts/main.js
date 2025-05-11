
function main() {
  console.log("Hello, World!");


}

main();
let windowHeight = window.innerHeight
const maxScroll = windowHeight * 0.35
const onClickLink = document.getElementById('title').onclick
console.log(onClickLink)
const title = document.getElementById('title');


$(window).scroll(function () {
  let scroll = $(window).scrollTop()
  
  if (scroll >= maxScroll){
    scroll = maxScroll;
    title.onclick = onClickLink;
    title.style.cursor = "pointer";
  } else {
    title.onclick = "";
    title.style.cursor = "default";
  }
  console.log(scroll, scroll/maxScroll);
  title.style.top = String(35-(35*scroll/maxScroll)).concat("dvh");
  title.style.height = String(20-(13*scroll/maxScroll)).concat("dvh");
  title.style.left = String(20 + (20*scroll/maxScroll)).concat("dvw");
  title.style.width = String(60 - (40*scroll/maxScroll)).concat("dvw");
  title.style.paddingBottom = String(5 - (5*scroll/maxScroll)).concat("dvh");
  title.style.paddingTop = String(5 - (5*scroll/maxScroll)).concat("dvh");

});