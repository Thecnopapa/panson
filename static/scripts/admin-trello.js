

trelloApiKey = document.getElementsByClassName("trello-key-input")[0];
trelloListSelect = document.getElementsByClassName("trello-list-select")[0];
trelloBoardSelect = document.getElementsByClassName("trello-board-select")[0];
trelloSubmitButton = document.getElementsByClassName("trello-submit-button")[0];
trelloTestButton = document.getElementsByClassName("trello-test-button")[0];


async function getTrelloLists(){
    console.log("Getting Trello Lists");
    console.log("Board: ", trelloBoardSelect.value );
    [...trelloListSelect.children].forEach((c) => {c.remove();});
    trelloSubmitButton.disabled = true;
    let resp = await fetch("/admin/trello/get-lists", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
        },
        body: JSON.stringify({"board_id":trelloBoardSelect.value}),
    }).then((res) => {return res});
    console.log(resp);
    if (resp.ok) {
        let data = await resp.json()
        console.log(data);
        data.forEach((option) => {
            console.log(option);
            let newOption = document.createElement("option");
            newOption.value = option.id;
            newOption.innerText = option.name;
            if (option.id !== trelloListSelect.getAttribute("current")) {
                newOption.selected = true;
            }
            trelloListSelect.appendChild(newOption);
        })
        trelloListSelect.classList.add("loaded");
        trelloSubmitButton.disabled = false;
    } else {

    }
}

async function testTrello(){
    console.log("Testing trello");
    console.log("Key: ", trelloApiKey.value );
    console.log("Board: ", trelloBoardSelect.value );
    console.log("List: ", trelloListSelect.value );
    trelloTestButton.style.backgroundColor = "orange";
    let labelInputs = [...document.getElementsByClassName("trello-label-input")];
    let labels = []
    labelInputs.forEach((label) => {
        if (label.checked) {
            labels.push(label.value);
        }
    });

    let resp = await fetch("/admin/trello/test", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
        },
        body: JSON.stringify({"api_key": trelloApiKey.value, "board_id":trelloBoardSelect.value, "list_id":trelloListSelect.value, "labels":labels}),
    }).then((res) => {return res});
    console.log(resp);
    if (resp.ok) {
        let data = await resp.json()
        console.log(data);
        if (data.success === true) {
            trelloTestButton.style.backgroundColor = "green";
        }
        else{
            trelloTestButton.style.backgroundColor = "red";
        }
    }
    else {
        trelloTestButton.style.backgroundColor = "purple";
    }
}

async function updateTrello(){
    console.log("Testing trello");
    console.log("Key: ", trelloApiKey.value );
    console.log("Board: ", trelloBoardSelect.value );
    console.log("List: ", trelloListSelect.value );
    trelloSubmitButton.style.backgroundColor = "orange";
    let labelInputs = [...document.getElementsByClassName("trello-label-input")];
    let labels = []
    labelInputs.forEach((label) => {
        if (label.checked) {
            labels.push(label.value);
        }
    });

    let resp = await fetch("/admin/trello/update", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
        },
        body: JSON.stringify({"api_key": trelloApiKey.value, "board_id":trelloBoardSelect.value, "list_id":trelloListSelect.value, "labels":labels }),
    }).then((res) => {return res});
    console.log(resp);
    if (resp.ok) {
        let data = await resp.json()
        console.log(data);
        trelloSubmitButton.style.backgroundColor = "green";
    }
    else {
        trelloSubmitButton.style.backgroundColor = "red";
    }
}


