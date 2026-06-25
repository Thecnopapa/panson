

let now = Date.now()
//console.log("NOW: ", now);

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
            //console.log(trigger.boundingClientRect.left < window.innerWidth, trigger.boundingClientRect.left,trigger.boundingClientRect.right, window.innerWidth)
            condition = (trigger.boundingClientRect.left < window.innerWidth)
        }


        if (condition) {
            //console.log(trigger.boundingClientRect.top, window.innerHeight);

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
        imagesToPreload.push(imageUrl(info.bucket, info.img1))
        preloadHiddenImages()
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
    constructor(element, options={}, query={}) {
        this.element = element;
        this.bucket = options.bucket;
        this.maxItems = Number(options.maxItems);
        this.minItems  = Number(options.minItems);
        this.minRow = Number(options.minRow);
        this.inline = Boolean(Number(options.inline));
	    this.readUrl = Boolean(Number(options.readUrl));
        this.query = query;
        this.products = Object.keys(allItems);
        this.products = this.filter();
        this.subset = undefined;
        //console.log(this.products);
        this.template = this.element.querySelector(".template");
        this.nId = "gallery-" + String(nGalleries);
        element.classList.add(this.nId);
        element.setAttribute("galleryId", this.nId);
        nGalleries += 1;
        allGalleries[this.nId] = this;
        this.galeria = this.element.querySelector(".galeria");
    }

    update(query={}){
        console.log("Updating", this.nId);
        console.log(query);
        let subset = this.filter(query);
        console.log({subset});
        this.subset = subset
        this.deleteAll();
        this.addRow()
    }

    filter(query= {}){
        //console.log("Filtering...");
        //console.log(this.query);
        //console.log(query);

        let filteredProds = undefined;

        [this.query, query].forEach(qq => {
            //console.log({qq});

            let queryDict = {};
            if (qq.query !== "" && qq.query !== undefined) {
                //console.log(qq.query);
                let qSplit = undefined;
                let exclusive = true;
                let exclude = [qq.exclude]; // TODO: implement multiple excluded
                if (qq.query.includes("&")) {
                    qSplit = qq.query.split("&");
                } else if (qq.query.includes("|")) {
                    qSplit = qq.query.split("|");
                    exclusive = false;
                } else {
                    qSplit = [qq.query];
                }
                //console.log({qSplit});

                qSplit.forEach(q => {
                    let kv = q.split("=");
                    let k = kv[0];
                    let v = kv[1];
                    if (["True", "true", "T", "Y"].includes(v)) {
                        v = true
                    } else if (["False", "false", "F", "N"].includes(v)) {
                        v = false
                    }
                    queryDict[k] = v;
                    //console.log({q,kv, k, v});
                });


                let availProds = undefined;
                if (filteredProds === undefined) {
                    availProds = this.products;
                    filteredProds = [];
                } else {
                    availProds = filteredProds;
                }

                //console.log({queryDict});
                //console.log(Object.keys(queryDict).length);
                if (Object.keys(queryDict).length >= 0) {
                    availProds.forEach(pID => {
                        let data = allItems[pID];
                        //console.log(data);
                        let reqs = []
                        if (!exclude.includes(pID)) {
                            Object.keys(queryDict).forEach(k => {
                                //console.log(k);
                                let pVal = data[k];
                                let qVal = queryDict[k];
                                let negate = false;
                                if (qVal[0] === "!") {
                                    qVal = qVal.split("!")[1];
                                    negate = true
                                }
                                //console.log({pVal, qVal, negate});
                                //console.log(pVal === qVal && !negate, pVal !== qVal && negate)

                                if ((pVal === qVal && !negate) || (pVal !== qVal && negate)) {
                                    reqs.push(true);
                                } else {
                                    if (exclusive) {
                                        reqs.push(false);
                                    }
                                }
                            });
                            //console.log({reqs});
                            if ((reqs.includes(true) && !reqs.includes(false))) {
                                filteredProds.push(pID);
                            }
                        }
                    });

                }
            }

        });
        if (filteredProds === undefined){return this.products;}
        //console.log(filteredProds);

        if (this.query.range !== undefined && this.query.range !== "0-1") {
            let range = this.query.range.split("-");
            //console.log({range});
            let n = filteredProds.length;
            let shifts = Math.ceil(n*Number(range[0]));
            let pops = Math.floor(n*(1-Number(range[1])));
            //console.log({shifts, pops});
            for (let i = 0; i < shifts; i++) {filteredProds.shift()}
            for (let i = 0; i < pops; i++) {filteredProds.pop()}
        }
        //console.log(filteredProds);
        return filteredProds;
    // let filteredDict = {}
    //     for (let i = 1; i < filteredProds.length; i++){
    //         filteredDict[i] = filteredProds[i];
    //     }
    // console.log(filteredDict);
	// return filteredDict;
    }

    deleteAll(){
	    this.all_elements().forEach(el => {el.remove()});
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
        return this.galeria.querySelectorAll(".producte:not(.template):not(.empty)");
    }
    all_elements(){
        return this.galeria.querySelectorAll(".producte:not(.template)");
    }
    last(){
        let els = this.elements();
        //console.log(els);
        //console.log(this)
        return els[els.length - 1];
    }

    addRow() {
        //console.log("Adding row...");

        //console.log({current});
        let all = undefined;
        if (this.subset === undefined){all = this.products;}
        else {all = this.subset}
        //console.log({all});

        let maximum = all.length;
        if (this.maxItems > 0){
            maximum = Math.min(maximum, this.maxItems);
        }

        let nCurrent = this.length();
        let nAvail = maximum - nCurrent;

        console.log({nCurrent, maximum, nAvail, "minRow": this.minRow});
        let nToAdd = Math.min(this.minRow, maximum, nAvail)
        console.log(this.elements())
        console.log({nToAdd});
        for (let i = nCurrent; i < nCurrent+nToAdd; i++) {
            console.log("Adding:", all[i]);
            this.addProduct(new Product(allItems[all[i]]));
        }
        let paddingProds =  Math.max(0, ( this.length() % this.minRow));
        console.log({paddingProds});
        if (paddingProds > 0 && !this.inline) {
            for (let i = 0; i < paddingProds; i++) {
                this.addProduct();
            }
        }
        console.log(nAvail, this.length());
        if (nAvail > 0){
            if (!this.last().classList.contains("observed")){
                this.last().classList.add("observed");
                galleryObserver.observe(this.last())
            }

        } else {
            //console.log("All products displayed!")
        }

        loadAllImages()

    }
}


function initGaleria(element) {

    let options = {
        bucket: element.getAttribute("bucket"),
        maxItems: element.getAttribute("maxProds"),
        minRow: element.getAttribute("minRow"),
        minItems: element.getAttribute("minProds"),
        inline: element.getAttribute("inline"),
	readUrl: element.getAttribute("readUrl"),
    }

    let query = {
        query: 	element.getAttribute("query"),
        range: 	element.getAttribute("range"),
        exclude: 	element.getAttribute("exclude"),
        exclusive: 	element.getAttribute("exclusive"),
    }

    console.log("   > Initializing Galeria", {options}, {query});
    let galeria = new Galeria(element, options, query);


    if (galeria.readUrl){
	    let params = new URLSearchParams(document.location.search);
	    let UrlQuery = params.get("query", undefined);
	    let UrlTextQuery = params.get("q", undefined);
	    console.log("Reading Url");
	    console.log(params);
	    if (UrlQuery === undefined || UrlQuery === null){UrlQuery="";}
	    query={
		    query: UrlQuery.replace("*", "&").replace(" ", "&"),
		    text: UrlTextQuery,
	    }
	    console.log(query.query);
	    galeria.update(query);
    }
    galeria.addRow()
    //console.log(galeria.products);

    //console.log(Math.min(galeria.products.length, minItems));
    // for (let i = 0; i < Math.min(galeria.products.length, galeria.minItems); i++) {
    //     //console.log(galeria.products[i]);
    //     galeria.addProduct(new Product(allItems[galeria.products[i]]));
    // }
    // let paddingProds =  galeria.minRow - Math.max(0, (galeria.length() % galeria.minRow));
    // //console.log({paddingProds}, galeria.length(), galeria.minRow);
    // if (paddingProds < galeria.minRow && !this.inline) {
    //     for (let i = 0; i < paddingProds; i++) {
	//         galeria.addProduct();
    //     }
    // }
    if (galeria.inline){

    }
    //console.log(galeria.last());
    let last = galeria.last();
    if (last !== undefined) {
        galleryObserver.observe(galeria.last());

    }

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



const galleryElements = document.getElementsByClassName("content-galeria");
for (let i = 0; i < galleryElements.length; i++) {
    //let params = new URLSearchParams(document.location.search);
    //let URLQuery = params.get("query", undefined);
    const galeria = galleryElements[i];
    initGaleria(galeria);

    loadAllImages()

}


function filterGaleria(trigger){
	let galleryID = trigger.parentElement.parentElement.parentElement.getAttribute("galleryID");
	let query ={
		"query": trigger.getAttribute("query"),
	}
	let gallery = allGalleries[galleryID];
	gallery.update(query);
}



function galleryAnimation(triggers, ops) {
    triggers.forEach(trigger => {
        if (trigger.boundingClientRect.top > 0) {
            trigger.target.classList.toggle("outside", !trigger.isIntersecting);
        }
    })
}


let filterDivs = document.querySelectorAll(".filtre-buttons");
filterDivs.forEach(fd => {
    fd.addEventListener("scroll", displayGradient, {passive: false});
});


function displayGradient() {
    let fd = this;
    //console.log(fd.scrollLeft, fd.offsetWidth, fd.scrollWidth);
    fd.previousElementSibling.classList.toggle("end-right", fd.scrollLeft + fd.offsetWidth >= fd.scrollWidth);
    fd.previousElementSibling.classList.toggle("end-left", fd.scrollLeft <= 0);

}



setInterval(updateDeltas, 1000);

print(" * Gallery JS ready");
