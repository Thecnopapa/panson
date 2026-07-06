console.log(" * Initialising Navigation JS");







const navigation = document.getElementsByClassName("navigation")[0];
const navLeft = document.getElementById('nav-left');

const navButtons = [...document.getElementsByClassName('dropbtn')];
const lanButtons = [...document.getElementsByClassName('language')];

const searchIcon = document.querySelector("#nav-search-icon");
const searchInput = document.getElementsByClassName("search-text")[0];
const searchResults = document.getElementsByClassName("search-results")[0];

const cartIcon = document.getElementsByClassName('shopping-cart')[0];
const cartCircle = document.getElementsByClassName('cercle-carret')[0];
const navTitle = document.getElementById("title");


camaleonElements.push(...navButtons, ...lanButtons, cartCircle, cartIcon, searchIcon, searchInput, navTitle);



let forceBlack = {search:false, menu:false, scroll:false}




function goBlack(){
    //console.log("GoBlack");
    for (let i = 0; i < camaleonElements.length; i++) {
        if (camaleonElements[i] !== null && camaleonElements[i] !== undefined ) {
            camaleonElements[i].classList.remove('white');
        }
    }
}

function goWhite() {
    //console.log("GoWhite");
    for (let i = 0; i < camaleonElements.length; i++) {
        if (camaleonElements[i] !== null && camaleonElements[i] !== undefined) {
            camaleonElements[i].classList.add('white');
        }
    }
}

function checkColor() {
    //console.log("Checking colour:", targetColour);
    let forceNot = Object.values(forceBlack).some((x) => x)
    //console.log("force black=", Object.values(forceBlack), forceNot);
        if (targetColour === "white" && !forceNot) {
            goWhite();
        } else if (targetColour === "black" || forceNot) {
            goBlack();
        }

        try{
            let navColour = colorElement.attributes.navColor.value;
            if (navColour === "translucid") {
                navigation.classList.remove("opaque");
            } else if (navColour === "opaque") {
                navigation.classList.add("opaque");
            }
            return navColour
        } catch {}
}



function background_to_url(background){
    return  background.replace(/"/g, "").split("(")[1].split(")")[0];
}


function getImageBrightness(url) {
    //console.log(url)
    const newImg = document.createElement("img");


    newImg.style.zIndex = "-999";
    newImg.src = url
    newImg.classList.add("hidden");


    let colorSum = 0;
    newImg.onload = function() {
        let canvas = document.createElement("canvas");
        canvas.width = this.width;
        canvas.height = this.height;
        var ctx = canvas.getContext("2d");
        ctx.drawImage(this,0,0);

        var imageData = ctx.getImageData(0,0,canvas.width,canvas.height);
        var data = imageData.data;
        var r,g,b,avg;

        for(var x = 0, len = data.length; x < len; x+=4) {
            r = data[x];
            g = data[x+1];
            b = data[x+2];

            avg = Math.floor((r+g+b)/3);
            colorSum += avg;
        }

        let brightness = Math.floor(colorSum / (this.width*this.height));
      //console.log(brightness);
      newImg.setAttribute("brightness", brightness);
    }
    return newImg.getAttribute("brightness");
}

function getImageBrightnessSO(image,callback) {
    var thisImgID = image.attr("id");

    const img = document.createElement("img");
    img.src = image.attr("src");

    img.style.display = "none";
    document.body.appendChild(img);

    let colorSum = 0;

    img.onload = function() {
        // create canvas
        var canvas = document.createElement("canvas");
        canvas.width = this.width;
        canvas.height = this.height;

        var ctx = canvas.getContext("2d");
        ctx.drawImage(this,0,0);

        var imageData = ctx.getImageData(0,0,canvas.width,canvas.height);
        var data = imageData.data;
        var r,g,b,avg;

          for(var x = 0, len = data.length; x < len; x+=4) {
            r = data[x];
            g = data[x+1];
            b = data[x+2];

            avg = Math.floor((r+g+b)/3);
            colorSum += avg;
        }

        var brightness = Math.floor(colorSum / (this.width*this.height));
        callback(thisImgID, brightness);
    }
}





let blackObserver = new IntersectionObserver((triggers) => {colorScroll(triggers);} ,{threshold: 0.06}
);


function colorScroll(triggers){
    //console.log("Color scroll")
    if (!triggers[0].isIntersecting) {
        forceBlack["scroll"] = true;
        goBlack();
        navigation.classList.add("opaque");
    } else {
        forceBlack["scroll"] = false;
        checkColor();
        navigation.classList.remove("opaque");

    }
}



try{
    blackObserver.observe(document.getElementById("producte-images"));
    
} catch {}

try{
    blackObserver.observe(document.getElementsByClassName("imatge-collecio")[0]);
    /*camaleonElements.push(document.getElementsByClassName("titol-collecio")[0])
    document.getElementsByClassName("titol-collecio")[0].addEventListener("click", function() {
        let galleries = [...document.getElementsByClassName('content-galeria')];
        galleries.forEach(g => {if (g.offsetParent !== null){g.scrollIntoView({block: 'end'})}});
    });*/
    
} catch {}



function toggleLanguages(trigger){
	let notCurrent = [...trigger.getElementsByClassName("not-current")];
	if (trigger.classList.contains("open")) {
		trigger.classList.remove("open");
		notCurrent.forEach(el => {
			//el.style.visibility = "hidden";
			el.style.display = "none";
		});
	} else {
		trigger.classList.add("open");
		notCurrent.forEach(el => {
			//el.style.visibility = "visible";
			el.style.display = "flex";
		});
	}
}

function closeSearchEsc(event){
    if (event.key === "Escape"){
        //console.log("escaping search");
        event.preventDefault();
        hideSearch(true);
        document.documentElement.removeEventListener("keydown", closeSearchEsc);
    } else if (event.key === "Enter"){
        //console.log("escaping search");
        let resultsDiv = searchIcon.parentElement.querySelector(".search-over-page");
        let textDiv = resultsDiv.querySelector(".gallery-search-text")
        window.location.href = "/"+document.documentElement.lang+"/search/?q="+textDiv.value
    }
}

async function documentClickCatcher(event){
    if (event.approved === true || isIphone){
        return
    }
    event.stopImmediatePropagation();
    event.stopPropagation();
    event.preventDefault();
    //console.log(`preventing event... (${event.type})`)

    await new Promise(r => setTimeout(r, 100));
    //console.log(`timeout finished (${event.type})`)


    if (!hideSearch()){
        //console.log("resuming event...")
        let newEvent = new event.constructor(event.type, event)
        newEvent.approved = true;
        event.target.dispatchEvent(newEvent);
    }
}

function showSearch(){
    //console.log("Showing search");
    closeMenu();
    closeCart();
    let trigger = searchIcon;
    let resultsDiv = trigger.parentElement.querySelector(".search-over-page");
    let textDiv = resultsDiv.querySelector(".gallery-search-text");
    let galleryDiv = resultsDiv.querySelector(".content-galeria");
    galleryDiv.classList.remove("closed");
    galleryDiv.classList.remove("fully-closed");
    function setFullyOpen(g) {
        if (!g.classList.contains("closed")){
            g.classList.add("fully-open");
            trigger.setAttribute("onclick", "hideSearch(true)");
            textDiv.focus();
        }
    }
    let timeout = 1000;
    if (oldSafari){
        timeout = 0;
    }
    setTimeout( setFullyOpen, timeout ,galleryDiv);




    document.documentElement.addEventListener("keydown", closeSearchEsc);
    // searchIcon.parentElement.classList.remove("closed");
    // searchIcon.parentElement.classList.add("open");
    // searchIcon.style.display = "none";
    // searchInput.style.display = "block";
    resultsDiv.classList.remove("hidden");
    resultsDiv.classList.add("open");
    navigation.classList.add("force-opaque");
    forceNavTitle()
    //document.documentElement.style.overflow = "hidden";
    document.documentElement.classList.add("blocked");

    forceBlack["search"] = true;
    checkColor();


    window.addEventListener("click", documentClickCatcher, true )
    window.addEventListener("scroll", documentClickCatcher, true )
    window.addEventListener("mousedown", documentClickCatcher, true )
    window.addEventListener("mouseup", documentClickCatcher, true )


}

function hideSearch(force=false){

    let trigger = searchIcon;

    //console.log("hidingSearch");
    let areaOfInterest = document.querySelector(".navigation-right");
    let resultsDiv = trigger.parentElement.querySelector(".search-over-page");


    if (areaOfInterest.matches(":hover") && !force) {
        return false;
    }
    let textBox = resultsDiv.querySelector(".search-over-page .gallery-search-text");
    textBox.blur()
    window.removeEventListener("click", documentClickCatcher, true)
    window.removeEventListener("scroll", documentClickCatcher, true)
    window.removeEventListener("mousedown", documentClickCatcher, true)
    window.removeEventListener("mouseup", documentClickCatcher, true)


    trigger.setAttribute("onclick", "showSearch()");

    document.documentElement.removeEventListener("keydown", closeSearchEsc);


    let galleryDiv = resultsDiv.querySelector(".content-galeria");
    galleryDiv.classList.add("closed");
    galleryDiv.classList.remove("fully-open");

    function setFullyClosed(g) {if(g.classList.contains("closed")){g.classList.add("fully-closed");}}
    let timeout = 1000;
    if (oldSafari){
        timeout = 0;
    }
    setTimeout(setFullyClosed, timeout, galleryDiv);

    // searchIcon.parentElement.classList.remove("open");
    // searchIcon.parentElement.classList.add("closed");

    // searchInput.style.display = "none";
    // searchIcon.style.display = "block";
    //resultsDiv.classList.add("hidden");
    resultsDiv.classList.remove("open");
    navigation.classList.remove("force-opaque");
    unforceNavTitle()
    document.documentElement.style.overflow = "";
    document.documentElement.classList.remove("blocked");
    forceBlack["search"] = false;
    checkColor();
    return true

}

function resizeSearch(){
    let fontSize = Number(getComputedStyle(searchInput).fontSize.replace("px",""));
    //console.log(fontSize, (1+ searchInput.value.length), (1+searchInput.value.length) * fontSize);
    const targetWidth =  (1+searchInput.value.length) * fontSize * 0.55;
    searchInput.style.width =  String(targetWidth)+"px";
}


function searchInDict(query, key, params=[undefined]){
    let ResultFound = {};
    let results = []
    if (query.length === 0){
        return results;
    }



    for (let el in searchableItems[key]) {
        try{
            params.forEach(p => {
                let target = el
                //console.log(el);
                if (p !== undefined && p !== null) {
                    //console.log("p", p);
                    target = searchableItems[key][el][p];
                }
                if (target !== undefined) {
                    target = target.normalize()
                    target = target.toLowerCase();
                    if (target.search(query) >= 0) {
                        //console.log(query, target, target.search(query));

                        results.push({"name": searchableItems[key][el]["name"] , "url": searchableItems[key][el].url, "key": key, "id":el});
                        throw ResultFound;
                    }
                }
            });

        } catch(e){
            if (e !== ResultFound) throw e;
        }
    }
    return results;
}



function globalSearch(trigger) {
	let resultsDiv = trigger.parentElement.querySelector(".search-over-page");
	let galleryID = resultsDiv.querySelector(".content-galeria").getAttribute("galleryId");
	let gallery = allGalleries[galleryID];

	resultsDiv.classList.remove("hidden")

	let query = {
		text: trigger.value
	}

	gallery.update(query);
}



function deprecatedShowResults(results){
    let supercontainer = document.querySelector(".search-results");

    Object.keys(results).forEach(cat => {
        let container = document.querySelector(".search-results-group-" + cat);
        if (!container) {
            container = document.createElement("div");
            container.classList.add("search-results-group");
            container.classList.add("search-results-group-" + cat);
            supercontainer.appendChild(container);
        }
        //console.log(container);
        //console.log(cat);
        //console.log(Object.keys(results[cat]));

        if (Object.keys(results[cat]).length === 0) {
            supercontainer.removeChild(container);

        } else {

            let resultElements = [];
            Object.keys(results[cat]).forEach(result => {
                resultElements[results[cat][result].id] = results[cat][result];
            });
            //console.log(resultElements);

            [...container.children].forEach(el => {
                if (el.id in Object.keys(resultElements)){
                    //console.log("M", el.id);
                    resultElements[cat].delete(el.id);
                } else {
                    container.removeChild(el)
                    //container.removeChild(el);
                }
            });
            //console.log(resultElements);
            //console.log("###")

            Object.keys(resultElements).forEach(result => {
                result = resultElements[result];
                //console.log("R", result);
                let newElement = document.createElement("div");
                newElement.id = result.id;
                newElement.classList.add("search-result");
                newElement.classList.add("search-result-"+result.key);
                newElement.innerText = result.name;
                newElement.setAttribute("onclick", "window.location.href='" + result.url + "';");
                container.appendChild(newElement);
            })
        }
    });

}


function deprecatedUpdateSearchResults(){
    let query = searchInput.value.normalize();
    query = query.toLowerCase();
    //console.log("QUERY:" + query);
    let letters = query.split("");
    //console.log("LETTERS:" + letters);
    let rx = ""
    letters.forEach(l => {
        rx = rx + l + ".*"
    })
    rx = rx.slice(0, rx.length-2) + "" //
    //console.log("RX:", rx);
    query = rx

    let results = Object()
    results.tipus = searchInDict(query, "tipus", [undefined, "name"]);
    results.cols = searchInDict(query, "cols", [undefined, "name"]);
    results.prods = searchInDict(query, "prods", ["name", "tipus", "col"]);
    results.fam = searchInDict(query, "fam", ["tipus", "per_a"]);
    //console.log(results);
    showResults(results);




}
function closeMenusEsc(event){
    if (event.key === "Escape"){
        closeMenu()
        closeCart();
    }
}


document.documentElement.addEventListener("keydown", closeMenusEsc);


window.addEventListener("load", (e) =>{
	checkColor();
    searchIcon.addEventListener("click", () => {showSearch()});
});


console.log(" * Navigation JS initialised")
