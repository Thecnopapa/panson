
let oldUrl = new URL(window.location.href);
window.scrollTo({top: Number(oldUrl.searchParams.get("scroll")), behavior: 'smooth'});
let form = document.getElementById('form');







function updatePrice(){
    let price = 0

    const variationList = document.getElementsByClassName("variation-input");
    for (let i = 0; i < variationList.length; i++) {
        if (variationList[i].checked && variationList[i].attributes.price) {
            price += Number(variationList[i].attributes.price.value);
        }
    }

    const materialList = document.getElementsByClassName("material-input");
    for (let i = 0; i < materialList.length; i++) {
        if (materialList[i].checked && materialList[i].attributes.price) {
            price += Number(materialList[i].attributes.price.value);
        }
    }

    const colorLists = document.getElementsByClassName("color-selector");
    for (let i = 0; i < colorLists.length; i++) {
        const colorElements = colorLists[i].getElementsByClassName("color-input");
        for (let n =0; n < colorElements.length; n++) {
            if (colorElements[n].checked && colorElements[n].attributes.price) {
                price += Number(colorElements[n].attributes.price.value);
            }
        }
    }
	const sizeList = document.getElementsByClassName("size-input");
	for (let i = 0; i < sizeList.length; i++) {
		if (sizeList[i].checked && sizeList[i].attributes.price) {
			price += Number(sizeList[i].attributes.price.value);
		}
	}
    	
    const priceTags = document.getElementsByClassName("preu-producte");
    console.log(priceTags, price);
    try {
        for (let i = 0; i < priceTags.length; i++) {
            priceTags[i].innerHTML = price.toFixed(2);
        }
    } catch (error) {}

}

function setTimeMessage(trigger){
    if (trigger.attributes.qty) {
        if (Number(trigger.attributes.qty.value) > 0){
            document.getElementById("missatge-rapid").style.display = "flex"
            document.getElementById("missatge-lent").style.display = "none";
            return;
        }
    }
    document.getElementById("missatge-rapid").style.display = "none"
    document.getElementById("missatge-lent").style.display = "flex";
}

function selectSize(trigger){
	var sizeList = document.getElementsByClassName("size-input");
	for (let i = 0; i < sizeList.length; i++) {
		sizeList[i].setAttribute("checked", false);
		console.log(sizeList[i]);
	}
	trigger.setAttribute("checked", true);
    setTimeMessage(trigger);
	for (let i = 0; i < sizeList.length; i++) {
		console.log(sizeList[i].getAttribute("checked") == "false", sizeList[i].classList.contains("multiple-input"));
		if (sizeList[i].getAttribute("checked")=="false" && sizeList[i].classList.contains("multiple-input")){
			sizeList[i].value = "";
                	sizeList[i].parentElement.style.display="none";
			sizeList[i].parentElement.previousElementSibling.style.display="flex";
        	}
	}
}

function selectSizeTable(trigger){
	const selectedVal = trigger.children[2].attributes.val.value;
	console.log(selectedVal);
	const multipleInput = document.getElementById("size-multiple-input");
	const customSize =document.getElementById("custom-size");
	customSize.dispatchEvent(new Event("click"));
	const countrySelector = document.getElementById("size-country");
	multipleInput.value = selectedVal;
	multipleInput.dispatchEvent(new Event("input"));
	countrySelector.options[1].selected =true;
	countrySelector.dispatchEvent(new Event("change"));
	const popups = document.getElementsByClassName("translucid-screen");
	for (let p = 0; p < popups.length; p++){
		hidePopup("backdrop", popups[p]);
	}

}


function selectColour(trigger){
	var colourList = trigger.parentElement.getElementsByClassName("color-input");
	for (let i = 0; i < colourList.length; i++) {
		colourList[i].setAttribute("checked", false);
	}
        trigger.firstElementChild.setAttribute("checked", true);
}






function submitToCart (trigger) {
    const theForm = document.getElementById("form");
    const missingInfo = document.getElementById("missing-info");
    document.body.style.cursor = "progress";
    theForm.submit();
	console.log(trigger);
	console.log(trigger.nextElementSibling)
    setTimeout(showPopup, 1000, trigger, trigger.nextElementSibling);

}

function showInfoDropdown(trigger, popupContent, arrow=undefined) {
    popupContent.style.display = "block";
    oldTrigger = String(trigger.attributes.onclick.value).split("(")[1];
    trigger.setAttribute("onclick","hideInfoDropdown("+oldTrigger);
    if (arrow) {
        arrow.innerHTML = "-";
    }
    var topPos = popupContent.offsetTop;
    //popupContent.scrollIntoView({behavior: "smooth"});
    console.log(trigger.parentElement.parentElement.parentElement, trigger.parentElement.offsetHeight);
    trigger.parentElement.parentElement.parentElement.scrollBy(0, trigger.parentElement.offsetHeight, {behavior: "smooth"});

}

function hideInfoDropdown(trigger, popupContent, arrow=undefined) {
    popupContent.style.display = "none";
    oldTrigger = String(trigger.attributes.onclick.value).split("(")[1];
    trigger.setAttribute("onclick","showInfoDropdown("+oldTrigger);
    if (arrow) {
        arrow.innerHTML = "+";
    }
}

function showPopup(trigger, popupContent, cross=true) {
    popupContent.style.display = "flex";
    hideBackgound(popupContent, cross);
}

function hidePopup(source, sourceElement) {
    let popupContent = undefined;
    if (source == "cross") {
        popupContent = sourceElement.parentElement;
    } else if (source == "backdrop") {
        popupContent = sourceElement.firstChild;
    }
    popupContent.parentElement.before(popupContent);
	try{
		popupContent.getElementsByClassName("popup-cross")[0].remove();
	} catch{};

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
        console.log("slideshowPrev");
	}
}


class Slideshow{
    constructor(container, displayCounter=true) {
        this.imageContainer = container;
        this.images = container.children;
        this.counter = 0;
        this.n_images = this.imageContainer.childElementCount;
        this.state = "still";

        this.displayCounter = displayCounter
        this.lastImage =this.imageContainer.lastElementChild;
        if (displayCounter){this.createCounter();}
        this.update(0);
    }
	
    createCounter(){
	var bubbles = document.createElement("div");
	    bubbles.classList.add("bubbles");
	for (let i = 0; i < this.n_images; i++) {
		var newBubble = document.createElement("span");
		newBubble.classList.add("bubble");
        newBubble.setAttribute("onclick","event.stopPropagation(productSlideshow.jumpTo("+String(i)+"))");
		bubbles.appendChild(newBubble);
	}
	    var scroller = document.createElement("span");
	    scroller.classList.add("scroller");
	    bubbles.appendChild(scroller);
	    this.imageContainer.appendChild(bubbles);
	    this.bubbles = this.imageContainer.querySelectorAll('.bubble');
	    this.scroller = this.imageContainer.querySelector(".bubbles").lastElementChild;
	    this.scrollerWidth = 100 / this.bubbles.length;
    }
    updateBubbles(){
        for (var i = 0; i < this.bubbles.length; i++) {
            if (i === this.counter){
                this.bubbles[i].classList.add("current-bubble");
            } else {
                this.bubbles[i].classList.remove("current-bubble");
            }
        }
	this.scroller.style.width = String(this.scrollerWidth) +"%";
	this.scroller.style.left = String(this.scrollerWidth * this.counter) + "%";
    }


    selectImages(){
        if (this.counter === 0) {
            this.prevImg = this.lastImage;
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

    jumpTo(target, self=this){
        console.log("Jumping to " + target);
        target = Number(target);
        console.log(self);
        console.log(self.counter, target);
        if (self.counter == target) {} else {
            if (self.counter > target) {
            self.update(-1);
        } else if (self.counter < target) {
            self.update(1);
        }
            console.log(self.counter, target);
        setTimeout(self.jumpTo, 400, target, self);
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
            if (this.displayCounter) {
                this.updateBubbles();
            }

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



function displayBuyOptions(trigger){
	optionDiv = document.getElementById("form");
	optionDiv.style.display = "flex";
	optionDiv.scrollIntoView({"behaviour": "smooth"});
	trigger.style.display ="none";
}

function hideBuyOptions(){
	optionDiv = document.getElementById("form");
	buyButton = document.getElementById("buy");
	optionDiv.style.display = "none";
	buyButton.style.display = "initial";
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






/*
let productSlideshow = undefined;
console.log( document.getElementById("fotos-producte"));
let fotos = document.getElementById("fotos-producte");
console.log(fotos.children.length > 1);


if (fotos.children.length > 1){
    productSlideshow = new Slideshow(fotos);
}
console.log(productSlideshow);
*/

updatePrice();

