
const cartButton = document.getElementById('cart-button');
const cartItems = document.getElementsByClassName('is-carret');
const cart = document.getElementById("carret")

closeCart()

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


function increaseItem(id){
	console.log("Increasing 1:",id)
	let urlParts = newLink.split("?")
        let link = urlParts[0]+"afegir_un/"+ id
	console.log(link)                               
	fetch(link, {method: "GET"})
	

}
