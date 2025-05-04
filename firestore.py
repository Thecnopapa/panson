from google.cloud import storage
from utilities import *
from google.oauth2 import service_account
import json



credentials = service_account.Credentials.from_service_account_file(
    os.environ.get('GOOGLE_APPLICATION_CREDENTIALS'))
storage_client = storage.Client(credentials=credentials, project="panson")
bucket = storage_client.bucket("panson.firebasestorage.app")


sprint("Firestore initialized")



def list_blobs(prefix = None ):
    sprint("Lists all the blobs in the bucket")
    bucket_name = "panson.firebasestorage.app"

    print(storage_client)

    # Note: Client.list_blobs requires at least package version 1.17.0.

    print(bucket.__dict__)
    blobs = bucket.list_blobs(prefix=prefix)
    print(blobs.__dict__)

    # Note: The call returns a response only when the iterator is consumed.
    blob_list = []
    for blob in blobs:
        blob_list.append(blob.name)

    return blob_list
