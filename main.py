import os
import json

import flask
from flask import Flask, send_file, render_template
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


def get_collections():
    print("Getting all collections:")
    all_cols = json.loads(requests.get(cols_path).text)["documents"]
    data=[]
    for col in all_cols:
        col_path = col["name"]
        data.append(get_col_data(col_path))
    html = render_template("collecio.html", data=data)
    #print(html)
    return html

def get_product_data(path):
    url = base_url + path
    print("Getting product data from url: ")
    print(url)
    raw_data = json.loads(requests.get(url).text)
    print(raw_data)
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
    else:
        return value[list(value.keys())[0]]


def get_products_by_attribute(attribute, value, origin = "/", template="producte.html", **kwargs):
    print("Getting all products in with {} == {}:".format(attribute, value))
    all_products = json.loads(requests.get(prods_path).text)["documents"]
    all_data = []
    for prod in all_products:
        product_path = prod["name"]
        data = get_product_data(product_path)
        print(data)
        if attribute in data:
            data["id"] = product_path.split("/")[-1]
            if data[attribute] == value:
                all_data.append(data)
    print(all_data)
    if len(all_data) == 0:
        return ("No hi han peces en aquesta collecio encara<br><br>"
                "<button onclick=\"location.href='/collecions'\">Tornar enrere</button>")

    html = render_template(template, all_data=all_data, origin=origin, **kwargs)
    # print(html)
    return html














@app.route("/")
def index():
    print(send_file('templates/index.html').mimetype)
    return render_template('index.html') + render_template("navigation.html")

@app.route("/navigation")
def navigation():
    return render_template("navigation.html")

@app.route("/collecions")
def collections():
    html = get_collections()
    return html + render_template("navigation.html")

@app.route("/collecions/<col>")
def productes_per_col(col):
    html = get_products_by_attribute("collecio", col, template="galeria.html", titol=col.capitalize(), subtitol="Colleccio")
    if html:
        return html + render_template("navigation.html", origin = "/collecions")


@app.route("/peces_uniques")
def peces_uniques():
    html = get_products_by_attribute("unica", True, )
    if html:
        return html + render_template("navigation.html",  origin = "/")


@app.route("/collecions/<col>/<id>")
def mostart_peca(col, id):
    html = get_products_by_attribute("id", id,)
    if html:
        return html + render_template("navigation.html",  origin = "/collecions/{}".format(col))

def main():
    app.run(port=int(os.environ.get('PORT', 80)))

if __name__ == "__main__":
    main()
