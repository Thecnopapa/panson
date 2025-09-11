import os.path

from firebase_admin.project_management import list_ios_apps
from google.cloud import storage
from utilities import *
from google.oauth2 import service_account
import json
from flask import request
from werkzeug.utils import secure_filename
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
        print(" * Firestore credentials loaded (secret)")
    except:
        credentials = service_account.Credentials.from_service_account_file(
            os.environ.get('FIRESTORE_CREDENTIALS'))
        print(" * Firestore credentials loaded (local)")

    storage_client = storage.Client(credentials=credentials, project="panson")
    db = storage_client.bucket("panson.firebasestorage.app")


    print(" * Firestore initialized")
except Exception as e:
    sprint("Error importing Firestore:")
    print(e)


def list_blobs(prefix = None ):
    try:
        #sprint("Lists all the blobs in {}/".format(prefix))

        #print(storage_client)

        # Note: Client.list_blobs requires at least package version 1.17.0.

        #print(bucket.__dict__)
        blobs = db.list_blobs(prefix=prefix)
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

            while target_folder + "/" + filename in list_blobs(target_folder):
                filename = filename.split(".")[0] + "_copia." + filename.split(".")[1]
            os.makedirs(folder, exist_ok=True)
            path = os.path.join(folder, file.filename)
            print(os.path.abspath(path))
            file.save(path)
            paths[filename] = os.path.abspath(path)
        return paths


def upload_images(path_dict, bucket):
    sprint("Uploading images to: ", bucket)
    fnames = []
    for fname, path in path_dict.items():
        print1(fname)
        print2(path)
        print1(bucket+"/"+fname)
        [print2(f) for f in list_blobs(bucket)]
        while bucket+"/"+fname in list_blobs(bucket):
            fname = fname.split(".")[0] +"_copia"+os.path.splitext(fname)[1]
        print("Final fname: ", fname)
        new_blob = db.blob(bucket+"/"+fname)
        new_blob.upload_from_filename(path)
        fnames.append(fname)
    print1("Uploaded images")
    return fnames

class Storage:
    def __init__(self):
        self.base_url = "https://firebasestorage.googleapis.com/v0/b/panson.firebasestorage.app/o/{}?alt=media"

    def get(self, folder, file):
        file = secure_filename(file)
        if folder is None:
            return self.base_url.format(file)
        folder = secure_filename(folder)
        return self.base_url.format(folder+"%2F"+file)

