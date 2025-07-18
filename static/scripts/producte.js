
let oldUrl = new URL(window.location.href);
window.scrollTo({top: Number(oldUrl.searchParams.get("scroll")), behavior: 'smooth'});


let form = document.getElementById('form');
let sizeSelector = document.getElementsByClassName("talla-unica");
let sizeButtons = document.getElementsByClassName("talla");
let requiredInput = document.getElementsByClassName("required");



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
    let popupContent = undefined
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