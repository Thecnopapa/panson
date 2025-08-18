


function addMaterial(button){
    const targetList = button.parentElement;
    const newItem = document.createElement("li");
    const listLength = targetList.children.length -1;
    console.log(targetList.children);
    console.log(targetList.children.length);
    newItem.innerHTML = '<span><input type="text" name="dict:op:materials#' +listLength + '"  class="material" value=""> Preu <input type="number" name="number:op:materials#' +listLength + ':preu" id="material" value=""><button class="remove" type="button" onclick="this.parentElement.parentElement.remove()">x</button></span>'
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
    newItem.innerHTML = '<input type="text" name="list:op:extra_colors#' +listLength + '" class="extra_colors" value=" "><button class="remove" type="button" onclick="this.parentElement.parentElement.remove()">x</button>'
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
    newItem.innerHTML = '<span><input type="text" name="dict:op:colors#' +listLength + '" id="color" value=""> Preu <input type="number" name="number:op:colors#' +listLength + ':preu" id="material" value=""><button class="remove" type="button" onclick="this.parentElement.parentElement.remove()">x</button></span>'
    console.log("LAST:", targetList.lastElementChild);
    console.log("NEW:",newItem);
    targetList.lastElementChild.before(newItem);
}

function addSize(button) {
    const targetList = button.parentElement;
    const newItem = document.createElement("li");
    const listLength = targetList.children.length - 1;
    console.log(targetList.children);
    console.log(targetList.children.length);
    newItem.innerHTML = '<span><input type="text" name="dict:op:talles#' + listLength + '" class="talla" value=""><input type="number" name="number:op:talles#' + listLength + ':qty" class="talla_quantitat" value=""><button class="remove" type="button" onclick="this.parentElement.remove()">x</button></span>';
    console.log("LAST:", targetList.lastElementChild);
    console.log("NEW:", newItem);
    targetList.lastElementChild.before(newItem);
}

function addVariation(button){
    const targetList = button.parentElement;
    const newItem = document.createElement("li");
    const listLength = targetList.children.length -1;
    console.log(targetList.children);
    console.log(targetList.children.length);
    newItem.innerHTML = '<span><span><input type="text" name="dict:op:variacions#' + listLength + '" class="variacio" value=""> Preu <input type="number" name="number:op:variacions#' + listLength + ':preu" class="variacio_preu" value=""><button class="remove" type="button" onclick="this.parentElement.parentElement.remove()">x</button></span></span>'
    console.log("LAST:", targetList.lastElementChild);
    console.log("NEW:",newItem);
    targetList.lastElementChild.before(newItem);
}


function resizeArea(target){
    console.log("TEXTAREA");
    console.log(target);
    target.style.height = target.scrollHeight + "px";
    target.nextElementSibling.style.backgroundColor = "yellow";
}

function updateField(target){
    console.log("UPDATING FIELD");
    console.log(target.value);
    console.log(target.attributes.page.value, target.attributes.key.value, target.attributes.lan.value);
    payload = {value: target.value, page:target.attributes.page.value, key: target.attributes.key.value, lan: target.attributes.lan.value};
    fetch("/admin/loc/update-field",
        {
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            method: "POST",
            body: JSON.stringify(payload),
    });
    target.nextElementSibling.style.backgroundColor = "revert";
}


function resizeAll() {
    console.log("RESIZING ALL");
    console.log(document.getElementsByTagName("textarea"));
    for (let i = 0; i < document.getElementsByTagName("textarea"); i++) {
        resizeArea(i)
    }
}