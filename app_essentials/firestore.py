import os.path

from firebase_admin.project_management import list_ios_apps
from google.cloud import storage
from utilities import *
from google.oauth2 import service_account
import json
from flask import request
from werkzeug.utils import secure_filename

try:
    '''SCOPES = ['https://www.googleapis.com/auth/sqlservice.admin']
    SERVICE_ACCOUNT_FILE = '/path/to/service.json'

    credentials = service_account.Credentials.from_service_account_file(
        SERVICE_ACCOUNT_FILE, scopes=SCOPES)


    print("Service account json")
    print(os.environ.get('GOOGLE_APPLICATION_CREDENTIALS'))
    #try:
    service_account_info = os.environ.get('GOOGLE_APPLICATION_CREDENTIALS')
    print("Service account info")
    print(service_account_info)

    credentials = service_account.Credentials.from_service_account_info(service_account_info, scopes=SCOPES)
    service_account.Credentials()
    #except:
        #credentials = service_account.Credentials.from_service_account_file(os.environ.get('GOOGLE_APPLICATION_CREDENTIALS'))

    print(credentials)'''
    #try:
        #credentials = service_account.Credentials.from_service_account_file(os.environ.get('GOOGLE_APPLICATION_CREDENTIALS'))
        #storage_client = storage.Client(credentials=credentials, project="panson")
    # except:
    #    storage_client = storage.Client(project="panson")
    try:
        credentials = service_account.Credentials.from_service_account_file(
            "secure/firestore_service_account_info.json")
        print1("Credentials loaded from secret")
    except:
        credentials = service_account.Credentials.from_service_account_file(
            os.environ.get('GOOGLE_APPLICATION_CREDENTIALS'))
        print1("Credentials loaded from environment")

    storage_client = storage.Client(credentials=credentials, project="panson")
    bucket = storage_client.bucket("panson.firebasestorage.app")


    print1("Firestore initialized")
except Exception as e:
    sprint("Error importing Firestore:")
    print(e)


def list_blobs(prefix = None ):
    try:
        #sprint("Lists all the blobs in {}/".format(prefix))

        #print(storage_client)

        # Note: Client.list_blobs requires at least package version 1.17.0.

        #print(bucket.__dict__)
        blobs = bucket.list_blobs(prefix=prefix)
        #print(blobs.__dict__)

        # Note: The call returns a response only when the iterator is consumed.
        blob_list = []
        for blob in blobs:
            blob_list.append(blob.name)
            #print1(blob.name)
        return blob_list
    except:
       return []


def load_files(folder= "./uploads", name="file", target_folder= "productes"):
    sprint("loading files")
    if request.method == "POST":
        files =  request.files.getlist(name)
        paths = {}
        if len(files) == 0:
            return paths
        for file in files:

            filename = secure_filename(file.filename)
            print(filename)
            if filename == "":
                continue

            if target_folder + "/" + filename in list_blobs(target_folder):
                filename = filename.split(".")[0] + "_copia." + filename.split(".")[1]
            os.makedirs(folder, exist_ok=True)
            path = os.path.join(folder, file.filename)
            print(os.path.abspath(path))
            file.save(path)
            paths[filename] = os.path.abspath(path)
        return paths


def upload_images(path_dict, folder="productes"):
    sprint("Uploading images")
    for fname, path in path_dict.items():
        if folder+"/"+fname in list_blobs(folder):
            fname = fname.split(".")[0] +"_copia."+os.path.splitext(fname)[1]
        new_blob = bucket.blob(folder+"/"+fname)
        new_blob.upload_from_filename(path)
    return list(path_dict.keys())


