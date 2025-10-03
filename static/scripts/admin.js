
let currentBucket = location.pathname.split("/")[2];



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


async function miscUpdate(target, del=false, sure=false){
    console.log("UPDATING MISC");
    let pos = undefined
    const colorcodedElements = [...target.getElementsByClassName("colorcoded")];
    const field = target.attributes.field.value;
    const keyElement = target.getElementsByClassName("misc-key")[0];
    const valueElement = target.getElementsByClassName("misc-value")[0];
    const key = keyElement.value;
    const value = valueElement.value;

    if (del && !sure){
        let dialog = document.createElement("dialog");
        dialog.classList.add("dialog-delete");
        let closeButton = document.createElement("button");
        closeButton.className = "cancel";
        closeButton.innerHTML = "Cancel";
        closeButton.addEventListener("click", (event) => {dialog.remove();});
        let deleteButton = document.createElement("button");
        deleteButton.className = "delete";
        deleteButton.innerHTML = "DELETE";
        deleteButton.addEventListener("click", () => {miscUpdate(target, del, true); dialog.remove();});
        let deleteText = document.createElement("div");
        deleteText.className = "delete-warning";
        deleteText.innerHTML = 'Are you sure you want to delete?<br>('+field+') <b>'+key+'</b>';

        dialog.appendChild(deleteText);
        dialog.appendChild(closeButton);
        dialog.appendChild(deleteButton);
        document.body.appendChild(dialog)
        dialog.showModal()
        return
    }


    try {
        pos = target.attributes.position.value;
    } catch {}
    console.log("FIELD:", field);
    console.log("POS:", pos);
    console.log("KEY:", key);
    console.log("VALUE:", value);

    let resp = await fetch("/admin/misc/update",
        {
            headers: {
                'Content-Type': 'application/json'
            },
            method: "POST",
            body: JSON.stringify({field: field, pos: pos, key:key, value: value, del: del} ),
        })
    if (resp.ok) {
        if (del){
            target.remove();
        }
        colorcodedElements.forEach(element => {element.style.backgroundColor = "lightgreen";});
    } else {

        colorcodedElements.forEach(element => {element.style.backgroundColor = "red";});
    }
}






async function uploadFiles(trigger, clone=undefined){
	let bucket = trigger.parentElement.attributes.bucket.value;
    if (bucket === undefined){
        bucket = currentBucket;
    }
	const files = trigger.files;
	let uploadedFiles = []
	for (let i = 0; i < files.length; i++){
		const file = files[i];
		print("Uploading: ", file.name, "("+file.type+") to: "+bucket);
		let newFname = await fetch("/admin/images/upload/"+bucket,
			{
				headers: {
					'Content-Type': file.type,
                			'Content-Disposition': 'attachment; filename="'+file.name+'"',
                			'filename': file.name,
			},
			method: "POST",
			body: file,
		}).then(response => {if (response.ok){return response.text();}else{return undefined;}});
		uploadedFiles.push(await newFname);
        console.log("Uploaded: ", await newFname);

        if (trigger.hasAttribute("product")){
            productUpdate(trigger, await newFname , "list:text", "add");
        }

        if (clone !== undefined && clone !== null){
            print("Cloning: ", clone)
            print(imageUrl(bucket, await newFname))
            let clonedElement = clone.cloneNode(true);
            clonedElement.style = "background-image: url('" + imageUrl(bucket, await newFname) + "')";

            clonedElement.setAttribute("filename", await newFname);
            clone.after(clonedElement);
            print("Clone: ", clonedElement);

        }
	}

    if (clone === undefined || clone === null){
        window.location.reload();
    }
    return uploadedFiles;
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
    image.scrollIntoView({block: "center"});
}

function productImageDelete(image){
    productUpdate(image, undefined, "list:text", "remove");
    image.remove();

}




async function productUpdate(trigger, value=undefined, type=undefined, mode="add",  key=undefined,  subdict=undefined, subkey=undefined, dry=false) {
	const field = trigger.attributes.field.value;
	const product = trigger.attributes.product.value;
    	let colorcode = trigger.getAttribute("colorcode");
	let colorElement = trigger;
    if (colorcode === undefined || colorcode === null){
	
    } else if(colorcode === "next"){
	    colorElement = trigger.nextElementSibling;
    }
    let bucket = window.location.href.split("/");

    
    bucket = bucket[bucket.length - 2];
    print("BUCKET: " + bucket);
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
	if (dry){
		console.log("dry");
	}
	let resp = await fetch("/admin/update/"+bucket,
		{
			headers: {'Accept': 'application/json',
				'Content-Type': 'application/json'
			},
			method: "POST",
			body: JSON.stringify({product: product, field: field, value: value, type:type, mode:mode, key:key, subdict:subdict, subkey:subkey, dry:dry} ),
                }).then(response => {return response;});
    if (colorElement !== undefined && colorElement !== null) {
        if (resp.ok) {
            colorElement.style.backgroundColor = "lightgreen";
        } else {
            colorElement.style.backgroundColor = "red";
        }
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
            } else {
		    container.style.backgroundColor = "green";
		    return true;
	    }
	}
        container.style.backgroundColor = "lightgreen";
        keyElement.type = "hidden";
        labelElement.innerHTML = "";
        return true;
    }
}


async function productUpdateColors(container){
	let nColorsInput = container.getElementsByClassName("n-colors-input")[0];
	let colorsDiv = container.getElementsByClassName("all-colors")[0];
	let selectedElements = [...colorsDiv.querySelectorAll(".colorCircles,.selected")];
	let nColors = nColorsInput.value;
	console.log("nColors: ", nColors);
	let selectedColors ={};
	if (nColors === "0"){
		console.log("no colors");
	}
	selectedElements.forEach(el => {
		selectedColors[el.attributes.value.value] = {"preu":0};
	});
	console.log(selectedColors);
	let resps = [];
	resps.push(await productUpdate(nColorsInput, nColors, "dict:int", "add", "n_colors", undefined,  undefined));
	
	resps.push(await productUpdate(colorsDiv, selectedColors, "dict:dict", "add", "colors", undefined, undefined));


	console.log(resps);



}




function addListElement(trigger, typeOfFirst){
    let newElement = trigger.lastElementChild.cloneNode(true);
    newElement.getElementsByTagName("span")[0].innerHTML = "";
    newElement.style.backgroundColor = "";
    const inputs = newElement.getElementsByTagName("input");
    inputs[0].type = typeOfFirst;
    for (let i = 0; i < inputs.length; i++) {
        inputs[i].value = "";
    }
    trigger.lastElementChild.after(newElement);
}




async function showImgDetails(image){
    const filename = image.attributes.filename.value;
    const bucket = image.attributes.bucket.value;

    let containerCloser = document.createElement("div");
    containerCloser.classList.add("container-closer");
    containerCloser.addEventListener("click", function(event){event.target.remove();});
    document.body.appendChild(containerCloser);
    let newContainer = document.createElement("div");
    newContainer.classList.add("img-details");
    newContainer.addEventListener("click", function(event){event.stopPropagation();});
    containerCloser.appendChild(newContainer);
    let newImage = document.createElement("img");
    newImage.classList.add("img-details-img");
    newImage.addEventListener("mouseover", function(event){event.target.scrollIntoView();});
    newContainer.appendChild(newImage);
    
    let newInfo = document.createElement("div");
    newInfo.classList.add("img-details-info");
    newInfo.addEventListener("mouseover", function(event){event.target.scrollIntoView({block: "end"});});
    newContainer.appendChild(newInfo);
    let deleteButton = document.createElement("div");
    deleteButton.addEventListener("click", e => {
        deleteImage(e)
        containerCloser.click();
        image.remove()
    })
    deleteButton.classList.add("img-details-delete");
    deleteButton.setAttribute("bucket", bucket);
    deleteButton.setAttribute("filename", filename);
    deleteButton.innerText = "ESBORRAR";
    newInfo.appendChild(deleteButton);
    let newInfoTable = document.createElement("table");
    newInfoTable.classList.add("img-details-table");
    newInfo.addEventListener("mouseover", function(event){event.target.parentElement.scrollIntoView({block: "end"});});
    newInfo.appendChild(newInfoTable);


    let imgInfo = await fetch("/admin/files/info",{
        method: "POST",
        body: JSON.stringify({filename: filename, bucket:bucket }),
        headers: {
            "Content-Type": "application/json"
        },
    }).then(response => {return response.json();});
    newImage.src = imgInfo.url;
    //imgInfo.push({key:"brighness", value: getImageBrightness(imgInfo.url)});
    for (const key in imgInfo) {
        let newRow = document.createElement("tr");
        newInfoTable.appendChild(newRow);
        newRow.innerHTML = "<th class='key'>"+key+"</th><th>"+imgInfo[key]+"</th>";
        newInfo.addEventListener("mouseover", function(event){event.parentElement.parentElement.scrollIntoView({block: "end"});});
    }

}

async function deleteImage(event){
    let filename = event.target.attributes.filename.value;
    let bucket = event.target.attributes.bucket.value
    if (filename === undefined || bucket === undefined){
        return false
    }
    let r = await fetch("/admin/images/delete", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({bucket:bucket, filename: filename})
    })
    event.target.remove()
    return true
}


let lastSelectedTrigger = undefined;

async function initImageSelector(dialog, product, trigger){
	if (lastSelectedTrigger === trigger){
		return null;
	}
	lastSelectedTrigger = trigger;
	let previousImages = [];
	const previousImageElements = [...trigger.parentElement.getElementsByClassName("product-image")];
	previousImageElements.forEach(pImage => {
		previousImages.push(pImage.getAttribute("value"));
	});

	let gallery = dialog.getElementsByClassName("image-selector-gallery")[0];
	[...gallery.children].forEach(child => {
		if (!child.classList.contains("template")){
			child.remove();
		}
	});
	let template = gallery.firstElementChild;
	const bucket = currentBucket;
	const titleElement = dialog.getElementsByClassName("image-selector-title")[0];
	const submitElement = dialog.getElementsByClassName("image-selector-confirm")[0];
	console.log(submitElement);
	submitElement.setAttribute("field", "imatges");
	submitElement.setAttribute("product", product);
	console.log(bucket);
	titleElement.innerHTML = bucket + ": "+product ;

	let resp = await fetch("/admin/files/list",
		{

			headers: {
				'Content-Type': 'application/json'
			},
			method: "POST",
			body: JSON.stringify({bucket:bucket})
		}).then(resp => {return resp.json()});
	let filenames = resp["filenames"];
	console.log(resp, filenames);
	filenames.forEach(file => {
		//console.log(file);
		let newElement = template.cloneNode(true);
		newElement.classList.remove("template");
		newElement.classList.add("normal-image");
		newElement.classList.add("selectable");
		if (previousImages.includes(file)){
			newElement.classList.add("selected");
		}
		newElement.setAttribute("filename", file);
		//console.log(imageUrl(bucket, file))
		newElement.setAttribute("background", imageUrl(bucket, file));
		gallery.appendChild(newElement);
	});
	loadAllImages();


}


function showImageSelector(trigger, product){
	let dialog = document.getElementsByClassName("image-selector")[0];
	console.log(dialog, product);
	dialog.classList.remove("hidden");
	initImageSelector(dialog, product, trigger);
}

async function confirmSelection(trigger){
	const dialog = trigger.parentElement.parentElement
	let selection =[];
	let selected = [...trigger.parentElement.getElementsByClassName("selected")];
	selected.forEach(element => {selection.push(element.getAttribute("filename"))});
	console.log(selection);
	let resps =[];
	let d = await productUpdate(trigger, undefined, undefined, "reset");
	for (let i = 0; i < selection.length; i++) {

		file = selection[i];
		console.log("updating with: ", file);
		let r = await productUpdate(trigger, file);
		resps.push([r, file]);
	}
	console.log(await Promise.all(resps));
	let previousElements = [...lastSelectedTrigger.parentElement.getElementsByClassName("product-image")];
	try{
		resps.forEach(r => {
			template = lastSelectedTrigger.parentElement.getElementsByClassName("as-template")[0];
			if (r[0].ok){
				let filename = r[1];
				let clone = template.cloneNode(true);
				template.classList.remove("as-template");
				clone.setAttribute("value", filename);
				clone.setAttribute("background", imageUrl(currentBucket, filename));
				template.after(clone);
			}
		});
		previousElements.forEach(e => {e.remove();});
		loadAllImages();
		lastSelectedTrigger = undefined;
	} catch {}
	
	dialog.classList.add("hidden");


	
}


function selectThis(trigger){
	trigger.classList.toggle("selected");

}








print(" * Admin JS ready")
