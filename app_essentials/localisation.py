import json
import os
from google.cloud.firestore import FieldFilter
from app_essentials.utils import *

from app_essentials.firebase import localisation, db

class Localisation2:
    def __init__(self, lan="cat"):
        self.lan = lan
        self.db = localisation
        self.preloaded = {}
        self.misc_ref = localisation.document("misc")
        self.misc_labels = []
        self.misc = {}
        self.texts = self.db.document("languages").collection("text")
        self.preload_misc()

    def preload_misc(self):
        for key, value in self.misc_ref.get().to_dict().items():
            self.misc[key] = value
            self.misc_labels.append(key)

    def get_misc(self, label, value):
        return self.misc[label][value]

    def preload(self, *pages):
        if len(pages) == 0:
            pages = [p.id for p in self.texts.stream()]
        data = {}
        for page in pages:
            doc = self.texts.document(page).get()
            for key, value in doc.to_dict().items():
                data["-".join([page,key])] = value[self.lan]
        self.preloaded = {**self.preloaded, **data}


    def get_text(self, col, name):
        print(col, self.misc_labels)
        if col in self.misc_labels:
            return self.get_misc(col, name)
        if "-".join([col,name]) not in self.preloaded.keys():
            self.preload(col)
        print(self.preloaded)
        try:
            return self.preloaded["-".join([col, name])]
        except KeyError:
            return "Missing text ({}-{})".format(col,name)

    def __getitem__(self, item):
        comps = split_multiple(item, "_", "-")
        col = comps[0]
        name = "-".join(comps[1:])
        return self.get_text(col, name)

    def __getattr__(self, item):
        return self.__getitem__(item)










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


