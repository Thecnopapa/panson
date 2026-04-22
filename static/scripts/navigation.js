







const navigation = document.getElementsByClassName("navigation")[0];
const navLeft = document.getElementById('nav-left');

const navButtons = [...document.getElementsByClassName('dropbtn')];
const lanButtons = [...document.getElementsByClassName('language')];

const searchIcon = document.getElementsByClassName('search-icon')[0];
const searchInput = document.getElementsByClassName("search-text")[0];
const searchResults = document.getElementsByClassName("search-results")[0];

const cartIcon = document.getElementsByClassName('shopping-cart')[0];
const cartCircle = document.getElementsByClassName('cercle-carret')[0];
const navTitle = document.getElementById("title")


camaleonElements.push(...navButtons, ...lanButtons, cartCircle, cartIcon, searchIcon, searchInput, searchResults);

if (navTitle) {
    camaleonElements.push(navTitle)
}






function goBlack(){
    for (let i = 0; i < camaleonElements.length; i++) {
        if (camaleonElements[i] !== null) {
            camaleonElements[i].classList.remove('white');
        }
    }
}

function goWhite(){
    for (let i = 0; i < camaleonElements.length; i++) {
        if (camaleonElements[i] !== null) {
            camaleonElements[i].classList.add('white');
        }
    }
}

function checkColor() {
    const colorElement = document.getElementById("nav-color")
    if (colorElement !== null) {
        try {
            let targetColour = colorElement.attributes.color.value;
            if (targetColour === "white") {
                goWhite();
            } else if (targetColour === "black") {
                goBlack();
            }
        } catch {}
        try{
            let navColour = colorElement.attributes.navColor.value;
            if (navColour === "translucid") {
                navigation.classList.remove("opaque");
            } else if (navColour === "opaque") {
                navigation.classList.add("opaque");
            }
        } catch {}
    }
}

const c = checkColor()
if (c != null) {
   console.log(" * Nav colour: ", c);
}


function background_to_url(background){
    return  background.replace(/"/g, "").split("(")[1].split(")")[0];
}


function getImageBrightness(url) {
    console.log(url)
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
      console.log(brightness);
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
    if (!triggers[0].isIntersecting) {
        goBlack();
        navigation.classList.add("opaque");
    } else {
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

function showSearch(){

    function closeSearchEsc(event){
        if (event.key === "Escape"){
            event.preventDefault();
            hideSearch();
            document.documentElement.removeEventListener("keydown", closeSearchEsc);
        }
    }
    document.documentElement.addEventListener("keydown", closeSearchEsc);
    searchIcon.parentElement.classList.remove("closed");
    searchIcon.parentElement.classList.add("open");
    searchIcon.style.display = "none";
    searchInput.style.display = "block";
    searchResults.style.display = "block";

    searchInput.focus();
}

function hideSearch(){
    if (searchResults.matches(":hover")) {
        return;
    }
    searchIcon.parentElement.classList.remove("open");
    searchIcon.parentElement.classList.add("closed");

    searchInput.style.display = "none";
    searchIcon.style.display = "block";
    searchResults.style.display = "none";
}

function resizeSearch(){
    let fontSize = Number(getComputedStyle(searchInput).fontSize.replace("px",""));
    //console.log(fontSize, (1+ searchInput.value.length), (1+searchInput.value.length) * fontSize);
    const targetWidth =  (1+searchInput.value.length) * fontSize * 0.55;
    searchInput.style.width =  String(targetWidth)+"px";
}

let ResultFound = {};
function searchInDict(query, key, params=[undefined]){
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


function showResults(results){
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


function updateSearchResults(){
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



window.addEventListener("load", (e) =>{
	checkColor()
});


console.log(" * Navigation JS ready")
