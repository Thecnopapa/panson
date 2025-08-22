import json
import os
from google.cloud.firestore import FieldFilter
from app_essentials.utils import *

from app_essentials.firebase import localisation, db, check_if_admin
from app_essentials.session import get_current_user

class Localisation2:
    def __init__(self, lan="cat"):
        self.lan = lan
        self.db = localisation
        self.preloaded = {}
        self.misc_ref = localisation.document("misc")
        self.misc_labels = []
        self.misc = {}
        self.preloaded_labels = []
        self.texts = self.db.document("languages").collection("text")
        self.preload_misc()
        self.pages = [p.id for p in self.texts.stream()]
        self.extra = self.db.document("languages").get().to_dict()
        self.all_langs = self.extra["langs"]

    def preload_misc(self):
        for key, value in self.misc_ref.get().to_dict().items():
            self.misc[key] = value
            self.misc_labels.append(key)

    def get_misc(self, label, value):
        try:
            return self.misc[label][value]
        except KeyError:
            return "Missing value ({}-{})".format(label, value)

    def preload(self, *pages):
        if len(pages) == 0:
            pages = self.pages
        data = {}
        for page in pages:
            doc = self.texts.document(page).get()
            self.preloaded_labels.append(page)
            if doc.exists:
                for key, value in doc.to_dict().items():
                    try:
                        data["-".join([page,key])] = value[self.lan]
                    except KeyError:
                        try:
                            data["-".join([page,key])] = value["cat"]
                        except KeyError:
                            data["-".join([page,key])] = "Missing language ({}) for:{}-{})".format(self.lan, page, key)
            else:
                self.preloaded[page] = None

        self.preloaded = {**self.preloaded, **data}



    def get_text(self, col, name):
        if col in self.misc_labels:
            return self.get_misc(col, name)
        if col not in self.preloaded_labels:
            self.preload(col)
        try:
            return self.preloaded["-".join([col, name])]
        except KeyError:
            try:
                if self.preloaded[col] is None:
                    return "Missing page ({}-{})".format(col, name)
                else:
                    return "ERROR"
            except KeyError:
                return "Missing text ({}-{})".format(col,name)


    def __getitem__(self, item):
        comps = split_multiple(item, "_", "-")
        col = comps[0]
        name = "-".join(comps[1:])
        print("Loc laod: page: {}, item: {}".format(col,name))
        return self.get_text(col, name)

    def __getattr__(self, item):
        return self.__getitem__(item)

    def get_values_by_page(self, page):
        doc = self.texts.document(page).get()
        return doc.to_dict()

    def get_all_values_by_page(self):
        data = {}
        for page in self.pages:
            data[page] = self.get_values_by_page(page)
        return data











class Localisation:
    def __init__(self, lan="cat"):
        self.lan = lan
        self.loc_json = json.loads(open("static/localization.json").read())
        self.all_langs = [lang for lang in self.loc_json.keys() if not lang in ["colors", "tipus"]]
        self.colours = self.loc_json["colors"]
        self.types = self.loc_json["tipus"].keys()

    def __getattr__(self, item):
        try:
            return self.loc_json[self.lan][item.replace("_", "-")]
        except KeyError:
            try:
                return self.loc_json["cat"][item.replace("_", "-")]
            except KeyError:
                return item

    def __getitem__(self, item):
        try:
            return self.loc_json[self.lan][item]
        except KeyError:
            return self.loc_json["cat"][item]

    def update(self, lan="cat"):
        self.__init__(lan)


