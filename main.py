# ESSENTIAL IMPORTS
import json
from utilities import *

# WEB-RELATED IMPORTS
from flask import Flask, render_template, redirect, request, make_response
import requests
from werkzeug.middleware.proxy_fix import ProxyFix


### START APP CONFIG ###################################################################################################
app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = "./uploads"
app.config['APPLICATION_ROOT'] = '/'
app.config['PREFERRED_URL_SCHEME'] = 'https'
app.wsgi_app = ProxyFix(app.wsgi_app, x_for=1, x_proto=1, x_host=1, x_port=1)
app.secret_key = b'_5#y2L"F4Q8z\n\xec]/'

base_url = "https://firestore.googleapis.com/v1/"
cols_path = base_url + "projects/panson/databases/productes/documents/collecions"
prods_path = base_url + "projects/panson/databases/productes/documents/productes"
storage_url = "https://firebasestorage.googleapis.com/v0/b/panson.firebasestorage.app/o/{}%2F{}?alt=media"

### END APP CONFIG #####################################################################################################


# GLOBALS SETUP
from app_essentials.localisation import Localisation
from app_essentials.session import session
from app_essentials.products import Products
from app_essentials.firebase import get_user_data, get_cols
from app_essentials.firestore import list_blobs
from app_essentials.html_builder import template, navigation


@app.route("/blank")
def return_blank():
    return
@app.route("/blank2")
def return_blank2():
    return Products().__html__()



@app.route("/static/<path:path>", defaults={"lan": "cat"})
@app.route("/<lan>/static/<path:path>")
def get_static(lan, path):
    return redirect("/static/"+path)
@app.route("/")
def redirect_to_cat():
    return redirect("/cat/")

@app.route("/<lan>/")
def index(lan, favicon = True):
    # Special urls #######################################
    if lan == "favicon.ico":
        if favicon:
            return redirect("/static/media/favicon.ico")
        else:
            return ""
    if lan == "robots.txt":
        return redirect("/static/robots.txt")
    if lan == "sitemap":
        with open("static/sitemap.xml") as f:
            sitemap = f.read()
        return sitemap
    ######################################################
    # TODO: Revisit firebase access
    slides = list_blobs("portada")
    slide_list = [[slide, storage_url.format("portada", slide.split("/")[-1])] for slide in slides if
                  slide.split("/")[-1] != ""]

    html = template(lan=lan, templates=["index", "galeria"], slides= slide_list, titol_galeria="ind_titol_galeria", hide_title=True, title=False)
    return html


@app.route("/<lan>/collecions/")
def collections(lan):
    cols = get_cols()
    html = template(lan=lan, templates=["collecions"], cols=cols)
    return html


@app.route("/<lan>/productes/")
def mostrar_tot(lan):
    html = template(lan=lan,templates="galeria", filters = request.args, titol="gal_totes")
    return html

@app.route("/<lan>/productes/peces_uniques/")
def peces_uniques(lan):
    html = template(lan=lan, templates="uniques", filters={"unica":"True"}, titol="gal_totes")
    return html











'''






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
    resp = redirect("/"+s.loc.lan)
    resp = s.admin.logout(resp)
    return resp
@app.route("/admin/", methods=["GET", "POST"])
def admin_load():
    #s.loc.update()
    #resp = make_response(admin_page())
    resp = s.admin.check_login( from_form=request.method == "POST")
    s.loc.update()
    #print(resp)
    return resp


@app.route("/admin/update/<id>", methods=["GET", "POST"])
def update_product(id):
    firebase.update_firebase(id, s.productes.get_single(id).nou_producte, taken_ids=s.productes.taken_ids)
    s.loc.update()
    return (redirect("/admin/"))

@app.route("/admin/delete/<id>", methods=["GET", "POST"])
def delete_product(id):
    firebase.delete_firebase(id)
    s.loc.update()
    return (redirect("/admin/"))














@app.route("/<lan>/productes/<id>/")
def mostrar_peca(lan, id):
    s.loc.update(lan)
    s.productes.update(s.loc)
    producte = s.productes.get_single(id)

    print(len(request.args))
    opcions = get_opcions()
    opcions_url = "?"+"&".join([key + "=" + str(value) for key, value in opcions.items()])
    print(opcions_url)

    html = render_template("producte.html", producte=producte, loc = s.loc, opcions = opcions)
    html += render_template("galeria.html", productes=s.productes.filtrats(collecio=producte.collecio),
                            titol=producte.collecio.capitalize(),  no_head=True,  loc=s.loc)

    if html:
        return html + navigation()

def get_opcions():
    opcions = {}
    opcions["material"] = request.args.get("material")
    opcions["variacio"] = request.args.get("variacio")
    opcions["talla"] = request.args.get("talla")
    opcions["color"] = request.args.get("color")
    if opcions["color"] is not None:
        if opcions["color"][0] == "[":
            opcions["color"] = opcions["color"].replace("[", "").replace("]", "").split("-")
        if len(opcions["color"]) == 0:
            opcions["color"] = "None"
    return opcions







@app.route("/<lan>/carret/")
def veure_carret(lan):
    s.loc.update(lan)
    html = render_template("carret.html", loc =s.loc, carret = s.carret)
    return html + navigation()

@app.route("/<lan>/productes/<id>/afegir_al_carret/", methods=["POST", "GET"])
def afegir_al_carret(lan, id):
    print("ARGS:")
    print(request.args)
    opcions = get_opcions()
    print(opcions)
    #opcions_url = "&".join([(key + "=" + value) for key, value in opcions_dict.items()])
    if request.method == "POST":
        resp = redirect("/{}/productes/{}/?{}".format(lan, id, opcions))
        resp = s.carret.add_producte_carret(id, opcions, resp=resp)
        return resp
    if request.method == "GET":
        resp = redirect("/{}/productes/{}/?{}".format(lan, id, opcions))
        resp = s.carret.add_producte_carret(id, opcions, resp=resp)
        return resp



@app.post("/<lan>/carret/id2/eliminar_del_carret")
def eliminar_del_carret(lan, id2, opcions):
    opcions_dict = string_to_dict(opcions, allow = ["_", "-" ,":"])
    #opcions_url = "&".join([(key + "=" + value) for key, value in opcions_dict.items()])
    if request.method == "POST":
        resp = redirect("/{}/carret/".format(lan))
        resp = s.carret.remove_producte_carret(id2, opcions_dict, resp=resp)
        return resp



@app.route("/<lan>/carret/checkout/")
def checkout(lan):
    s.loc.update(lan)
    s.carret.update()
    items = s.carret.items

    from payments import stripe_checkout
    return stripe_checkout(items, loc=s.loc)


@app.route("/<lan>/carret/checkout/success/")
def stripe_success(lan):
    s.loc.update(lan)
    html = render_template("success.html", loc=s.loc)
    html += navigation()
    resp = s.carret.move_to_favorites(resp=html)
    return resp


@app.route("/<lan>/carret/checkout/cancel/")
def stripe_cancel(lan):
    s.loc.update(lan)
    html = render_template("cancel.html", loc=s.loc)
    html += navigation()
    return html



@app.route("/<lan>/projecte/")
def projecte(lan):
    s.loc.update(lan)
    html = render_template("projecte.html", loc=s.loc)
    return html + navigation()
@app.route("/<lan>/contacte/")
def contatce(lan):
    s.loc.update(lan)
    html = render_template("contacte.html", loc=s.loc)
    return html + navigation()



@app.route("/<path>/acceptar_cookies")
def acceptar_cookies(path):
    resp = redirect("/"+path)
    resp = s.cookies.set_accepted(resp)
    return resp




'''
def main():
    app.run(port=int(os.environ.get('PORT', 80)))

if __name__ == "__main__":
    main()
