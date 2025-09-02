import json
import os

from app_essentials.utils import *
from app_essentials.firebase import localisation

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
        self.pages = sorted([p.id for p in self.texts.stream()])


        self.extra = self.db.document("languages").get().to_dict()
        self.all_langs = self.extra["langs"]

    def preload_misc(self):
        for key, value in self.misc_ref.get().to_dict().items():
            self.misc[key] = value
            self.misc_labels.append(key)
        self.misc_labels = sorted(self.misc_labels)


    def get_misc(self, label, value):
        try:
            print(self.misc[label][value])
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
                    if key.startswith("_"):
                        continue
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




    def get_text(self, page, name):
        if page in self.misc_labels:
            print("loading misc: {}".format(page))
            t = self.get_misc(page, name)
            if t == "$empty$":
                return "Empty text ({}-{})".format(page,name)
            return t
        elif page not in self.preloaded_labels:
            self.preload(page)
        try:
            t = self.preloaded["-".join([page, name])]
        except KeyError:
            try:
                if self.preloaded[page] is None:
                    self.create_empty_text(page, name)
                    return "Missing page ({}-{})".format(page, name)
                else:
                    return "ERROR"
            except KeyError:
                self.create_empty_text(page, name)
                return "Missing text ({}-{})".format(page,name)

        if t == "$empty$":
            return "Empty text ({}-{})".format(page, name)
        return t


    def __getitem__(self, item):
        comps = split_multiple(item, "_", "-")
        page = comps[0]
        name = "-".join(comps[1:])
        print("Loc load: page: {}, item: {}".format(page,name))
        return self.get_text(page, name)

    def __getattr__(self, item):
        return self.__getitem__(item)

    def get_values_by_page(self, page):
        doc = self.texts.document(page).get()
        return {k:v for k,v in sorted(doc.to_dict().items(), key = lambda x: x[0])}

    def get_all_values_by_page(self):
        data = {}
        for page in sorted(self.pages):
            data[page] = self.get_values_by_page(page)
        return data

    def create_empty_text(self, page, name):
        doc = self.texts.document(page).get()
        print(doc.__dict__)
        if not doc.exists:
            self.create_empy_page(page)
        try:
            doc = self.texts.document(page)
            doc.update({name:{"cat":"$empty$", "en":"$empty$"}})
        except:
            print("ERROR creating empty text ({}-{})".format(page,name))

    def create_empy_page(self, page):
        doc = self.texts.document(page).set({})






