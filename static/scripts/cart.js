
const cartButton = document.getElementById('cart-button');
const cartItems = document.getElementsByClassName('is-carret');
const cart = document.getElementById("carret")

closeCart();
updateCartCounter();


function openCart(){
    closeMenu()
    console.log("Opening Cart")
    cart.style.display = "flex";
    for (let i = 0; i < cartItems.length; i++) {
        cartItems[i].classList.add('open');
        cartButton.setAttribute("onclick", "closeCart()");
    }
    if (cartIcon.length > 0){
            cartIcon[0].src = "/static/media/bag-black.svg";

    }
    if (cartCircle.length != 0){
        	cartCircle[0].style.color = "black";
        	cartCircle[0].style.backgroundColor = "white";
	}
}


function closeCart(){
    console.log("Closing Cart")
    cart.style.display = "none";
    for (let i = 0; i < cartItems.length; i++) {
        cartItems[i].classList.remove('open');
        cartButton.setAttribute("onclick", "openCart()");
    }
}


function deleteItem(productElement, pos){
    console.log(productElement);
    productElement.remove();
    let link = "/productes/carret/"+ pos+"/0";
	console.log(link);
	fetch(link, {method: "POST"});
    updateCartCounter()

}

function modifyItem(counterElement, pos, mode){
    let oldQty = counterElement.innerHTML;
	console.log(oldQty, pos);
    let newQty = Number(oldQty);
    if (mode == "increase"){
        newQty = Number(oldQty)+1;
    }else if (mode == "decrease") {
        newQty = Number(oldQty)-1;
    }
    if (newQty <= 0){
        deleteItem(counterElement.parentElement.parentElement.parentElement, pos);
    } else{
        counterElement.innerHTML = newQty;
        let link = "/productes/carret/"+ pos+"/"+newQty;
        console.log(link);
        fetch(link, {method: "POST"});
        updateCartCounter()
    }

}

function updateCartCounter(){
    const allCounters = document.getElementsByClassName('producte-carret-quantitat');
    const cartCounter = document.getElementById("cart-counter");
    const totalCart = document.getElementById("total-cart");
    let itemSum = 0;
    let priceSum = 0;
    for (let i = 0; i < allCounters.length; i++){
        itemSum += Number(allCounters[i].innerHTML);
        const newPrice = Number(allCounters[i].innerHTML) * Number(allCounters[i].attributes.price.value);
        priceSum += newPrice;
        allCounters[i].parentElement.previousElementSibling.innerHTML = String(newPrice) + "&#8364;";
    }
    totalCart.innerHTML = "Total: "+String(priceSum)+ "&#8364";
    cartCounter.innerHTML = itemSum;
    if (itemSum <= 0){
        cartCounter.style.display = "none";
        totalCart.parentElement.style.display = "none";
    }else {
        totalCart.parentElement.style.display = "flex";
        cartCounter.style.display = "flex";
    }
}

