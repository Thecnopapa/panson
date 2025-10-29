


let doc = document.documentElement;
window.addEventListener("load", initLocalisation);



function initLocalisation(){
	console.log(" * Initialising Localisation");
	let locElements = [...document.getElementsByClassName("loc")];
	console.log(locElements.length, " Elements");
	locElements.forEach(el => {
		el.addEventListener("contextmenu", makeEditable);
		el.addEventListener("select", makeEditable);
	});
	

}


function makeEditable(event) {
    event.preventDefault();
	let target = event.target;
	while (!target.classList.contains("loc")) {
		target = target.parentElement;
		if (target === doc){cancelEditable(event);}
	}

	target.style.color = "blue";
	console.log(target.innerText);
	console.log(target.textContent);
	console.log(target.innerHTML);
	//target.textContent = target.textContent.replace(/\n/g, '<br>');
	target.textContent = target.innerHTML;
	target.textContent = target.textContent.replace(/<br>/g, '<br>\n');
	target.textContent = target.textContent.replace(/<\/li>/g, '</li>\n');
	target.textContent = target.textContent.replace(/<ol>/g, '<ol>\n');
	target.textContent = target.textContent.replace(/<\/ol>/g, '</ol>\n');
	target.addEventListener("click", editLoc);
	target.contentEditable = "true";
	[...target.children].forEach(c => {
		c.contentEditable = "false";
	});
    target.focus();
	target.removeEventListener("contextmenu", makeEditable);
	target.removeEventListener("select", makeEditable);
	//target.addEventListener("mouseleave", cancelEditable);
    editLoc(event);
	
}


function editLoc(event) {
	event.preventDefault();
	let target = event.target;
	while (!target.classList.contains("loc")) {
                target = target.parentElement;
                if (target === doc){cancelEditable(event);}
        }
    target.focus();
	target.style.color = "black";
	target.style.backgroundColor = "lightyellow";
	target.removeEventListener("click", editLoc);
	target.addEventListener("focusout", saveEdits);
	//target.removeEventListener("mouseleave", cancelEditable);

   target.addEventListener("keydown", closeLocWithEscape);
	
}

function closeLocWithEscape(event) {
        //console.log(event.key);
        if (event.key === "Escape"){
            event.preventDefault()
            cancelEditable(event);

        }
    }
function cancelEditable(event){
	console.log("cancel editable");
	let target = event.target;
	while (!target.classList.contains("loc")) {
		target = target.parentElement;
                if (target === doc){cancelEditable(event);}
        }

	target.removeEventListener("click", editLoc);
	target.removeEventListener("keydown", closeLocWithEscape);
	target.removeEventListener("focusout", saveEdits);
	target.style.backgroundColor = "";
    target.style.color = "";
    target.contentEditable = "false";
	target.addEventListener("contextmenu", makeEditable);
    target.addEventListener("select", makeEditable);
	//target.textContent = target.textContent.replace(/\n/g, '<br>');
	target.textContent = target.textContent.replace(/>\n/g, '>');
	target.innerText = target.innerText.replace(/\n/g, '<br>');
	target.innerHTML = target.textContent;

}


async function saveEdits(event) {
	let target = event.target;
	while (!target.classList.contains("loc")) {
                target = target.parentElement;
                if (target === doc){cancelEditable(event);}
        }
	target.contentEditable = "false";
	console.log("--");
	console.log(target.innerText);
	target.textContent = target.textContent.replace(/>\n/g, '>');
	//target.textContent = target.textContent.replace(/<\/li>\n/g, '</li>');
	//target.textContent = target.textContent.replace(/<ol>\n/g, '<ol>');
	//target.textContent = target.textContent.replace(/<\/ol>\n/g, '</ol>');
	target.innerText = target.innerText.replace(/\n/g, '<br>');
	
	console.log(target.innerText);
	//target.textContent = target.textContent.replace(/\r\n/g, '<br>');
	
	let resp = await updateLoc(target.attributes.loc.value, target.textContent, doc.lang);
	if (resp.ok) {
		target.style.backgroundColor = "";
		target.style.color = "";
	} else {
		target.style.backgroundColor = "red";
		target.style.color = "white";
	}
	target.removeEventListener("focusout", saveEdits);
	target.removeEventListener("mouseleave", cancelEditable);
	target.addEventListener("contextmenu", makeEditable);
        target.addEventListener("select", makeEditable);
	//target.textContent = target.textContent.replace(/\n/g, '<br>');
	target.innerHTML = target.textContent;
}

async function editLocOld(event){
	console.log(event.target);
    event.preventDefault();
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
	locInput.textContent = target.innerText;
	locInput.innerHTML = locInput.innerHTML.replace(/\n/g, '\n');
	locInput.addEventListener("focusout", updateLocElement);



	locEditor.appendChild(locInput);
    locEditor.addEventListener("click", (e) => {e.stopPropagation()});
	locEditor.style.left = String(targetPosX) + "px";
	locEditor.style.top = String(targetPosY) + "px";
	target.after(locEditor);
    locInput.focus();


}


async function updateLocElement(e){
    e.preventDefault();
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



