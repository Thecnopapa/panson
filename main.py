# ESSENTIAL IMPORTS
import json
from utilities import *

# WEB-RELATED IMPORTS
from flask import Flask, render_template, redirect, request, make_response, session
import requests
from werkzeug.middleware.proxy_fix import ProxyFix
from google.cloud import secretmanager


### START APP CONFIG ###################################################################################################

project_id = "panson"
secret_client = secretmanager.SecretManagerServiceClient()

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = "./uploads"
app.config['APPLICATION_ROOT'] = '/'
app.config['PREFERRED_URL_SCHEME'] = 'https'
app.wsgi_app = ProxyFix(app.wsgi_app, x_for=1, x_proto=1, x_host=1, x_port=1)

app.secret_key = bytes(str(secret_client.access_secret_version(request={"name": "projects/746452924859/secrets/flask_secret_key/versions/1"})), 'utf-8')

base_url = "https://firestore.googleapis.com/v1/"
cols_path = base_url + "projects/panson/databases/productes/documents/collecions"
prods_path = base_url + "projects/panson/databases/productes/documents/productes"
storage_url = "https://firebasestorage.googleapis.com/v0/b/panson.firebasestorage.app/o/{}%2F{}?alt=media"

### END APP CONFIG #####################################################################################################


# GLOBALS SETUP
from app_essentials.localisation import Localisation
from app_essentials.session import get_current_user
from app_essentials.products import Products
from app_essentials.firebase import get_user_data, get_cols
from app_essentials.firestore import list_blobs
from app_essentials.html_builder import template, navigation
from app_essentials.utils import get_opcions




@app.before_request
def make_session_permanent():
    session.permanent = True



@app.route("/blank")
def return_blank():
    return
@app.route("/blank2")
def return_blank2():
    return Products().__html__()


@app.route("/<lan>/acceptar_cookies/")
def acceptar_cookies(lan):
    user = get_current_user()
    user.accepted_cookies = True
    user.update_db()
    resp = redirect("/{}/".format(lan))
    return resp



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
    elif lan == "robots.txt":
        return redirect("/static/robots.txt")
    elif lan == "sitemap":
        with open("static/sitemap.xml") as f:
            sitemap = f.read()
        return sitemap
    ######################################################
    # TODO: Revisit firebase access
    slides = list_blobs("portada")
    slide_list = [[slide, storage_url.format("portada", slide.split("/")[-1])] for slide in slides if
                  slide.split("/")[-1] != ""]

    html = template(lan=lan, templates=["index", "galeria"], slides= slide_list, filters={}, titol_galeria="ind_titol_galeria", hide_title=True, title=False, max_gallery=8)
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

@app.route("/<lan>/peces_uniques/")
def peces_uniques(lan):
    html = template(lan=lan, templates="uniques", filters={"unica":"True"}, titol="gal_totes")
    return html

@app.route("/<lan>/productes/<id>/")
def mostrar_peca(lan, id):

    producte = Products(lan=lan).filter({"_id":id})[0]

    print(len(request.args))
    opcions = get_opcions()
    opcions_url = "?"+"&".join([key + "=" + str(value) for key, value in opcions.items()])
    print(opcions_url)
    if producte.unica:
        titol_galeria = "pro-altres-uniques"
    else:
        titol_galeria = "pro-mateixa-col"
    html = template(lan=lan, templates=["producte", "galeria"], producte=producte, opcions=opcions, filters={"collecio":producte.collecio} ,titol_galeria=titol_galeria)
    return html






@app.route("/<lan>/productes/<id>/afegir_al_carret/", methods=["POST"])
def afegir_al_carret(lan, id):
    opcions = get_opcions()
    user = get_current_user()
    user.add_producte_carret(id, opcions)
    return opcions
    resp = redirect("/{}/productes/{}/?{}".format(lan, id, opcions))
    return resp



@app.post("/<lan>/carret/id2/eliminar_del_carret")
def eliminar_del_carret(lan, id2):
    opcions = get_opcions()
    user = get_current_user()
    user.add_producte_carret(id2, delete=True)
    return opcions
    resp = redirect("/{}/productes/{}/?{}".format(lan, id, opcions))
    return resp

@app.route("/<lan>/carret/")
def veure_carret(lan):
    html = template(lan=lan, templates="carret", carret=get_current_user().carret)
    return html




@app.route("/<lan>/checkout/")
def checkout(lan):
    user = get_current_user()
    items = user.generate_items()

    from payments import stripe_checkout
    return stripe_checkout(items, lan=lan)


@app.route("/<lan>/checkout/success/")
def stripe_success(lan):
    user = get_current_user()
    user.move_to_favourites()
    html = template(lan=lan, templates="success")
    return html


@app.route("/<lan>/checkout/cancel/")
def stripe_cancel(lan):
    html = template(lan=lan, templates="cancel")
    return html

@app.route("/<lan>/projecte/")
def projecte(lan):
    html = template(lan=lan, templates="projecte")
    return html
@app.route("/<lan>/contacte/")
def contatce(lan):
    html = template(lan=lan, templates="contacte")
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








'''
def main():
    app.run(port=int(os.environ.get('PORT', 80)))

if __name__ == "__main__":
    main()
