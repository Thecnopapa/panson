
import os
from flask import request, redirect
from app_essentials.session import get_current_user
from app_essentials.mail import *

import stripe


try:
    with open(os.environ["STRIPE_KEY"]) as f:
        stripe.api_key = f.read()

except:
    print("Stripe key could not be read")




def stripe_checkout(items, lan, origin=None):
    DOMAIN = request.url_root+"{}/checkout/".format(lan)
    user = get_current_user()
    user.stripe_session = None
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
            success_url=DOMAIN + "success",
            cancel_url=request.headers["Referer"],
            billing_address_collection="required",
            shipping_address_collection={
                "allowed_countries": ["ES"],
            },
            client_reference_id=user._id,
            phone_number_collection={
                "enabled": True,
            },

        )
    except Exception as e:
        print(e)
        return "Error"
    user.stripe_session = checkout_session
    user.update_db()
    return redirect(checkout_session.url, code=303)



def process_payment(lan):
    user = get_current_user()
    session = stripe.checkout.Session.retrieve(user.stripe_session["id"])
    line_items = stripe.checkout.Session.list_line_items(user.stripe_session["id"], limit=100)
    print(session)
    print(line_items)
    if session["status"] == "complete" and session["payment_status"] == "paid":
        send_email(
            recipient="{}".format(session["customer_details"]["email"]),
            subject="Compra realitzada amb exit",
            sender="ventes",
            temp="email_compra",
            name="{}".format(session["customer_details"]["name"]),
            cc="a_client",
            details=session,
            items = line_items,
        )
        send_email(
                recipient="info_compra",
                sender="ventes",
                subject="Detalls de compra realitzada",
                temp="email_compra_internal",
                internal_recipient=True,
                details=session,
                items=line_items,
                )



        user.move_to_favourites()
    else:
        return None
    return session
