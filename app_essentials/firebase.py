from utilities import *
from flask import request
from werkzeug.utils import secure_filename
import os, sys
try:
    import firebase_admin
    from google.cloud.firestore import FieldFilter
    from firebase_admin import credentials, firestore
    if "FIREBASE_CREDENTIALS" in os.environ:
        cred = credentials.Certificate(os.environ.get('FIREBASE_CREDENTIALS'))
        app = firebase_admin.initialize_app(cred)
    else:
        app = firebase_admin.initialize_app()

    db = firestore.client(app, database_id="productes")
    prods = db.collection("productes")
    usuaris = db.collection("usuaris")
    collections = db.collection("collecions")

    sprint("Firebase initialized")
except Exception as e:
    sprint("Error importing Firebase:")
    print(e)


class firebaseObject(object):
    def __init__(self,data, id = None):
        self.data = data
        for key, value in data.items():
            setattr(self, key, value)
        self._id = id

    def __repr__(self):
        return "\n".join(["> {}:".format(self.__class__.__name__), *["    > {} ({}): {}".format(k,type(v).__name__, v) for k,v in self.__dict__.items() if k != "data"]])+"\n"

    def __html__(self):
        return "<br>".join(["&nbsp&nbsp> {}:".format(self.__class__.__name__), *["&nbsp&nbsp&nbsp> {} ({}): {}".format(k,type(v).__name__, v) for k,v in self.__dict__.items()  if k != "data"]])+"<br>"


def get_products():
    raw = prods.where(filter=FieldFilter("esborrat", "==", False, )).stream()
    #print([p.id for p in raw])
    #print([p.to_dict() for p in raw])
    ps = {p.id:p.to_dict() for p in raw}
    #print([p for p in ps.items()])
    return ps

def get_cols():
    raw = collections.where(filter=FieldFilter("activa", "==", True, )).stream()
    cols = [col.to_dict() for col in raw]
    return cols

def get_user_data(id):
    r = usuaris.document(id).get().to_dict()
    if r is None:
        print("No such user")
        new_id = usuaris.document(id).set({})
    return usuaris.document(id).get().to_dict()



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
    print(data)
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




