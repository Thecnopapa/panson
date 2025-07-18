from main import project_id
from utilities import *
from flask import request
import os, sys
import datetime


import google.auth
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError


_scopes = ["https://www.googleapis.com/auth/drive"," https://www.googleapis.com/auth/calendar"]
credentials = service_account.Credentials.from_service_account_file(
        SERVICE_ACCOUNT_FILE, scopes=SCOPES)

try:
    cred = credentials.Certificate("secure/firebase_service_account_info.json")
    print(" * Firebase credentials loaded (secret)")
except:
    cred = credentials.Certificate(os.environ.get('FIREBASE_CREDENTIALS'))
    print(" * Firebase credentials loaded (local)")

def get_values(spreadsheet_id, range_name):
  """
  Creates the batch_update the user has access to.
  Load pre-authorized user credentials from the environment.
  TODO(developer) - See https://developers.google.com/identity
  for guides on implementing OAuth2 for the application.
  """
  creds, _ = google.auth.default()
  # pylint: disable=maybe-no-member
  try:
    service = build("sheets", "v4", credentials=creds)

    result = (
        service.spreadsheets()
        .values()
        .get(spreadsheetId=spreadsheet_id, range=range_name)
        .execute()
    )
    rows = result.get("values", [])
    print(f"{len(rows)} rows retrieved")
    return result
  except HttpError as error:
    print(f"An error occurred: {error}")
    return error



def sheets():
    sheet=get_values("18mfuB_yEj5UcQuEwINkHl9RXb7kceJydF9j7moXQn9U",  "A1:D6")
    print(sheet)
    return sheet