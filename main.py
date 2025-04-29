import os
import json

from utilities import *
import flask
from flask import Flask, send_file, render_template, redirect
import requests
app = Flask(__name__)
base_url = "https://firestore.googleapis.com/v1/"
cols_path = base_url + "projects/panson/databases/productes/documents/collecions"
prods_path = base_url + "projects/panson/databases/productes/documents/productes"



def read_data_type(value):
    if list(value.keys())[0] == "stringValue":
        return value["stringValue"]
    elif list(value.keys())[0] == "integerValue":
        return int(value["integerValue"])
    elif list(value.keys())[0] == "booleanValue":
        return bool(value["booleanValue"])
    elif list(value.keys())[0] == "mapValue":
        r = {}
        for key, value in value["mapValue"]["fields"].items():
            r[key] = read_data_type(value)
        return r
    elif list(value.keys())[0] == "arrayValue":
        r = []
        for value in value["arrayValue"]["values"]:
            r.append(read_data_type(value))
        return r
    else:
        return value[list(value.keys())[0]]


class Localization():
    def __init__(self, lan):
        self.lan = lan
        self.loc_json = json.loads(open("localization.json").read())
        self.all_langs = (lang for lang in self.loc_json.keys() if lang != "colors")
        self.colors = self.loc_json["colors"]
        self.loc = self.loc_json[lan]

    def __getattr__(self, item):
        try:
            return self.loc[item.replace("_", "-")]
        except KeyError:
            return self.loc_json["cat"][item.replace("_", "-")]

    def __getitem__(self, item):
        return self.loc[item]

    @staticmethod
    def upper(string ):
        return string.upper()

    def update(self, lan):
        if self.lan != lan:
            self.__init__(lan)
            return self
        else:
            return self


class Variacions():
    def __init__(self, materials):
        self.materials = materials
        self.noms_materials = materials.keys()

    def obtenir_variacions(self, material):
        variacio = self.materials[material]["variacions"]
        return ((variacio, info) for variacio, info in variacio.items())


class Producte():
    def __init__(self, loc, raw_data):
        print(raw_data["name"])
        self.loc = loc
        self.raw_data = raw_data
        self.id = raw_data["name"].split("/")[-1]
        self.nom = self.id
        self.lan = loc.lan
        self._lan = "-" + self.lan

        self.unica = False
        self.descripcio = "Descripcio"

        print1("Producte:", self.id)
        print2(raw_data["fields"])
        [print3(key, read_data_type(value)) for key, value in raw_data["fields"].items()]
        self.data = {key: read_data_type(value) for key, value in raw_data["fields"].items()}
        print(self.data)
        for key, value in self.data.items():
            self.__setattr__(key, value)

        if "material" in self.__dict__:
            self.variacions = Variacions(self.data["material"])



    def __getitem__(self, item):
        return self.__getattribute__(item)





class Productes():
    def __init__(self, lan):
        sprint("Carregant llista de productes")
        self.lan = lan
        self.all_productes = json.loads(requests.get(prods_path).text)["documents"]
        #[print(p, "\n") for p in self.all_productes]

        self.productes = [Producte(lan,raw_data) for raw_data in self.all_productes]
        #[print(p, "\n") for p in self.productes]

    def __iter__(self):
        for producte in self.productes:
            yield producte

    def update(self, lan):
        self.__init__(lan)

    def uniques(self):
        print("Unique productes:")
        return [dict(producte.__dict__) for producte in self.productes ]

    def filtrats(self, **filtres):
        pass


def carregar_totes_collecions(loc):
    sprint("Carregant collecions")
    try:
        all_cols = json.loads(requests.get(cols_path).text)["documents"]
    except:
        return "Could not read collection data at: <br><a href={}>{}</a>".format(cols_path, cols_path)
    html = ""
    all_data = []
    for col in all_cols:
        col_path = col["name"]
        url = base_url + col_path
        print1("URL:", url)
        data = json.loads(requests.get(url).text)
        descripcio = ""
        nom = ""
        id = url.split("/")[-1]
        if "fields" in data:
            if "nom-" + loc.lan in data["fields"]:
                nom = read_data_type(data["fields"]["nom-" + loc.lan])
            elif "nom" in data["fields"]:
                nom = read_data_type(data["fields"]["nom"])
            if "descripcio" + loc.lan in data["fields"]:
                descripcio = read_data_type(data["fields"]["descripcio" + loc.lan])
            elif "descripcio" in data["fields"]:
                descripcio = read_data_type(data["fields"]["descripcio"])
        all_data.append((id, nom, descripcio))
    html += render_template("collecions.html", data=all_data, loc=loc)
    html += render_template("navigation.html", loc = loc)
    return html







def carregar_galeria(loc, filtres:dict[str, str] = {}):
    sprint("Carregant llista de productes")
    print1("Filtres:", filtres)
    html = ""
    try:
        all_products = json.loads(requests.get(prods_path).text)["documents"]
    except:
        return "Could not read product data at: <br><a href={}>{}</a>".format(prods_path, prods_path)

    for product in all_products:
        pass


    return html + render_template("navigation.html", loc = loc)


def dades_generals_producte(producte):
    pass









loc = Localization("cat")
productes = Productes(loc)

@app.route("/")
def redirect_to_cat():
    loc.update("cat")
    return redirect("/cat/")

@app.route("/static/<path:path>", defaults={"lan": "cat"})
@app.route("/<lan>/static/<path:path>")
def get_static(lan, path):
    return redirect("/static/"+path)


@app.route("/<lan>/")
def index(lan):
    if lan == "favicon.ico":
        return redirect("/static/media/favicon.ico")
    loc.update(lan)
    return render_template('index.html', loc = loc) + render_template("navigation.html", origin="hide", loc = loc)




@app.route("/<lan>/collecions")
def collections(lan):
    loc.update(lan)
    return carregar_totes_collecions(loc)

@app.route("/<lan>/collecions/<col>")
def productes_per_col(lan, col):
    loc.update(lan)
    html = get_products_by_attribute("collecio", col, template="galeria.html", titol=col.capitalize(), subtitol=loc.gal_collecio, loc=loc)
    if html:
        return html + render_template("navigation.html", origin = None, loc = loc)


@app.route("/<lan>/peces_uniques")
def peces_uniques(lan):
    loc.update(lan)
    html = render_template("uniques.html", productes=productes.uniques(), loc = loc, )

    return html + render_template("navigation.html", origin = None, loc = loc)



@app.route("/<lan>/productes/<id>/<material>/<variacio>")
def mostrar_peca_material_variacio(lan, id, material, variacio):
    loc.update(lan)
    print("VARIACIO:", variacio)
    html = get_products_by_attribute("id", id, first_only=True, loc = loc, material = material, variacio = variacio)
    if html:
        return html + render_template("navigation.html", origin = None, loc = loc)


@app.route("/<lan>/productes/<id>/<material>")
def mostrar_peca_material(lan, id, material):
    loc.update(lan)
    html = get_products_by_attribute("id", id, first_only=True, loc = loc, material = material)
    if html:
        return html + render_template("navigation.html", origin = None, loc = loc)


@app.route("/<lan>/productes/<id>")
def mostrar_peca(lan, id):
    loc.update(lan)
    html = get_products_by_attribute("id", id, first_only=True, loc = loc)
    if html:
        return html + render_template("navigation.html", origin = None, loc = loc)


@app.route("/<lan>/productes")
def mostrar_tot(lan):
    loc.update(lan)
    html = get_products_by_attribute(template="galeria.html", titol=loc.gal_totes, subtitol="PANSON", loc=loc)
    if html:
        return html + render_template("navigation.html", origin = None, loc = loc)








@app.route("/<lan>/contacte")
def contatce(lan):
    loc.update(lan)
    html = render_template("contacte.html", loc=loc)
    return html + render_template("navigation.html", origin = None, loc = loc)






def main():
    app.run(port=int(os.environ.get('PORT', 80)))

if __name__ == "__main__":
    main()
