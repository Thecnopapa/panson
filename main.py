import os
import json
from enum import global_str

from utilities import *
import flask
from flask import Flask, send_file, render_template, redirect, request, make_response
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
        self.all_langs = [lang for lang in self.loc_json.keys() if lang != "colors"]
        self.colors = self.loc_json["colors"]
        self.loc = self.loc_json[lan]
        try:
            self.logged_in = admin.logged_in
        except:
            self.logged_in = False


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

    def update(self, lan=None, force = True):
        global admin
        admin.restore_login()
        if lan is None:
            lan = self.lan
        if self.lan != lan or force:
            self.__init__(lan)
            global productes
            productes.update(self)

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
        #print(raw_data["name"])
        self.loc = loc
        self.raw_data = raw_data
        self.id = raw_data["name"].split("/")[-1]
        self.nom = self.id
        self.lan = loc.lan
        self._lan = "-" + self.lan

        self.unica = False
        self.descripcio = "Descripcio"
        self.imatges = []
        self.collecio = None
        self.subtitol = "SUBTITOL"
        self.tipus = "altres"

        print1("Producte:", self.id)
        #print2(raw_data["fields"])
        #[print2(key, read_data_type(value)) for key, value in raw_data["fields"].items()]
        self.data = {key: read_data_type(value) for key, value in raw_data["fields"].items()}
        #print(self.data)
        #print(self._lan)
        for key, value in self.data.items():
            self.__setattr__(key, value)

        for attr in self.__dict__.keys():
            if attr+self._lan in self.__dict__.keys():
                #print(self._lan)
                #print(attr, ":", attr+self._lan in self.__dict__.keys())
                self.__setattr__(attr, self.__dict__[attr+self._lan])
        if self.unica:
            self.collecio = loc.gal_peces_uniques

        if "material" in self.__dict__:
            self.variacions = Variacions(self.data["material"])
            self.mats = self.variacions.noms_materials



    def __getitem__(self, item):
        return self.__getattribute__(item)






class Productes():
    def __init__(self, loc):
        sprint("Carregant llista de productes")
        self.lan = loc.lan
        self.all_productes = json.loads(requests.get(prods_path).text)["documents"]
        #[print(p, "\n") for p in self.all_productes]

        self.productes = [Producte(loc,raw_data) for raw_data in self.all_productes]
        #[print(p, "\n") for p in self.productes]

    def __iter__(self):
        for producte in self.productes:
            yield producte

    def update(self, loc):
        self.__init__(loc)

    def uniques(self):
        print("Unique productes:")
        return [dict(producte.__dict__) for producte in self.productes ]

    def filtrats(self, **filtres):
        filtrats = []
        for producte in self.productes:
            for arg, values in filtres.items():
                if type(values) is not list:
                    values = [values]
                for value in values:
                    if producte.__getattribute__(arg) == value:
                        filtrats.append(producte)
                        break
        return filtrats

    def get_single(self, id):
        for producte in self.productes:
            if producte.id == id:
                return producte

    def get_all(self):
        return self.productes


class Admin():
    def __init__(self):
        print("Admin setup")
        self.logged_in = False
        self.username = None


    def get_admins(self):
        admins = json.loads(open("secure/admins.json").read())["admins"]
        print(admins)
        return admins

    def restore_login(self, resp=None):
        print("Restoring login session")
        user = request.cookies.get('username')
        password = request.cookies.get('password')
        self.check_login(user, password, resp)
        return admin.username

    def check_login(self, username=None, password=None, resp=None):
        print("Checking login", username, password)
        if username is None and password is None:
            try:
                username = request.form["user"]
                password = request.form["password"]
            except:
                print("Login failed")
                return self.logout(resp)
        if username in self.get_admins().keys():
            if password == self.get_admins()[username]:
                return self.login(username, password, resp)
        return make_response()

    def save_login(self, username, password, resp=None):
        print("Saving login")
        if resp is None:
            resp = make_response()
        try:
            resp.set_cookie("username", username)
            resp.set_cookie("password", password)
        except:
            pass
        self.username = username
        return resp

    def login(self, username, password, resp=None):
        print("Logging in user")
        self.logged_in = True
        return self.save_login(username, password, resp)

    def logout(self, resp=None):
        print("Logging out")
        self.logged_in = False
        return self.save_login("None", "None", resp)


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
        nom = ""
        id = url.split("/")[-1]
        if "fields" in data:
            if "nom-" + loc.lan in data["fields"]:
                nom = read_data_type(data["fields"]["nom-" + loc.lan])
            elif "nom" in data["fields"]:
                nom = read_data_type(data["fields"]["nom"])
        all_data.append((id, nom))
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


    return html + render_template("navigation.html", origin="hide", loc = loc)




def encrypt(string):
    return string.encode()
def decrypt(string):
    return string.decode()






def admin_page():
    global loc
    html = render_template("admin.html", user = admin.username, loc = loc)
    return html + render_template("navigation.html", loc = loc, logout = True)











loc = Localization("cat")
productes = Productes(loc)
admin = Admin()



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

@app.route("/<lan>/admin/")
def admin_redirect(lan):
    return redirect("/admin/")
@app.route("/admin/login/")
def admin_login():
    return render_template("admin_login.html") + render_template("navigation.html", origin="hide", loc = loc)

@app.route("/admin/logout/")
def admin_logout():
    resp = redirect("/"+loc.lan)
    resp = admin.logout(resp)
    return resp
@app.route("/admin/", methods=["GET", "POST"])
def admin_load():
    app.logger.info("admin_load")
    if request.method == "POST":
        print("POST /admin")
        resp = admin.check_login()
        loc.update()
        print("Username:", admin.username)
        if admin.logged_in:
            resp.data = admin_page()
        else:
            resp.data = render_template("admin_login.html")
        return resp
    if request.method == "GET":
        print("POST /admin")
        if admin.logged_in:
            return admin_page()
        else:
            return render_template("admin_login.html")


@app.route("/<lan>/collecions")
def collections(lan):
    loc.update(lan)
    return carregar_totes_collecions(loc)

@app.route("/<lan>/collecions/<col>")
def productes_per_col(lan, col):
    loc.update(lan)
    html = render_template("galeria.html",productes = productes.filtrats(collecio=col), titol=col.capitalize(), subtitol=loc.col_subtitiol, loc=loc)
    if html:
        return html + render_template("navigation.html", origin = "hide", loc = loc)


@app.route("/<lan>/peces_uniques")
def peces_uniques(lan):
    loc.update(lan)
    html = render_template("uniques.html", productes=productes.uniques(), loc = loc, )

    return html + render_template("navigation.html", origin = "hide", loc = loc)



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
    productes.update(loc)
    producte = productes.get_single(id)
    #print(loc.gal_collecio)
    html = render_template("producte.html", producte=producte, loc = loc)
    html += render_template("galeria.html", productes=productes.filtrats(collecio=producte.collecio),
                            titol=producte.collecio.capitalize(), subtitol=loc.gal_collecio,  no_head=True,  loc=loc)

    if html:
        return html + render_template("navigation.html", origin = None, loc = loc)


@app.route("/<lan>/productes")
def mostrar_tot(lan):
    loc.update(lan)
    html = render_template("galeria.html", productes = productes.get_all(), titol=loc.gal_totes, subtitol=loc.gal_subtitol, loc=loc)
    if html:
        return html + render_template("navigation.html", origin = "hide", loc = loc)








@app.route("/<lan>/contacte")
def contatce(lan):
    loc.update(lan)
    html = render_template("contacte.html", loc=loc)
    return html + render_template("navigation.html", origin = None, loc = loc)






def main():
    app.run(port=int(os.environ.get('PORT', 80)))

if __name__ == "__main__":
    main()
