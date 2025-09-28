from app_essentials.firebase import firebaseObject
from app_essentials.products import Products, get_talla_es
from app_essentials.utils import str_to_list
import hashlib


class User(firebaseObject):
    bucket = "usuaris"
    def __init__(self, data, id):
        self.carret = {}
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

            price = product.calcular_preu(material, variacio, color)[0]*100

            description = ""
            if talla is not None:
                description += "Talla: {}/ ".format(talla)
            if talla_es is not None:
                description += "TallaES: {} ".format(talla)
            if material is not None:
                description += "Material: {}/ ".format(material)
            if variacio is not None:
                description += "Variacio: {}/ ".format(variacio)
            if color is not None:
                description += "Color: {}/".format(color)
            if description[-1] == "/":
                description = description[:-1]

            i = {
                "price_data": {
                    "currency": "eur",

                    "unit_amount": price,
                    "product_data": {
                        "name": item["id"],
                        "description": description,
                    }
                },
                "quantity": item["quantity"],
                "adjustable_quantity": {
                    "enabled": True,
                }
            }
            items.append(i)
        return items


