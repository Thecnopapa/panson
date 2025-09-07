

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
        //console.log("current intervalId: " + galeria.attributes["intervalId"].value);

    } else{
        //console.log("startScrolling");
        const intervalId = setInterval(scrollGallery, 1, galeria, direction);
        galeria.setAttribute("intervalId", intervalId);
        //console.log("scrollId:", intervalId);
    }
}



function stopScrolling(galeria) {

    const currentInterval = galeria.attributes["intervalId"]
    //console.log("stopping interval: ", currentInterval);
    if (currentInterval) {
        //console.log(`stopScrolling(${galeria.attributes["intervalId"].value})`);
        clearInterval(Number(currentInterval.value));
        galeria.removeAttribute("intervalId");
    }

}

function highlightProduct(trigger) {
    trigger.classList.add("active");


}

function reverseProduct(trigger) {
    trigger.classList.remove("active");
}

function initGaleria(galeria, targetPage=undefined, filterKey=undefined, filterValue=undefined) {
    print(" * Initialising galeria")
	const currentPage = Number(galeria.attributes.page.value);
	if (targetPage === undefined){
		targetPage = currentPage;
	}

	targetPage=Number(targetPage);
	galeria.setAttribute("page", targetPage);
	galeria.scrollTo(0,0);
	const infoElement = galeria.getElementsByClassName("gallery-info")[0];
	const maxProds = Number(infoElement.attributes.maxProds.value);
	const bucket = infoElement.attributes.bucket.value;
	const key = infoElement.attributes.filterKey.value;
	const value = infoElement.attributes.filterValue.value;
	
	if (key !== "None" && value !== "None"){
		console.log("Filters from div")
		filterKey = key;
		filterValue = value;
	}


    const allProducts = galeria.getElementsByClassName("hidden-info-producte");
    if (filterKey === null){filterKey = undefined;}
    if (filterValue === null){filterValue = undefined;}
    let filteredProducts = []
    if (filterKey !== undefined  && filterValue !== undefined){
        for (let i = 0; i < allProducts.length; i++) {
            print(filterKey);
            if (allProducts[i].attributes[filterKey].value === filterValue){
                filteredProducts.push(allProducts[i]);
            }
        }
    } else {
        filteredProducts = allProducts;
    }
    const productElements = galeria.getElementsByClassName("producte enabled");

    for (let i = 0; i < maxProds; i++) {
        const targetProductNo = i + targetPage*maxProds;
        changeProduct(productElements[i], filteredProducts[targetProductNo], bucket);
    }
    loadAllImages()
}




function filterGaleria(trigger){
	const galeria = trigger.parentElement.parentElement.parentElement;
	const key = trigger.attributes.filterKey.value;
	const value = trigger.attributes.filterValue.value;
	window.history.replaceState(document.title, "", document.location.pathname+"?filterKey=" + key + "&filterValue=" + value);
	initGaleria(galeria, 0, key, value);
}


function changeProduct(element, product, bucket) {
    let info = undefined;
    try {
        info = product.attributes;
    } catch (e){
        //print(e);
        element.classList.add("empty");
        return}
    //print(element);
    //print(info);
    element.classList.remove("empty");
    element.getElementsByClassName("imatge primera")[0].setAttribute("background", imageUrl(bucket, info.img1.value));
    element.getElementsByClassName("imatge segona")[0].setAttribute("background", imageUrl(bucket, info.img2.value));
	if (bucket === "bespoke"){
		element.getElementsByClassName("per-a")[0].innerHTML = info.per_a.value;
	} else{
            element.onclick = function () { location.href = "/"+document.documentElement.lang + "/"+bucket+"/"+info.id.value }
    		element.getElementsByClassName("nom")[0].innerHTML = info.nom.value;
    		element.getElementsByClassName("preu-inline")[0].innerHTML = info.preu.value;
	}

}

const galleryElements = document.getElementsByClassName("content-galeria");
for (let i = 0; i < galleryElements.length; i++) {
	let params = new URLSearchParams(document.location.search);
	const key = params.get("filterKey", undefined);
	const value = params.get("filterValue", undefined);
	initGaleria(galleryElements[i], undefined, key, value);

}


print(" * Gallery JS ready")
