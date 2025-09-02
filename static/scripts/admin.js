




function prioDown(image, move=true){
	const input = image.getElementsByClassName("order-img-input")[0];
	const text = image.getElementsByClassName("order-img-text")[0];
	
	if (image.nextElementSibling && move){
		console.log(image);
		prioDown(image, false);
		prioUp(image.nextElementSibling, false);
		image.nextElementSibling.after(image);

	}
	console.log(!move);
	if (!move){
		let position =Number(input.value);
                position = position + 1;
                text.innerHTML = String(position);
                input.value = position;
	}
}

function prioUp(image, move=true){
        const input = image.getElementsByClassName("order-img-input")[0];
        const text = image.getElementsByClassName("order-img-text")[0];

        if (image.previousElementSibling && move){
		console.log(image);
		prioUp(image, false);
                prioDown(image.previousElementSibling, false);
		image.previousElementSibling.before(image);
        }
	console.log(!move);
        if (!move){
                let position =Number(input.value);
                position = position - 1;
                text.innerHTML = String(position);
                input.value = position;
        }
}






function showData(trigger){
    data = trigger.parentElement.getElementsByClassName("product-data")[0]
    data.classList.remove("hide")
    trigger.setAttribute("onclick","hideData(this)")
}

function hideData(trigger){
    data = trigger.parentElement.getElementsByClassName("product-data")[0]
    data.classList.add("hide")
    trigger.setAttribute("onclick","showData(this)")
}

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

function deleteField(trigger){
	const pageValue = trigger.attributes.page.value;
	const keyValue = trigger.attributes.key.value;
	print("deleting: ", pageValue, "-", keyValue);
	fetch("/admin/loc/delete-field",
		{
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json'
			},
			method: "POST",
			body: JSON.stringify({page: pageValue, key:keyValue} ),
		});
	trigger.parentElement.remove();

}





function resizeAll() {
    console.log("RESIZING ALL");
    console.log(document.getElementsByTagName("textarea"));
    for (let i = 0; i < document.getElementsByTagName("textarea"); i++) {
        resizeArea(i)
    }
}



function triggerInput(target){
	target.click();
}


function productAddImage(trigger){
	const files = trigger.files;
	print("Adding images: ", files);

	for (let i = 0; i < files.length; i++){
        fileName = files[i].name;
		uploadImage(files[i], "bespoke");
		productUpdate(trigger,fileName , "list", "add");
        try {
            const newImage = trigger.parentElement.previousElementSibling.cloneNode(true);
            newUrl = imageUrl("bespoke", fileName);
            newImage.style = "background-image: url('" + newUrl + "')";
            trigger.parentElement.before(newImage);
        } catch (e) {
            location.reload();
        }
	}
}



function uploadImage(file, folder="productes"){
	print("Uploading: ", file.name, "("+file.type+")");
	fetch("/admin/images/upload/"+folder,
		{
			headers: {'Accept': file.type,
				'Content-Type': file.type,
                'Content-Disposition': 'attachment; filename="'+file.name+'"',
                'fname': file.name,
			},
			method: "POST",
			body: file,
		});
}

function productImageMove(image, moveRight){
    const oldPosition = Array.from(image.parentElement.children).indexOf(image);
    let newPosition = oldPosition
    if (moveRight){
        if (image.nextElementSibling !== null && image.nextElementSibling.classList.contains("product-image")){
            newPosition += 1;
            image.nextElementSibling.after(image);
        }
    } else{
        if (image.previousElementSibling !== null) {
            newPosition -= 1;
            image.previousElementSibling.before(image);
        }
    }
    print("Moved image: ",oldPosition, "->", newPosition)
    productUpdate(image, oldPosition, "list", "sort", newPosition);
}

function productImageDelete(image){
    productUpdate(image, undefined, "list", "remove");
    image.remove();

}




function productUpdate(trigger, value=undefined, type="text", mode="add",  key=undefined,  subdict=undefined, subkey=undefined) {
	const field = trigger.attributes.field.value;
	const product = trigger.attributes.product.value;
    let bucket = window.location.href.split("/");

    print("BUCKET: " + bucket, bucket.length);
    bucket = bucket[bucket.length - 2];
    print(bucket);
	print("Trigger: ", trigger, value);
	if (value === undefined) {
        if (trigger.value) {
            value = trigger.value;
        }else {
            value = trigger.attributes.value.value;
        }
	}
    if (trigger.attributes.dataType){
		type = trigger.attributes.dataType.value;
	}
	print("Updating field: ", field, "("+mode+")");
	print("With value: ", value);
	fetch("/admin/"+bucket+"/update",
		{
			headers: {'Accept': 'application/json',
				'Content-Type': 'application/json'
			},
			method: "POST",
			body: JSON.stringify({product: product, field: field, value: value, type:type, mode:mode, key:key, subdict:subdict, subkey:subkey} ),
                });
    if (type === "text"){
        trigger.nextElementSibling.style.backgroundColor = "lightgreen";
    }


}
