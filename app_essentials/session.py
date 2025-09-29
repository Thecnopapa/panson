import uuid

from flask import session
from app_essentials.users import User

from app_essentials.firebase import get_user_data


def get_current_user():
    from app_essentials.firebase import usuaris
    from google.cloud.firestore import FieldFilter
    print("getting current user")
    if "session_id" not in session:
        new_id = str(uuid.uuid4())
        print("new id", new_id)
        matching_ids = usuaris.where(filter=FieldFilter("sessions", "array_contains", new_id)).stream()
        print("matching_ids", matching_ids)
        while len(list(matching_ids)) > 0:
            new_id = str(uuid.uuid4())
            matching_ids = usuaris.where(filter=FieldFilter("sessions", "array_contains", new_id)).stream()
        session["session_id"] = str(uuid.uuid4())
        return User({}, session["session_id"])
    else:
        print("current id", session["session_id"])
        matching_user = list(usuaris.where(filter=FieldFilter("sessions", "array_contains", session["session_id"])).stream())
        print("matching_user", matching_user)
        if len(matching_user) == 1:
            target_id = matching_user[0].id
            return User(usuaris.document(target_id).get().to_dict(), target_id)
        else:
            return User({}, session["session_id"])




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



def get_session_id():
    return session.get("session_id", "no-id")
