


let saveButton = document.querySelector('.save-newsletter');
let sendButton = document.querySelector('.send-newsletter');

function editNewsletter(trigger){
    let container = document.querySelector('.newsletter-editor');
    container.style.border = "1px solid black";
    let elements = container.querySelectorAll('span');
    elements.forEach(element => {
        print(element.innerText);
        if (element.classList.contains('non-editable')){return 0;}
        //if (element.children.length > 0){return 0;}
        if (element.innerText === ""){element.innerText = "$empty$"}
        element.classList.add('editable');
        element.contentEditable = "true";
    })
    console.log(trigger)
    trigger.setAttribute("onclick", "stopEditingNewsletter(this)");
    trigger.innerText = "Previsualitzar";
    saveButton.classList.add('hidden');
    sendButton.classList.add('hidden');

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
    } else {
        trigger.style.backgroundColor = "red";
    }
    sendButton.classList.remove('hidden');
    sendButton.style.backgroundColor = "lightblue";

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
