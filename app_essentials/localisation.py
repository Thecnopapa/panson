import json
import os
from google.cloud.firestore import FieldFilter

from app_essentials.firebase import localisation, db

class Localisation2:
    def __init__(self, lan="cat"):
        self.lan = lan
        self.db = localisation
        self.preloaded = {}
        self.texts = self.db.document("languages").collection("text")


    def preload(self, *pages):
        if len(pages) == 0:
            pages = [p.id for p in self.texts.stream()]
        for page in pages:
            data = {"_".join([page,t.id]):t.to_dict[self.lan] for t in self.texts.document(page).stream()}
            self.preloaded = {**self.preloaded, **data}


    def get_text(self, col, name):
        if "_".join([col,name]) not in self.preloaded.keys():
            self.preload(col)
        return self.preloaded["_".join([col, name])]

    def __getitem__(self, item):
        comps = item.split(["_","-"])
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


