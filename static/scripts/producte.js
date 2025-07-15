
let oldUrl = new URL(window.location.href)
window.scrollTo({top: Number(oldUrl.searchParams.get("scroll")), behavior: 'smooth'})


let form = document.getElementById('form');
let sizeSelector = document.getElementsByClassName("talla-unica")
let sizeButtons = document.getElementsByClassName("talla")
let requiredInput = document.getElementsByClassName("required")

console.log(oldUrl)

console.log(form)

console.log(sizeSelector)
        console.log(sizeButtons)

updatePrice()



function updatePage(trigger, refresh = true) {
console.log(trigger)
    let linkBase = window.location.origin+window.location.pathname
    let material = oldUrl.searchParams.get("material")
    let variacio = oldUrl.searchParams.get("variacio")
    let color = oldUrl.searchParams.get("color")
    let talla = oldUrl.searchParams.get("talla")
    let colorSelectors = form.querySelectorAll('select')

    if (colorSelectors.length > 0) {
        color = "["
        for (let i = 0; i < colorSelectors.length; i++) {
            let selector = colorSelectors[i]
            color += selector.value
            color += "-"
            }
        color = color.slice(0, -1) + "]"
        }

    if (sizeSelector.length > 0) {
        talla = sizeSelector[0].value
    }
    if (trigger){
        if (trigger.classList.contains("talla")) {
            talla = trigger.textContent
        }
        if (trigger.classList.contains("variacio")) {
            variacio = trigger.value
        }
    }



    let materialLink = "material" + variacio
    let variacioLink = "variacio=" + variacio
    let colorLink = "color=" + color
    let tallaLink = "talla=" + talla
    let newLink = linkBase + "?" + materialLink +"&"+ variacioLink +"&"+ tallaLink +"&"+ colorLink
    console.log(newLink)
    if (refresh) {
        location.href = newLink + "&scroll="+ String($(window).scrollTop())
    }
return newLink
}


function updatePrice(){
    let price = 0

    const variationList = document.getElementsByClassName("variation")
    console.log(variationList)
    for (let i = 0; i < variationList.length; i++) {
        if (variationList[i].checked) {
            price += Number(variationList[i].attributes.price.value)
            console.log(price)
        }
    }

    const materialList = document.getElementsByClassName("material")
    console.log(materialList)
    for (let i = 0; i < materialList.length; i++) {
        if (materialList[i].checked) {
            price += Number(materialList[i].attributes.price.value)
            console.log(price)
        }
    }

    const colorList = document.getElementsByClassName("color-selector")
    console.log(colorList)
    for (let i = 0; i < colorList.length; i++) {
        if (colorList[i].options[colorList[i].selectedIndex].attributes.price) {
            price += Number(colorList[i].options[colorList[i].selectedIndex].attributes.price.value)
            console.log(price)
        }
    }
    const priceTag = document.getElementById("final_price")
    priceTag.innerHTML = price
}

function submitToCart () {
    const theForm = document.getElementById("form")
    console.log(theForm.submit());


}


function submitToCartOld (notSubmittable) {
    if (notSubmittable == "True") {
        console.log("missing info")
        for (let i = 0; i < requiredInput.length; i++) {
            requiredInput[i].style.color = "red"
        }
    }
    else {
        let newLink = updatePage(null, false)
        let urlParts = newLink.split("?")
        console.log(urlParts)
        let cartLink = urlParts[0]+"afegir_al_carret/?" + urlParts[1]
        console.log(cartLink)
        fetch(cartLink, {method: "POST"})
        if (true) {
            window.location.href=newLink
        }
    }
}