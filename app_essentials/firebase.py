from utilities import *
from flask import request
import os, sys
import datetime


import firebase_admin
from google.cloud.firestore import FieldFilter
from firebase_admin import credentials, firestore
from google.oauth2 import service_account
#if "FIREBASE_CREDENTIALS" in os.environ:
_scopes = [
    'https://www.googleapis.com/auth/cloud-platform',
    'https://www.googleapis.com/auth/datastore',
    'https://www.googleapis.com/auth/devstorage.read_write',
    'https://www.googleapis.com/auth/firebase',
    'https://www.googleapis.com/auth/identitytoolkit',
    'https://www.googleapis.com/auth/userinfo.email'
]
#print(os.environ.get('FIREBASE_CREDENTIALS'))
#try:
#    credentials.Certificate(os.environ.get('FIREBASE_CREDENTIALS'))
#except:
#    cred = service_account.Credentials.from_service_account_info(os.environ.get('FIREBASE_CREDENTIALS'), scopes=_scopes)
#app = firebase_admin.initialize_app(cred)
#else:
#cred = credentials.ApplicationDefault()


try:
    cred = credentials.Certificate("secure/firebase_service_account_info.json")
    print(" * Firebase credentials loaded (secret)")
except:
    cred = credentials.Certificate(os.environ.get('FIREBASE_CREDENTIALS'))
    print(" * Firebase credentials loaded (local)")
app = firebase_admin.initialize_app(cred)
# projects/746452924859/secrets/firestore_credentials
db = firestore.client(app, database_id="productes")
prods = db.collection("productes")
usuaris = db.collection("usuaris")
collections = db.collection("collecions")
admins = db.collection("admins")
localisation = db.collection("localisation")
bespoke = db.collection("bespoke")

print(" * Firebase initialized")



class firebaseObject(object):
    bucket = None
    def __init__(self,data, id = None):
        self._data = data
        for key, value in data.items():
            setattr(self, key, value)
        self._id = id

    def __repr__(self):
        return "\n".join(["> {}:".format(self.__class__.__name__), *["    > {} ({}): {}".format(k,type(v).__name__, v) for k,v in self.__dict__.items() if k != "data"]])+"\n"

    def __html__(self):
        return "<br>".join(["&nbsp&nbsp> {}:".format(self.__class__.__name__), *["&nbsp&nbsp&nbsp> {} ({}): {}".format(k,type(v).__name__, v) for k,v in self.__dict__.items()  if k != "data"]])+"<br>"

    def update_db(self, bucket=None):
        if bucket is None:
            bucket = self.bucket
        data = {k:v for k,v in self.__dict__.items() if not k.startswith("_")}
        data["_timestamp"] = datetime.datetime.utcnow().isoformat()
        db.collection(bucket).document(self._id).set(data)


    def keys(self):
        return list(self.__dict__.keys())

    def __setitem__(self, key, value):
        self.__setattr__(key, value)

    def __getitem__(self, key):
        return self.__getattribute__(key)

def check_if_admin(username, password):
    raw = admins.where(filter=FieldFilter("username", "==", username )).where(filter=FieldFilter("password", "==", password )).stream()
    match = [a for a in raw]
    if len(match) == 1:
        return True
    else:
        return False

def get_products():
    raw = prods.where(filter=FieldFilter("esborrat", "==", False, )).stream()
    ps = {p.id:p.to_dict() for p in raw}
    return ps


def get_bespoke():
    raw = bespoke.where(filter=FieldFilter("esborrat", "==",False, )).stream()
    ps = {p.id:p.to_dict() for p in raw}
    return ps


def get_cols():
    raw = collections.where(filter=FieldFilter("activa", "==", True, )).stream()
    cols = {c.id:c.to_dict() for c in raw}
    cols = dict(sorted(cols.items(), key=lambda col: col[1]["ordre"]))
    return cols

def get_user_data(id):
    from app_essentials.users import User
    r = usuaris.document(id).get().to_dict()
    if r is None:
        print("No such user")
        new_user = User({}, id)
        new_user.update_db()
        return new_user
    return User(usuaris.document(id).get().to_dict(),id)











from app_essentials.firestore import load_files, upload_images

def update_firebase(id, new, taken_ids):
    sprint("Updating product: {}".format(id))
    #print(request.form)
    paths = load_files(target_folder="productes")
    uploaded_images = upload_images(paths, "productes")
    data = {}
    data["imatges"] = []
    for key, value in request.form.items():
        if key == "img_list":
            if value != "":
                data["imatges"].append(value)
        elif ":" in key:
            data_type = key.split(":")[0]
            db_key = key.split(":")[1]
            if db_key == "id":
                id = value
            if data_type == "text":
                data[db_key] = value
            if data_type == "bool":
                data[db_key] = True if value in ["true", "on", True ,"1", 1, "True"] else False
    data["imatges"] = data["imatges"] + uploaded_images
    #print(data)
    if new:
        n = 1
        new_id = id
        while new_id in taken_ids:
            new_id = id+"_{}".format(n)
            n+=1
        id = new_id
    data["id"] = id
    prods.document(id).set(data, merge=True)

def delete_firebase(id):
    sprint("Deleting product: {}".format(id))
    prods.document(id).set({"esborrat": True}, merge=True)




