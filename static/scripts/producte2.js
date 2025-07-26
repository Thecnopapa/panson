
let oldUrl = new URL(window.location.href);
window.scrollTo({top: Number(oldUrl.searchParams.get("scroll")), behavior: 'smooth'});
let form = document.getElementById('form');



updatePrice();


function updatePrice(){
    let price = 0

    const variationList = document.getElementsByClassName("variation");
    for (let i = 0; i < variationList.length; i++) {
        if (variationList[i].checked) {
            price += Number(variationList[i].attributes.price.value);
        }
    }

    const materialList = document.getElementsByClassName("material");
    for (let i = 0; i < materialList.length; i++) {
        if (materialList[i].checked) {
            price += Number(materialList[i].attributes.price.value);
        }
    }

    const colorList = document.getElementsByClassName("color-selector");
    for (let i = 0; i < colorList.length; i++) {
        if (colorList[i].options[colorList[i].selectedIndex].attributes.price) {
            price += Number(colorList[i].options[colorList[i].selectedIndex].attributes.price.value);
        }
    }
    const priceTag = document.getElementById("final_price");
    priceTag.innerHTML = price;
}

function submitToCart () {
    const theForm = document.getElementById("form");
    const missingInfo = document.getElementById("missing-info");
    document.body.style.cursor = "progress";
    theForm.submit();
    setTimeout(function(){missingInfo.style.display = "block";document.body.style.cursor = "unset";}, 1000);

}

function showInfoDropdown(trigger, popupContent, arrow=undefined) {
    popupContent.style.display = "block";
    oldTrigger = String(trigger.attributes.onclick.value).split("(")[1];
    trigger.setAttribute("onclick","hideInfoDropdown("+oldTrigger);
    if (arrow) {
        arrow.innerHTML = "-";
    }

}

function hideInfoDropdown(trigger, popupContent, arrow=undefined) {
    popupContent.style.display = "none";
    oldTrigger = String(trigger.attributes.onclick.value).split("(")[1];
    trigger.setAttribute("onclick","showInfoDropdown("+oldTrigger);
    if (arrow) {
        arrow.innerHTML = "+";
    }
}

function showPopup(trigger, popupContent) {
    popupContent.style.display = "block";
    hideBackgound(popupContent);
}

function hidePopup(source, sourceElement) {
    let popupContent = undefined;
    if (source == "cross") {
        popupContent = sourceElement.parentElement;
    } else if (source == "backdrop") {
        popupContent = sourceElement.firstChild;
    }
    popupContent.parentElement.before(popupContent);
    popupContent.getElementsByClassName("popup-cross")[0].remove();
    popupContent.nextElementSibling.remove();
    popupContent.style.display = "none";

}

function hideBackgound(popupContent, cross=true) {
    var translucidScreen = document.createElement("div");
    translucidScreen.className = "translucid-screen";
    translucidScreen.setAttribute("onclick","hidePopup('backdrop', this)")
    popupContent.after(translucidScreen);
    translucidScreen.appendChild(popupContent);
    if (cross) {
        addPopupCross(popupContent);
    }
}
function addPopupCross(popupContent) {
    var cross = document.createElement("button");
    cross.className = "popup-cross";
    cross.innerHTML = "x";
    cross.type = "button";
    cross.setAttribute("onclick","hidePopup('cross', this)")
    popupContent.appendChild(cross);
}

function slideshowNext(slideshow){
	if (slideshow === "producte"){
        productSlideshow.update(1);
	}
}

function slideshowPrev(slideshow){
	if (slideshow === "producte"){
        productSlideshow.update(-1);
	}
}

class Slideshow{
    constructor(container) {
        this.imageContainer = container;
        this.images = container.children;
        this.counter = 0;
        this.n_images = this.imageContainer.childElementCount;
        this.state = "still";
	    this.update(0);
    }

    selectImages(){
        if (this.counter === 0) {
            this.prevImg = this.imageContainer.lastElementChild;
        } else {
            this.prevImg = this.images[this.counter - 1];
        }
        this.currentImg = this.images[this.counter];
        if (this.counter === this.n_images-1) {
            this.nextImg = this.images[0];
        } else {
            this.nextImg = this.images[this.counter + 1];
        }
    }

    update(change){
        if (this.state === "still") {
            this.state = "active";
            this.counter += Number(change);
            if (this.counter >= this.n_images) {
                this.counter = 0;
            }
            if (this.counter <0) {
                this.counter = this.n_images-1;
            }
            this.selectImages();
            this.displayImages();
        } else {
            console.log("slideshow active")
        }
    }


    displayImages(){
	    try {
            for (let n = 0; n < this.n_images; n++) {
                this.images[n].classList = "foto_producte"
            }
            this.currentImg.classList.add("current");
            this.currentImg.classList.remove("previous");
            this.currentImg.classList.remove("next");
            this.prevImg.classList.add("previous");
            this.prevImg.classList.remove("current");
            this.nextImg.classList.add("next");
            this.nextImg.classList.remove("current");

        } catch(err) {
            console.log(err.message);
            console.log(this.prevImg);
            console.log(this.currentImg);
            console.log(this.nextImg);
        }
        setTimeout(this.displayImages2, 400, this);
    }
    displayImages2(t){
        t.state = "still";
    }
}

let productSlideshow = undefined;
let fotos = document.getElementById("fotos-producte");
if (fotos.children.length > 1){
    productSlideshow = new Slideshow(fotos);
}

function displayBuyOptions(trigger){
	optionDiv = document.getElementById("buy-options");
	optionDiv.style.display = "flex";
	optionDiv.scrollIntoView({"behaviour": "smooth"});
	trigger.style.display ="none";
}

function hideBuyOptions(){
	optionDiv = document.getElementById("buy-options");
	buyButton = document.getElementById("buy");
	optionDiv.style.display = "none";
	buyButton.style.display = "flex";
}

function displayAllDetails(trigger){
	optionDiv = document.getElementById("all-details");
	optionDiv.style.display = "flex";
	optionDiv.scrollIntoView({"behaviour": "smooth"});
	trigger.innerHTML = "Menys detalls";
    trigger.setAttribute("onclick","hideAllDetails(this)");
}

function hideAllDetails(trigger){
	optionDiv = document.getElementById("all-details");
	optionDiv.style.display = "none";
	trigger.innerHTML = "Més detalls";
    trigger.setAttribute("onclick","displayAllDetails(this)");
}