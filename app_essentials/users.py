from app_essentials.firebase import firebaseObject
from app_essentials.products import Products, get_talla_es
from app_essentials.utils import str_to_list
import hashlib
from app_essentials.localisation import Images




class User(firebaseObject):
    bucket = "usuaris"

    def __init__(self, data, id):
        self.cart = {}
        self._n_cart = 0
        self._total_cart = 0
        self.favourites = []
        self.is_admin = False
        self.accepted_cookies = False
        self.cookies = {
            'ad_user_data': 'denied',
            'ad_personalization': 'denied',
            'ad_storage': 'denied',
            'analytics_storage': 'denied'
        }
        self.username = None
        self.password = None

        super().__init__(data, id)
        self.recalculate()

    def recalculate(self):
        self._n_cart = sum([item["quantity"] for item in self.cart.values()])
        self._total_cart = sum([item["quantity"] * item["price"] for item in self.cart.values()])


    def move_to_favourites(self):
        self.favourites = list(set(self.favourites + [item["product_id"].split("&")[0] for item in self.cart.values()]))
        self.cart = {}
        self.update_db()

    def add_to_cart(self, product_id, options={}, quantity=1):
        product = Products().get_single(product_id)
        id2 = product.generate_id2(options)
        name = product.nom
        price = product.calculate_price(**options)[0]
        imgs = Images()
        images = [imgs.get_url("productes", i) for i in product.imatges[:min(8, len(product.imatges))]]

        description = ""
        if options.get("talla", None) is not None:
            description += "Talla: {}/ ".format(options["talla"])
        if options.get("material", None) is not None:
            description += "Material: {} / ".format(options["material"])
        if options.get("variacio", None) is not None:
            description += "Variacio: {} / ".format(options["variacio"])
        if options.get("color", None) is not None:
            description += "Color: {} /".format(options["color"])
        if description[:-2] == "/ ":
            description = description[:-2]

        data = dict(
            images = images,
            name=name,
            description=description,
            metadata={
                'id2': id2,
                "product_id": product_id,
            }
        )
        self.cart[id2] = dict(
            product_id=product_id,
            quantity=quantity,
            price=price,
            options=options,
            data=data,
        )
        self.update_db()










class UserOld(firebaseObject):
    bucket = "usuaris"
    def __init__(self, data, id):
        self.carret = {}
        self.cart = {}
        self.preferits = []
        self.is_admin = False
        self.accepted_cookies = False
        self.cookies = {
            'ad_user_data': 'denied',
            'ad_personalization': 'denied',
            'ad_storage': 'denied',
            'analytics_storage': 'denied'
        }
        self.username = None
        self.password = None

        super().__init__(data, id)
        self.n_carret = sum([item["quantity"] for item in self.carret.values()])
        self.total_carret = sum([item["quantity"] * item["preu"][0] for item in self.carret.values()])

    def create_product(id, options, quantity=1):
        prod = Products().get_single(id)
        return stripe.Product.create(
                name=prod.nom,
                metadata={k:str(v) for k,v in options.items()},
                )
    def delete_product(id):
        return stripe.Product.delete(id)




    def move_to_favourites(self):
        self.preferits = list(set(self.preferits + [i["id"].split("&")[0] for i in self.carret.values()]))
        self.carret = {}
        self.update_db()

    def add_producte_carret(self, id, opcions_seleccionades={}, quantitat = 1, delete=False):
        if not delete:
            print("Adding producte", id)
            producte = Products().get_single(id)
            new_producte = {"id":producte._id,
                            "quantity":quantitat,}
            id2 = producte._id
            for key, value in sorted(opcions_seleccionades.items(), key=lambda item: item[0]):
                new_producte[key] = value
                id2 += "&{}:{}".format(key,value)
            new_producte["id2"] = id2
            if id2 in self.carret.keys():
                print(self.carret[id2])
                self.carret[id2]["quantity"] += quantitat
            else:
                self.carret[id2] = new_producte
                #self.carret[id2]["checksum"] = hashlib.new("sha256").update(id2).hexdigest()
            self.carret[id2]["preu"] = producte.calcular_preu(**opcions_seleccionades)
        else:
            print("Deleting producte", id)
            if self.carret[id]["quantity"] > 0:
                self.carret[id]["quantity"] -= quantitat
            else:
                self.carret.pop(id)
        self.recalculate()
        self.update_db()

    def recalculate(self):
        self.n_carret = sum([item["quantity"] for item in self.carret.values()])
        self.total_carret = sum([item["quantity"] * item["preu"][0] for item in self.carret.values()])

    def generate_items(self):
        items = []
        for id, item in self.carret.items():
            print(item)
            product = Products().get_single(item["id"])
            if product is None:
                continue
            material = item.get("material", None)
            variacio = item.get("variacio", None)
            color = item.get("color", None)
            talla = item.get("talla", None)
            talla_es = item.get("talla_es", None)
            talla_country = item.get("talla_country", None)

            price = product.calcular_preu(material, variacio, color)[0]*100

            description = ""
            if talla is not None:
                description += "Talla: {}/ ".format(talla)
            if talla_es is not None:
                description += "TallaES: {} /".format(talla_es)
            if material is not None:
                description += "Material: {} / ".format(material)
            if variacio is not None:
                description += "Variacio: {} / ".format(variacio)
            if color is not None:
                description += "Color: {} /".format(color)
            if description[-1] == "/":
                description = description[:-1]

            i = {
                "price_data": {
                    "currency": "eur",

                    "unit_amount": price,
                    "product_data": {
                        "name": item["id"],
                        "description": description,
                        "metadata": dict(
                            talla=talla,
                            talla_es=talla_es,
                            material=material,
                            color=str(color),
                            variacio=variacio,
                            talla_country=talla_country,
                            ),
                        }
                },
                "quantity": item["quantity"],
                "adjustable_quantity": {
                    "enabled": True,
                },
                
            }
            items.append(i)
        return items


