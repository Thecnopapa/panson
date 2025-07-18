
import os
from flask import request, redirect

import stripe


try:
    stripe.api_key = os.environ["STRIPE_SECRET"]
except:
    print("Stripe key could not be loaded")



def stripe_checkout(items, lan, origin=None):
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
            success_url=DOMAIN + "{}/checkout/success".format(lan),
            cancel_url=DOMAIN + "{}/checkout/cancel".format(lan),
        )
    except Exception as e:
        return str(e)

    return redirect(checkout_session.url, code=303)
