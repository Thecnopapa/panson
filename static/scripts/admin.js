




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

async function updateField(target){
    console.log("UPDATING FIELD");
    console.log(target.value);
    console.log(target.attributes.page.value, target.attributes.key.value, target.attributes.lan.value);
    payload = {value: target.value, page:target.attributes.page.value, key: target.attributes.key.value, lan: target.attributes.lan.value};
    let resp = await fetch("/admin/loc/update-field",
        {
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            method: "POST",
            body: JSON.stringify(payload),
    }).then((response) => {return response});
    if (resp.ok) {
        target.nextElementSibling.style.backgroundColor = "revert";
    } else {
        target.nextElementSibling.style.backgroundColor = "red";
    }

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


async function productAddImage(trigger, bucket){
	const files = trigger.files;
	print("Adding images: ", files);
    if (bucket === undefined){
        bucket = document.URL.split("/");
        bucket = bucket[bucket.length - 2];
    }
    print("Bucket: ", bucket);

	for (let i = 0; i < files.length; i++){
        const originalName = files[i].name;
		let newName = await uploadImage(files[i], bucket).then(response => {return response;});
        if (newName !== undefined){
            productUpdate(trigger, newName , "list:text", "add");
            try {
                const newImage = trigger.parentElement.previousElementSibling.cloneNode(true);
                newUrl = imageUrl(bucket, newName);
                newImage.style = "background-image: url('" + newUrl + "')";
                trigger.parentElement.before(newImage);
            } catch (e) {
                location.reload();
            }
        }



	}
}



async function uploadImage(file, bucket){
	print("Uploading: ", file.name, "("+file.type+")");
	let newFname = await fetch("/admin/images/upload/"+bucket,
		{
			headers: {'Accept': file.type,
				'Content-Type': file.type,
                'Content-Disposition': 'attachment; filename="'+file.name+'"',
                'fname': file.name,
			},
			method: "POST",
			body: file,
		}).then(response => {if (response.ok){return response.text();}else{return undefined;}});
    console.log("Uploaded: ", newFname);
    return newFname;
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
    productUpdate(image, oldPosition, "list:int", "sort", newPosition);
}

function productImageDelete(image){
    productUpdate(image, undefined, "list:text", "remove");
    image.remove();

}




async function productUpdate(trigger, value=undefined, type=undefined, mode="add",  key=undefined,  subdict=undefined, subkey=undefined) {
	const field = trigger.attributes.field.value;
	const product = trigger.attributes.product.value;
    let bucket = window.location.href.split("/");

    print("BUCKET: " + bucket, bucket.length);
    bucket = bucket[bucket.length - 2];
    print(bucket);
	print("Trigger: ", trigger, value);
	if (value === undefined) {
        print("Value undefined: " + value);
        if (trigger.value) {
            value = trigger.value;
        }else {
		try{
            		value = trigger.attributes.value.value;
		} catch{}
        }
	}
    if (type === undefined){
        try{
            type = trigger.attributes.dataType.value;
        }catch(e){
            type = "text"
        }

	}
	print("Updating field: ", field, "("+mode+")");


	print("With value: ", value);
	let resp = await fetch("/admin/"+bucket+"/update",
		{
			headers: {'Accept': 'application/json',
				'Content-Type': 'application/json'
			},
			method: "POST",
			body: JSON.stringify({product: product, field: field, value: value, type:type, mode:mode, key:key, subdict:subdict, subkey:subkey} ),
                }).then(response => {return response;});
    if (resp.ok){
        trigger.nextElementSibling.style.backgroundColor = "lightgreen";
    } else {
        trigger.nextElementSibling.style.backgroundColor = "red";

    }
    return resp;
}

async function productUpdateDict(container, mode){
    const labelElement = container.getElementsByTagName("span")[0];
    const keyElement = container.getElementsByClassName("dict-key")[0];
    const inputElements = container.getElementsByClassName("dict-input");
    const subdict = keyElement.attributes.subdict.value;
    const subkey = keyElement.value;
    let responses = []
    print("Updating dict..")
    if (mode === "remove"){
        print(keyElement, undefined, "dict:text", "remove", subdict);
        let resp = await productUpdate(keyElement, undefined, "dict:text", "remove", subdict).then(response => {return response;});
        if (resp.ok) {
            container.remove();
        }else {
            container.style.backgroundColor = "red";
        }
    } else if (mode === "add"){

        for (let i = 0; i < inputElements.length; i++) {
            const input = inputElements[i];
            print(input.attributes.key.value);
            const value =  input.value;
            const key = input.attributes.key.value;
            const dataType = input.attributes.dataType.value
            print(keyElement, value, "dict:"+dataType, "add", key, subdict, subkey);
            let resp = await productUpdate(keyElement, value, "dict:"+dataType, "add", key, subdict, subkey).then(response => {return response;});
                responses.push(resp);
        }
        for (let i = 0; i < responses.length; i++) {
            if (!responses[i].ok) {
                container.style.backgroundColor = "red";
                return false;
            }
        }
        container.style.backgroundColor = "lightgreen";
        keyElement.type = "hidden";
        labelElement.innerHTML = "";
        return true;
    }
}


function addListElement(trigger, typeOfFirst){
    let newElement = trigger.lastElementChild.cloneNode(true);
    newElement.getElementsByTagName("span")[0].innerHTML = "";
    newElement.style.backgroundColor = "";
    const inputs = newElement.getElementsByTagName("input");
    inputs[0].type = typeOfFirst;
    for (let i = 0; i < inputs.length; i++) {
        inputs[i].value = ""
    }
    trigger.lastElementChild.after(newElement);
}

print(" * Admin JS ready")
