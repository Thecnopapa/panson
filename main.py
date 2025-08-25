# ESSENTIAL IMPORTS
import json
import os

from utilities import *

# WEB-RELATED IMPORTS
from flask import Flask, render_template, redirect, request, make_response, session
import requests
from werkzeug.middleware.proxy_fix import ProxyFix
from google.cloud import secretmanager
from google.oauth2 import service_account

### START APP CONFIG ###################################################################################################

project_id = "panson"
os.makedirs("secure", exist_ok=True)
try:
    secret_client = secretmanager.SecretManagerServiceClient()
    print(" * Secret manager initialised")


    try:
        with open("secure/firebase_service_account_info.json", "w") as f:
            f.write(secret_client.access_secret_version(request={"name": "projects/746452924859/secrets/firebase_credentials/versions/1"}).payload.data.decode("UTF-8"))
    except:
        print(" * Failed to read firebase secret")
    try:
        with open("secure/firestore_service_account_info.json", "w") as f:
            f.write(secret_client.access_secret_version(request={"name": "projects/746452924859/secrets/firestore_credentials/versions/1"}).payload.data.decode("UTF-8"))
    except:
        print(" * Failed to read firestore secret")
    try:
        with open("secure/stripe_key", "w") as f:
            f.write(secret_client.access_secret_version(request={"name": "projects/746452924859/secrets/stripe_key_thecnopapa_test/versions/2"}).payload.data.decode("UTF-8"))
    except:
        print(" * Failed to read stripe key")
    try:
        with open("secure/flask_key", "w") as f:
            f.write(secret_client.access_secret_version(request={"name": "projects/746452924859/secrets/flask_secret_key/versions/1"}).payload.data.decode("UTF-8"))
    except:
        print(" * Failed to read flask secret")
    try:    
        with open("secure/mailgun_key", "w") as f:
            f.write(secret_client.access_secret_version(request={"name": "projects/746452924859/secrets/mailgun_sending_key/versions/1"}).payload.data.decode("UTF-8"))
    except:
        print(" * Failed to read mailgun sending key")
except:
    print(" * Failed to initialise secret manager")


os.environ["FIREBASE_CREDENTIALS"] = "secure/firebase_service_account_info.json"
os.environ["FIRESTORE_CREDENTIALS"] = "secure/firestore_service_account_info.json"
os.environ["STRIPE_KEY"] = "secure/stripe_key"
os.environ["FLASK_KEY"] = "secure/flask_key"
os.environ["MAILGUN_KEY"] = "secure/mailgun_key"

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = "./uploads"
app.config['APPLICATION_ROOT'] = '/'
app.config['PREFERRED_URL_SCHEME'] = 'https'
app.wsgi_app = ProxyFix(app.wsgi_app, x_for=1, x_proto=1, x_host=1, x_port=1)

try:
    with open("secure/flask_key", "r") as f:
        app.secret_key = bytes(str(f.read()), 'utf-8')
except:
    print(" * Failed to read flask key")


base_url = "https://firestore.googleapis.com/v1/"
cols_path = base_url + "projects/panson/databases/productes/documents/collecions"
prods_path = base_url + "projects/panson/databases/productes/documents/productes"
storage_url = "https://firebasestorage.googleapis.com/v0/b/panson.firebasestorage.app/o/{}%2F{}?alt=media"

### END APP CONFIG #####################################################################################################


# GLOBALS SETUP
from app_essentials.session import get_current_user
from app_essentials.products import Products, Product
from app_essentials.firebase import get_user_data, get_cols, check_if_admin
from app_essentials.firestore import list_blobs, upload_images, load_files
from app_essentials.html_builder import template
from app_essentials.utils import get_opcions





@app.before_request
def make_session_permanent():
    session.permanent = True



@app.route("/blank")
def return_blank():
    from app_essentials.localisation import Localisation2
    loc = Localisation2()
    loc.create_empty_text("page", "name",)
    return loc.page_name

@app.route("/mailgun")
def mailgun():
    from app_essentials.mail import send_email
    m = send_email("iainvisa@gmail.com", "Configuracio d'email", "Que et sembla aquest email automatic?\n\nEs podia fins i tot enviar desde:\n<el-que-tu-vulguis>@pansonjoieria.com")
    print(m)
    return str(m)


@app.post("/acceptar_cookies")
def acceptar_cookies():
    user = get_current_user()
    user.accepted_cookies = True
    user.update_db()
    return ""



@app.route("/static/<path:path>", defaults={"lan": "cat"})
@app.route("/<lan>/static/<path:path>")
def get_static(lan, path):
    return redirect("/static/"+path)

@app.route("/")
@app.route("/<lan>/")
def index(lan ="cat", favicon = True):
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

    html = template(lan=lan, templates=["index", "galeria"], slides= slide_list, hide_title=True, title=False, max_gallery=8)
    return html


@app.route("/<lan>/collecions/")
def collections(lan):
    cols = get_cols()
    html = template(lan=lan, templates=["collecions"], cols=cols)
    return html




@app.route("/<lan>/productes/")
def mostrar_tot(lan):
    filters = request.args.copy()
    keys = [k for k in request.args.copy().keys()]

    for n, k in enumerate(keys):
        if "#" in k:
            print(k)
            keys[n] = k.split("#")[0]

    keys = list(set(keys))
    print(keys)
    if "collecio" not in keys:
        if "unica" in keys:
            filters["collecio"] = []
        else:
            filters["collecio"] = "totes"
    if "unica" not in keys:
        filters["unica"] = "totes"
    if "tipus" not in keys:
        filters["tipus"] = "totes"

    html = template(lan=lan,templates="galeria", filters = filters, titol="gal_totes", show_filtres=True)
    return html

@app.route("/<lan>/peces_uniques/")
def peces_uniques(lan):
    html = template(lan=lan, templates="uniques", filters={"unica":True, "collecio":[], "tipus":"totes"}, titol="gal_totes")
    return html

@app.route("/<lan>/productes/<id>/")
def mostrar_peca(lan, id):

    producte = Products(lan=lan).get_single(id)
    print(producte)

    print(len(request.args))
    opcions = get_opcions()

    filters={}
    '''
    filters = {"tipus":"totes"}
    if producte.unica:
        titol_galeria = "pro-altres-uniques"
        filters["unica"] = True
        filters["collecio"] = []
    else:
        filters["collecio"] = producte.collecio
        titol_galeria = "pro-mateixa-col"
        '''
    html = template(lan=lan, templates=["producte3"], producte=producte, opcions=opcions, filters=filters)
    return html





@app.post("/<lan>/carret/add")
def afegir_al_carret(lan):
    user = get_current_user()
    material= None
    variacio = None
    colors = None
    talla = None
    print(request.form)
    for k, v in request.form.items():
        if "#" in k:
            k = k.split("#")[0]
        if k == "material":
            material = v
        elif k == "variacio":
            variacio = v
        elif k == "color":
            if colors is None:
                colors = [v]
            else:
                colors.append(v)
        elif k == "talla":
            if v is None or v == "":
                return "talla", 204
            talla = int(v)

    opcions = {}
    opcions["material"] = material
    opcions["variacio"] = variacio
    opcions["color"] = colors
    opcions["talla"] = talla
    user.add_producte_carret(id=request.form["id"], opcions_seleccionades=opcions)
    # return "", 204
    # print("Returning 205")
    # return "", 205
    return redirect("/{}/productes/{}/".format(lan, request.form["id"]))

@app.post("/productes/carret/<pos>/<qty>")
def alterar_carret(pos, qty):
    user = get_current_user()
    for n, (k, v) in enumerate(user.carret.items()):
        if n == int(pos):
            if int(qty) <= 0:
                user.carret.pop(k)

                break
            v["quantity"] = int(qty)
            break
    user.recalculate()
    user.update_db()
    print(user.carret)
    return "", 204



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
    from payments import process_payment

    customer_session = process_payment(lan=lan)

    html = template(lan=lan, templates="success", cs=customer_session)
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




@app.route("/<lan>/admin/")
@app.route("/<lan>/admin/page/")
@app.route("/admin/")
@app.route("/admin/<page>/")
def admin(lan="cat", page="main"):
    lan="cat"
    user = get_current_user()
    print(user.__dict__)
    print("admin check")
    print(user.username, user.password)
    if check_if_admin(user.username, user.password):
        return template(lan=lan, templates="admin-{}".format(page), user = user.username, amagats=True, footer=False)
    else:
        return template(lan=lan, templates="login", footer=False)


@app.post("/login")
def login():
    print("loging in...")
    from app_essentials.firebase import check_if_admin
    print(request.form["username"], request.form["password"])

    if check_if_admin(request.form["username"], request.form["password"]):
        user = get_current_user()
        user.username = request.form["username"]
        user.password = request.form["password"]
        user.is_admin = True
        user.update_db()
        print("login succesfull")
    else:
        print("login failed")
    return(redirect("/admin/"))

@app.route("/admin/logout")
def logout():
    user = get_current_user()
    user.username = None
    user.password = None
    user.is_admin = False
    user.update_db()
    return redirect("/")


@app.post("/admin/update/<id>")
def update_product(id, lan="cat"):
    user = get_current_user()

    if check_if_admin(user.username, user.password):

        if "text:id" in request.form:
            id = request.form["text:id"]
        product = Product(id=id)
        for key, value in request.form.to_dict().items():
            value_type = key.split(":")[0]
            okey = key
            print(key, value)
            if value.strip() in ["none", "", "None", "cap", "Cap"]:
                value = None
            if value_type == "bool":
                if value in ["true", "on", "True", True, None]:
                    value = True
                else:
                    value = False
            if value_type == "number":
                if value is None:
                    value = 0
                else:
                    value = int(value)
            if value_type == "float":
                if value is None:
                    value = 0
                else:
                    value = float(value)
            key = key.split(":")[1]
            option = False
            if key == "op":
                option = True
                key = okey.split(":")[2]
            subkey = None
            try:
                if okey.split(":")[-1] != key:
                    subkey = okey.split(":")[-1]
            except:
                pass
            if "#" in key:
                nkey = key
                key = key.split("#")[0]
            else:
                nkey = key

            if option:
                target = product.opcions
            else:
                target = product
            if key not in target.keys():
                if value_type == "list":
                    target[key] = []
                elif value_type == "dict" and subkey is None:
                    target[key] = {}
                else:
                    target[key] = value
            print(subkey)
            print(target.keys())
            if type(target[key]) is list:
                target[key].append(value)
            elif type(target[key]) is dict:
                if subkey is None:
                    target[key][value] = {}
                else:
                    [print(k) for k in request.form.keys() if nkey in k.split(":") and ":" not in k.split("#")[1]]
                    parentkey = [request.form[k] for k in request.form.keys() if nkey in k.split(":") and ":" not in k.split("#")[1]]
                    print("PARENTKEY",parentkey)
                    print("TARGETKEY",key)
                    print("SUBKEY",subkey)
                    print("NKEY", nkey)
                    print("OKEY", okey)
                    assert len(parentkey) == 1
                    target[key][parentkey[0]][subkey] = value
            else:
                target[key] = value

            print(key, value, value_type)
        uploads = load_files(target_folder="productes")
        uploaded_images = upload_images(uploads, "productes")
        for image in uploaded_images:
            product.imatges.append(image)
        product.update_db()
        #return str(request.form) + "<br>" + str(uploads)+ "<br>" + str(uploaded_images)+ "<br>" + product.__html__()
        return redirect("/admin/#"+product._id)
    else:
        return template(lan=lan, templates="login")



@app.route("/admin/hide/<id>")
def hide_product(id):
    user = get_current_user()
    if check_if_admin(user.username, user.password):
        product = Products(lan="cat").get_single(id=id)
        product.amagat = True
        product.update_db()
    return redirect("/admin/")
@app.route("/admin/unhide/<id>")
def unhide_product(id):
    user = get_current_user()
    if check_if_admin(user.username, user.password):
        product = Products(lan="cat").get_single(id=id)
        product.amagat = False
        product.update_db()
    return redirect("/admin/")

@app.route("/admin/delete/<id>")
def delete_product(id):
    user = get_current_user()
    if check_if_admin(user.username, user.password):
        product = Products(lan="cat").get_single(id=id)
        product.esborrat = True
        product.update_db()
    return redirect("/admin/")
@app.route("/admin/restore/<id>")
def restore_product(id):
    user = get_current_user()
    if check_if_admin(user.username, user.password):
        product = Products(lan="cat").get_single(id=id)
        product.esborrat = False
        product.update_db()
    return redirect("/admin/")


@app.post("/admin/loc/update-field")
def update_field():
    user = get_current_user()
    if check_if_admin(user.username, user.password):
        print(request.json)
        data = request.json
        from app_essentials.firebase import localisation
        prev_data = localisation.document("languages").collection("text").document(data["page"]).get().to_dict()
        print(prev_data)
        new_data = prev_data
        new_data[data["key"]][data["lan"]] = data["value"]
        print(new_data)
        localisation.document("languages").collection("text").document(data["page"]).update(new_data)
    return ""

@app.post("/<lan>/send_email/contacte/")
def send_contact_email(lan):
    form = request.form
    print(form)
    return form


'''


@app.route("/<lan>/admin/login/")
def admin_redirect_login(lan):
    return redirect("/admin/login")
@app.route("/admin/login/")
def admin_login():
    return render_template("login.html") + navigation()

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
def start_ngrok():
    from pyngrok import ngrok
    url = ngrok.connect(5000, name="tunnel1", url="https://funny-constantly-peacock.ngrok-free.app").public_url
    print(' * Tunnel URL:', url)

app.config["START_NGROK"] = os.environ.get('START_NGROK') == "1" and os.environ.get('WERKZEUG_RUN_MAIN') != 'true'

if app.config['START_NGROK']:
    start_ngrok()





def main():
    app.run(port=4242, host="0.0.0.0", debug=False) # Not used if run from bash

if __name__ == "__main__":
    main()
