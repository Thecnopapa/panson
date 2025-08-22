import os.path
import time
import webbrowser
from flask import request, redirect
import firebase_admin
from google.cloud.firestore import FieldFilter
from firebase_admin import credentials, firestore
from google.oauth2 import service_account


from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError


persistent_google_login = None

# If modifying these scopes, delete the file token.json.
SCOPES = ["https://www.googleapis.com/auth/gmail.readonly"]


def emailAPI():

  creds = None

  if os.path.exists("token.json"):
    creds = Credentials.from_authorized_user_file("token.json", SCOPES)
  # If there are no (valid) credentials available, let the user log in.
  if not creds or not creds.valid:
    if creds and creds.expired and creds.refresh_token:
      creds.refresh(Request())
    else:
        google_login()

  try:
    # Call the Gmail API
    service = build("gmail", "v1", credentials=creds)
    results = service.users().labels().list(userId="me").execute()
    labels = results.get("labels", [])

    if not labels:
      print("No labels found.")
      return
    print("Labels:")
    for label in labels:
      print(label["name"])

  except HttpError as error:
    # TODO(developer) - Handle errors from gmail API.
    print(f"An error occurred: {error}")


def persistent_google_login():
    flow = InstalledAppFlow.from_client_secrets_file(
        "secure/client_webserver1.json", SCOPES,
        #redirect_uri=request.url_root + "auth/token"
    )
    # Tell the user to go to the authorization URL.
    auth_url, state = flow.authorization_url(prompt='consent')
    print('Please go to this URL: {}'.format(auth_url))
    webbrowser.open_new_tab(auth_url)
    i = 0
    while i < 10:
        print(state)
        time.sleep(1)


    # The user will get an authorization code. This code is used to get the
    # access token.
    code = input('Enter the authorization code: ')
    flow.fetch_token(code=code)

    # You can use flow.credentials, or you can just get a requests session
    # using flow.authorized_session.
    session = flow.authorized_session()
    print(session.get('https://www.googleapis.com/userinfo/v2/me').json())


def persistent_google_token_save():
    import json
    with open("secure/token.json", "w") as token:
        token.write(json.dumps(request.args))
        print(request.args)



