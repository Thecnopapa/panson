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
    productes = db.collection("productes")

    sprint("Firebase initialized")
except Exception as e:
    sprint("Error importing Firebase:")
    print(e)


from firestore import load_files, upload_images

def update_firebase(id, producte):
    sprint("Updating product: {}".format(id))
    print(request.form)
    paths = load_files()
    uploaded_images = upload_images(paths, "productes")
    data = {}
    data["imatges"] = producte.imatges + uploaded_images
    for key, value in request.form.items():

        if ":" in key:
            data_type = key.split(":")[0]
            db_key = key.split(":")[1]
            if data_type == "text":
                data[db_key] = value
            if data_type == "bool":
                data[db_key] = True if value in ["true", "on", True ,"1", 1, "True"] else False
    print(data)
    productes.document(id).set(data, merge=True)



