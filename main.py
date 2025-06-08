import os
import json
from urllib.request import parse_http_list

from utilities import *
import flask
from flask import Flask, send_file, render_template, redirect, request, make_response, url_for
import requests
import firebase, firestore
app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = "./uploads"
base_url = "https://firestore.googleapis.com/v1/"
cols_path = base_url + "projects/panson/databases/productes/documents/collecions"
prods_path = base_url + "projects/panson/databases/productes/documents/productes"
storage_url = "https://firebasestorage.googleapis.com/v0/b/panson.firebasestorage.app/o/{}%2F{}?alt=media"


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
        if len(value["arrayValue"]) == 0:
            return r
        print("#", value["arrayValue"])
        print("##", value["arrayValue"]["values"])
        for value in value["arrayValue"]["values"]:
            r.append(read_data_type(value))
        return r
    else:
        return value[list(value.keys())[0]]


class Localization():
    def __init__(self, lan):
        self.lan = lan
        self.loc_json = json.loads(open("localization.json").read())
        self.all_langs = [lang for lang in self.loc_json.keys() if not lang in ["colors", "tipus"]]
        self.colors = self.loc_json["colors"]
        self.tipus = self.loc_json["tipus"].keys()
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

    @staticmethod
    def len(i):
        return len(i)

    def update(self, lan=None, force = True):
        if lan is None:
            lan = self.lan
        if self.lan != lan or force:
            self.__init__(lan)
            global productes
            productes.update(self)
            global cookies
            cookies.check_accepted()


            return self
        else:
            return self



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
        if material == "None":
            material = None
        if variacio == "None":
            variacio = None
        if color == "None":
            color = None
        incomplet = False
        print(material, variacio, color)
        print(type(material), type(variacio), type(color))
        if material is None:
            if self.opcions["materials"] is not None:
                incomplet = True
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
            if type(color) is str:
                color = [color]
            for c in color:
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
        global carret
        carret.update()

    def uniques(self):
        print("Unique productes:")
        return [dict(producte.__dict__) for producte in self.productes ]

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
                        "metadata": product,
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


    def add_producte_carret(self, id, opcions_seleccionades={},resp=None,quantitat = 1, save_cart=True):
        print("adding producte", save_cart)
        producte = productes.get_single(id)
        new_producte = {"producte":producte,
                        "quantity":quantitat,}
        id2 = producte.id
        for key, value in sorted(opcions_seleccionades.items(), key=lambda item: item[0]):
            if value == "None":
                value = None
            new_producte[key] = value
            id2 += "&{}:{}".format(key,value)
        new_producte["id2"] = id2
        if id2 in self.carret.keys():
            print(self.carret[id2])
            self.carret[id2]["quantity"] += quantitat
        else:
            self.carret[id2] = new_producte
        if save_cart:
            return self.save_cart(resp)

    def save_cart(self, resp=None):
        print("Saving cart")
        print(self.item_list)
        print(self.preferits)
        if resp is None:
            resp = make_response()
        elif type(resp) is str:
            resp = make_response(resp)
        try:
            resp.set_cookie("cart", json.dumps(self.item_list))
            resp.set_cookie("favourites", json.dumps(self.preferits))
        except:
            print("Filed to save cookies")
        return resp


class Admin():
    def __init__(self):
        print("Admin setup")
        self.logged_in = False
        self.username = None


    def get_admins(self):
        #admins = json.loads(open("secure/admins.json").read())["admins"]

        admins = {"iain": "iain",
                      "nico": "nico"}
        #print(admins)
        return admins

    def restore_login(self, resp=None):
        print("Restoring login session")
        user = request.cookies.get('username')
        password = request.cookies.get('password')
        #self.check_login(user, password, resp)
        return user, password

    def check_login(self, username=None, password=None, resp=None, from_form=False):

        sprint("Checking login", username, password)
        if username is None and password is None:
            if from_form:
                try:
                    print1("From form")
                    username = request.form["user"]
                    password = request.form["password"]
                    print2(username, password)
                except:
                    print("Login failed")
                    return self.logout()
            else:
                print1("Not from form")
                username, password = self.restore_login()
                print2(username, password)
        if username in self.get_admins().keys():
            if password == self.get_admins()[username]:
                self.username = username
                return self.login(username, password, resp)
        else:
            return self.logout()
        #return make_response(redirect("/admin/login"))

    def save_login(self, username, password, resp=None):
        print1("Saving login")
        if resp is None:
            resp = make_response()
        try:
            resp.set_cookie("username", username)
            resp.set_cookie("password", password)
        except:
            print("Filed to save cookies")
        self.username = username
        return resp

    def login(self, username, password, resp=None):
        print1("Logging in user")
        self.logged_in = True
        if resp is None:
            resp = make_response(admin_page())
        return self.save_login(username, password, resp)

    def logout(self, resp=None):
        print1("Logging out")
        self.logged_in = False
        if resp is None:
            resp = redirect("/admin/login")
        return self.save_login("None", "None", resp=resp)


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
    html += navigation()
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
    html = render_template("admin.html", user = admin.username, productes=productes, loc = loc)
    return html + navigation(is_admin=True)


def navigation(html = "", title = True, back = False, is_admin = False):
    global loc
    global admin
    global carret
    global cookies
    if back:
        origin = None
    else:
        origin = "hide"

    carret.count_items()
    n_carret = carret.n_items
    print("N_items:", n_carret)


    html += render_template("navigation.html", origin=origin, loc = loc, hide_title=not title,
                            productes=productes, logout = is_admin, n_carret = n_carret, ask_cookies=not cookies.accepted)
    print(carret.carret)
    return html



class Cookies:
    def __init__(self):
        self.accepted = False

    def check_accepted(self):
        self.accepted = request.cookies.get('accepted_cookies') == "True"
        return self.accepted


    def set_accepted(self, resp, value=True):
        resp.set_cookie("accepted_cookies", str(value))
        self.accepted = value
        return resp





loc = Localization("cat")
productes = Productes(loc)
admin = Admin()
carret = Carret()
cookies = Cookies()




@app.route("/")
def redirect_to_cat():
    loc.update("cat")
    return redirect("/cat/")

@app.route("/blank")
def return_blank():
    return carret.__dict__

@app.route("/static/<path:path>", defaults={"lan": "cat"})
@app.route("/<lan>/static/<path:path>")
def get_static(lan, path):
    return redirect("/static/"+path)


@app.route("/<lan>/")
def index(lan):
    if lan == "favicon.ico":
        return redirect("/static/media/favicon.ico")
    loc.update(lan)

    slides = firestore.list_blobs("portada")
    print("###########")
    print(slides)
    slide_list = [[slide, storage_url.format("portada", slide.split("/")[-1])] for slide in slides if slide.split("/")[-1] != ""]
    html =  render_template('index.html', loc = loc, slides= slide_list)

    html += render_template("galeria.html", productes=productes.get_all(),
                            titol=loc.ind_titol_galeria,  no_head=True,  loc=loc)
    html += navigation(title=False)
    return html

@app.route("/<lan>/admin/")
def admin_redirect(lan):
    return redirect("/admin/")

@app.route("/<lan>/admin/login/")
def admin_redirect_login(lan):
    return redirect("/admin/login")
@app.route("/admin/login/")
def admin_login():
    return render_template("admin_login.html") + navigation()

@app.route("/admin/logout/")
def admin_logout():
    resp = redirect("/"+loc.lan)
    resp = admin.logout(resp)
    return resp
@app.route("/admin/", methods=["GET", "POST"])
def admin_load():
    #loc.update()
    #resp = make_response(admin_page())
    resp = admin.check_login( from_form=request.method == "POST")
    loc.update()
    #print(resp)
    return resp


@app.route("/admin/update/<id>", methods=["GET", "POST"])
def update_product(id):
    firebase.update_firebase(id, productes.get_single(id), taken_ids=productes.taken_ids)
    loc.update()
    return (redirect("/admin/"))

@app.route("/admin/delete/<id>", methods=["GET", "POST"])
def delete_product(id):
    firebase.delete_firebase(id)
    loc.update()
    return (redirect("/admin/"))



@app.route("/<lan>/collecions/")
def collections(lan):
    loc.update(lan)
    return carregar_totes_collecions(loc)

@app.route("/<lan>/collecions/<col>/")
def productes_per_col(lan, col):
    loc.update(lan)
    html = render_template("galeria.html",productes = productes.filtrats(collecio=col), titol=col.capitalize(), loc=loc)
    if html:
        return html + navigation()


@app.route("/<lan>/productes/peces_uniques/")
def peces_uniques(lan):
    loc.update(lan)
    html = render_template("uniques.html", productes=productes.uniques(), loc = loc, )

    return html + navigation()





@app.route("/<lan>/productes/<id>/")
def mostrar_peca(lan, id, opcions=None):
    loc.update(lan)
    productes.update(loc)
    producte = productes.get_single(id)
    print(opcions)
    print(len(request.args))
    if opcions is None:
        opcions = {}
        opcions["material"] = request.args.get("material")
        opcions["variacio"] = request.args.get("variacio")
        opcions["talla"] = request.args.get("talla")
        opcions["color"] = request.args.get("color")
        print("##", opcions["color"])
        if opcions["color"] is not None:
            if opcions["color"][0] == "[":
                opcions["color"] = opcions["color"].replace("[", "").replace("]", "").split("-")
                print(">> ", opcions["color"])


        opcions_url = "?"+"&".join([key + "=" + str(value) for key, value in opcions.items()])
        print(opcions_url)
        if len(request.args) == 0:
            return redirect("/"+loc.lan+"/productes/"+id+"/"+opcions_url)
    html = render_template("producte.html", producte=producte, loc = loc, opcions = opcions)
    html += render_template("galeria.html", productes=productes.filtrats(collecio=producte.collecio),
                            titol=producte.collecio.capitalize(),  no_head=True,  loc=loc)

    if html:
        return html + navigation()


@app.route("/<lan>/productes/")
def mostrar_tot(lan):
    loc.update(lan)
    print("ARGS:")
    print(request.args)

    html = render_template("galeria.html", productes = productes.filtrats(**request.args), titol=loc.gal_totes, loc=loc)
    if html:
        return html + navigation()





@app.route("/<lan>/carret/")
def veure_carret(lan):
    loc.update(lan)
    html = render_template("carret.html", loc =loc, carret = carret)
    return html + navigation()

@app.post("/<lan>/productes/<id>/<opcions>/afegir_al_carret")
def afegir_al_carret(lan, id, opcions):
    opcions_dict = string_to_dict(opcions, allow = ["_", "-" ,":"])
    #opcions_url = "&".join([(key + "=" + value) for key, value in opcions_dict.items()])
    if request.method == "POST":
        resp = redirect("/{}/productes/{}/?{}".format(lan, id, opcions))
        resp = carret.add_producte_carret(id, opcions_dict, resp=resp)
        return resp



@app.post("/<lan>/carret/id2/eliminar_del_carret")
def eliminar_del_carret(lan, id2, opcions):
    opcions_dict = string_to_dict(opcions, allow = ["_", "-" ,":"])
    #opcions_url = "&".join([(key + "=" + value) for key, value in opcions_dict.items()])
    if request.method == "POST":
        resp = redirect("/{}/carret/".format(lan))
        resp = carret.remove_producte_carret(id2, opcions_dict, resp=resp)
        return resp



@app.route("/<lan>/carret/checkout/")
def checkout(lan):
    loc.update(lan)
    carret.update()
    items = carret.items

    from payments import stripe_checkout
    return stripe_checkout(items, loc=loc)


@app.route("/<lan>/carret/checkout/success/")
def stripe_success(lan):
    loc.update(lan)
    html = render_template("success.html", loc=loc)
    html += navigation()
    resp = carret.move_to_favorites(resp=html)
    return resp


@app.route("/<lan>/carret/checkout/cancel/")
def stripe_cancel(lan):
    loc.update(lan)
    html = render_template("cancel.html", loc=loc)
    html += navigation()
    return html



@app.route("/<lan>/projecte/")
def projecte(lan):
    loc.update(lan)
    html = render_template("projecte.html", loc=loc)
    return html + navigation()
@app.route("/<lan>/contacte/")
def contatce(lan):
    loc.update(lan)
    html = render_template("contacte.html", loc=loc)
    return html + navigation()



@app.route("/<path>/acceptar_cookies")
def acceptar_cookies(path):
    resp = redirect(request.url)
    resp = cookies.set_accepted(resp)
    return resp





def main():
    app.run(port=int(os.environ.get('PORT', 80)))

if __name__ == "__main__":
    main()
