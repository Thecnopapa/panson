from app_essentials.firebase import get_products, firebaseObject, get_cols, get_bespoke
from app_essentials.utils import str_to_list


class Product(firebaseObject):
    bucket = "productes"
    def __init__(self, data={}, id=None):
        self.data = {}
        self.unica = False
        self.esborrat = False
        self.collecio = "None"
        self.descripcio = ""
        self.subtitol = ""
        self.imatges = []
        self._imatges2 = []
        self.nom = ""
        self.amagat = False
        self._bespoke= False
        self.popular = False
        self.novetat = False
        self.info = ""


        self.tipus = None
        self.opcions=dict(materials=None, variacions=None, colors=None, talles=None)
        self.totes_talles = False
        super().__init__(data, id)
        if self._id is None:
            self.new = True
        if self.imatges is None:
            self.imatges=[]
        self._imatges2 = self.imatges.copy()
        nimg = len(self.imatges)
        if nimg != 0:
            self._imatges2 *= 4//nimg
            self._imatges2 += self._imatges2[:nimg%nimg]

    def generate_id2(self, options={}):
        id2 = self._id
        for key, value in sorted(options.items(), key=lambda item: item[0]):
            id2 += "&{}:{}".format(key, value)
        return id2

    def calcular_preu_minim(self):
        p = 0
        if self.opcions["materials"] is not None:
            #print(self.opcions["materials"].values())
            p += min([material["preu"] for material in self.opcions["materials"].values()])
        if self.opcions["variacions"] is not None  and self.opcions.get("vars_exclusivament", False):
            p += min([variacio["preu"] for variacio in self.opcions["variacions"].values()])
        if self.opcions["colors"] is not None:
            #print(self.opcions["colors"].values())
            p += min([data["preu"] for color, data in self.opcions["colors"].items()]) * self.opcions.get("n_colors", 1)
        return p

    def calculate_price(self, material = None, variacio = None, color = None, **kwargs):
        p = 0
        nones = [None, "None", "none", "null", "[]", ""]
        if material in nones:
            material = None
        if variacio in nones:
            variacio = None
        if color in nones:
            color = None
        incomplet = False
        #print(material, variacio, color)
        #print(type(material), type(variacio), type(color))

        if material is None:
            if self.opcions["materials"] is not None:
                #incomplet = True
                print([material["preu"] for material in self.opcions["materials"].values()])
                p += min([material["preu"] for material in self.opcions["materials"].values()])
        else:
            p += self.opcions["materials"][material]["preu"]

        if variacio is None:
            if self.opcions["variacions"] is not None:
                incomplet = True
                p += min([variacio["preu"] for variacio in self.opcions["variacions"].values()])
        else:
            if type(variacio) is str:
                variacio = [variacio]
            for v in variacio:
                p += self.opcions["variacions"][v]["preu"]

        if color is None:
            if self.opcions["colors"] is not None:
                incomplet = True
                p += min([data["preu"] for color,data in self.opcions["colors"].items()])* self.opcions.get("n_colors",1)
        else:
            #print(color, type(color))
            if "[" in color:
                color = str_to_list(color)
            if type(color) is str:
                color = [color]
            for c in color:
                if color != "n_colors":
                    continue
                c = c.replace("\'", "")
                #print("#", c)
                #print(c == "None" , c == "")
                if c == "None" or c == "":
                    p += min([data["preu"] for color, data in self.opcions["colors"].items()])
                else:
                    #print(self.opcions["colors"], c)
                    p += self.opcions["colors"][c]["preu"]
        return p, incomplet




class Products():
    def __init__(self, lan="cat", filters=None):
        self.products = {id:Product(data, id) for id, data in get_products().items()}
        if filters is not None:
            self.products = self.filter(filters, as_dict=True)
        self.bespoke = [Bespoke(data, id) for id, data in get_bespoke().items()]
        self.setup()


    def setup(self):
        self.cols = get_cols()
        self.tipus = sorted(set([c.tipus for c in self.products.values() if c.tipus is not None]))
        self.productes = [p for p in  self.get_all() if not (p.esborrat or p.amagat)]
        self.bespoke = [p for p in self.bespoke if not (p.esborrat or p.amagat)]
        


    def __repr__(self):
        return "\n".join(["Products:", *[repr(p) for p in self]])
    def __html__(self):
        return "<br>".join(["Products:".format(self.__class__.__name__), *[p.__html__() for p in self]])

    def new(self, classname="product"):
        if classname == "product":
            return Product()
        elif classname == "bespoke":
            return Bespoke()


    def __iter__(self):
        for producte in self.get_all():
            yield producte

    def uniques(self):
        return self.filter({"unica":True, "amagat":False, "esborrat":False})

    def get_all(self, as_dict=False):
        if as_dict:
            return self.products
        return list(self.products.values())

    def filter(self, filters, inclusive=False, as_dict=False, inplace=False, return_products=True, return_new_filters=False, custom = False):
        if filters is None:
            filters = {}
        if len(filters) == 0:
            keep_all = True
        else:
            keep_all = False
        filtered_dict = {}
        filtered_list = []
        new_filters = {}
        filters = filters.copy()
        for key in filters.keys():
            if type(filters[key]) is str:
                filters[key] = filters[key].lower()
            elif type(filters[key]) is list:
                filters[key] = [s.lower() for s in filters[key]]
            if "#" in key:
                new_key = key.split("#")[0]
                if new_key not in new_filters:
                    new_filters[new_key] = [filters[key]]
                else:
                    new_filters[new_key].append(filters[key])
            else:
                new_filters[key] = filters[key]

        #print("CUSTOM FILTERING:", custom)
        #print(new_filters)
        for product in self:
            stays = False
            if custom:
                if "collecio" in new_filters:
                    #print(product.collecio, new_filters["collecio"])
                    if str(product.collecio) in new_filters["collecio"] or new_filters["collecio"] == "totes" :
                        #print("Col OK")
                        stays=True
                    elif "unica" in new_filters:
                        #print(product.unica, new_filters["unica"])
                        if product.unica or new_filters["unica"] == "totes":
                            #print("Unica OK")
                            stays = True
                if not stays and not keep_all:
                    continue
                #print("Col OK")
                if "tipus" in new_filters:
                    if str(product.tipus) in new_filters["tipus"] or new_filters["tipus"] == "totes":
                        stays = True
                    else:
                        continue
                if stays or keep_all:
                    filtered_dict[product._id] = product
                    filtered_list.append(product)

            else:
                approval = 0
                if not keep_all:
                    for key, values in new_filters.items():
                        key = key.lower()
                        if key not in product.__dict__:
                            break
                        if type(values) is not list:
                            values = [values]
                        for value in values:
                            value = str(value).lower()
                            #print(product.__getattribute__(key), key, value)
                            if str(product.__getattribute__(key)).lower() == value:
                                approval += 1
                                break
                    if approval == 0 and inclusive or (not inclusive and approval != len(new_filters.keys())):
                        continue
                filtered_dict[product._id] = product
                filtered_list.append(product)
        if inplace:
            self.products = filtered_dict
        if return_products:
            if as_dict:
                r =  filtered_dict
            else:
                r =  filtered_list
        else:
            r =  self
        if return_new_filters:
            return (r, new_filters)
        else:
            return r

    def get_single(self, id):
        for producte in self:
            if producte._id == id:
                return producte


import pandas as pd
def get_talla_es(unit, value, target_unit="es"):
    df = pd.read_excel("static/MIDES_PANSON.xlsx", header = 1).astype(str)
    unit = unit.lower()
    value = str(value)
    #print(df)
    #print(df[unit])
    #print(df[df[unit] == value])
    value_row = [t for t in df[df[unit] == value].itertuples()][0]
    target_value = value_row.__getattribute__(target_unit)
    return target_value


class Bespoke(Product):
    bucket = "bespoke"
    def __init__(self, data={}, id=None):
        self.per_a = ""
        self._bespoke = True
        super().__init__(data, id)


class Collection(firebaseObject):
    bucket = "collecions"
    def __init__(self, data={}, id=None):
        self.data ={}
        self.nom = ""
        self.nom_menu = ""
        self.descripcio = ""
        self.imatges =[]
        self.ordre = 10
        self.fons_blanc = False

        self.amagat=False
        self.esborrat=False
        super().__init__(data, id)
        if self._id is None:
            self.new = True
        

class StaticImage(firebaseObject):
    bucket = "imatges"
    def __init__(self, data={}, id=None):
        self.data = {}
        self.nom = ""
        self.imatges = []

        super().__init__(data, id)
        if self._id is None:
            self.new = True




