


let doc = document.documentElement;
window.addEventListener("load", initLocalisation);



function initLocalisation(){
	console.log(" * Initialising Localisation");
	let locElements = [...document.getElementsByClassName("loc")];
	console.log(locElements);
	locElements.forEach(el => {
		el.addEventListener("contextmenu", editLoc);
		el.addEventListener("select", editLoc);
	});
	

}



async function editLoc(event){
	console.log(event.target);
	let target = event.target;
	let targetPosX = target.offsetLeft;
	let targetPosY = target.offsetTop;
	
	//console.log(targetPosX, targetPosY);
	let locEditor = document.createElement("div");
	locEditor.classList.add("loc-editor");
	locEditor.setAttribute("draggable", true);

	let locTitle = document.createElement("div");
	locTitle.classList.add("loc-title");
	locTitle.innerText = target.attributes.loc.value;
	locEditor.appendChild(locTitle);

	let locInput = document.createElement("textarea");
	locInput.classList.add("loc-input");
	locInput.innerText = target.innerText;
	locInput.addEventListener("focusout", updateLocElement);



	locEditor.appendChild(locInput);
	locEditor.style.left = String(targetPosX) + "px";
	locEditor.style.top = String(targetPosY) + "px";
	target.after(locEditor);


}


async function updateLocElement(e){
	target = e.target.parentElement.previousElementSibling;
	console.log(target);
	let r = await updateLoc(target.attributes.loc.value, e.target.value, doc.lang );
	target.innerText = e.target.value;
	e.target.parentElement.remove();
}



async function updateLoc(label, value, lan){
	console.log("updating loc:");
	console.log(label, value, lan);

	let r = fetch("/admin/loc/update",
		{
			method: "POST",
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({label: label, value: value, lan:lan}),
		}
	)

	return await r


}



