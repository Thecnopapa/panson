

function scrollGallery(galeria, direction){
    var targetScroll = galeria.scrollLeft;
    if (direction === "right"){
        targetScroll += 1;
    } else if (direction === "left"){
        targetScroll -= 1;
    }
    galeria.scrollTo(targetScroll, 0);
}


function startScrolling(galeria, direction) {

    if (galeria.attributes["intervalId"]) {
        console.log("current intervalId: " + galeria.attributes["intervalId"].value);

    } else{
        console.log("startScrolling");
        const intervalId = setInterval(scrollGallery, 1, galeria, direction);
        galeria.setAttribute("intervalId", intervalId);
        console.log("scrollId:", intervalId);
    }
}



function stopScrolling(galeria) {

    const currentInterval = galeria.attributes["intervalId"]
    console.log("stopping interval: ", currentInterval);
    if (currentInterval) {
        console.log(`stopScrolling(${galeria.attributes["intervalId"].value})`);
        clearInterval(Number(currentInterval.value));
        galeria.removeAttribute("intervalId");
    }

}