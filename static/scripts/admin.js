


function addMaterial(){
    const materialList = document.getElementById('material_list');
    const newMaterial = document.createElement("li");
    const listLength = materialList.children.length -1;
    console.log(materialList.children);
    console.log(materialList.children.length);
    newMaterial.innerHTML = '<span><input type="text" name="text:material#' +listLength + '" id="material" value=""> Preu <input type="number" name="number:material#$' +listLength + ':preu" id="material" value=""></span>'
    materialList.lastElementChild.before(newMaterial);
}