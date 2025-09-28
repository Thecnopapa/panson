import json
import os

from app_essentials.utils import *
from app_essentials.firebase import localisation
from werkzeug.utils import secure_filename
from app_essentials.firestore import db
from flask import request
class Images:
    def __init__(self, folder="media"):
        self.folder_name = folder
        self.folder = folder+"/{}"
        self.folder_url = "https://firebasestorage.googleapis.com/v0/b/panson.firebasestorage.app/o/{}%2F".format(self.folder_name)
        self.img_url = self.folder_url+"{}%2F{}?alt=media".format("{}","{}")

    def load(self):
        self.paths = self.get_folders(None, with_prefix=True)
        print(self.paths)
        self.buckets = [b.split("/")[1] for b in self.paths]
        return self

    def get_blobs(self, bucket, folders=False):
        if bucket is not None:
            bucket = self.folder.format(secure_filename(bucket))+"/"
        else:
            bucket = self.folder_name+"/"
        l = [b for b in db.list_blobs(prefix=bucket)]
        if folders is None:
            return l
        elif folders:
            return [b for b in l if b.name.endswith("/")]
        else:
            return [b for b in l if b.name != bucket]
    
    def get_blob(self, bucket, filename):
        filename = secure_filename(filename)
        for blob in self.get_blobs(bucket):
            if blob.name == self.folder.format(bucket)+"/"+filename:
                return blob


    def get_names(self, bucket, with_prefix=False, folders=False):
        if with_prefix:
            return [b.name for b in self.get_blobs(bucket, folders)]
        return [b.name.split("/")[-1] for b in self.get_blobs(bucket,folders)]

    def get_folders(self, bucket, with_prefix=False):
        return self.get_names(bucket, with_prefix=with_prefix, folders=True)

    def get_url(self, bucket, filename):
        try:
            bucket = secure_filename(bucket)
            filename = secure_filename(filename)
            return self.img_url.format(bucket, filename)
        except:
            return None

    def __call__(self, bucket, filename):
        return self.get_url(bucket, filename)
    

    def upload(self, bucket, filename, filedata, content_type, replace=False):
        bucket = secure_filename(bucket)
        filename = secure_filename(filename)
        storage_path = self.folder.format(bucket) + "/" + filename
        if not replace:
            print(filename, self.get_names(bucket))
            while filename in self.get_names(bucket):
                filename = filename.split(".")[0] +"_copia"+os.path.splitext(filename)[1]
        storage_path = self.folder.format(bucket) + "/" + filename

        new_blob = db.blob(storage_path)
        print("Uploading {} MIME: {} to: {}".format(filename, content_type, storage_path))
        new_blob.upload_from_string(filedata, content_type=content_type)
        return dict(blob=new_blob, filedata=filedata, content_type=content_type,filename=filename, bucket=bucket)
    

    def get(self, bucket, filename):
        bucket = secure_filename(bucket)
        filename = secure_filename(filename)
        blob = self.get_blob(bucket, filename)
        filedata = blob.download_as_bytes()
        content_type = blob.content_type
        size = blob.size
        url = self.get_url(bucket, filename)
        return dict(blob=blob, filedata=filedata, content_type=content_type, filename=filename, bucket=bucket, size=size, url=url)

    
    def delete(self, bucket, filename):
        data = self.get(bucket, filename)
        data["blob"].delete()
        return data

    def move(self, oldbucket, new_bucket, filename, replace=False):
        data = self.delete(oldbucket, filename)
        new_data = self.upload(new_bucket, data["filename"], data["filedata"], data["content_type"], replace)
        return new_data

    def get_usage(self, bucket, filename):
        from app_essentials.products import Products
        try:
            prods = Products().__getattribute__(bucket)
            return [p._id for p in prods if filename in p.imatges]

        except:
            return []

    def get_brightness(self, bucket, filename):
        try:
            from PIL import Image, ImageStat
            import requests
            data = self.get(bucket, filename)
            im = Image.open(requests.get(data["url"], stream=True).raw).convert('L')
            stat = ImageStat.Stat(im)
            return stat.mean[0]
        except:
            print("Failed to calculate brightness")
            return 100





















class Localisation2:
    def __init__(self, lan="cat"):
        self.available_languages = ["cat", "en"]
        if lan not in self.available_languages:
            self.lan = self.available_languages[0]
        else:
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
        print("getting misc: {}:{}".format(label, value))
        try: 
            field = self.misc[label]
            if value is None:
                return field
            if value == "":
                return field
            return field[value]
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
            #print("loading misc: {}".format(page))
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
        #print("Loc load: page: {}, item: {}".format(page,name))
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
        #print(doc.__dict__)
        if not doc.exists:
            self.create_empy_page(page)
        try:
            doc = self.texts.document(page)
            doc.update({name:{"cat":"$empty$", "en":"$empty$"}})
        except:
            print("ERROR creating empty text ({}-{})".format(page,name))

    def create_empy_page(self, page):
        doc = self.texts.document(page).set({})






