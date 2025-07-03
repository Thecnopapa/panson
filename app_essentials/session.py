from flask import session as flask_session


class Session:
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


session = Session()



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




