import json
import os


class Localisation:
    def __init__(self, lan="cat"):
        self.lan = lan
        self.loc_json = json.loads(open("static/localization.json").read())
        self.all_langs = [lang for lang in self.loc_json.keys() if not lang in ["colors", "tipus"]]
        self.colours = self.loc_json["colors"]
        self.types = self.loc_json["tipus"].keys()

    def loc(self,item):
        try:
            return self.loc_json[self.lan][item.replace("_", "-")]
        except KeyError:
            return self.loc_json["cat"][item.replace("_", "-")]

    def update(self, lan="cat"):
        self.__init__(lan)

