import uuid

from flask import session as session
from app_essentials.users import User

from app_essentials.firebase import get_user_data


def get_current_user():
   if "session_id" not in session:
       session["session_id"] = str(uuid.uuid4())
   return User(get_user_data(session["session_id"]), session["session_id"])



class Cookies:
    def __init__(self):
        self.accepted = False

    def check_accepted(self):
        self.accepted = request.cookies.get('accepted_cookies') == "True"
        return self.accepted


    def set_accepted(self, resp, value=True):
        resp.set_cookie("accepted_cookies", str(value))
        self.accepted = value
        return resp




