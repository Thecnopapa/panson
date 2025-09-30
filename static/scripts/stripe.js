



console.log("Stripe");
// This is your test publishable API key.
const stripe = Stripe("pk_test_51RQARFCeEnHFH7noKa1gmDHslTH4Qj7CsUTERUhmsydcWJ1MMW8npVtsim9mUPhCDsKVyKzDoBxHZ2dd7yXLza4T00DLMnmedO");

console.log(stripe);

initialize();

// Create a Checkout Session
async function initialize() {
  console.log("Initializing Stripe");
  const fetchClientSecret = async () => {
      let serverUrl = "/"+document.documentElement.lang+"/checkout/init";
      console.log(location.pathname);
      if (location.pathname.endsWith("/force_new")) {
          serverUrl = serverUrl + "/force_new";
      }
    const response = await fetch(serverUrl, {
      method: "POST",
    });
      let resp = await response.json();
    const { clientSecret } = resp;
    if (resp["has_email"]){
        console.log(resp);
        console.log(resp["has_email"]);
        document.getElementById("change_email").style.display = "flex";
    }
    return clientSecret;
  };

  // Call your backend to set shipping options
  const onShippingDetailsChange = async (shippingDetailsChangeEvent) => {
    const {checkoutSessionId, shippingDetails} = shippingDetailsChangeEvent;
    const response = await fetch("/"+document.documentElement.lang+"/checkout/update/shipping", {
      method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      body: JSON.stringify({
        checkout_session_id: checkoutSessionId,
        shipping_details: shippingDetails,
      })
    })
	console.log(response);
    if (response.type === 'error') {
      return Promise.resolve({type: "reject", errorMessage: response.message});
    } else {
	    checkoutElement = document.getElementById("checkout");
	    //checkoutElement.scrollIntoView({"block": "start"});
	    document.documentElement.scrollTo({top:0});
	    r = Promise.resolve({type: "accept"});
	    console.log(r);
      return r;
    }
  };
  
  const checkout = await stripe.initEmbeddedCheckout({
      fetchClientSecret,
      onShippingDetailsChange,
  });

  // Mount Checkout
  checkout.mount('#checkout');

}

