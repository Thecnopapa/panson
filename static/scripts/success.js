






function showInvoice(url){
    window.open(url, '_blank');
}



async function fetchInvoice(url){
    let invoiceDiv = document.getElementById("invoice");
    let invoiceHTML = await fetch(url,{
        method: 'GET',

    }).then(response => {return response.text();}).then(text => {
		const parser = new DOMParser();
		let html = parser.parseFromString(text, "text/html").documentElement;
		console.log(html);
		return html;
	});
    invoiceDiv.innerHTML = invoiceHTML.innerHTML;

}



