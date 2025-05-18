
import os
from flask import request, redirect

import stripe


stripe_key_name = "STRIPE_KEY_REAL"
if stripe_key_name in os.environ.keys():
    stripe.api_key = os.environ[stripe_key_name]
else:
    print("{} not found in environ".format(stripe_key_name))


def stripe_checkout(items, loc):
    DOMAIN = request.url_root
    try:
        print(items)
        checkout_session = stripe.checkout.Session.create(
            line_items=items,
            #line_items=[
            #    {
            #        # Provide the exact Price ID (for example, price_1234) of the product you want to sell
            #        'price': '{{PRICE_ID}}',
            #        'quantity': 1,
            #    },
            #],
            mode='payment',
            success_url=DOMAIN + "{}/carret/checkout/success".format(loc.lan),
            cancel_url=DOMAIN + "{}/carret/checkout/cancel".format(loc.lan),
        )
    except Exception as e:
        return str(e)

    return redirect(checkout_session.url, code=303)
