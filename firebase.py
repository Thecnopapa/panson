from utilities import *
from flask import request
import os, sys
try:
    import firebase_admin
    from firebase_admin import credentials, firestore
    print(os.getcwd())
    print(os.listdir(os.getcwd()))
    print("/")
    print(os.listdir("/"))
    print("./")
    print(os.listdir("./"))

    cred = credentials.Certificate(os.environ.get('FIREBASE_CREDENTIALS'))
    app = firebase_admin.initialize_app(cred)
    db = firestore.client(app, database_id="productes")

    sprint("Firebase initialized")
except Exception as e:
    sprint("Error importing Firebase:")
    print(e)
