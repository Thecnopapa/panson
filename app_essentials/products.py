
from app_essentials.firebase import get_products, firebaseObject, get_cols


class Product(firebaseObject):
    bucket = "productes"
    def __init__(self, data, id):
        self.data = {}
        self.unica = False
        self.esborrat = False
        self.collecio = "None"
        self.descripcio = ""
        self.subtitol = ""
        self.imatges = []
        self.nom = ""

        self.tipus = None
        self.opcions={}
        super().__init__(data, id)



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
    def __init__(self, lan="cat"):
        self.products = {id:Product(data, id) for id, data in get_products().items()}
        self.col_names = [c["nom"] for c in get_cols().values()]
        self.tipus = sorted(set([c.tipus for c in self.products.values()]))
    def __repr__(self):
        return "\n".join(["Products:", *[repr(p) for p in self]])
    def __html__(self):
        return "<br>".join(["Products:".format(self.__class__.__name__), *[p.__html__() for p in self]])


    def __iter__(self):
        for producte in self.get_all():
            yield producte

    def uniques(self):
        return [product for product in self if product.unica]

    def get_all(self):
        return list(self.products.values())

    def filter(self, filters, inclusive=False):
        if filters is None:
            return self.get_all()
        if len(filters) == 0:
            return self.get_all()
        filtered = []

        for product in self:
            approval = 0
            for key, values in filters.items():
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
            if inclusive and approval == 0 or approval != len(filters.keys()):
                continue
            filtered.append(product)

        return filtered

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













