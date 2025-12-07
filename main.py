# ESSENTIAL IMPORTS
import json
import os
import datetime

from utilities import *

# WEB-RELATED IMPORTS
from flask import Flask, render_template, redirect, request, make_response, session, jsonify, abort
import requests
from werkzeug.middleware.proxy_fix import ProxyFix
from google.cloud import secretmanager
from google.oauth2 import service_account

### START APP CONFIG ###################################################################################################
print(" * Initiatlising...")
project_id = "panson"
FETCH_SECRETS = True


if "SECRETS" in os.environ:
    if os.environ["SECRETS"] in [0, "0", False]:
        FETCH_SECRETS = False
        print(" * NOT Updating secrets (SECRETS={})".format(os.environ["SECRETS"]))

if FETCH_SECRETS:
    print(" * Updating secrets")
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
                f.write(secret_client.access_secret_version(request={"name": "projects/746452924859/secrets/stripe_key_thecnopapa_test/versions/3"}).payload.data.decode("UTF-8"))
        except:
            print(" * Failed to read stripe key")
        try:
            with open("secure/flask_key", "w") as f:
                f.write(secret_client.access_secret_version(request={"name": "projects/746452924859/secrets/flask_secret_key/versions/1"}).payload.data.decode("UTF-8"))
        except:
            print(" * Failed to read flask secret")
        try:
            with open("secure/mailgun_key", "w") as f:
                f.write(secret_client.access_secret_version(request={"name": "projects/746452924859/secrets/mailgun_sending_key/versions/2"}).payload.data.decode("UTF-8"))
        except:
            print(" * Failed to read mailgun sending key")
        try:
            with open("secure/trello_key", "w") as f:
                f.write(secret_client.access_secret_version(request={"name": "projects/746452924859/secrets/trello_key/versions/3"}).payload.data.decode("UTF-8"))
        except:
            print(" * Failed to read trello key")
    except:
        print(" * Failed to initialise secret manager")


os.environ["FIREBASE_CREDENTIALS"] = "secure/firebase_service_account_info.json"
os.environ["FIRESTORE_CREDENTIALS"] = "secure/firestore_service_account_info.json"
os.environ["STRIPE_KEY"] = "secure/stripe_key"
os.environ["FLASK_KEY"] = "secure/flask_key"
os.environ["MAILGUN_KEY"] = "secure/mailgun_key"
os.environ["TRELLO_KEY"] = "secure/trello_key"


app = Flask(__name__)
app.config['STATIC_FOLDER'] = "static"
app.config['UPLOAD_FOLDER'] = "uploads"
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
storage_url_single = "https://firebasestorage.googleapis.com/v0/b/panson.firebasestorage.app/o/{}?alt=media"

### END APP CONFIG #####################################################################################################


# GLOBALS SETUP
from app_essentials.session import get_current_user, get_session_id
from app_essentials.products import Products, Product, get_talla_es
from app_essentials.firebase import get_user_data, get_cols, check_if_admin
from app_essentials.firestore import list_blobs, upload_images, load_files
from app_essentials.html_builder import template
from app_essentials.utils import get_opcions
from app_essentials.localisation import Images
from payments import Trello


from werkzeug.exceptions import HTTPException
@app.errorhandler(HTTPException)
def handle_exception(e):
    """Return JSON instead of HTML for HTTP errors."""

    if e.code == 403:
        return redirect("/admin")

    # start with the correct headers and status code from the error
    response = e.get_response()
    # replace the body with JSON
    response.data = json.dumps({
        "code": e.code,
        "name": e.name,
        "description": e.description,
    })
    response.content_type = "application/json"
    return render_template("ERROR.html", code=e.code, name=e.name, description=e.description, request=request), e.code




origin = datetime.datetime.now()
usage_ips = {}


@app.before_request
def check_limit(max_reqs=10, seconds=10):
    #print("* Checking limit (session):")
    #print(session)
    now = (datetime.datetime.now() - origin).total_seconds()
    #print("Now: ", now)
    usage = 0
    window = now
    if "usage" in session:
        usage = session["usage"]
    if "window" in session:
        window = session["window"]
    #window = session["window"]
    delta = now - window
    #print(" - Delta: ", delta)
    if delta >= seconds or delta < 0:
        pass
    #    window = now
    #    session["window"] = window
    #    usage = 0
    #    session["usage"] = usage
    #    print(" - Window renewed, delta: ", delta)

    #print(" - Window: ", window)
    #print(" - Usage: ", usage)
    elif usage > max_reqs:
        print(" - Usage exceded: ", usage)
        abort(492)
    else:
        pass

def use(amount=1.0):
    #print("* Checking limit (local):")
    global usage_ips
    if "usage" not in session:
        session["usage"] = 0
        print(" - Usage not in session")
    req_ip = request.remote_addr
    #print(" - Request IP: ", req_ip)
    now = (datetime.datetime.now() - origin).total_seconds()

    if req_ip in usage_ips.keys():
        delta = now - usage_ips[req_ip]["window"]
        #print(" - Delta: ", delta)
        usage_ips[req_ip]["usage"] += amount
        usage_ips[req_ip]["delta"] = delta
        if delta < 0 or delta >= 10:
            usage_ips[req_ip]["window"] = now
            usage_ips[req_ip]["usage"] = amount
    else:
        print(" - IP not in dict")
        usage_ips[req_ip] = dict(window=now, usage = amount, delta=0)
    session["usage"] = usage_ips[req_ip]["usage"]
    session["window"] = usage_ips[req_ip]["window"]
    #print(" - Window: ", usage_ips[req_ip]["window"])
    #print(" - Usage: ", usage_ips[req_ip]["usage"])
    if usage_ips[req_ip]["usage"] >= 10:
        abort(429)
        raise Exception("Usage exceded")

    if len(usage_ips.keys()) >100:
        usage_ips = {}

    print("IP:", req_ip, "Using:", amount, "Total:", usage_ips[req_ip]["usage"], "Delta:", usage_ips[req_ip]["delta"])
    #session["usage"] += amount

    print(request.path)

    if "test." in request.host:
        if request.path.split("/")[1] not in ["static", "style", "media", "scripts"]:
            if not (request.path == "/admin/" or request.path == "/login"):
                if admin_check():
                    pass
                else:
                    abort(403)







def admin_check():
    user = get_current_user()
    return check_if_admin(user.username, user.password)


@app.route("/blank")
def return_blank():
    from payments import create_card, card_add_checklist
    card = create_card("test", "this is a test", ["item1", "item2"])
    return card

@app.route("/ips")
def return_ips():
    use(0.1)
    return usage_ips

@app.route("/mailgun")
def mailgun():
    use(0.1)
    from app_essentials.mail import send_email
    m = send_email("iainvisa@gmail.com", "Configuracio d'email", "Que et sembla aquest email automatic?\n\nEs podia fins i tot enviar desde:\n<el-que-tu-vulguis>@pansonjoieria.com")
    print(m)
    return str(m)


@app.route("/size/calculator/", methods=["POST", "GET"])
def get_talla():
    use(0.01)
    es_talla =""

    f_talla = request.form.get("talla")
    f_unit = request.form.get("unit")
    print(f_talla, f_unit)
    if f_talla is not None and f_unit is not None:
        es_talla = get_talla_es(f_unit, f_talla)
    else:
        es_talla = "missing data"

    result = "Talla: {} / Unit: {} /= TallaES: {}".format(f_talla, f_unit, es_talla)
    return "<form action='/size/calculator/' method=POST><input name='unit' placeholder='unit'><br><input name='talla' placeholder='size'><br><button>SUBMIT</button></form><br>Result: {}".format(result)


@app.post("/accept-cookies")
def acceptar_cookies():
    use(0.1)
    print("Accepting cookies")
    user = get_current_user()
    r = request.get_json()
    print(r["essential"])
    user.accepted_cookies = True
    user.essential_cookies = r["essential"]
    user.cookies = r["cookies"]
    print("essential: ", user.essential_cookies)
    print("cookies: \n", user.cookies)
    user.update_db()
    session.permanent = r["essential"]
    print(user)
    return ""

from werkzeug.utils import secure_filename
from flask import url_for, send_from_directory



@app.route("/<lan>/tic/<tic_page>")
def tic(lan,tic_page):
    use()
    return template(templates="terms", lan=lan, tic_page=tic_page )



@app.route("/static/<folder>/<file>")
@app.route("/static/<file>")
def get_static(file, folder=None):
    use(0.01)
    try:
        raise Exception()
        file = secure_filename(file)
        if folder is None:
            return redirect(storage_url_single.format(file))
        folder = secure_filename(folder)
        return redirect(storage_url.format(folder, file), 301)
    except:
        if folder is None:
            return send_from_directory("static", file)
        return send_from_directory("static", folder + "/" + file)


@app.route("/style/<file>")
def get_style(file):
    use(0.01)
    return redirect("/static/style/"+secure_filename(file))

@app.route("/scripts/<file>")
def get_script(file):
    use(0.01)
    return redirect("/static/scripts/"+secure_filename(file))

@app.route("/fonts/<file>")
def get_font(file):
    use(0.01)
    return redirect("/static/scripts/"+secure_filename(file))


@app.route("/")
@app.route("/<lan>/")
def index(lan ="cat", favicon = True):
    # Special urls #######################################
    if lan == "favicon.ico":
        use(0.01)
        if favicon:
            return redirect("/static/media/favicon.ico")
        else:
            return ""
    elif lan == "apple-touch-icon-precomposed.png":
        use(0.01)
        return redirect("/static/media/apple-touch-icon-precomposed.png")
    elif lan == "apple-touch-icon-120x120.png":
        use(0.01)
        return redirect("/static/media/apple-touch-icon-120x120.png")

    elif lan == "robots.txt":
        use()
        return redirect("/static/robots.txt")

    elif lan == "sitemap":
        use()
        with open("static/sitemap.xml") as f:
            sitemap = f.read()
        return sitemap
    ######################################################
    # TODO: Revisit firebase access
    use()
    slides = list_blobs("portada")
    slide_list = [[slide, storage_url.format("portada", slide.split("/")[-1])] for slide in slides if
                  slide.split("/")[-1] != ""]

    html = template(lan=lan, templates=["index", "galeria"], slides= slide_list, hide_title=True, title=False, max_gallery=8, show_banner=True)
    return html


@app.route("/<lan>/collecio/<id>")
def collections(lan,id):
    use()
    try:
        col = [c for c in get_cols() if c._id == id][0]
        html = template(lan=lan, templates=["collecio"], col=col)
        return html
    except:
        return ""



@app.route("/<lan>/productes/")
def productes(lan):
    use()
    filters = {"esborrat": False, "amagat": False}
    html = template(lan=lan,templates="all_products")
    return html

@app.route("/<lan>/peces_uniques/")
def peces_uniques(lan):
    use()
    html = template(lan=lan, templates="uniques", filters={"unica":True, "collecio":[], "tipus":"totes"}, titol="gal_totes")
    return html

@app.route("/<lan>/productes/<id>/")
def mostrar_peca(lan, id):
    use()
    producte = Products(lan=lan).get_single(id)
    #print(producte)
    html = template(lan=lan, templates="producte3", producte=producte)
    return html

@app.route("/<lan>/bespoke/<id>/")
def mostrar_bedpoke(lan, id):
    use()
    from app_essentials.firebase import bespoke
    from app_essentials.products import Bespoke

    product = Bespoke(bespoke.document(id).get().to_dict(), id)
    print(bespoke)
    html = template(lan=lan, templates="producte3", producte=product)
    return html




@app.post("/carret/add")
def afegir_al_carret():
    use(0.1)
    user = get_current_user()
    material= None
    variacio = None
    colors = None
    talla = None
    talla_multi = None
    talla_country = None
    talla_es = None
    print(request.form)
    resp = make_response()
    resp.status_code = 206
    #resp.body = {"missing-val"}
    #resp.content_type = "application/json"
    resp.headers["missing-val"] = ""
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
            if v != "":
                talla = v
        elif k == "talla-multi":
            if v != "":
                talla_multi = v
        elif k == "talla-country":
            talla_country = v

    opcions = {}
    if material == "":
        resp.headers["missing-val"] = "materials-producte"
        return resp
    elif material != "NA":
        opcions["material"] = material

    if variacio == "":
        resp.headers["missing-val"] = "variacions-producte"
        return resp
    elif variacio != "NA":
        opcions["variacio"] = variacio

    if colors is None:
        resp.headers["missing-val"] = "colors-producte"
        return resp
    for n, c in enumerate(colors):
        if c == "":
            resp.headers["missing-val"] = "colors-producte#{}".format(n)
            return resp
    if colors != ["NA"]:
        opcions["color"] = colors

    if talla is None and talla_multi is None:
        resp.headers["missing-val"] = "talles-producte"
        return resp
    if talla_multi is not None:
        talla = talla_multi
        if talla_country is not None:
            talla = "{}({})".format(talla, talla_country)
            if talla_country != "es":
                talla_es = "{}".format(get_talla_es(talla_country, talla_multi))
                opcions["talla_country"] = talla_country
            else:
                talla_es = talla
            opcions["talla_es"] = talla_es
        else:
            resp.headers["missing-val"] = "unit"
            return resp
    opcions["talla"] = talla


    print("OPCIONS: ", opcions)
    user.add_to_cart(request.form["id"], opcions)

    resp.status_code = 200
    resp.headers["refresh"] = 0

    #return redirect("/{}/productes/{}/".format(lan, request.form["id"]))
    return redirect(request.referrer)


@app.post("/<lan>/render_cart")
def render_cart(lan):
    use(0.1)
    return template(lan=lan, templates="cart")



@app.post("/productes/carret/<pos>/<qty>")
def alterar_carret(pos, qty):
    use(0.01)
    user = get_current_user()
    for n, (k, v) in enumerate(user.cart.items()):
        if n == int(pos):
            if int(qty) <= 0:
                user.cart.pop(k)

                break
            v["quantity"] = int(qty)
            break
    user.recalculate()
    user.update_db()
    #print(user.cart)
    return "", 204



@app.post("/<lan>/carret/id2/eliminar_del_carret")
def eliminar_del_carret(lan, id2):
    use(0.01)
    opcions = get_opcions()
    user = get_current_user()
    user.add_producte_carret(id2, delete=True)
    return opcions
    resp = redirect("/{}/productes/{}/?{}".format(lan, id, opcions))
    return resp


@app.post("/close_banner")
def close_banner():
    pass



@app.post("/<lan>/checkout/init")
def checkout(lan):
    use(0.1)
    from payments import init_checkout
    return init_checkout(lan, force_new=False)

@app.post("/<lan>/checkout/init/force_new")
def checkout_force(lan):
    use(0.1)
    from payments import init_checkout
    return init_checkout(lan, force_new=True)


@app.route("/<lan>/checkout/stripe")
def stripe_checkout(lan):
    use()
    return template(lan=lan, templates="stripe_checkout", force_new=False)

@app.route("/<lan>/checkout/stripe/force_new")
def stripe_checkout_force(lan):
    use()
    return template(lan=lan, templates="stripe_checkout", force_new=True)



@app.post("/<lan>/checkout/update/shipping")
def calculate_shipping_options_route(lan):
    use(0.01)
    print("Calculating shipping options")
    request_data = request.get_json()
    checkout_session_id = request_data.get('checkout_session_id')
    print("CHECKOUT SESSION ID: {}".format(checkout_session_id))
    shipping_details = request_data.get('shipping_details')
    from payments import update_shipping_options
    return update_shipping_options(shipping_details, checkout_session_id)






@app.route("/<lan>/checkout/success/")
def stripe_success(lan):
    use(0.01)
    try:
        from payments import process_payment
        payment_data = process_payment(lan=lan)
        if payment_data is None:
            return redirect("/{}".format(lan))
        html = template(lan=lan, templates="success", **payment_data)
    except:
        return """<div style='width:100%;height:100%;display:flex;align-items:center;justify-content:center;flex-direction:column;'>
        <p>Your payment has been processed correctly and your order has been placed.<br>
        You should recive an email with your order soon.<br>
        <br>
        If you are seeing this is due to some technical issues on our side.<br>
        If you have any doubts please contact us at <b>help@pansonjoieria.com</b></p>
        <br><br>
        <a href="/">HOME</a>
        </div>
        
        """
    return html

@app.route("/<lan>/checkout/success/test")
def stripe_success_test(lan):
    use(0.01)
    from payments import process_payment
    session = {
        "customer_details": {
            "email": "test@pansonjoieria.com"
        }
    }
    invoice = {
                "hosted_invoice_url": "https://stripe.com",
                "number": "12345"
    }
    html = template(lan=lan, templates="success", invoice=invoice, session=session)
    return html





@app.route("/<lan>/checkout/cancel/")
def stripe_cancel(lan):
    use()
    html = template(lan=lan, templates="cancel")
    return html

@app.route("/<lan>/projecte/")
def projecte(lan):
    use()
    html = template(lan=lan, templates="projecte")
    return html

@app.route("/<lan>/contacte/")
def contatce(lan):
    use()
    html = template(lan=lan, templates="contacte")
    return html

@app.route("/<lan>/info-talles/")
def info_talles(lan):
    use()
    html = template(lan=lan, templates="talles")
    return html


@app.route("/<lan>/admin/")
@app.route("/<lan>/admin/<page>/")
@app.route("/admin/")
@app.route("/admin/<page>/")
def admin(lan="cat", page="base"):
    use()
    from payments import Trello
    if admin_check():
        return template(lan=lan, imgs=Images().load(), templates="admin-{}".format(page), amagats=True, footer=False, collecions = get_cols(amagats=True), trello=Trello())
    else:
        return template(lan=lan, templates="login")


@app.post("/login")
def login():
    use()
    print("loging in...")
    from app_essentials.firebase import check_if_admin
    #print(request.form["username"], request.form["password"])

    if check_if_admin(request.form["username"], request.form["password"]):
        user = get_current_user()
        user.username = request.form["username"]
        user.password = request.form["password"]
        user.is_admin = True
        user.update_db()
        print("login succesfull")
    else:
        print("login failed")
    return redirect("/admin/")


@app.route("/admin/logout")
def logout():
    use(0.01)
    user = get_current_user()
    user.username = None
    user.password = None
    user.is_admin = False
    user.update_db()
    return redirect("/")



@app.post("/admin/trello/update")
def trello_update():
    use(0.01)
    if admin_check():
        trello = Trello()
        print(request.get_json())
        data = request.get_json()
        trello.api_key = data["api_key"]
        trello.board_id = data["board_id"]
        trello.list_id = data["list_id"]
        try:
            trello.labels = data["labels"]
        except:
            trello.labels = []
        trello.update()
        return jsonify({"success": True}), 200

@app.post("/admin/trello/get-lists")
def trello_get_lists():
    use(0.01)
    if admin_check():
        trello = Trello()
        print(request.get_json())
        lists = trello.get_available_lists(request.get_json()["board_id"])
        return jsonify(lists), 200

@app.post("/admin/trello/test")
def trello_test():
    use(0.01)
    if admin_check():
        trello = Trello()
        data = request.get_json()
        print(data)
        trello.api_key = data["api_key"]
        trello.board_id = data["board_id"]
        trello.list_id = data["list_id"]
        try:
            trello.labels = data["labels"]
        except:
            trello.labels = []
        print(trello)
        r = trello.test()
        print(r)
        return {"success": r}, 200



@app.post("/admin/misc/update")
def misc_update():
    use(0.01)
    if admin_check():
        data = request.json
        from app_essentials.firebase import localisation
        print(data)
        prev_data = localisation.document("misc").get().to_dict()
        target_data = prev_data[data["field"]]
        if "pos" in data:
            target_data = target_data[int(data["pos"])]
        print(target_data)
        if data["del"]:
            target_data.pop(data["key"])
        else:
            target_data.update({data["key"]: data["value"]})
        print("###")
        print(target_data)
        print(prev_data)
        localisation.document("misc").update(prev_data)
        return ""



@app.post("/admin/loc/update-field")
def update_field():
    use(0.01)
    if admin_check():
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


@app.post("/admin/loc/update")
def update_loc():
    use(0.01)
    if admin_check():
        print("Updating loc")
        data = request.get_json()
        label = data["label"]
        value = data["value"]
        lan = data["lan"]
        print(label, value, lan)
        from app_essentials.utils import split_multiple
        comps = split_multiple(label, "_", "-")
        page = comps[0]
        print("Page: ", page)
        key = "-".join(comps[1:])
        from app_essentials.firebase import localisation
        prev_data = localisation.document("languages").collection("text").document(page).get().to_dict()
        new_data = prev_data
        if new_data is None:
            localisation.document("languages").collection("text").document(page).set({})
            new_data= {}
        if key not in new_data.keys():
            new_data[key]={"cat":"$empty$", "en": "$empty"}
        new_data[key][lan] = value
        print(new_data)
        localisation.document("languages").collection("text").document(page).update(new_data)
        return "", 200



@app.post("/admin/loc/delete-field")
def delete_field():
    use(0.01)
    user = get_current_user()
    if check_if_admin(user.username, user.password):
        print(request.json)
        data = request.json
        from app_essentials.firebase import localisation
        prev_data = localisation.document("languages").collection("text").document(data["page"]).get().to_dict()
        print(prev_data)
        new_data = prev_data
        new_data.pop(data["key"])
        print(new_data)
        localisation.document("languages").collection("text").document(data["page"]).set(new_data)
        return ""




@app.post("/admin/create/<bucket>")
def create_product(bucket):
    use(0.01)
    user = get_current_user()
    if check_if_admin(user.username, user.password):
        print(request.form)

        if bucket == "productes":
            from app_essentials.products import Product as P
        elif bucket == "bespoke":
            from app_essentials.products import Bespoke as P
        elif bucket == "collecions":
            from app_essentials.products import Collection as P
        elif bucket == "imatges":
            from app_essentials.products import StaticImage as P
        else:
            return "Unknown bucket", 500

        new = P({"nom": request.form["name"]}, request.form["id"])
        new.update_db()

        return redirect("/admin/{}/".format(bucket))



@app.post("/admin/update/<bucket>")
def update_product(bucket):
    use(0.01)
    user = get_current_user()
    if check_if_admin(user.username, user.password):
        try:
            print(request.json)
            data = request.json.copy()
            dry = False
            if "dry" in data.keys():
                dry = data["dry"]
            if bucket == "productes":
                from app_essentials.firebase import prods
                from app_essentials.products import Product
                prev_data = prods.document(data["product"]).get().to_dict()
                p = Product(prev_data, data["product"])
            elif bucket == "bespoke":
                from app_essentials.firebase import bespoke
                from app_essentials.products import Bespoke
                prev_data = bespoke.document(data["product"]).get().to_dict()
                p = Bespoke(prev_data, data["product"])
            elif bucket == "collecions":
                from app_essentials.firebase import collections
                from app_essentials.products import Collection
                prev_data = collections.document(data["product"]).get().to_dict()
                p = Collection(prev_data, data["product"])
            elif bucket == "imatges":
                from app_essentials.firebase import images
                from app_essentials.products import StaticImage
                prev_data = images.document(data["product"]).get().to_dict()
                p = StaticImage(prev_data, data["product"])
            else:
                print("Unknown bucket: ", bucket)
                return "Unknown bucket", 500
            if ":" in data["type"]:
                target_type = data["type"].split(":")[0]
                data_type = data["type"].split(":")[1]
            else:
                target_type = None
                data_type = data["type"]

            print("Type:", target_type, target_type)
            if "value" not in data.keys():
                value = None
            else:
                value = data["value"]
                if data_type == "dict":
                    if value is None:
                        value = {}
                    else:
                        value = dict(value)
                elif data_type == "list":
                    if value is None:
                        value = []
                    else:
                        value = list(value)
                elif data_type == "bool":
                    value = value in ["true", "True", "TRUE", "on", "1", 1]
                elif data_type == "int":
                    value = int(value)
                elif data_type == "float":
                    value = float(value)
                elif data_type == "text":
                    value = str(value)
                else:
                    print("Unknown data type: ", data_type)
                    return "Unknown dataType: {}".format(data_type), 500

            subdicts = []
            if "subdict" in data.keys():
                subdicts = [data["subdict"]]
                if "subkey" in data.keys():
                    subdicts.append(data["subkey"])
            print("Subdicts: ", subdicts)

            if target_type == "list":
                new =p.__getattribute__(data["field"]).copy()
                print("\nOLD: ",type(new), new)
                if data["mode"] == "add":
                    new.append(value)
                elif data["mode"] == "remove":
                    try:
                        new.remove(value)
                    except ValueError:
                        pass
                elif data["mode"] == "reset":
                    new = []
                elif data["mode"] == "sort":
                    print(data["key"], "-->", value)
                    new.insert(data["key"], new.pop(value))
                print("\nNEW: ",type(new), new)
                p.__setattr__(data["field"], new)
            elif target_type == "dict":
                new = p.__getattribute__(data["field"]).copy()
                print("\nOLD: ",type(new), new)
                target_dict = new
                for s in subdicts:
                    try:
                        if target_dict[s] is None:
                            target_dict[s] = {}
                        target_dict = target_dict[s]
                    except KeyError:
                        target_dict[s] = {}
                        target_dict = target_dict[s]
                    print("target_dict[{}]: {}".format(s,target_dict))
                print("target dict: {}, subdicts: {}".format( target_dict, subdicts))
                print("key = {}, value = {}".format(data["key"], value))
                if data["mode"] == "add":
                    print("adding")
                    target_dict[data["key"]] = value
                elif data["mode"] == "remove":
                    print("removing")
                    target_dict.pop(data["key"])
                print("final dict: {}".format(target_dict))
                print(new)
                p.__setattr__(data["field"], new)
            else:
                print("\nNEW: ",data["field"], "==>", type(value), value)
                print(p.__dict__)
                p.__setattr__(data["field"], value)

            sprint("Updating DB")
            if not dry:
                p.update_db()
                print1("DB updated")
            else:
                sprint("Dry run")
            return p.__dict__
        except Exception as e:
            print(e)
            return str(e), 500



@app.post("/admin/images/upload/<bucket>")
def upload_image(bucket):
    use(0.01)
    user = get_current_user()
    if check_if_admin(user.username, user.password):
        from app_essentials.localisation import Images
        imgs = Images()
        filedata = request.data
        print(request.headers)
        filename = request.headers["filename"]
        print("filename: ", filename, filename.split(".")[-1])
        #content_type = "image/"+filename.split(".")[-1]
        content_type = request.headers["content_type"]
        print(content_type)
        data = imgs.upload(bucket, filename, filedata, content_type)
        return data["filename"]


@app.post("/admin/images/delete")
def delete_image():
    use(0.01)
    if admin_check():
        r = request.get_json()
        from app_essentials.localisation import Images
        imgs = Images()
        filename = r["filename"]
        bucket = r["bucket"]
        imgs.delete(bucket, filename)
        return "", 200

@app.post("/admin/images/rename")
def rename_image():
    use(0.01)
    if admin_check():
        r = request.get_json()
        from app_essentials.localisation import Images
        imgs = Images()
        filename = r["filename"]
        bucket = r["bucket"]
        newname = r["newFilename"]
        imgs.rename(bucket, filename, newname)
        return "", 200

@app.post("/admin/files/info")
def get_file_info(data=None):
    use(0.01)
    if admin_check():
        imgs = Images()
        if data is None:
            target = request.get_json()
            data = imgs.get(target["bucket"], target["filename"])


        return json.dumps(dict(
            bucket=data["bucket"],
            filename=data["filename"],
            size="{}MB".format(round(int(data["blob"].size)/1000000,2)),
            content_type=data["content_type"],
            full_path=data["blob"].name,
            url = imgs(target["bucket"], data["filename"]),
            usage = imgs.get_usage(target["bucket"], data["filename"]),
            brightess = imgs.get_brightness(data["bucket"], data["filename"])
        ))

@app.post("/admin/files/rightness")
def get_file_brightness():
    use(0.01)
    imgs = Images()
    target = request.get_json()
    data = imgs.get(target["bucket"], target["filename"])
    return jsonify(dict(brightness = imgs.get_brightness(data["bucket"], data["filename"])))



@app.post("/admin/files/list")
def get_file_list():
    use(0.01)
    print("admin/files/list")
    if admin_check():
        imgs = Images()
        data = request.get_json()
        print(data)
        bucket = data["bucket"]
        print("Fetching list from bucket: " ,bucket)
        return json.dumps(dict(filenames=imgs.get_names(bucket)))




@app.post("/admin/update/multiple/discount")
def update_discounts():
    use(0.01)
    if admin_check():
        data = request.get_json()
        print(data)
        prods = Products()
        for prod in prods.products.values():
            if prod.descompte == 0 and not data["changeAll"]:
                continue
            prod.descompte = data["newDiscount"]
            prod.update_db()


        return "", 200



@app.post("/<lan>/send_email/<target>/")
def send_contact_email(lan, target="contacte"):
    use(10)
    from app_essentials.mail import send_email
    form = request.form

    if target == "contacte":
        recipient = "contacte"
        sender_name = "Formulari Contacte"
        temp = "email_contacte"
        subject = form["subject"]
    elif target == "bespoke":
        recipient = "fetamida"
        sender_name = "Formulari Fet a Mida"
        temp = "email_fetamida"
        subject = "PANSON: Fet a mida"
    else:
        recipient = "general"
        sender_name = "Formulari Desconegut"
        temp = "email_contacte"
        subject = form["subject"]


    print(form)
    r = send_email(
        recipient=recipient,
        sender="web",
        sender_name=sender_name,
        internal_recipient=True,
        subject=subject,
        temp=temp,
        form = form,
    )
    print(r)
    return "", 204

@app.route("/<lan>/fetamida/")
def fetamida(lan):
    use()
    html = template(lan=lan, templates="fetamida5")
    return html

@app.route("/<lan>/fetamida/intro")
def fetamida_intro(lan):
    use()
    html = template(lan=lan, templates="fetamida-intro")
    return html


















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
