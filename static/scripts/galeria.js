

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

function highlightProduct(trigger) {
    const primera = trigger;
    const segona = trigger.nextElementSibling;
    segona.classList.add("active");
    primera.classList.remove("active");
    primera.classList.add("inactive");

}

function reverseProduct(trigger) {
    const segona = trigger;
    const primera = trigger.previousElementSibling;
    primera.classList.add("active");
    primera.classList.remove("inactive");
    segona.classList.remove("active");
}

function initGaleria(galeria, bucket) {
    print("Initialising galeria:")
    print(galeria)
    const allProducts = document.getElementsByClassName("hidden-info-producte");
    const productElements = document.getElementsByClassName("producte");

    for (let i = 0; i < productElements.length; i++) {
        const targetProductNo = i + currentPage*maxProds;
        changeProduct(productElements[i], allProducts[targetProductNo], bucket);
    }
}

function changeProduct(element, product, bucket) {
    let info = undefined;
    try {
        info = product.attributes;
    } catch (e){
        print(e);
        element.classList.add("empty");
        return}
    print(element);
    print(info);
    element.classList.remove("empty");
    element.getElementsByClassName("imatge primera")[0].style.backgroundImage = 'url('+ imageUrl(bucket, info.img1.value) + ')';
    element.getElementsByClassName("imatge segona")[0].style.backgroundImage = 'url('+ imageUrl(bucket, info.img2.value) + ')';
	if (bucket === "bespoke"){
		element.getElementsByClassName("per-a")[0].innerHTML = info.per_a.value;
	} else{
            element.onclick = function () { location.href = "/"+document.documentElement.lang + "/"+bucket+"/"+info.id.value }
    		element.getElementsByClassName("nom")[0].innerHTML = info.nom.value;
    		element.getElementsByClassName("preu-inline")[0].innerHTML = info.preu.value;
	}

}

let pageBucket = document.getElementById("gallery-info").attributes["bucket"].value;
let currentPage = 0;
let maxProds = Number(document.getElementById("gallery-info").attributes["max-prods"].value);
initGaleria(document.getElementById("galeria"), pageBucket);
window.scrollTo(0,0)
