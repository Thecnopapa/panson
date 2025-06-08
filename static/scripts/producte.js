


let form = document.getElementById('submit-form');


console.log(form)



function updatePage() {

    let linkBase = window.location.origin+window.location.pathname
    let material = "None"
    let variacio = "None"
    let color = "None"
    let colorSelectors = form.querySelectorAll('select')
    let sizeSelector = form.getAttribute("")
    if (colorSelectors.length > 0) {
        color = "["
        for (let i = 0; i < colorSelectors.length; i++) {
            let selector = colorSelectors[i]
            color += selector.value
            color += "-"
            }
        color = color.slice(0, -1) + "]"
        }





    let materialLink = "material" + variacio
    let variacioLink = "variacio=" + variacio
    let colorLink = "color=" + color
    let newLink = linkBase + "?" + materialLink +"&"+ variacioLink +"&"+ colorLink
    console.log(newLink)
    location.href = newLink
}
