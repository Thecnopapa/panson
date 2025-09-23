




function scrollGallery(galeria, direction){
    var targetScroll = galeria.scrollLeft;
    if (direction === "right"){
        targetScroll += 2;
    } else if (direction === "left"){
        targetScroll -= 2;
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
	} else{
		galeria.parentElement.scrollIntoView({block: "start"})
	}

	targetPage=Number(targetPage);
	galeria.setAttribute("page", targetPage);
	if (filterKey === undefined && galeria.hasAttribute("filterKey")){filterKey = galeria.attributes.filterKey.value;}
	if (filterValue === undefined && galeria.hasAttribute("filterValue")){filterValue = galeria.attributes.filterValue.value}
	
	console.log(filterKey, filterValue);

	galeria.setAttribute("filterKey", filterKey);
	galeria.setAttribute("filterValue", filterValue);
	

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
    if (filterKey === null || filterKey === "null"){filterKey = undefined;}
    if (filterValue === null || filterValue ==="null"){filterValue = undefined;}
    let filteredProducts = [];
    console.log("filters: ", filterKey, filterValue);
    if (filterKey !== undefined  && filterValue !== undefined){
        for (let i = 0; i < allProducts.length; i++) {
		try{
			
            		if (allProducts[i].attributes[filterKey].value.includes(filterValue)){
                		filteredProducts.push(allProducts[i]);
            		}
		} catch (e){}
		
        }
    } else {
        filteredProducts = allProducts;
    }

	const pageNav = galeria.getElementsByClassName("galeria-navigation")[0];
	if (pageNav.attributes.show.value === "True"){
		const pageCounter = galeria.getElementsByClassName("galeria-counter")[0];
		const leftArrow = galeria.getElementsByClassName("galeria-arrow left")[0];
		const rightArrow = galeria.getElementsByClassName("galeria-arrow right")[0];
	        targetPage=Number(targetPage);
		let maxPages = Math.round(Math.ceil(filteredProducts.length / maxProds));
		console.log("MAX: ", maxPages);
		pageNav.classList.toggle("disabled", maxPages <=1);
		pageCounter.innerHTML = String(targetPage+1)+" / "+String(maxPages);
		leftArrow.classList.toggle("disabled", targetPage === 0);
		rightArrow.classList.toggle("disabled", (targetPage + 1) === maxPages);
	} else{
		console.log("disabled");
		console.log(pageNav);
		pageNav.classList.add("disabled");
	}



    const productElements = galeria.getElementsByClassName("producte enabled");

    for (let i = 0; i < maxProds; i++) {
        const targetProductNo = i + targetPage*maxProds;
        changeProduct(productElements[i], filteredProducts[targetProductNo], bucket);
    }
    loadAllImages()
}


function galeriaNext(galeria){
	console.log(galeria);
	initGaleria(galeria, Number(galeria.attributes.page.value)+1);
}
function galeriaPrev(galeria){
	initGaleria(galeria, Number(galeria.attributes.page.value)-1);
}

function filterGaleria(trigger){
	const galeria = trigger.parentElement.parentElement;
	if (trigger.classList.contains("active")){
		galeria.removeAttribute("filterKey");
		galeria.removeAttribute("filterValue");
		trigger.classList.remove("active");
		initGaleria(galeria);
	}else{
		const filterElements= galeria.getElementsByClassName("filtre");
		for (let i = 0; i < filterElements.length; i++){
			filterElements[i].classList.remove("active");
		}

	const key = trigger.attributes.filterKey.value;
	const value = trigger.attributes.filterValue.value;
	window.history.replaceState(document.title, "", document.location.pathname+"?filterKey=" + key + "&filterValue=" + value);
	initGaleria(galeria, 0, key, value);
	trigger.classList.add("active");
	}
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
            [...element.getElementsByClassName("preu-inline")].forEach(e => {e.innerHTML = info.preu.value;});
	}

}


let galleryObserver = new IntersectionObserver(galleryAnimation, {
    threshold: 0.3,
})



const galleryElements = document.getElementsByClassName("content-galeria");
for (let i = 0; i < galleryElements.length; i++) {
	let params = new URLSearchParams(document.location.search);
	const key = params.get("filterKey", undefined);
	const value = params.get("filterValue", undefined);
    const galeria = galleryElements[i];
    const filterElements= galeria.getElementsByClassName("filtre");
    for (let i = 0; i < filterElements.length; i++){
        if (filterElements[i].attributes.filterKey.value === key && filterElements[i].attributes.filterValue.value === value){
            filterElements[i].classList.add("active");
        }
    }
	initGaleria(galeria, undefined, key, value);
    if (!galeria.classList.contains("inline")){
        const productElements = galeria.querySelectorAll(".producte.enabled:not(.inline)");
        for (let i = 0; i < productElements.length; i++) {
            //galleryObserver.observe(productElements[i]);
        }

    }

}




function galleryAnimation(triggers, ops) {
    triggers.forEach(trigger => {
        if (trigger.boundingClientRect.top > 0) {
            trigger.target.classList.toggle("inside", trigger.isIntersecting);
        }
    })
}


try{
	let filterDiv = document.getElementsByClassName("filtre-buttons")[0];
	let gradientDiv = document.getElementsByClassName("filtre-buttons-gradient")[0];
	
	function displayGradient(){
		console.log(filterDiv.scrollLeft, filterDiv.offsetWidth, filterDiv.scrollWidth);
		gradientDiv.classList.toggle("end-right", filterDiv.scrollLeft + filterDiv.offsetWidth >= filterDiv.scrollWidth);
		gradientDiv.classList.toggle("end-left", filterDiv.scrollLeft <= 0);

	}


	filterDiv.addEventListener("scroll", displayGradient);
	displayGradient()
} catch(e) {console.log(e);}















print(" * Gallery JS ready")
