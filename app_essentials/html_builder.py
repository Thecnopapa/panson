import json
from flask import render_template, session, request

from app_essentials.localisation import Localisation2 as localisation, Images
from app_essentials.products import Products
from app_essentials.utils import Utils
from app_essentials.session import get_current_user
from app_essentials.firestore import Storage




def common_kwargs(**kwargs):
    print(request.path, request.host)
    lan = localisation(kwargs.get("lan", "cat"))
    kwargs["path"] = request.path
    kwargs["host"] = request.host
    kwargs["loc"] = lan
    kwargs["imgs"] = kwargs.get("imgs", Images())
    kwargs["stg"] = kwargs.get("stg", Storage())
    kwargs["productes"] = Products(lan=lan)
    kwargs["productes_filtrats"] = Products(lan=lan)
    #print("STARTING PRODUCTS:", len(kwargs["productes_filtrats"].get_all()))
    #print(kwargs["productes_filtrats"].products.keys())
    if not kwargs.get("esborrats", False):
        kwargs["productes_filtrats"] = kwargs["productes_filtrats"].filter({"esborrat":False}, return_products=False, inplace=True)
    #print(kwargs["productes_filtrats"].products.keys())
    if not kwargs.get("amagats", False):
        kwargs["productes_filtrats"] = kwargs["productes_filtrats"].filter({"amagat": False}, return_products=False, inplace=True)
    #print(kwargs["productes_filtrats"].products.keys())
    #print("DEAULT FILTERS:", len(kwargs["productes_filtrats"].get_all()))
    kwargs["prods_json"] = json.dumps({p._clean_id: {"url": f"/{lan.lan}/productes/{p._id}", "name": p.nom, "col": p.collecio, "tipus": p.tipus} for p in kwargs["productes_filtrats"]})
    kwargs["tipus_json"] = json.dumps({tipus: {"url": f"/{lan.lan}/productes/?filterKey=tipus&filterValue={tipus}", "name":  lan["tip-"+tipus+"-plural"]} for tipus in kwargs["productes_filtrats"].tipus})
    kwargs["cols_json"] = json.dumps({col._clean_id: {"url": f"/{lan.lan}/collecio/{col._id}", "name": col.nom_menu} for col in kwargs["productes_filtrats"].cols})
    kwargs["fam_json"] = json.dumps({p._clean_id: {"url": f"/{lan.lan}/bespoke/{p._id}", "name": p.nom, "per_a": p.per_a, "tipus": p.tipus} for p in kwargs["productes_filtrats"].bespoke})



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
    kwargs["user"].recalculate()
    kwargs["cart"] = kwargs["user"].get_cart(kwargs["productes"])
    kwargs["n_cart"] = sum([i["quantity"]for i in kwargs["cart"].values()])
    print(json.dumps(kwargs["cart"], indent=4))
    kwargs["cart_contents"] = json.dumps([{"id":v["product_id"], "quantity":v["quantity"]} for k, v in kwargs["cart"].items()])
    # for k, v in kwargs["cart"].items():
    #     #print(v)
    #     v["producte"] = kwargs["productes"].get_single(v["product_id"])

    #print("##### USER ####")
    #print(kwargs["user"])
    #print("##### USER ####")
    kwargs["utils"] = Utils()



    return kwargs


def template(html="", templates=None, navigation=True, retry=True, reset=True, **kwargs):

    kwargs = common_kwargs(**kwargs)

    if templates is not None:
        if type(templates) is str:
            templates = [templates]
        for n, t in enumerate(templates):
            print("Rendering template: {}.html".format(t))
            try:
                html+= render_template(t+".html",no_head=n!=0, **kwargs)
            except Exception as e:
                if reset:
                    print("#######################################")
                    print("Failed to render template: {}".format(t))
                    print(e)
                    kwargs["user"].remove()
                    session.pop("session_id")
                    session.pop("user_id")
                    kwargs["user"] = get_current_user()
                    kwargs["cart"] = kwargs["user"].get_cart()
                if retry:
                    html += render_template(t + ".html", no_head=n != 0, retry=False, **kwargs)


    return html





