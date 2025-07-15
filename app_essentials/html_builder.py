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
    kwargs["productes_filtrats"] = Products(lan=kwargs.get("lan", "cat"))
    #print(kwargs["productes_filtrats"].products.keys())
    if not kwargs.get("esborrats", False):
        kwargs["productes_filtrats"] = kwargs["productes_filtrats"].filter({"esborrat":False}, return_products=False)
    #print(kwargs["productes_filtrats"].products.keys())
    if not kwargs.get("amagats", False):
        kwargs["productes_filtrats"] = kwargs["productes_filtrats"].filter({"amagat": False}, return_products=False)
    #print(kwargs["productes_filtrats"].products.keys())
    if "filters" in kwargs:
        print(kwargs["filters"])
        kwargs["productes_filtrats"] =kwargs["productes_filtrats"].filter(kwargs.get("filters", None), return_products=False)
    #print(kwargs["productes_filtrats"].products.keys())
    kwargs["productes_filtrats"] = kwargs["productes_filtrats"].get_all()
    kwargs["max_gallery"] = kwargs.get("max_gallery", len(kwargs["productes_filtrats"]))
    kwargs["user"] = get_current_user()
    kwargs["cart"] = kwargs["user"].carret
    for k, v in kwargs["cart"].items():
        print(v)
        v["producte"] = kwargs["productes"].get_single(v["id"])

    #print("##### USER ####")
    #print(kwargs["user"])
    #print("##### USER ####")
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





