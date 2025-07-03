
import json


class Localisation():
    def __init__(self):

        self.loc_json = json.loads(open("localization.json").read())
        self.all_langs = [lang for lang in self.loc_json.keys() if not lang in ["colors", "tipus"]]
        self.colors = self.loc_json["colors"]
        self.tipus = self.loc_json["tipus"].keys()

    def localise(self, lan, item):
        try:
            return self.loc_json[lan][item.replace("_", "-")]
        except KeyError:
            return self.loc_json["cat"][item.replace("_", "-")]

    def update(self):
        self.__init__()


localisation = Localisation

def loc(item, lan = "cat"):
    localisation.localise(lan, item)