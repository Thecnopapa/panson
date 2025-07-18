import os
import json


import flask
from flask import Flask, send_file, render_template, redirect
import requests
app = Flask(__name__)
base_url = "https://firestore.googleapis.com/v1/"
cols_path = base_url + "projects/panson/databases/productes/documents/collecions"
prods_path = base_url + "projects/panson/databases/productes/documents/productes"





def get_col_data(path):
    url = base_url + path
    print("Getting collection data from url: ")
    print(url)
    data = json.loads(requests.get(url).text)
    description = ""
    name = ""
    id = url.split("/")[-1]
    if "fields" in data:
        print(data["fields"])
        if "nom" in data["fields"]:
            name = data["fields"]["nom"]["stringValue"]
        if "descripcio" in data["fields"]:
            description = data["fields"]["descripcio"]["stringValue"]
    return id, name, description


def get_collections(loc):
    print("Getting all collections:")
    all_cols = json.loads(requests.get(cols_path).text)["documents"]
    data=[]
    for col in all_cols:
        col_path = col["name"]
        data.append(get_col_data(col_path))
    html = render_template("collecions.html", data=data, loc=loc)
    #print(html)
    return html

def get_product_data(path):
    url = base_url + path
    print("Getting product data from url: ")
    print(url)
    raw_data = json.loads(requests.get(url).text)
    #print(raw_data)
    fields = raw_data["fields"]
    data = {}
    for key, value in fields.items():
        data[key] = read_data_type(value)
    return data

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



def get_product_data(product):
    product_path = product["name"]
    data = get_product_data(product_path)
    data["id"] = product_path.split("/")[-1]
    print("Producte:", data["id"])
    # [print("{}: {}".format(key, value)) for key, value in data.items()]
    preus = []
    vars = []
    mats = []
    if "material" in data:
        for m, variacions in data["material"].items():
            print("Material:", m)
            mats.append(m)
            for variacions in variacions.values():
                for v, info in variacions.items():
                    if material == m:
                        vars.append((v, info))
                    print("Variacio:", v, info)
                    if "preu" in info:
                        preus.append(info["preu"])

    if len(preus) == 0:
        data["preu"] = None
        data["desde"] = None
    elif len(preus) == 1:
        data["preu"] = preus[0]
        data["desde"] = None
    else:
        data["preu"] = min(preus)
        data["desde"] = True

    if len(mats) > 0:
        data["mats"] = sorted(mats, reverse=True)
    else:
        data["mats"] = None

    if len(vars) > 0:
        data["vars"] = sorted(vars, reverse=True)
        print("#########", data["vars"])
    else:
        data["varas"] = None

    if "descripcio" in data:
        try:
            data["descripcio"] = data["descripcio"][lan]
        except:
            try:
                data["descripcio"] = data["descripcio"]["cat"]
            except:
                data["descripcio"] = data["descripcio"]

    return data



def get_products_by_attribute(attributes = [], values = [], origin = "/", template="producte.html", first_only=False, lan="cat",material="", variacio="", **kwargs):
    print("Getting all products in with {} == {}:".format(attributes, values))
    all_products = json.loads(requests.get(prods_path).text)["documents"]
    all_data = []
    for prod in all_products:
        data = get_product_data(prod)
        for attribute, value in zip(attributes, values):
            if attribute in data or attribute is None:
                if attribute is None or data[attribute] == value:
                    all_data.append(prod)
        if first_only:
            break
    if len(all_data) == 0:
        return ("No hi han peces en aquesta collecio encara<br><br>"
                "<button onclick=\"location.href='/collecions'\">Tornar enrere</button>")
    html = render_template(template, all_data=all_data, origin=origin, len = len(all_data), material=material, variacio=variacio, **kwargs)
    # print(html)
    return html







class Localization():
    def __init__(self, lan):
        self.loc_json = json.loads(open("static/localization.json").read())
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





@app.route("/")
def redirect_to_cat():
    return redirect("/cat/")

@app.route("/static/<path:path>", defaults={"lan": "cat"})
@app.route("/<lan>/static/<path:path>")
def get_static(lan, path):
    return redirect("/static/"+path)


@app.route("/<lan>/")
def index(lan):
    loc = Localization(lan)
    return render_template('index.html', loc = loc) + render_template("navigation.html", origin="hide", loc = loc)



@app.route("/<lan>/navigation")
def navigation(lan):
    loc = Localization(lan)
    return render_template("navigation.html", loc=loc)

@app.route("/<lan>/collecions")
def collections(lan):
    loc = Localization(lan)
    html = get_collections(loc=loc)
    return html + render_template("navigation.html", loc = loc)

@app.route("/<lan>/collecions/<col>")
def productes_per_col(lan, col):
    loc = Localization(lan)
    html = get_products_by_attribute("collecio", col, template="galeria.html", titol=col.capitalize(), subtitol=loc.gal_collecio, loc=loc)
    if html:
        return html + render_template("navigation.html", origin = None, loc = loc)


@app.route("/<lan>/peces_uniques")
def peces_uniques(lan):
    loc = Localization(lan)
    html = get_products_by_attribute("unica", True, loc = loc )
    if html:
        return html + render_template("navigation.html",  origin = None, loc = loc)



@app.route("/<lan>/productes/<id>/<material>/<variacio>")
def mostrar_peca_material_variacio(lan, id, material, variacio):
    loc = Localization(lan)
    print("VARIACIO:", variacio)
    html = get_products_by_attribute("id", id, first_only=True, loc = loc, material = material, variacio = variacio)
    if html:
        return html + render_template("navigation.html", origin = None, loc = loc)


@app.route("/<lan>/productes/<id>/<material>")
def mostrar_peca_material(lan, id, material):
    loc = Localization(lan)
    html = get_products_by_attribute("id", id, first_only=True, loc = loc, material = material)
    if html:
        return html + render_template("navigation.html", origin = None, loc = loc)


@app.route("/<lan>/productes/<id>")
def mostrar_peca(lan, id):
    loc = Localization(lan)
    html = get_products_by_attribute("id", id, first_only=True, loc = loc)
    if html:
        return html + render_template("navigation.html", origin = None, loc = loc)


@app.route("/<lan>/productes")
def mostrar_tot(lan):
    loc = Localization(lan)
    html = get_products_by_attribute(template="galeria.html", titol=loc.gal_totes, subtitol="PANSON", loc=loc)
    if html:
        return html + render_template("navigation.html", origin = None, loc = loc)








@app.route("/<lan>/contacte")
def contatce(lan):
    loc = Localization(lan)
    html = render_template("contacte.html", loc=loc)
    return html + render_template("navigation.html", origin = None, loc = loc)






def main():
    app.run(port=int(os.environ.get('PORT', 80)))

if __name__ == "__main__":
    main()
