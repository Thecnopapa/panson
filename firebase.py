from utilities import *
from flask import request
try:
    import firebase_admin
    from firebase_admin import credentials, firestore


    cred = credentials.Certificate("./secure/panson-791122483313.json")
    app = firebase_admin.initialize_app(cred)
    db = firestore.client(app, database_id="productes")

    sprint("Firebase initialized")
except Exception as e:
    sprint("Error importing Firebase:")
    print(e)
