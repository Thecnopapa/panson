
const cartButton = document.getElementById('cart-button');
const cartItems = document.getElementsByClassName('is-carret');
const cart = document.getElementById("carret")




function openCart(){
    closeMenu()
    //console.log("Opening Cart")
    cart.classList.add('open');
    for (let i = 0; i < cartItems.length; i++) {
        cartItems[i].classList.add('open');
        cartButton.setAttribute("onclick", "closeCart()");
    }
    if (cartIcon){
            cartIcon.src = "/static/media/bag-black.svg";

    }
    if (cartCircle){
        	cartCircle.style.color = "black";
        	cartCircle.style.backgroundColor = "white";
	}
    if (window.innerHeight > window.innerWidth){
        //console.log(document.documentElement)
        document.documentElement.style.overflow = "hidden";
    }
}


async function closeCart(){
    //console.log("Closing Cart");
    cart.classList.remove('open');
    for (let i = 0; i < cartItems.length; i++) {
        cartItems[i].classList.remove('open');
        cartButton.setAttribute("onclick", "openCart()");
    }
    document.documentElement.style.overflow = "";
}


async function deleteItem(productElement, pos){
    let link = "/productes/carret/"+ pos+"/0";
	console.log(link);
	let resp = await fetch(link, {method: "POST"});
	if (resp.ok){
		productElement.remove();
		updateCartCounter();
	}

}

async function modifyItem(counterElement, pos, mode){
    let oldQty = counterElement.innerHTML;
    let newQty = Number(oldQty);
    if (mode == "increase"){
        newQty = Number(oldQty)+1;
    }else if (mode == "decrease") {
        newQty = Number(oldQty)-1;
    }
    if (newQty <= 0){
        deleteItem(counterElement.parentElement.parentElement.parentElement, pos);
    } else{
        let link = "/productes/carret/"+ pos+"/"+newQty;
        console.log(link);
        let resp = await fetch(link, {method: "POST"});
	    if (resp.ok){
		    counterElement.innerHTML = newQty;
        	updateCartCounter();
		   
	    }
    }

}

function updateCartCounter(){
    const allCounters = document.getElementsByClassName('producte-carret-quantitat');
    const cartCounters = [...document.getElementsByClassName("cart-counter")];
	const cartInfo = document.getElementsByClassName("cart-info")[0];
	const emptyInfo = document.getElementsByClassName("no-cart-info")[0];
    const totalCart = document.getElementsByClassName("total-cart")[0];
    const totalCartValue = document.getElementsByClassName("total-cart-value")[0];
	console.log(totalCart, totalCartValue);
    let itemSum = 0;
    let priceSum = 0;
    for (let i = 0; i < allCounters.length; i++){
        itemSum += Number(allCounters[i].innerHTML);
        const newPrice = Number(allCounters[i].innerHTML) * Number(allCounters[i].attributes.price.value);
        priceSum += newPrice;
        allCounters[i].parentElement.previousElementSibling.innerHTML = String(newPrice) + "&#8364;";
    }
    totalCartValue.innerHTML = String(priceSum)+ "&#8364";
    cartCounters.forEach(c => {c.innerHTML = itemSum});
    if (itemSum <= 0){
        cartCounters.forEach(c => {c.style.display = "none"});
	    cartInfo.style.display ="none";
        totalCart.parentElement.style.display = "none";
	    emptyInfo.style.display = "flex";
    }else {
	    cartInfo.style.display= "flex";
        if (itemSum === 1){
            [...cartInfo.getElementsByClassName("plural")].forEach(e => {e.style.display = "none"});
            [...cartInfo.getElementsByClassName("singular")].forEach(e => {e.style.display = "flex"});
        } else {
            [...cartInfo.getElementsByClassName("plural")].forEach(e => {e.style.display = "flex"});
            [...cartInfo.getElementsByClassName("singular")].forEach(e => {e.style.display = "none"});
        }
	    emptyInfo.style.display = "none";
        totalCart.parentElement.style.display = "flex";
        cartCounters.forEach(c => {c.style.display = "flex"});
    }
}



closeCart();
updateCartCounter();

window.addEventListener('orientationchange', function () {
	console.log("Rotation change!");
	closeCart();
    closeMenu();
})



print(" * Cart JS ready")

