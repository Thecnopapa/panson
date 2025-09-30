
import os
import uuid


from flask import request, redirect, jsonify
from app_essentials.session import get_current_user
from app_essentials.mail import *

import stripe
currency="EUR"

try:
    with open(os.environ["STRIPE_KEY"]) as f:
        stripe.api_key = f.read()

except:
    print("Stripe key could not be read")


def create_items(user):
    cart = user.cart
    items = []
    for item in cart.values():
        print(item["data"])
        stripe_item = dict(
            adjustable_quantity={
                "enabled": True
            },
            quantity=item["quantity"],
            price_data = dict(
                currency = currency,
                unit_amount = item["price"]*100,
                #product= product["id"],
                product_data = dict(
                    **item["data"],
                    #name=item["data"]["name"],
                    # description = item["data"]["description"],
                    # images = item["data"]["images"],
                    # metadata = item["data"]["metadata"],
                ),
            ),
            # shippable=True,
            # active = True,
        )
        print("Stripe item: ", stripe_item)
        items.append(stripe_item)
    print("items", items)
    return items

def create_customer(user):
    user_id = user._id
    try:
        return stripe.Customer.retrieve(user_id)
    except:
        return stripe.Customer.create(
            id=user_id,
        )

shipping_areas = {
    "spain": ["ES"],
    "europe_a": ["AT", "BE", "DE", "FR", "IT", "PT", "LU", "PL", "NL"],
    "europe_b":[],
    "world":[],
}





# Return a boolean indicating whether the shipping details are valid
def validate_shipping_details(shipping_details):
    print("shipping details", shipping_details)
    try:
        print("Target Country: ", shipping_details["address"]["country"])
        return True
    except:
        return False

def get_area_shipping_rates(area=None):
    all_rates = [r for r in stripe.ShippingRate.list(limit=20) if r["active"]]
    target_rates = []
    if area is None:
        return all_rates
    for rate in all_rates:
        try:
            if rate["metadata"]["area"] == area:
                target_rates.append(rate.id)
        except:
            pass
    return target_rates

# Return an array of the updated shipping options or the original options if no update is needed
def calculate_shipping_options(shipping_details):
    shipping_area = None
    country = shipping_details["address"]["country"]
    for area, codes in shipping_areas.items():
        if country in codes:
            shipping_area = area
            break
    available_rates = get_area_shipping_rates(shipping_area)
    return available_rates



def update_shipping_options(shipping_details, checkout_session_id):

    # 2. Validate the shipping details
    if not validate_shipping_details(shipping_details):
        print("Invalid Shipping Details")
        return jsonify({'type': 'error', 'message': "Country not valid or not elegible for shipping. Please choose a different address or get in touch by email."}), 400

    # 3. Calculate the shipping options
    shipping_options = calculate_shipping_options(shipping_details)
    if len(shipping_options) == 0:
        print("No shipping options available")
        return jsonify({'type': 'error', 'message': "We can't ship to your address. Please choose a different address or get in touch by email."}), 400

    print("shipping options", shipping_options)
    # 4. Update the Checkout Session with the customer's shipping details and shipping options
    stripe.checkout.Session.modify(
        checkout_session_id,
        collected_information={'shipping_details': shipping_details},
        shipping_options=[{"shipping_rate":so} for so in shipping_options]
    )
    print("Shipping options updated:")
    [print(stripe.ShippingRate.retrieve(so)) for so in shipping_options]
    return jsonify({'type': 'accept', 'value': {'succeeded': True}})

    #return jsonify({'type': 'error', 'message': "We can't find shipping options. Please try again."}), 400








def init_checkout(lan):
    user = get_current_user()
    items = create_items(user)
    customer = create_customer(user)
    try:
        checkout_session = stripe.checkout.Session.create(
            mode='payment',
            ui_mode="embedded",
            #customer=customer,
            line_items=items,
            permissions={"update_shipping_details": "server_only"},
            billing_address_collection="required",
            shipping_options=[{"shipping_rate":so} for so in get_area_shipping_rates("spain")],
            shipping_address_collection={
                "allowed_countries": shipping_areas["spain"] + shipping_areas["europe_a"] + shipping_areas["europe_b"] + shipping_areas["world"],
            },
            phone_number_collection={
                "enabled": True,
            },

            #success_url= request.url_root+"{}/checkout/success".format(lan),
            #cancel_url=request.headers["Referer"],
            return_url=request.url_root+"{}/checkout/success".format(lan),
        )
    except Exception as e:
        print("ERROR")
        print(e)
        return str(e)
    user.last_checkout = checkout_session.id
    user.update_db()
    return jsonify(clientSecret=checkout_session.client_secret)
    #return redirect(checkout_session.url, code=303)
    #return "<br>".join([str(user), str(items), str(customer)])









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
    session = stripe.checkout.Session.retrieve(user.last_checkout)
    line_items = stripe.checkout.Session.list_line_items(user.last_checkout, limit=100)
    print(session)
    print(line_items)
    if session["status"] == "complete" and session["payment_status"] == "paid":
        # send_email(
        #         recipient="info_compra",
        #         sender="ventes",
        #         subject="Detalls de compra realitzada",
        #         temp="email_compra_internal",
        #         internal_recipient=True,
        #         details=session,
        #         items=line_items,
        #         )
        # send_email(
        #     recipient="{}".format(session["customer_details"]["email"]),
        #     subject="Compra realitzada amb exit",
        #     sender="ventes",
        #     temp="email_compra",
        #     name="{}".format(session["customer_details"]["name"]),
        #     cc="a_client",
        #     details=session,
        #     items = line_items,
        # )




        #user.move_to_favourites()
        pass
    else:
        return None
    return session
