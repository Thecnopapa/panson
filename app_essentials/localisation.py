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
        for page in pages:
            data = {"_".join([page,t.id]):t.to_dict[self.lan] for t in self.texts.where(filter=FieldFilter("activa", "==", True, )).stream()}
            self.preloaded = {**self.preloaded, **data}


    def get_text(self, col, name):
        if "_".join([col,name]) in self.preloaded:
            return self.preloaded["_".join([col,name])]
        else:
            self.preload(col)
            return self.preloaded["_".join([col, name])]










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


