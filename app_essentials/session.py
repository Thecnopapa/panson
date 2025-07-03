import uuid

from flask import session as session


from app_essentials.firebase import get_user_data


'''class Session:
    @staticmethod
    def __getattr__(key):
        return flask_session.__getitem__(key)

    def __setattr__(self, key, value):
        try:
            flask_session.__setitem__(key, value)
            return key, value
        except: return None

    def __getitem__(self, key):
        return flask_session.__getitem__(key)

    def __setitem__(self, key, value):
        try:
            flask_session.__setitem__(key, value)
            return key, value
        except: return None
    
    def __contains__(self, key):

    def to_dict(self):
        return {key:value for key, value in flask_session}

session = Session()'''

def get_updated_session():
   if "session_id" not in session:
       session["session_id"] = str(uuid.uuid4())
   return get_user_data(session["session_id"])



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




