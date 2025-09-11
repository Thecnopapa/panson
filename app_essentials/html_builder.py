import jinja2
from flask import render_template

from app_essentials import products
from app_essentials.localisation import Localisation2 as localisation, Images
from app_essentials.products import Products
from app_essentials.utils import Utils
from app_essentials.session import get_current_user
from app_essentials.firestore import Storage




def common_kwargs(**kwargs):
    kwargs["loc"] = kwargs.get("loc", localisation(kwargs.get("lan", "cat")))
    kwargs["imgs"] = kwargs.get("imgs", Images())
    kwargs["stg"] = kwargs.get("stg", Storage())
    kwargs["productes"] = Products(lan=kwargs.get("lan", "cat"))
    kwargs["productes_filtrats"] = Products(lan=kwargs.get("lan", "cat"))
    #print("STARTING PRODUCTS:", len(kwargs["productes_filtrats"].get_all()))
    #print(kwargs["productes_filtrats"].products.keys())
    if not kwargs.get("esborrats", False):
        kwargs["productes_filtrats"] = kwargs["productes_filtrats"].filter({"esborrat":False}, return_products=False, inplace=True)
    #print(kwargs["productes_filtrats"].products.keys())
    if not kwargs.get("amagats", False):
        kwargs["productes_filtrats"] = kwargs["productes_filtrats"].filter({"amagat": False}, return_products=False, inplace=True)
    #print(kwargs["productes_filtrats"].products.keys())
    #print("DEAULT FILTERS:", len(kwargs["productes_filtrats"].get_all()))
    if "filters" in kwargs:
        #print(kwargs["filters"])
        kwargs["productes_filtrats"], kwargs["filters"] = kwargs["productes_filtrats"].filter(kwargs.get("filters", None),
                                                                                              custom = True,
                                                                                              return_products=False,
                                                                                              return_new_filters=True,
                                                                                              inplace=True)
    #print("CUSTOM FILTERS:", len(kwargs["productes_filtrats"].get_all()))
    #print(kwargs["productes_filtrats"].products.keys())
    kwargs["productes_filtrats"] = kwargs["productes_filtrats"].get_all()
    kwargs["max_gallery"] = kwargs.get("max_gallery", len(kwargs["productes_filtrats"]))
    kwargs["user"] = get_current_user()
    kwargs["cart"] = kwargs["user"].carret
    for k, v in kwargs["cart"].items():
        #print(v)
        v["producte"] = kwargs["productes"].get_single(v["id"])

    #print("##### USER ####")
    #print(kwargs["user"])
    #print("##### USER ####")
    kwargs["utils"] = Utils()

    return kwargs


def template(html="", templates=None, navigation=True, **kwargs):

    kwargs = common_kwargs(**kwargs)

    if templates is not None:
        if type(templates) is str:
            templates = [templates]
        for n, t in enumerate(templates):
            print("Rendering template: {}.html".format(t))
            html+= render_template(t+".html",no_head=n!=0, **kwargs)

    return html





