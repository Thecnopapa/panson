from flask import render_template

from app_essentials import products
from app_essentials.localisation import Localisation
from app_essentials.products import Products


def add_navigation(html="", **kwargs):
    kwargs["loc"] = kwargs.get("loc", Localisation(kwargs.get("lan", "cat")))
    kwargs["productes"] =Products(lan=kwargs.get("lan", "cat"))


    print(kwargs["productes"])
    html += render_template("navigation.html", **kwargs)
    return html




def template(html="", template=None, navigation=True, **kwargs):
    loc = kwargs.get("loc", Localisation(kwargs.get("lan", "cat")))
    kwargs["loc"] = loc


    if template is not None:
        html+= render_template(template+".html", **kwargs)
    if navigation:
        html = add_navigation(html, **kwargs)
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

