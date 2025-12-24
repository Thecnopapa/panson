


let saveButton = document.querySelector('.save-newsletter');
let sendButton = document.querySelector('.send-newsletter');
let editButton = document.querySelector(".edit-newsletter");
let editHTMLButton = document.querySelector(".edit-html-newsletter");

function editNewsletter(trigger){
    let container = document.querySelector('.newsletter-editor');
    container.style.border = "1px solid black";
    let elements = container.querySelectorAll('span');
    elements.forEach(element => {
        print(element.innerHTML);
        if (element.classList.contains('non-editable')){return 0;}
        //if (element.children.length > 0){return 0;}
        if (element.innerText === ""){element.innerText = "$empty$"}
	let html = element.innerHTML;
	html = html.replace(/<br>/g, '<br>\n');
	element.innerText = html;
        element.classList.add('editable');
        element.contentEditable = "true";
    })
    console.log(trigger);
    trigger.setAttribute("onclick", "stopEditingNewsletter(this)");
    trigger.innerText = "Previsualitzar";
    saveButton.classList.add('hidden');
    sendButton.classList.add('hidden');
    editHTMLButton.classList.add("hidden");

}

function stopEditingNewsletter(trigger){
    let container = document.querySelector('.newsletter-editor');
    container.style.border = "1px solid orange";
    let elements = container.querySelectorAll('span');
    elements.forEach(element => {
        print(element.innerText);
        if (element.classList.contains('non-editable')){return 0;}
        //if (element.children.length > 0){return 0;}
        if (element.innerText === "$empty$"){element.innerText = ""}
        let newText = element.innerText;
        newText = newText.replace(/\$empty\$/g, '');
        newText = newText.replace(/<br>\n/g, '<br>');
        newText = newText.replace(/\n/g, '<br>');
        element.innerHTML = newText;
        element.classList.remove('editable');
        element.removeAttribute("contenteditable");
    })


    trigger.setAttribute("onclick","editNewsletter(this)");
    trigger.innerText = "Editar Newsletter";
    saveButton.classList.remove('hidden');
    editHTMLButton.classList.remove("hidden");
    saveButton.style.backgroundColor = "lightblue";

}

async function saveNewsletter(trigger) {
    trigger.style.backgroundColor = "orange";
    let container = document.querySelector('.newsletter-editor');
    let currentFile = document.querySelector('.current-file').getAttribute('filename');

    let resp = await fetch("/admin/newsletter/save", {
        method: 'POST',
        headers: {
            'Content-Type': 'text/plain',
            'filename': currentFile,
        },
        body: String(container.innerHTML),
    })
    if (resp.ok){
            trigger.style.backgroundColor = "lightgreen";
            sendButton.classList.remove('hidden');
            sendButton.style.backgroundColor = "lightblue";
    } else {
        trigger.style.backgroundColor = "red";
    }


}

async function sendNewsletter(trigger) {
    trigger.style.backgroundColor = "orange";
    let container = document.querySelector('.newsletter-editor');
    let currentFile = document.querySelector('.current-file').getAttribute('filename');
    let subject = document.querySelector('.subject-input').value;

    let resp = await fetch("/admin/newsletter/send", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            filename: currentFile,
            subject: subject,
        })
    })
    if (resp.ok){
            trigger.style.backgroundColor = "lightgreen";
    } else {
        trigger.style.backgroundColor = "red";
    }

}

function editHTMLNewsletter(trigger){
    let container = document.querySelector('.newsletter-editor');
    container.style.border = "1px solid black";
    let html = container.innerHTML;
    //html = html.replace(/<br>/g, '<br>\n');
    container.innerText = html;
    container.contentEditable=true;
    console.log(trigger);
    trigger.setAttribute("onclick", "stopEditingHTMLNewsletter(this)");
    trigger.innerText = "Previsualitzar";
    saveButton.classList.add('hidden');
    sendButton.classList.add('hidden');
    editButton.classList.add("hidden");

}

function stopEditingHTMLNewsletter(trigger){
    let container = document.querySelector('.newsletter-editor');
    container.style.border = "1px solid orange";
    let html = container.innerText;
    container.innerHTML = html;
    container.contentEditable = false;

    trigger.setAttribute("onclick","editHTMLNewsletter(this)");
    trigger.innerText = "Editar Newsletter";
    saveButton.classList.remove('hidden');
    editButton.classList.remove("hidden");
    saveButton.style.backgroundColor = "lightblue";

}
