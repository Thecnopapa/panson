from utilities import *
from flask import request
from werkzeug.utils import secure_filename
import os, sys
try:
    import firebase_admin
    from firebase_admin import credentials, firestore
    if "FIREBASE_CREDENTIALS" in os.environ:
        cred = credentials.Certificate(os.environ.get('FIREBASE_CREDENTIALS'))
        app = firebase_admin.initialize_app(cred)
    else:
        app = firebase_admin.initialize_app()

    db = firestore.client(app, database_id="productes")
    prods = db.collection("productes")
    usuaris = db.collection("usuaris")

    sprint("Firebase initialized")
except Exception as e:
    sprint("Error importing Firebase:")
    print(e)



def get_user_data(id):
    return



from firestore import load_files, upload_images

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




