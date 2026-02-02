

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
        self.essential_cookies = False
        self.cookies = {
            'ad_user_data': 'denied',
            'ad_personalization': 'denied',
            'ad_storage': 'denied',
            'analytics_storage': 'denied'
        }
        self.closed_banner = False
        self.no_newsletter = False
        self.sessions = []
        self.username = None
        self.password = None
        self.last_checkout = None

        super().__init__(data, id)
        if self._id not in self.sessions:
            self.sessions.append(self._id)
        self.recalculate()

    def recalculate(self):
        self._n_cart = sum([item["quantity"] for item in self.get_cart().values()])
        self._total_cart = sum([item["quantity"] * item["price"] for item in self.get_cart().values()])


    def move_to_favourites(self):
        self.favourites = list(set(self.favourites + [item["product_id"].split("&")[0] for item in self.get_cart().values()]))
        self.cart = {}
        self.update_db()

    def add_to_cart(self, product_id, options={}, quantity=1):
        product = Products().get_single(product_id)
        id2 = product.generate_id2(options)
        if id2 in self.cart.keys():
            self.cart[id2]["quantity"] += quantity
            self.update_db()
            return


        name = product.nom
        price = product.calculate_price(**options)[0]
        imgs = Images()
        try:
            images = [imgs.get_url("productes", product.imatges[0])]
        except:
            images = []
        extras = {}
        if product.opcions.get("extra_colors", False):
            extras["extra_colors"] = product.opcions["extra_colors"]


        description = ""
        if options.get("talla", None) is not None:
            description += "Talla: {} / ".format(options["talla"])
        if options.get("material", None) is not None:
            description += "Material: {} / ".format(options["material"])
        if options.get("variacio", None) is not None:
            description += "Variacio: {} / ".format(options["variacio"])
        if options.get("color", None) is not None:
            description += "Color: {} / ".format(options["color"])
        if description[:-2] == "/ ":
            description = description[:-2]

        data = dict(

            images = images,
            name=name,
            description=description,
            metadata=dict(
                status="unpaid",
                id2= id2,
                product_id= product_id,
                **{k:str(v) for k,v in options.items()}
            )
        )
        self.cart[id2] = dict(
            product_id=product_id,
            quantity=quantity,
            options=options,
            data=data,
            extras=extras,
        )
        print(self.cart)
        self.update_db()

    def get_cart(self, prods=None):
        print("getting cart")
        new_cart = {}
        if prods is None:
            prods = Products()
        for k, v in self.cart.items():
            print(k)
            target = prods.get_single(v["product_id"])
            if target.esborrat or target.amagat:
                print("hidden")
                continue
            if target.unanounced():
                print("unanounced")
                continue
            v["price"], incomplete = target.calculate_price(**v["options"])
            if not incomplete:
                new_cart[k] = v
        print(new_cart)
        return new_cart












