


let form = document.getElementById('submit-form');
let sizeSelector = document.getElementsByClassName("talla-unica")
let sizeButtons = document.getElementsByClassName("talla")
let oldUrl = new URL(window.location.href)
console.log(oldUrl)

console.log(form)

console.log(sizeSelector)
        console.log(sizeButtons)

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
        location.href = newLink
    }
return newLink
}

function submitToCart () {
    let url = updatePage(null, false)
    let urlParts = url.split("?")
    console.log(urlParts)
    let cartLink = urlParts[0]+"afegir_al_carret/?" + urlParts[1]
    console.log(cartLink)
    fetch(cartLink, {method: "POST"})
    if (false) {
        location.href = newLink
    }
}