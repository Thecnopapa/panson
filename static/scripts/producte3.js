
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
		sizeList[i].setAttribute("checked", false);
		console.log(sizeList[i]);
	}
	trigger.setAttribute("checked", true);
    setTimeMessage(trigger);
	for (let i = 0; i < sizeList.length; i++) {
		if (sizeList[i].getAttribute("checked") === "false" && sizeList[i].classList.contains("multiple-input")){
			sizeList[i].value = "";
                	sizeList[i].parentElement.style.display="none";
			sizeList[i].parentElement.previousElementSibling.style.display="flex";
        }
	}
}

function resizeSelector(trigger){
    print("TRIGGER: ", trigger);
    const selectedOption = trigger.selectedOptions[0];
    const targetWidth =  ((1.7+selectedOption.text.length) * 1.7 * window.innerHeight / 100);
    print("TARGET: ", targetWidth, "CURRENT: ", trigger.offsetWidth);
    trigger.style.width =  String(targetWidth)+"px";
    //print(trigger.style);
    //trigger.style.minWidth = String(targetWidth)+"px !important";
    //trigger.style.maxWidth = String(targetWidth)+"px !important";
    print("NEW: ", trigger.offsetWidth, trigger.width);
}


function selectSizeTable(trigger) {
    var selectedVal = trigger.attributes.val.value;
    var selectedCol = trigger.attributes.col.value;
    console.log(selectedVal, selectedCol);
    try {
        const targetContainer = document.getElementsByClassName("talles")[0]
        const targetInput = targetContainer.getElementsByTagName("input");
        if (selectedCol in ["0","1"] && selectedVal !== "NA") {
            for (let i = 0; i < targetInput.length; i++) {
                print(targetInput[i].value)
                if (targetInput[i].value === selectedVal) {
                    //targetInput[i].setAttribute("checked", true);
                    print(targetInput[i].parentElement);
                    targetInput[i].dispatchEvent(new Event("change"));
                    throw new Error("found");
                }
            }
        }
        throw new Error("Size not found on displayed options");
    } catch (error) {
        print(error);
        if (error.message !== "found") {
            if (selectedVal === "NA"){
                selectedCol = "1";
                selectedVal = trigger.parentElement.children[1].attributes.val.value;
            }
            const multipleInput = document.getElementById("size-multiple-input");
            const customSize = document.getElementById("custom-size");
            customSize.dispatchEvent(new Event("click"));
            const countrySelector = document.getElementById("size-country");
            multipleInput.value = selectedVal;
            multipleInput.dispatchEvent(new Event("input"));
            //print(countrySelector.options, Number(selectedCol));
            countrySelector.options[Number(selectedCol)-1].selected = true;
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
	var colourList = trigger.parentElement.getElementsByClassName("color-input");
	for (let i = 0; i < colourList.length; i++) {
		colourList[i].setAttribute("checked", false);
	}
    trigger.firstElementChild.setAttribute("checked", true);
}






async function submitToCart (trigger) {
    const theForm = document.getElementById("form");
    const missingInfo = document.getElementById("missing-info");
    const formData = new FormData(theForm);
    const fieldsets = form.querySelectorAll("fieldset");
    document.body.style.cursor = "progress !important";
    try {
        const response = await fetch("/carret/add", {
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
                alert("Producte afegit al carret!");
            } else if (document.documentElement.lang === "en") {
                alert("Product added to cart!");
            }
            window.location.reload();
        }
    } catch (error) {
        console.log(error);
        alert(error.message);
    }



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

function showPopup(popupContent, cross=true) {
    popupContent.style.display = "flex";
    document.body.style.cursor = undefined;
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

    document.body.style.overflow = "hidden";

	
    const newContainer = document.createElement("div");
    newContainer.classList.add("enlarged-container");
    newContainer.addEventListener("click", function (event){newContainer.remove(); document.body.style.overflow = "unset"; newObserver.disconnect()});
    document.body.appendChild(newContainer);

	let newObserver = new IntersectionObserver(newBubbleChange, {
		root: newContainer,
		threshold: 0.5,
	});

	function newBubbleChange(triggers, opts){
		for (let i = 0; i < triggers.length; i++){
                	const trigger = triggers[i].target;
              		console.log(trigger);
                	const targetIndex = [...newSlideshow.children].indexOf(trigger);
                	const targetBubble = newBubbles.children[targetIndex];
                	targetBubble.classList.toggle("active", triggers[i].isIntersecting);
        }
	}



	const newBubbles = document.createElement("div");
	newBubbles.classList.add("enlarged-bubbles");
	if (images.length <= 1){newBubbles.classList.add("hidden");}
	newContainer.appendChild(newBubbles);

  
	const newCross = document.createElement("div");
	newCross.innerHTML ="&#10005;";
	newCross.classList.add("close-enlarged-container");
	newCross.addEventListener("click", function (event){newContainer.remove(); document.body.style.overflow = "unset"; newObserver.disconnect()});
	newContainer.appendChild(newCross);

	const newSlideshow = document.createElement("div");
	newSlideshow.classList.add("enlarged-slideshow");
	newContainer.appendChild(newSlideshow);



    for (let i = 0; i < images.length; i++){
        //const productName = img.attributes["product"].value;
        //print(productName);
    	const newImg = document.createElement("img");
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
	newBubbles.appendChild(newBubble);
    }
	print("Scrolling to: ", images[targetImage])
	newSlideshow.children[targetImage].scrollIntoView({block: "center"});


    print("Enlarged img ready!")
}


function startZoom(event){
    image = event.target;
    event.stopPropagation();
    print("Starting zoom");
    //print("image", image);
    image.classList.add("zoomed");
    image.addEventListener("click", stopZoom);
    image.removeEventListener("click", startZoom);
    image.addEventListener("mousemove", moveImg);
    moveImg(event);
}

function stopZoom(event) {
    event.target;
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
    clickX = (1-(image.width - event.pageX + pos.left)/image.width)*100;
    clickY = (1-(image.height -  event.pageY + pos.top)/image.height)*100;
    image.style.backgroundPosition = String(clickX)+ "% "+String(clickY)+"%";
}



const initialSlideshowElements = document.getElementsByClassName("main-foto");

let initialSlideshowObserver = new IntersectionObserver(initialBubbleChange, {
	root: document.getElementById("producte-images"),
	threshold: 0.5,
})

function initialBubbleChange(triggers, opts){
	const triggerContainer = document.getElementById("producte-images");
	const bubbleContainer = triggerContainer.nextElementSibling;
	
	for (let i = 0; i < triggers.length; i++){
		const trigger = triggers[i].target;
		console.log(trigger);
		const targetIndex = [...triggerContainer.children].indexOf(trigger);
		const targetBubble = bubbleContainer.children[targetIndex];
		targetBubble.classList.toggle("active", triggers[i].isIntersecting);
	}
}



for (let i = 0; i < initialSlideshowElements.length; i++){
	initialSlideshowObserver.observe(initialSlideshowElements[i]);
}





updatePrice();


print(" * Product JS ready")
