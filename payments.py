
import os
from flask import request, redirect

import stripe


if " STRIPE_KEY" in os.environ:
    stripe.api_key = os.environ
else:
    print("STRIPE KEY not found in environ")
    quit()


DOMAIN = request.path

@app.route('/checkout', methods=['POST'])
def checkout(items):
    try:
        checkout_session = stripe.checkout.Session.create(
            line_items=[
                {
                    # Provide the exact Price ID (for example, price_1234) of the product you want to sell
                    'price': '{{PRICE_ID}}',
                    'quantity': 1,
                },
            ],
            mode='payment',
            success_url=YOUR_DOMAIN + '/success.html',
            cancel_url=YOUR_DOMAIN + '/cancel.html',
        )
    except Exception as e:
        return str(e)

    return redirect(checkout_session.url, code=303)
