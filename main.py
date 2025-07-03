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

base_url = "https://firestore.googleapis.com/v1/"
cols_path = base_url + "projects/panson/databases/productes/documents/collecions"
prods_path = base_url + "projects/panson/databases/productes/documents/productes"
storage_url = "https://firebasestorage.googleapis.com/v0/b/panson.firebasestorage.app/o/{}%2F{}?alt=media"

### END APP CONFIG #####################################################################################################


# GLOBALS SETUP
from app_essentials.localisation import loc
from app_essentials.session import session












@app.route("/")
def redirect_to_cat():
    s.loc.update("cat")
    return redirect("/cat/")

@app.route("/blank")
def return_blank():
    from app_essentials.firebase import get_user_data
    print(get_user_data("SuuT8m5Ej538OxvCQn8y").to_dict())
    return get_user_data("SuuT8m5Ej538OxvCQn8y").to_dict()

@app.route("/static/<path:path>", defaults={"lan": "cat"})
@app.route("/<lan>/static/<path:path>")
def get_static(lan, path):
    return redirect("/static/"+path)




@app.route("/<lan>/")
def index(lan, favicon = False):
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

    s.loc.update(lan)

    slides = firestore.list_blobs("portada")
    print("###########")
    print(slides)
    slide_list = [[slide, storage_url.format("portada", slide.split("/")[-1])] for slide in slides if slide.split("/")[-1] != ""]
    html =  render_template('index.html', loc = s.loc, slides= slide_list)

    html += render_template("galeria.html", productes=s.productes.get_all(),
                            titol=s.loc.ind_titol_galeria,  no_head=True,  loc=s.loc)
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



@app.route("/<lan>/collecions/")
def collections(lan):
    s.loc.update(lan)
    return carregar_totes_collecions(s.loc)

@app.route("/<lan>/collecions/<col>/")
def productes_per_col(lan, col):
    s.loc.update(lan)
    html = render_template("galeria.html",productes = s.productes.filtrats(collecio=col), titol=col.capitalize(), loc=s.loc)
    if html:
        return html + navigation()


@app.route("/<lan>/productes/peces_uniques/")
def peces_uniques(lan):
    s.loc.update(lan)
    html = render_template("uniques.html", productes=s.productes.uniques(), loc = s.loc, )

    return html + navigation()





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



@app.route("/<lan>/productes/")
def mostrar_tot(lan):
    s.loc.update(lan)
    print("ARGS:")
    print(request.args)

    html = render_template("galeria.html", productes = s.productes.filtrats(**request.args), titol=s.loc.gal_totes, loc=s.loc)
    if html:
        return html + navigation()





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





def main():
    app.run(port=int(os.environ.get('PORT', 80)))

if __name__ == "__main__":
    main()
