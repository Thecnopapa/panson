from app_essentials.firebase import firebaseObject
from app_essentials.products import Products
from app_essentials.utils import str_to_list
import hashlib


class User(firebaseObject):
    bucket = "usuaris"
    def __init__(self, data, id):
        self.carret = {}
        self.preferits = []
        self.is_admin = False
        self.accepted_cookies = False
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
            price = product.calcular_preu(material=item["material"],
                                          variacio=item["variacio"],
                                          color=item["color"])[0]*100
            description = " / ".join(["{}: {}".format(d, item[d]) for d in ["talla", "material", "color", "variacio"]])
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


















class Carret():
    def __init__(self):
        self.preferits = []
        self.carret = {}
        self.item_list = []
        self.items = []
        self.n_items = 0
        self.restored = False


    def restore_from_cookies(self):
        print("Restoring carret from cookies")
        cart_str = request.cookies.get("cart")
        favourites_str = request.cookies.get("favourites")
        print(cart_str)
        print(favourites_str)

        if cart_str is not None:
            if len(cart_str) > 2:
                try:
                    self.carret = {}
                    for c in json.loads(cart_str):
                        op = c[2].split("&")[1:]
                        op = {o.split(":")[0]:o.split(":")[1] for o in op}

                        opcions = dict(color = None,
                                       material = None,
                                       talla = None,
                                       variacio = None,)
                        for key, value in op.items():
                            if value == "None":
                                opcions[key] = None
                            else:
                                try:
                                    opcions[key] = int(value)
                                except:
                                    opcions[key] = str(value)
                        self.add_producte_carret(id=c[0], opcions_seleccionades=opcions, quantitat=c[1], save_cart=False)

                except:
                    pass
        if favourites_str is not None:
            if len(favourites_str) > 2:
                try:
                    #self.preferits.extend(clean_list(favourites_str, delimiter=",", allow=["_", "-" ,":"], format="str"))
                    self.preferits = json.loads(favourites_str)
                except:
                    pass
        self.restored = True


    def move_to_favorites(self, resp=None):
        print("Moving to favourites")
        for item in self.carret.values():
            print(item)
            if item["producte"].id not in self.preferits:
                self.preferits.append(item["producte"].id)
        self.carret = {}
        self.n_items = 0
        self.item_list = []
        return self.update(save=True, resp=resp)



    def empty_cart(self,resp=None):
        self.carret = {}
        self.n_items = 0
        self.item_list = []
        self.update(save=True ,resp=resp)


    def generate_items(self):
        self.items = []
        for id, product in self.carret.items():
            print(product)
            price = product["producte"].calcular_preu(material=product["material"],
                                                      variacio=product["variacio"],
                                                      color=product["color"])[0]*100
            description = " / ".join(["{}: {}".format(d, product[d]) for d in ["talla", "material", "color", "variacio"]])
            i = {
                "price_data": {
                    "currency": "eur",

                    "unit_amount": price,
                    "product_data": {
                        "name": product["producte"].id,
                        "description": description,
                    }
                },
                "quantity": product["quantity"],
                "adjustable_quantity": {
                    "enabled": True,
                }
            }
            self.items.append(i)


    def count_items(self):
        if len(self.carret) != 0:
            self.n_items = sum([item["quantity"] for item in self.carret.values()])
        else:
            self.n_items = 0
        return self.n_items

    def get_simple_list(self):
        l = []
        for item in self.carret.values():
            l.append((item["producte"].id, item["quantity"], item["id2"]))
        return l

    def update(self, save=False, resp=None, restore=False):
        print("Updating carret...")
        if not self.restored or restore:
            self.restore_from_cookies()
        self.generate_items()
        self.count_items()
        self.item_list = self.get_simple_list()
        if save:
            if resp is None:
                resp = make_response()
            resp = self.save_cart(resp=resp)
        return resp

