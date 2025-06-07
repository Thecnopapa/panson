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


from firestore import upload_image

def update_firebase(id):
    sprint("Updating product: {}".format(id))
    print(request.form)
    data = {}
    for key, value in request.form.items():
        if key == "file":
            print("IMG:", value)
            print(os.listdir("./"))
            #upload_image(value, "test", value)
            print(request.__dict__)
            if "file" in request.files:
                print("FILE:", request.files["file"])
                print(request.files["file"])
            else:
                print("FILES:", request.files)
                #for file in request.file["file"]:



        elif ":" in key:
            data_type = key.split(":")[0]
            db_key = key.split(":")[1]
            if data_type == "text":
                data[db_key] = value
            if data_type == "bool":
                data[db_key] = True if value in ["true", "on", True ,"1", 1, "True"] else False
    print(data)
    productes.document(id).set(data, merge=True)



