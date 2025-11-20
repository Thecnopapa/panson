
import os
import uuid
import time
import datetime

import requests
import json
from flask import request, redirect, jsonify

from app_essentials import firebase
from app_essentials.session import get_current_user
from app_essentials.mail import *
from app_essentials.firebase import get_areas

import stripe
currency="EUR"



try:
    with open(os.environ["STRIPE_KEY"]) as f:
        stripe.api_key = f.read()

except:
    print("Stripe key could not be read")




class Trello():
    def __init__(self):
        self._token = None
        self.api_key = None
        self.board_id = None
        self.list_id = None
        self._db_ref = None
        self.labels = []
        self.setup()


    def setup(self):
        from app_essentials.firebase import db
        try:
            with open(os.environ["TRELLO_KEY"]) as f:
                self._token = f.read()
        except:
            print("Trello key could not be read")

        self._db_ref=db.collection("localisation").document("trello")

        raw_data = self._db_ref.get().to_dict()
        for k,v in raw_data.items():
            setattr(self,k,v)

    def update(self):
        self._db_ref.update({k:v for k,v in self.__dict__.items() if not k.startswith("_")})

    def test(self):
        print("Testing trello")
        try:
            self.card_create("prova", "aixo es una prova")
            return True
        except:
            return False

    def get_available_boards(self):
        try:
            method = "GET"
            url = "https://api.trello.com/1/members/me/boards"
            headers = {"Accept": "application/json"}
            query = {
                "key": self.api_key,
                "token": self._token,
                "fields": ["id", "name"],
            }
            response = requests.request(method, url, headers=headers, params=query)
            return response.json()
        except:
            return None

    def get_available_lists(self, board_id=None):
        try:
            if board_id is None:
                board_id = self.board_id
            method = "GET"
            url = "https://api.trello.com/1/boards/{}/lists".format(board_id)
            headers = {"Accept": "application/json"}
            query = {
                "key": self.api_key,
                "token": self._token,
                "fields": ["id", "name"],
            }
            response = requests.request(method, url, headers=headers, params=query)
            return response.json()
        except:
            return None

    def get_available_labels(self, board_id=None):
        try:
            if board_id is None:
                board_id = self.board_id
            method = "GET"
            url = "https://api.trello.com/1/boards/{}/labels".format(board_id)
            headers = {"Accept": "application/json"}
            query = {
                "key": self.api_key,
                "token": self._token,
                "fields": ["id", "name", "color"],
            }
            response = requests.request(method, url, headers=headers, params=query)
            return response.json()
        except:
            return None

    def card_create(self, name, description, items=None, link=None):
        now = datetime.datetime.now()
        method = "POST"
        url = "https://api.trello.com/1/cards"
        headers = {"Accept": "application/json"}
        query = {
            "key": self.api_key,
            "token": self._token,
            "idList": self.list_id,
            "name": name,
            "desc": description,
            "start": now,
            "due": now + datetime.timedelta(days=21),
            "idLabels": ",".join(self.labels),
        }
        if link is not None:
            query["urlSource"] = link
        response = requests.request(method, url, headers=headers, params=query)
        card_id = response.json()["id"]
        if items is not None:
            self.card_add_checklist(card_id, "Productes", items)
        return card_id

    def card_add_checklist(self, card, name, items=None):
        method = "POST"
        url = "https://api.trello.com/1/cards/{}/checklists".format(card)
        headers = {"Accept": "application/json"}
        query = {
            "key": self.api_key,
            "token": self._token,
            "name": name,
        }
        response = requests.request(method, url, headers=headers, params=query)
        checklist_id = response.json()["id"]
        if items is not None:
            for i in items:
                self.card_checklist_add_item(checklist_id, i)
        return checklist_id

    def card_checklist_add_item(self, checklist, name):
        method = "POST"
        url = "https://api.trello.com/1/checklists/{}/checkItems".format(checklist)
        headers = {"Accept": "application/json"}
        query = {
            "key": self.api_key,
            "token": self._token,
            "name": name,
        }
        response = requests.request(method, url, headers=headers, params=query)
        item_id = response.json()["id"]
        return item_id







def create_items(user):
    cart = user.cart
    items = []
    for item in cart.values():
        print(item["data"])
        product_data = dict(
                    **item["data"],
                    #name=item["data"]["name"] +" ("+ item["data"]["description"]+")",
                    #description = item["data"]["description"],
                    #images = item["data"]["images"],
                    #metadata = item["data"]["metadata"],
        )
        #product_data.update({"name": item["data"]["name"] +" ("+ item["data"]["description"]+")" }),
        print(product_data)
        stripe_item = dict(
            adjustable_quantity={
                "enabled": True
            },
            quantity=item["quantity"],
            price_data = dict(
                currency = currency,
                unit_amount = item["price"]*100,
                #product= product["id"],
                product_data = product_data,
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
        customer = stripe.Customer.retrieve(user_id)
    except:
        customer = stripe.Customer.create(
            id=user_id,
        )
    return customer["id"], customer["email"]








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
    for area, codes in get_areas().items():
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








def init_checkout(lan, force_new=False):
    shipping_areas=get_areas()
    user = get_current_user()
    items = create_items(user)
    has_email = False
    print("force_new", force_new)
    if force_new:
        print("Forcing new customer")
        customer = {"customer_creation": "always"}
    else:
        print("Retriving customer")
        c = create_customer(user)
        customer = {"customer":c[0]}
        has_email = c[1] is not None
        print("Customer has email?", has_email, c[1])
    try:
        checkout_session = stripe.checkout.Session.create(
            mode='payment',
            ui_mode="embedded",
            **customer,
            #customer=customer,
            #customer_creation="if_required",
            invoice_creation={
                "enabled": True,
                },
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
    return jsonify(clientSecret=checkout_session.client_secret, has_email=has_email)
    #return redirect(checkout_session.url, code=303)
    #return "<br>".join([str(user), str(items), str(customer)])







def process_payment(lan):
    user = get_current_user()
    session = stripe.checkout.Session.retrieve(user.last_checkout, expand=["line_items", "payment_intent", "shipping_rate"])
    line_items = session["line_items"]
    print(session)
    print(line_items)
    
            
    #payment=session["payment"]
    if session["status"] == "complete" and session["payment_status"] == "paid":
        new_items =[]
        customer_name = session["customer_details"]["name"]
        customer_email = session["customer_details"]["email"]
        customer_tel = session["customer_details"]["phone"]
        ad = session["collected_information"]["shipping_details"]["address"]
        address = ", ".join([ad["line1"], ad["line2"],  ad["postal_code"], ad["city"], ad["state"], ad["country"]])
        recipient = session["collected_information"]["shipping_details"]["name"]
        if session["payment_intent"] is None:
            pi = payment_intent = {"id":"NA",
                                   "amount_received":0,
                                   "currency": "eur",
                                   "amount_details": {
                                       "tax":{"total_tax_amount":0},
                                       "shipping":{"amount":0},
                                       }
                                   }
        else:
            pi = session["payment_intent"]
        print(pi)



        for line_item in line_items["data"]:
            #print(line_item)
            auto_product = stripe.Product.retrieve(line_item["price"]["product"])
            #print(auto_product)
            old_metadata = auto_product["metadata"]
            #print("old_metadata", old_metadata)
            new_metadata = old_metadata
            new_metadata.update(dict(
                order_id=session["id"],
                customer_id=session["customer"],
                payment_id=pi["id"],
                status=session["payment_status"],
                line_id=line_item["id"],
                auto_id=auto_product["id"],
                adress=address,
                recipient=recipient,
                quantity=line_item["quantity"],
                email = customer_email,
                client_name = customer_name,
                details = auto_product["description"],
            )),

            new_data = dict(
                id="product_" + auto_product["id"],
                name=line_item["description"],
                description="Client: {} ({} - {}) \n Detalls peca: {}".format(
                    customer_name,
                    customer_email,
                    customer_tel,
                    auto_product["description"],

                ),
                metadata=new_metadata,
                images=auto_product["images"],
            )
            new_items.append(new_data)

            try:
                stripe.Product.create(**new_data)
            except:
                stripe.Product.modify(**new_data)


        card_name = "{} ({})".format(customer_name, len(new_items))

        card_description="""
        ----- Dades client -------------
        Client: {}
        Email: {}
        Telefon: {}
        
        ----- Enviament ----------------
        Adreça: 
        {}"
        {}
        
        --- Pagament -------------------
        Preu: {} {}
        Enviament: {} + {} = {} {}
        Total: {} + {} + {} = {} {}
        
        --- Stripe ---------------------
        customer_id: {}
        payment_id: {}
        product_id: {}
        
        --- {} ----------------
        """.format(
            customer_name,
            customer_email,
            customer_tel,
            recipient,
            address,
            session["amount_subtotal"]/100,
            pi["currency"],
            session["shipping_cost"]["amount_subtotal"]/100, session["shipping_cost"]["amount_tax"]/100,session["shipping_cost"]["amount_total"]/100, pi["currency"],
            session["amount_subtotal"]/100, pi["amount_details"]["shipping"]["amount"]/100, pi["amount_details"]["tax"]["total_tax_amount"]/100, pi["amount_received"]/100, pi["currency"],
            session["customer"], pi["id"], ", ".join(d["id"] for d in new_items),
            datetime.date.today()
        )
        [print(i) for i in new_items]
        card_items = [ "{} ({}) x{}".format(i["name"], i["metadata"]["details"], i["metadata"]["quantity"]) for i in new_items]
        trello = Trello()
        trello.card_create(card_name, card_description, card_items)


        while session["invoice"] is None:
            print(session["invoice"])
            session = stripe.checkout.Session.retrieve(user.last_checkout)
            time.sleep(1)
        #print(session["invoice"])
        invoice = stripe.Invoice.send_invoice(session["invoice"])
        #print("invoice:")
        #print(invoice)
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
    return dict(session=session, invoice=invoice, items=line_items)
