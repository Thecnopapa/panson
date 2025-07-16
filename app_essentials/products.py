
from app_essentials.firebase import get_products, firebaseObject, get_cols
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
        self.nom = ""
        self.amagat = False

        self.tipus = None
        self.opcions={}
        self.totes_talles = False
        super().__init__(data, id)
        if self._id is None:
            self.new = True



    def calcular_preu_minim(self):
        p = 0
        if "materials" in self.opcions:
            print(self.opcions["materials"].values())
            p += min([material["preu"] for material in self.opcions["materials"].values()])
        if "variacions" in self.opcions and self.opcions.get("vars_exclusivament", False):
            p += min([variacio["preu"] for variacio in self.opcions["variacions"].values()])
        if "colors" in self.opcions:
            print(self.opcions["colors"].values())
            p += min([data["preu"] for color, data in self.opcions["colors"].items()]) * self.opcions.get("n_colors", 1)
        return p

    def calcular_preu(self, material = None, variacio = None, color = None, **kwargs):
        p = 0
        nones = [None, "None", "none", "null", "[]", ""]
        if material in nones:
            material = None
        if variacio in nones:
            variacio = None
        if color in nones:
            color = None
        incomplet = False
        print(material, variacio, color)
        print(type(material), type(variacio), type(color))

        if material is None:
            if "materials" in self.opcions:
                #incomplet = True
                print([material["preu"] for material in self.opcions["materials"].values()])
                p += min([material["preu"] for material in self.opcions["materials"].values()])
        else:
            p += self.opcions["materials"][material]["preu"]

        if variacio is None:
            if "variacions" in self.opcions:
                incomplet = True
                p += min([variacio["preu"] for variacio in self.opcions["variacions"].values()])
        else:
            if type(variacio) is str:
                variacio = [variacio]
            for v in variacio:
                p += self.opcions["variacions"][v]["preu"]

        if color is None:
            if "color" in self.opcions:
                incomplet = True
                p += min([data["preu"] for color,data in self.opcions["colors"].items()])* self.opcions.get("n_colors",1)
        else:
            print(color, type(color))
            if "[" in color:
                color = str_to_list(color)
            if type(color) is str:
                color = [color]
            for c in color:
                if color != "n_colors":
                    continue
                c = c.replace("\'", "")
                print("#", c)
                print(c == "None" , c == "")
                if c == "None" or c == "":
                    p += min([data["preu"] for color, data in self.opcions["colors"].items()])
                else:
                    print(self.opcions["colors"], c)
                    p += self.opcions["colors"][c]["preu"]
        return p, incomplet




class Products():
    def __init__(self, lan="cat", filters=None):
        self.products = {id:Product(data, id) for id, data in get_products().items()}
        if filters is not None:
            self.products = self.filter(filters, as_dict=True)
        self.setup()
    def setup(self):
        self.col_names = [c["nom"] for c in get_cols().values()]
        self.tipus = sorted(set([c.tipus for c in self.products.values()]))


    def __repr__(self):
        return "\n".join(["Products:", *[repr(p) for p in self]])
    def __html__(self):
        return "<br>".join(["Products:".format(self.__class__.__name__), *[p.__html__() for p in self]])

    def new(self):
        return Product()
    def __iter__(self):
        for producte in self.get_all():
            yield producte

    def uniques(self):
        return [product for product in self if product.unica]

    def get_all(self, as_dict=False):
        if as_dict:
            return self.products
        return list(self.products.values())

    def filter(self, filters, inclusive=False, as_dict=False, inplace=True, return_products=True, return_new_filters=False, custom = False):
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

        print("CUSTOM FILTERING:", custom)
        print(filters)
        for product in self:
            stays = False
            if custom:

                if "collecio" in filters:
                    print(product.collecio, filters["collecio"])
                    if product.collecio in filters["collecio"]:
                        print("Col OK")
                        stays=True

                if "unica" in filters:
                    print(product.unica, filters["unica"])
                    if product.unica:
                        print("Unica OK")
                        stays = True
                if not stays:
                    continue
                print("Col OK")
                if "tipus" in filters:
                    if product.tipus in filters["tipus"]:
                        stays = True
                    else:
                        stays = False
                        continue
                if stays:
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














class Opcions:
    def __init__(self, opcions_raw):

        self.opcions = self.processar_opcions(opcions_raw)
        self.preu_minim = self.calcular_preu_minim()

    def __getattr__(self, item):
        return self.opcions[item]

    def processar_opcions(self, opcions_raw):
        opcions = dict(talles=None,
                       totes_les_talles=False,
                       materials=None,
                       variacions=None,
                       vars_exclusivament=False,
                       colors=None,
                       n_colors=1)
        if "talles" in opcions_raw:
            ts = {}
            for key, value in opcions_raw["talles"].items():
                if key == "totes":
                    opcions["totes_les_talles"] = value
                else:
                    ts[key] = value
            ts = {k:v for k,v in sorted(ts.items(), key=lambda t: t[0])}
            opcions["talles"] = ts
        if "materials" in opcions_raw:
            opcions["materials"] = opcions_raw["materials"]
        if "variacions" in opcions_raw:
            vs = {}
            for key, value in opcions_raw["variacions"].items():
                if key == "exclusivament":
                    opcions["vars_exclusivament"] = value
                else:
                    if "preu" not in value:
                        value["preu"] = 0
                    vs[key] = value
            vs = {k: v for k, v in sorted(vs.items(), key=lambda t: t[0])}
            opcions["variacions"] = vs
        if "colors" in opcions_raw:
            cols = {}
            for key, value in sorted(opcions_raw["colors"].items(),key= lambda x: x[0]):
                if key == "n_colors":
                    opcions["n_colors"] = value
                else:
                    if "preu" not in value:
                        value["preu"] = 0
                    cols[key] = value
            cols = {k: v for k, v in sorted(cols.items(), key=lambda t: t[0])}
            opcions["colors"] = cols
        return opcions

    def calcular_preu_minim(self):
        p = 0
        if self.opcions["materials"] is not None:
            print(self.opcions["materials"].values())
            p += min([material["preu"] for material in self.opcions["materials"].values()])
        if self.opcions["variacions"] is not None and self.opcions["vars_exclusivament"]:
            p += min([variacio["preu"] for variacio in self.opcions["variaciions"].values()])
        if self.opcions["colors"] is not None:
            p += min([color["preu"] for color in self.opcions["colors"].values()]) * self.opcions["n_colors"]
        return p

    def calcular_preu(self, material = None, variacio = None, color = None, **kwargs):
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
                p += min([color["preu"] for color in self.opcions["colors"].values()]) * self.opcions["n_colors"]
        else:
            print(color, type(color))
            if "[" in color:
                color = str_to_list(color)
            if type(color) is str:
                color = [color]
            for c in color:
                c = c.replace("\'", "")
                print("#", c)
                print(c == "None" , c == "")
                if c == "None" or c == "":
                    p += min([color["preu"] for color in self.opcions["colors"].values()])
                else:
                    print(self.opcions["colors"])
                    p += self.opcions["colors"][c]["preu"]
        return p, incomplet


class Producte():
    def __init__(self, loc, raw_data, empty = False):
        #print(raw_data["name"])
        self.loc = loc
        self.nou_producte = empty
        self.unica = False
        self.descripcio = "Descripcio"
        self.imatges = []
        self.collecio = None
        self.subtitol = "SUBTITOL"
        self.tipus = "altres"
        self.esborrat = False
        self.amagat = False
        self.opcions=[]

        if empty:
            self.id = raw_data
            self.data = {}
        else:

            self.raw_data = raw_data
            self.id = raw_data["name"].split("/")[-1]

            self.data = {key: read_data_type(value) for key, value in raw_data["fields"].items()}

        self.nom = self.id
        self.lan = loc.lan
        self._lan = "-" + self.lan
        for key, value in self.data.items():
            self.__setattr__(key, value)

        for attr in self.__dict__.keys():
            if attr+self._lan in self.__dict__.keys():
                #print(self._lan)
                #print(attr, ":", attr+self._lan in self.__dict__.keys())
                self.__setattr__(attr, self.__dict__[attr+self._lan])
        if self.unica:
            self.collecio = "uniques"

        if "opcions" in self.__dict__:
            self.opcions = Opcions(self.opcions)
            self.preu_minim = self.opcions.preu_minim


    def calcular_preu(self, material = None, variacio = None, color = None, **kwargs):
        return self.opcions.calcular_preu(material, variacio, color, **kwargs)


    def __getitem__(self, item):
        return self.__getattribute__(item)



class Productes():
    def __init__(self, loc):
        sprint("Carregant llista de productes")
        self.lan = loc.lan
        self.all_productes = json.loads(requests.get(prods_path).text)["documents"]
        #[print(p, "\n") for p in self.all_productes]
        self.collecions = self.obtenir_collecions()
        self.productes = [Producte(loc,raw_data) for raw_data in self.all_productes]
        self.taken_ids = [p.id for p in self.productes]
        self.productes = [p for p in self.productes if not p.esborrat]
        self.tipus = set([prod.tipus for prod in self.productes])
        #[print(p, "\n") for p in self.productes]
        self.nou_producte = Producte(loc, empty=True, raw_data="nou_producte".format(len(self.productes)))

    def __iter__(self):
        for producte in self.productes:
            yield producte

    def obtenir_collecions(self):
        all_cols = json.loads(requests.get(cols_path).text)["documents"]
        #print(all_cols)
        col_names = []
        for col in all_cols:
            #print(col)
            col_names.append(read_data_type(col["fields"]["nom"]))
        #print(col_names)
        return col_names

    def update(self, loc):
        self.__init__(loc)
        s.carret.update()

    def uniques(self):
        return [dict(producte.__dict__) for producte in self.productes if producte.unica ]

    def filtrats(self, **filtres):
        print("Filtrant:", filtres)
        if len(filtres) == 0:
            return self.get_all()
        filtrats = []
        for producte in self.productes:
            for arg, values in filtres.items():
                if type(values) is not list:
                    values = [values]
                for value in values:
                    if producte.__getattribute__(arg) == value.lower():
                        filtrats.append(producte)
                        break
        return filtrats

    def get_single(self, id):
        for producte in self.productes:
            if producte.id == id:
                return producte

    def get_all(self):
        return self.productes

    def __add__(self, other):
        return self.productes +[other]













