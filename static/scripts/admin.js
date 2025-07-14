


function addMaterial(button){
    const targetList = button.parentElement;
    const newItem = document.createElement("li");
    const listLength = targetList.children.length -1;
    console.log(targetList.children);
    console.log(targetList.children.length);
    newItem.innerHTML = '<span><input type="text" name="text:material#' +listLength + '"  class="material" value=""> Preu <input type="number" name="number:material#$' +listLength + ':preu" id="material" value=""><button class="remove" type="button" onclick="this.parentElement.parentElement.remove()">x</button></span>'
    console.log("LAST:", targetList.lastElementChild);
    console.log("NEW:",newItem);
    targetList.lastElementChild.before(newItem);
}

function addExtra(button){
    const targetList = button.parentElement;
    const newItem = document.createElement("span");
    const listLength = targetList.children.length -1;
    console.log(targetList.children);
    console.log(targetList.children.length);
    newItem.innerHTML = '<input type="text" name="text:extra_colors#' +listLength + '" class="extra_colors" value=" "><button class="remove" type="button" onclick="this.parentElement.parentElement.remove()">x</button>'
    console.log("LAST:", targetList.lastElementChild);
    console.log("NEW:",newItem);
    targetList.lastElementChild.before(newItem);
}

function addColour(button){
    const targetList = button.parentElement;
    const newItem = document.createElement("li");
    const listLength = targetList.children.length -1;
    console.log(targetList.children);
    console.log(targetList.children.length);
    newItem.innerHTML = '<span><input type="text" name="text:color#' +listLength + '" id="color" value=""> Preu <input type="number" name="number:color#' +listLength + ':preu" id="material" value=""><button class="remove" type="button" onclick="this.parentElement.parentElement.remove()">x</button></span>'
    console.log("LAST:", targetList.lastElementChild);
    console.log("NEW:",newItem);
    targetList.lastElementChild.before(newItem);
}

function addSize(button) {
    const targetList = button.parentElement;
    const newItem = document.createElement("span");
    const listLength = targetList.children.length - 1;
    console.log(targetList.children);
    console.log(targetList.children.length);
    newItem.innerHTML = '<input type="text" name="text:talla#' + listLength + '" class="talla" value=""><button class="remove" type="button" onclick="this.parentElement.remove()">x</button>';
    console.log("LAST:", targetList.lastElementChild);
    console.log("NEW:", newItem);
    targetList.lastElementChild.before(newItem);
}