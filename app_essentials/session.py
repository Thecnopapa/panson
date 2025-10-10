import uuid

from flask import session
from app_essentials.users import User

from app_essentials.firebase import get_user_data


def get_current_user():
    from app_essentials.firebase import usuaris
    from google.cloud.firestore import FieldFilter
    print("getting current user")
    print(session)
    if "user_id" in session.keys():
        print("getting from usr_id")
        user_data = usuaris.document(session["user_id"]).get().to_dict()
        if user_data is None:
            print("user_id not found in database")
            user_data = {}
        return User(user_data, session["user_id"])
    if "session_id" not in session.keys():
        print("getting from new session_id")
        new_id = str(uuid.uuid4())
        print("new id", new_id)
        matching_ids = usuaris.where(filter=FieldFilter("sessions", "array_contains", new_id)).stream()
        print("matching_ids", matching_ids)
        while len(list(matching_ids)) > 0:
            new_id = str(uuid.uuid4())
            matching_ids = usuaris.where(filter=FieldFilter("sessions", "array_contains", new_id)).stream()
        session["session_id"] = new_id
        session["user_id"] = session["session_id"]
        print(session["session_id"], session)
        return User({}, session["session_id"])
    else:
        print("getting from session_id")
        print("current id", session["session_id"])
        matching_user = list(usuaris.where(filter=FieldFilter("sessions", "array_contains", session["session_id"])).stream())
        print("matching_user", matching_user)
        if len(matching_user) == 1:
            print("user found")
            target_id = matching_user[0].id
            session["user_id"] = session["session_id"]
            return User(usuaris.document(target_id).get().to_dict(), target_id)
        else:
            print("user not found")
            session["user_id"] = session["session_id"]
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
