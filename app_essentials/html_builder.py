import jinja2
from flask import render_template

from app_essentials import products
from app_essentials.localisation import Localisation
from app_essentials.products import Products
from app_essentials.utils import Utils
from app_essentials.session import get_current_user




def common_kwargs(**kwargs):
    kwargs["loc"] = kwargs.get("loc", Localisation(kwargs.get("lan", "cat")))
    kwargs["productes"] = Products(lan=kwargs.get("lan", "cat"))
    if "filters" in kwargs:
        kwargs["productes_filtrats"] =kwargs["productes"].filter(kwargs.get("filters", None))
        kwargs["max_gallery"] = kwargs.get("max_gallery", len(kwargs["productes_filtrats"]))
    kwargs["user"] = get_current_user()
    kwargs["cart"] = kwargs["user"].carret
    for k, v in kwargs["cart"].items():
        print(v)
        v["producte"] = kwargs["productes"].get_single(v["id"])

    print("##### USER ####")
    print(kwargs["user"])
    print("##### USER ####")
    kwargs["utils"] = Utils()
    return kwargs


def template(html="", templates=None, navigation=True, **kwargs):

    kwargs = common_kwargs(**kwargs)


    if navigation:
        html += render_template("navigation.html", **kwargs)
    if templates is not None:
        if type(templates) is str:
            templates = [templates]
        for n, t in enumerate(templates):
            print("Rendering template: {}.html".format(t))
            html+= render_template(t+".html",no_head=n!=0, **kwargs)



    return html










def admin_page():
    html = render_template("admin.html", user = s.admin.username, productes=s.productes, loc = s.loc)
    return html + navigation(is_admin=True)


def navigation(html = "", title = True, back = False, is_admin = False):
    if back:
        origin = None
    else:
        origin = "hide"

    s.carret.count_items()
    n_carret = s.carret.n_items
    print("N_items:", n_carret)


    html += render_template("navigation.html", origin=origin, loc = s.loc, hide_title=not title,
                            productes=s.productes, logout = is_admin, n_carret = n_carret, carret = s.carret, ask_cookies=not s.cookies.accepted)
    print(s.carret.carret)
    return html




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

