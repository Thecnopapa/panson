
let oldUrl = new URL(window.location.href);
let form = document.getElementById('form');

let mainDetails = document.getElementById('main-details');
let productImages = document.getElementById('producte-images');





function updatePrice(){
    let price = 0
	console.log("Updating price");

    const variationList = document.getElementsByClassName("variation-input");
	
    for (let i = 0; i < variationList.length; i++) {
        if (variationList[i].checked && variationList[i].attributes.price) {
            console.log(variationList[i].attributes.price.value);
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
        const colorElements = colorLists[i].getElementsByClassName( "color-input");
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
    //console.log(priceTags, price);
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
    if (trigger.value === ""){
        return;
    }
	var sizeList = document.getElementsByClassName("size-input");
	for (let i = 0; i < sizeList.length; i++) {
		sizeList[i].removeAttribute("checked");
		console.log(sizeList[i]);
	}
	trigger.setAttribute("checked", true);
    setTimeMessage(trigger);
	for (let i = 0; i < sizeList.length; i++) {
		if (sizeList[i].getAttribute("checked") !== "true" && sizeList[i].classList.contains("multiple-input")){
			sizeList[i].value = "";
                	sizeList[i].parentElement.style.display="none";
			sizeList[i].parentElement.previousElementSibling.style.display="flex";
        }
	}
	updatePrice();
}

function resizeSelector(trigger){
    //print("TRIGGER: ", trigger);
    const selectedOption = trigger.selectedOptions[0];
    const targetWidth =  ((1.7+selectedOption.text.length) * 1.7 * window.innerHeight / 100);
    //print("TARGET: ", targetWidth, "CURRENT: ", trigger.offsetWidth);
    trigger.style.width =  String(targetWidth)+"px";
    //print(trigger.style);
    //trigger.style.minWidth = String(targetWidth)+"px !important";
    //trigger.style.maxWidth = String(targetWidth)+"px !important";
    //print("NEW: ", trigger.offsetWidth, trigger.offsetWidth);
}


function selectSizeTable(trigger) {
    var selectedVal = trigger.attributes.val.value;
    var selectedCol = trigger.attributes.col.value;
    console.log(selectedVal, selectedCol);
    try {
        const targetContainer = document.getElementsByClassName("talles")[0]
        const targetInputs = [...targetContainer.getElementsByTagName("input")];
	    console.log(targetInputs);
	    console.log(["panson", "es"].includes(selectedCol));
        if (["panson","es"].includes(selectedCol) && selectedVal !== "NA") {
            targetInputs.forEach(input => {
                console.log(input.value, selectedVal, input.value === selectedVal)
                if (input.value === selectedVal) {
                    input.setAttribute("checked", true);
                    console.log(input.parentElement);
                    input.dispatchEvent(new Event("change"));
                    throw new Error("found");
                }
            });
        }
        throw new Error("Size not found on displayed options");
    } catch (error) {
        print(error);
        if (error.message !== "found") {
            if (selectedVal === "NA" || selectedCol === "panson"){
		    console.log("val is NA");
		    selectedCol = "es";
		    selectedVal = undefined;
		[...trigger.parentElement.children].forEach(el => {if (el.getAttribute("col", undefined) === selectedCol){selectedVal = el.attributes.val.value;}});
		    console.log("selected val: ", selectedVal);
            }
            const multipleInput = document.getElementById("size-multiple-input");
            const customSize = document.getElementById("custom-size");
            customSize.dispatchEvent(new Event("click"));
            const countrySelector = document.getElementById("size-country");
            multipleInput.value = selectedVal;
            multipleInput.dispatchEvent(new Event("input"));
		console.log("options");
            console.log(countrySelector, selectedCol);
            countrySelector.getElementsByClassName(selectedCol)[0].selected = true;
            countrySelector.dispatchEvent(new Event("change"));
        }
    }
    print("done")
    const popups = document.getElementsByClassName("translucid-screen");
        for (let p = 0; p < popups.length; p++) {
            hidePopup("backdrop", popups[p]);
        }

}


function selectColour(trigger){
    console.log(trigger);
	let colourList = trigger.parentElement.getElementsByClassName("color-input");
	for (let i = 0; i < colourList.length; i++) {
		colourList[i].removeAttribute("checked");
	}
    trigger.firstElementChild.setAttribute("checked", true);
	updatePrice();
}


function selectVariation(trigger){
	console.log(trigger);
	let varList = [...trigger.parentElement.parentElement.getElementsByTagName("input")];
	console.log(varList);
	varList.forEach(v => {v.removeAttribute("checked");});
	trigger.firstElementChild.setAttribute("checked", true);
	updatePrice();
}



async function submitToCart (trigger) {
	trigger.classList.add("loading");
	
    const theForm = document.getElementById("form");
    const missingInfo = document.getElementById("missing-info");
    const formData = new FormData(theForm);
    const fieldsets = form.querySelectorAll("fieldset");
    document.body.style.cursor = "progress !important";
	console.log(formData);
    try {
        let response = await fetch("/carret/add", {
                method: "POST",
                body: formData,
            });
        console.log(await response);
        console.log(response.status);
        console.log(response.headers.get("missing-val", undefined));
        if (response.status == "206") {
            const missingField = response.headers.get("missing-val", undefined);
            const targetFieldset = document.getElementsByClassName(missingField)[0];
            targetFieldset.setAttribute("onmousedown", "this.style.border = 'none'");
            targetFieldset.style.border = "1px solid red";

        } else {
            console.log(document.documentElement.lang);
            if (document.documentElement.lang === "cat"){
                //alert("Producte afegit al carret!");
            } else if (document.documentElement.lang === "en") {
                //alert("Product added to cart!");
            }
		let r = await reloadCart();
            //window.location.reload();
        }
    } catch (error) {
        console.log(error);
        alert("Error:", error.message);
    }
	trigger.classList.remove("loading");
	
}

async function reloadCart(){
	let cartList = document.getElementsByClassName("llista-carret")[0];
    console.log("Reloading cart");
	//console.log(cartList);
	//console.log(cartList.innerHTML);
	[...cartList.children].forEach(c => {c.remove()});
	let newItems = await fetch("/"+document.documentElement.lang+"/render_cart",
		{
			method:"POST",
		}
	).then(response => {return response.text();}).then(text => {
		const parser = new DOMParser();
		let html = parser.parseFromString(text, "text/html").documentElement;
		console.log(html);
		return [...html.getElementsByClassName("producte-carret")];
	});
	console.log(newItems);
	newItems.forEach(i => {cartList.appendChild(i)});
	loadAllImages();
	updateCartCounter();
	openCart();
	return "done"

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
    //console.log(trigger.parentElement.parentElement.parentElement, trigger.parentElement.offsetHeight);
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




function enlargeImg(img, all=true){
    print("Enlarging img, all: ", all);
	let images = undefined;
	let targetImage = undefined
	if (all){
		images = img.parentElement.children;
		targetImage = [...images].indexOf(img);

	} else {
		images = [img];
		targetImage = 0;
	}
	print("N images: ", images.length, " target: ", targetImage);
    const productName = img.attributes["product"].value;
    print(productName);

    document.documentElement.style.overflow = "hidden";

    const newContainer = document.createElement("div");

    let enlargedObserverThreshold = 0.7;
    if (window.innerWidth <= window.innerHeight) {
        enlargedObserverThreshold = 0.8;
    }

	let newObserver = new IntersectionObserver(newBubbleChange, {
		root: newContainer,
		threshold: enlargedObserverThreshold,
	});
	

    newContainer.classList.add("enlarged-container");
    newContainer.addEventListener("click", function (event){event.preventDefault(); event.stopPropagation(); newContainer.remove(); document.documentElement.style.overflow = ""; newObserver.disconnect();});
    newContainer.addEventListener("scroll", function (event){event.stopPropagation();});
    newContainer.addEventListener("touchmove", function (event){event.stopPropagation();});
    newContainer.addEventListener("wheel", function (event){event.stopPropagation();});
    function closeWithEscape(event) {
        //console.log(event.key);
        if (event.key === "Escape" || event.key === "Backspace"){
            event.preventDefault()
            newContainer.remove();
            newObserver.disconnect();
            document.documentElement.style.overflow = "";
            document.documentElement.removeEventListener("keydown", closeWithEscape);

        }
    }

    document.documentElement.addEventListener("keydown", closeWithEscape);

    document.body.appendChild(newContainer);


	function newBubbleChange(triggers, opts){
		for (let i = 0; i < triggers.length; i++){
                	const trigger = triggers[i].target;
              		console.log(trigger);
                	const targetIndex = [...newSlideshow.children].indexOf(trigger);
                	const targetBubble = newBubbles.children[targetIndex];
                	targetBubble.classList.toggle("active", triggers[i].isIntersecting);
                    trigger.classList.toggle("visible", triggers[i].isIntersecting);
        }
	}

    const newCross = document.createElement("div");
	newCross.innerHTML ="&#10005;";
	newCross.classList.add("close-enlarged-container");
	newCross.addEventListener("click", function (event){newContainer.remove(); document.body.style.overflow = ""; newObserver.disconnect()});
	newContainer.appendChild(newCross);

	const newBubbles = document.createElement("div");
	newBubbles.classList.add("enlarged-bubbles");
	if (images.length <= 1){newBubbles.classList.add("hidden");}
	newContainer.appendChild(newBubbles);

  


	const newSlideshow = document.createElement("div");
	newSlideshow.classList.add("enlarged-slideshow");
    newSlideshow.classList.add("slideshow");
    newSlideshow.classList.add("horizontal-scroll");
	newContainer.appendChild(newSlideshow);
    detectHorizontal();



    for (let i = 0; i < images.length; i++){
        //const productName = img.attributes["product"].value;
        //print(productName);
    	const newImg = document.createElement("div");
    	newImg.classList.add("enlarged-img");
    	//newImg.src = imgUrl;
    	newImg.style.backgroundImage = images[i].style.backgroundImage;
    	newImg.setAttribute('draggable', false);
    	newImg.addEventListener("click", startZoom);
        newImg.addEventListener("mouseleave", stopZoom);
    	newSlideshow.appendChild(newImg);
        newObserver.observe(newImg);
        const newBubble = document.createElement("div");
        newBubble.classList.add("enlarged-bubble");
        newBubble.addEventListener("click", (e) => {e.stopPropagation(); slideshowScroll(e.target.parentElement.nextElementSibling, i, "both");})
        newBubbles.appendChild(newBubble);
    }

	print("Scrolling to: ", images[targetImage])
	newSlideshow.children[targetImage].scrollIntoView({block: "center", behavior: "instant"});


    print("Enlarged img ready!")
}


function startZoom(event){
    let image = event.target;
    event.stopPropagation();
    if (window.innerHeight >= window.innerWidth) {image.scrollIntoView({block: "center", inline: "center"});return;}
    print("Starting zoom");
    //print("image", image);
    if (image.classList.contains("visible")) {
        image.classList.add("zoomed");
        image.removeEventListener("click", startZoom);
        image.addEventListener("click", stopZoom);
        image.addEventListener("mousemove", moveImg, {passive: false});
        moveImg(event);
    } else {
        image.scrollIntoView({block: "center", inline: "center"});
    }


}

function stopZoom(event) {
    let image = event.target;
    event.stopPropagation();
    print("Ending zoom");
    //print("image", image);
    image.classList.remove("zoomed");
    image.addEventListener("click", startZoom);
    image.removeEventListener("click", stopZoom);
    image.removeEventListener("mousemove", moveImg);
    image.style.backgroundPosition = "center";
}


function moveImg(event){
    const image = event.target;
	let pos = image.getBoundingClientRect();
    let imgHeight = image.offsetHeight;
    let imgWidth = image.offsetWidth;
    clickX = (1-(imgWidth - event.clientX + pos.left)/imgWidth)*100;
    clickY = (1-(imgHeight -  event.clientY + pos.top)/imgHeight)*100;
    //console.log(clickX, clickY);
    image.style.backgroundPosition = String(clickX)+ "% "+String(clickY)+"%";
    console.log(image.style.backgroundPosition);
}



const initialSlideshowElements = document.getElementsByClassName("main-foto");

let initialSlideshowObserver = new IntersectionObserver(initialBubbleChange, {
	root: document.getElementById("producte-images"),
	threshold: 0.5,
})

function initialBubbleChange(triggers, opts){
	const triggerContainer = document.getElementById("producte-images");
	const bubbleContainer = triggerContainer.nextElementSibling.firstElementChild;
	
	for (let i = 0; i < triggers.length; i++){
		const trigger = triggers[i].target;
		const targetIndex = [...triggerContainer.children].indexOf(trigger);
		const targetBubble = bubbleContainer.children[targetIndex];
		targetBubble.classList.toggle("active", triggers[i].isIntersecting);
	}
}



for (let i = 0; i < initialSlideshowElements.length; i++){
	initialSlideshowObserver.observe(initialSlideshowElements[i]);
}


function slideshowScroll(container, mode, axis="both"){
	let targetScrollX = 0;
    let targetScrollY = 0;
	let incrementX = 0;
    let incrementY = 0;
    let containerWidth = container.offsetWidth;
    let containerHeight = container.offsetHeight;
    console.log(containerWidth, containerHeight);
    let childWidth = container.firstElementChild.offsetWidth;
    let childHeight = container.firstElementChild.offsetHeight;
    console.log(childWidth, childHeight);

	if (axis === "X" || axis === "both"){
		targetScrollX = container.scrollLeft;
		incrementX = childWidth ;
	}
    if (axis === "Y" || axis === "both") {
		targetScrollY = container.scrollTop;
		incrementY = childHeight ;
	}
    console.log("Increment:", incrementX, incrementY);
	if (mode === "prev"){
		targetScrollX = targetScrollX - incrementX;
        targetScrollY = targetScrollY - incrementY;
	} else if (mode === "next") {
		targetScrollX = targetScrollX + incrementX;
        targetScrollY = targetScrollY + incrementY;
    } else{
        try{
            mode = Number(mode)
            targetScrollX = incrementX*mode - (containerWidth - childWidth) / 2;
            targetScrollY = incrementY*mode - (containerHeight - childHeight) / 2;
            console.log(mode, targetScrollX, targetScrollY);
        } catch(err){console.log(err)}
    }
	console.log(axis, targetScrollX, targetScrollY);
    container.scrollTo(targetScrollX, targetScrollY);

}
let alwaysBlackInProduct = [...lanButtons, cartIcon, cartCircle]
console.log(alwaysBlackInProduct);
alwaysBlackInProduct.forEach(el => {

    el.classList.add("black-landscape");
});
//cartIcon[0].src = "/static/media/bag-black.svg";
//menuButton[0].src = "/static/media/menu-black.svg";

updatePrice();

imageSlideshow = document.getElementById("producte-images");
imageSlideshow.addEventListener("scroll", function (event) {if(imageSlideshow.scrollTop !== (imageSlideshow.scrollHeight - imageSlideshow.offsetHeight)){event.stopPropagation()}});
imageSlideshow.addEventListener("wheel", function (event) {if(imageSlideshow.scrollTop !== (imageSlideshow.scrollHeight - imageSlideshow.offsetHeight)){event.stopPropagation()}});
imageSlideshow.addEventListener("touchmove", function (event) {if(imageSlideshow.scrollTop !== (imageSlideshow.scrollHeight - imageSlideshow.offsetHeight)){event.stopPropagation()}});

blackObserver.observe(imageSlideshow);


//document.documentElement.style.overflowY = "hidden";
document.documentElement.scrollTo(0,0)

mainDetails.addEventListener("scroll", preventDefaultScroll, {passive: false});
mainDetails.addEventListener("wheel", preventDefaultScroll, {passive: false});
mainDetails.addEventListener("touchmove", preventDefaultScroll, {passive: false});




function preventDefaultScroll(event) {
    //event.preventDefault();
    if (window.innerHeight >= window.innerWidth){return;}
    //console.log(mainDetails.scrollTop + mainDetails.offsetHeight, mainDetails.scrollHeight)
    if (mainDetails.scrollTop + mainDetails.offsetHeight < mainDetails.scrollHeight && event.deltaY >= 0){return;}
    //if (productImages.scrollTop > 0 && event.deltaY <= 0){return;}
    //console.log("preventDefaultScroll");
    //console.log(productImages.scrollTop+productImages.offsetHeight > productImages.scrollHeight);
    //console.log(event.deltaY)
    if (productImages.scrollTop+productImages.offsetHeight >= productImages.scrollHeight && event.deltaY >= 0){
      return;
    } else {
        //console.log(productImages);
        event.preventDefault();
        if (event.deltaY <= 0){
            document.documentElement.scrollTo(0,0);
        }
        //console.log(event);
        if (document.documentElement.scrollTop <= 0) {
            productImages.scrollTo(0, productImages.scrollTop + event.deltaY)
        }


    }
    //event.preventDefault();
    /*if( imageSlideshow.scrollTop === (imageSlideshow.scrollHeight - imageSlideshow.offsetHeight)){
        document.documentElement.style.overflowY = "unset";
    } else {
        event.preventDefault();
        document.documentElement.style.overflowY = "hidden";
        imageSlideshow.scrollTo(imageSlideshow.scrollWidth, imageSlideshow.scrollTop+imageSlideshow.offsetHeight/2);
        //document.documentElement.scrollTo(0,0);
    }*/
}







print(" * Product JS ready")
