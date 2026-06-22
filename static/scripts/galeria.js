

let now = Date.now()
console.log("NOW: ", now);

function miliToTime(miliseconds){
	let days = Math.floor(miliseconds /  86400000);
	miliseconds -= days * 86400000;
	let hours = Math.floor(miliseconds / 3600000);
	miliseconds -= hours * 3600000;
	let minutes = Math.floor(miliseconds / 60000);
	miliseconds -= minutes * 60000;
	let seconds = Math.floor(miliseconds / 1000);
	return [days, hours, minutes, seconds]
}



async function updateDeltas(){
	deltaElements = document.querySelectorAll(".launch-time-cover:not(.hidden)");
	now = Date.now();
	deltaElements.forEach(element => {
		let deltaLaunch = Number(element.getAttribute("launchTime")) - now;
		if (deltaLaunch < 0){
			element.classList.add("hidden");
			element.parentElement.onclick = function () {location.href = element.getAttribute("link");}
		}
		let deltaTime = miliToTime(deltaLaunch);
		let timeElements = element.querySelectorAll(".launch-time");
		for (let i=0; i < timeElements.length; i++){
			let t = String(deltaTime[i]);
			if (t.length === 1){t="0"+t;}
			timeElements[i].innerText = t;
		}
	});
}


async function scrollGallery(galeria, direction, amount){
    let targetScroll = galeria.scrollLeft;
	//console.log("scrolling", galeria);
	if (amount.includes("%")){
		amount = Number(amount.replace("%", ""));
		//console.log(amount, galeria.offsetWidth);
		amount = amount * galeria.offsetWidth / 100;
		//console.log(amount);
	} else if (amount.includes("u")){
		amount = Number(amount.replace("u", ""));
		let refEl = galeria.querySelector(".producte:not(.template)");
		let p_width = refEl.offsetWidth + parseFloat(window.getComputedStyle(refEl).marginRight);
		//console.log(p_width);
		amount = amount * p_width;
	} else {
		amount = Number(amount);
	}
	//console.log("Scrolling: ", targetScroll, amount);

    if (direction === "right"){
        targetScroll += amount;
    } else if (direction === "left"){
        targetScroll -= amount;
    }
	//console.log("final:", targetScroll);
	galeria.scrollTo(targetScroll, 0);



}

async function hideScrollArrows(event){
	let galeria = event.target;
	//console.log("Checking arrows...");
    let hideLeft = galeria.scrollLeft <= 1;
    let hideRight = (galeria.scrollLeft + galeria.offsetWidth) >= galeria.scrollWidth -1;
	//console.log(galeria.scrollLeft, hideLeft, hideRight);


	let leftArrow = galeria.parentElement.querySelector(".scroll-left-button");
    let rightArrow = galeria.parentElement.querySelector(".scroll-right-button");
	//console.log({leftArrow, rightArrow});

	leftArrow.classList.toggle("disabled", hideLeft);
    rightArrow.classList.toggle("disabled", hideRight);


}


function highlightProduct(trigger) {
    if (window.innerWidth <= desktopThreshold) {return;}
    trigger.classList.add("active");
    trigger.children[0].style.visibility = "hidden";
    trigger.style.webkitTransform = 'scale(1)';
}

function reverseProduct(trigger) {
    trigger.classList.remove("active");
    trigger.children[0].style.visibility = "visible";
    trigger.style.webkitTransform = 'scale(1)';
}

let galleryObserver = new IntersectionObserver(galleryAddRow, {
    threshold: 0.9,
});

let animationObserver = new IntersectionObserver(galleryAnimation, {
	threshold: 0.3,
});



function galleryAddRow(triggers, ops){
	triggers.forEach(trigger => {
        let condition = undefined;
        let galleryID = trigger.target.getAttribute("galleryID")
        let gallery = allGalleries[galleryID];

        if (!gallery.inline){
            condition = (trigger.boundingClientRect.top < window.innerHeight)
        } else {
            console.log(trigger.boundingClientRect.left < window.innerWidth, trigger.boundingClientRect.left,trigger.boundingClientRect.right, window.innerWidth)
            condition = (trigger.boundingClientRect.left < window.innerWidth)
        }


        if (condition) {
            console.log(trigger.boundingClientRect.top, window.innerHeight);

            galleryObserver.unobserve(trigger.target);
            trigger.target.classList.remove("observed");
            gallery.galeria.classList.toggle("need-more", trigger.isIntersecting);
            gallery.addRow();
        }

	});
}



class Product {
    constructor(data) {
        this.data = data;
        this.empty = true;

        if (data !== undefined) {
            this.id = this.data.id;
            this.empty = false;
        }
    }
    writeEmpty(template){
	    let el = template.cloneNode(true);
	    el.classList.remove("template");
	    return el
    }
    writeTemplate(template){
        //console.log(template);
        let el = template.cloneNode(true);
        let info = this.data
        //console.log(info)
        el.getElementsByClassName("imatge primera")[0].setAttribute("background", imageUrl(info.bucket, info.img1));
        el.getElementsByClassName("imatge segona")[0].setAttribute("background", imageUrl(info.bucket, info.img2));
        el.classList.remove("template");
        el.classList.remove("empty");

        let deltaLaunch = 0;
        let launchTime = undefined;
        if (info.startDate.value !== ""){
            launchTime = Date.parse(info.startDate);
            deltaLaunch = launchTime - now;
        }
        if (deltaLaunch > 0){
            let tElement = el.querySelector(".launch-time-cover");
            el.classList.remove("hidden");
            el.setAttribute("launchTime", launchTime);
            el.link = "/"+document.documentElement.lang + "/"+info.bucket+"/"+info.id;

        } else {
            el.querySelector(".launch-time-cover").remove();
            el.onclick = function () { location.href = "/"+document.documentElement.lang + "/"+info.bucket+"/"+info.id }
        }
        if (info.bucket === "bespoke"){
            el.getElementsByClassName("per-a")[0].innerHTML = info.per_a;
        } else{
            el.getElementsByClassName("nom")[0].innerHTML = info.name;
            [...el.getElementsByClassName("preu-inline")].forEach(e => {
                let t = "";
                if (Number(info.descompte.value > 0)){
                    t = "<span class='strikethrough grayed'>"+info.preu_antic+"&#8364;</span>&nbsp;&nbsp;"
                    e.innerHTML = t + "<span class='bold'>" + info.preu + "</span>";
                } else{
                    e.innerHTML = t + info.preu;

                }
            });
        }
        return el;
    }

}


class Galeria {
    constructor(element, bucket, maxItems, minRow, minItems, inline) {
        this.element = element;
        this.bucket = bucket;
        this.maxItems = Number(maxItems);
        this.minItems  = Number(minItems);
        this.minRow = Number(minRow);
        this.inline = Boolean(Number(inline));
        this.products = Object.keys(allItems);
        console.log(this.products);
        this.template = this.element.querySelector(".template");
        this.nId = "gallery-" + String(nGalleries);
        element.classList.add(this.nId);
        element.setAttribute("galleryId", this.nId);
        nGalleries += 1;
        allGalleries[this.nId] = this;
        this.galeria = this.element.querySelector(".galeria");
    }

    deleteEmpty(){
        let emptyElements = this.galeria.querySelectorAll(".producte.empty:not(.template)");
        //console.log({emptyElements});
        emptyElements.forEach(e => {e.remove();});
    }

    addProduct(product=undefined){
        this.deleteEmpty()
        let el = undefined;
        if (product === undefined){
            //console.log("Adding empty..");
            product = new Product();
            el = product.writeEmpty(this.template);
        } else {
            if (product.empty){
                el = product.writeEmpty(this.template)
            } else{
                //console.log("Adding product: ", product.id);
            el = product.writeTemplate(this.template);
            }
        }
        el.setAttribute("galleryId", this.nId);
        //console.log(el);
        this.galeria.append(el);
        //animationObserver.observe(el);
        loadAllImages()
    }

    length(){
        return this.elements().length;
    }
    elements(){
        return this.galeria.querySelectorAll(".producte:not(.template)");
    }
    last(){
        let els = this.elements();
        console.log(els);
        console.log(this)
        return els[els.length - 1];
    }

    addRow() {
        console.log("Adding row...");

        //console.log({current});
        let all = this.products;
        //console.log({all});

        let maximum = all.length;
        if (this.maxItems > 0){
            maximum = Math.min(maximum, this.maxItems);
        }

        let nCurrent = this.length();
        let nAvail = maximum - nCurrent;

        console.log({nCurrent, nAvail, "current+": nCurrent + this.minRow, maximum});

        for (let i = nCurrent; i < Math.min(nCurrent + this.minRow, maximum); i++) {
            console.log(i, all[i]);
            this.addProduct(new Product(allItems[all[i]]));
        }
        let paddingProds =  Math.max(0, ( this.length() % this.minRow));
        //console.log({paddingProds});
        if (paddingProds > 0 && !this.inline) {
            for (let i = 0; i < paddingProds; i++) {
                this.addProduct();
            }
        }
        if (nAvail > 0){
            this.last().classList.add("observed");
            galleryObserver.observe(this.last())
        } else {
            console.log("All products displayed!")
        }

        loadAllImages()

    }
}


function initGaleria(element, bucket="products", maxItems=0, minRow=4, minItems=4, inline=0) {
    console.log("Initializing Galeria", {bucket, maxItems, minRow, minItems, inline});
    let galeria = new Galeria(element, bucket, maxItems, minRow, minItems, inline);
    console.log(galeria);

    console.log(Math.min(galeria.products.length, maxItems), galeria.products.length, maxItems);
    for (let i = 0; i < Math.min(galeria.products.length, minItems); i++) {
        console.log(galeria.products[i]);
        galeria.addProduct(new Product(allItems[galeria.products[i]]));
    }
    let paddingProds =  galeria.minRow - Math.max(0, (galeria.length() % galeria.minRow));
    console.log({paddingProds}, galeria.length(), galeria.minRow);
    if (paddingProds < galeria.minRow && !this.inline) {
        for (let i = 0; i < paddingProds; i++) {
	        galeria.addProduct();
        }
    }
    if (galeria.inline){

    }
    console.log(galeria.last());
	galleryObserver.observe(galeria.last());

    if (!galeria.inline) {
        //animation
        const productElements = galeria.elements();
        for (let i = 0; i < productElements.length; i++) {
            //animationObserver.observe(productElements[i]);
        }
    } else {
        galeria.galeria.addEventListener("scroll", hideScrollArrows)
    }


    return galeria;
}



function deprecatedInitGaleria(galeria, bucket) {
    console.log(" * Initialising galeria");
    console.log("To page: ", targetPage);
	let galeriaElement = galeria.getElementsByClassName("galeria")[0];
	if (galeriaElement.classList.contains("inline")){
		galeriaElement.addEventListener("scroll", hideScrollArrows);
	}



	//galeria.scrollTo(0,0);
	const infoElement = galeria.getElementsByClassName("gallery-info")[0];
	let maxProds = Number(infoElement.attributes.maxProds.value);
    const minRow = Number(infoElement.attributes.minRow.value);
    maxProds += maxProds % minRow


    const allProducts = [...allItems];
    if (filterKey === null || filterKey === "null"){filterKey = undefined;}
    if (filterValue === null || filterValue === "null"){filterValue = undefined;}
    let filteredProducts = [];
    console.log("filters: ", filterKey, filterValue);
    if (filterKey !== undefined  && filterValue !== undefined){
        //track("FilterGaleria", {filterKey: filterKey, filterValue: filterValue});
        for (let i = 0; i < allProducts.length; i++) {
		try{
                if (allProducts[i].attributes[filterKey].value.includes(filterValue)){
                    filteredProducts.push(allProducts[i]);
                } else if (invert) {
                    filteredProducts.push(allProducts[i]);
                }
		} catch (e){}

        }
    } else {
        filteredProducts = allProducts;
    }
    targetPage=Number(targetPage);
    let maxPages = Math.round(Math.ceil(filteredProducts.length / maxProds));
    //console.log({targetPage});
    //console.log("MAX PAGES: ", maxPages);

	const pageNav = galeria.getElementsByClassName("galeria-navigation")[0];
	if (pageNav.attributes.pages.value === "True"){

		const pageCounter = galeria.getElementsByClassName("galeria-counter")[0];
		const leftArrow = galeria.getElementsByClassName("page-arrow left")[0];
		const rightArrow = galeria.getElementsByClassName("page-arrow right")[0];

		pageNav.classList.toggle("disabled", maxPages <=1);
		pageCounter.innerHTML = String(targetPage+1)+" / "+String(maxPages);
		leftArrow.classList.toggle("disabled", targetPage === 0);
		rightArrow.classList.toggle("disabled", (targetPage + 1) === maxPages);

	} else if (pageNav.attributes.more.value === "True"){

        const moreButton = galeria.getElementsByClassName("galeria-load-more")[0];
        moreButton.classList.toggle("disabled", (targetPage + 1) === maxPages);

	} else if (pageNav.attributes.goToShop.value === "True"){

	}else{
		//console.log("disabled");
		//console.log(pageNav);
		pageNav.classList.add("disabled");
	}



    const templateElement = galeria.getElementsByClassName("producte template")[0];
	const currentProducts = galeria.querySelectorAll(".producte:not(.template)").length;
    //console.log("generating new Products: ", targetPage,maxProds,currentProducts);
    for (let i = 0; i < maxProds; i++) {
        const targetProductNo = i + targetPage*maxProds;
        //console.log("producte producte: ", filteredProducts[targetProductNo], i % minRow);

        if (filteredProducts[targetProductNo] === undefined){
		if (i % minRow === 0 ){
			break;
		}
	}
        let newElement = templateElement.cloneNode(true);
        templateElement.parentElement.appendChild(newElement);
        changeProduct(newElement, filteredProducts[targetProductNo], bucket);

    }
	templateElement.parentElement.lastElementChild.classList.add("last");

    loadAllImages()
}


function galeriaNext(galeria){
	//console.log(galeria);
    //track("GaleriaNext", {"page":Number(galeria.attributes.page.value)+1})
	//initGaleria(galeria, Number(galeria.attributes.page.value)+1);
}
function galeriaPrev(galeria){
    //track("GaleriaPrev", {"page":Number(galeria.attributes.page.value)-1})

	//initGaleria(galeria, Number(galeria.attributes.page.value)-1);
}

function filterGaleria(trigger, invert=false){
	const galeria = trigger.parentElement.parentElement.parentElement;
    [...galeria.getElementsByClassName("galeria")[0].children].forEach((p) => {
        if (!p.classList.contains("template")) {p.remove();}
    })
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
    if (invert){
        window.history.replaceState(document.title, "", document.location.pathname+"?filterKey=" + key + "&filterValue=" + value + "&invert=true");

    } else{
        window.history.replaceState(document.title, "", document.location.pathname+"?filterKey=" + key + "&filterValue=" + value);
    }
	//initGaleria(galeria, 0, key, value, invert);
	trigger.classList.add("active");
	}
}


function changeProduct(element, product, bucket) {
    console.log("changing product");
    element.classList.remove("template");
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
    let deltaLaunch = 0;
    let launchTime = undefined;
    if (info.startDate.value !== ""){
	//console.log(info.startDate.value);
    	launchTime = Date.parse(info.startDate.value);
	//console.log(launchTime);
	deltaLaunch = launchTime - now;
    }
    //console.log(deltaLaunch);
    element.getElementsByClassName("imatge primera")[0].setAttribute("background", imageUrl(bucket, info.img1.value));
    element.getElementsByClassName("imatge segona")[0].setAttribute("background", imageUrl(bucket, info.img2.value));
    if (deltaLaunch > 0){
	    let tElement = element.querySelector(".launch-time-cover");
	    tElement.classList.remove("hidden");
	    tElement.setAttribute("launchTime", launchTime);
	    tElement.link = "/"+document.documentElement.lang + "/"+bucket+"/"+info.id.value;

    } else {
		element.querySelector(".launch-time-cover").remove();
    	element.onclick = function () { location.href = "/"+document.documentElement.lang + "/"+bucket+"/"+info.id.value }
    }
	if (bucket === "bespoke"){
		element.getElementsByClassName("per-a")[0].innerHTML = info.per_a.value;
	} else{

    		element.getElementsByClassName("nom")[0].innerHTML = info.nom.value;
            [...element.getElementsByClassName("preu-inline")].forEach(e => {
				let t = "";
				if (Number(info.descompte.value > 0)){
					t = "<span class='strikethrough grayed'>"+info.preu_antic.value+"&#8364;</span>&nbsp;&nbsp;"
					e.innerHTML = t + "<span class='bold'>" + info.preu.value + "</span>";
				} else{
					e.innerHTML = t + info.preu.value;

				}
			});
	}

}




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
	initGaleria(galeria,
        galeria.getAttribute("bucket", "productes"),
        galeria.getAttribute("maxProds", 0),
        galeria.getAttribute("minRow", 4),
        galeria.getAttribute("minProds", 4),
        galeria.getAttribute("inline", 0),
    );


    loadAllImages()

}


function galleryAnimation(triggers, ops) {
    triggers.forEach(trigger => {
        if (trigger.boundingClientRect.top > 0) {
            trigger.target.classList.toggle("outside", !trigger.isIntersecting);
        }
    })
}




try{
	let filterDiv = document.getElementsByClassName("filtre-buttons")[0];
    if (filterDiv !== undefined) {
        let gradientDiv = document.getElementsByClassName("filtre-buttons-gradient")[0];

        function displayGradient() {
            console.log(filterDiv.scrollLeft, filterDiv.offsetWidth, filterDiv.scrollWidth);
            gradientDiv.classList.toggle("end-right", filterDiv.scrollLeft + filterDiv.offsetWidth >= filterDiv.scrollWidth);
            gradientDiv.classList.toggle("end-left", filterDiv.scrollLeft <= 0);

        }


        filterDiv.addEventListener("scroll", displayGradient, {passive: false});
        displayGradient()
    }
} catch(e) {console.log(e);










setInterval(updateDeltas, 1000);





print(" * Gallery JS ready");}