



class Admin():
    def __init__(self):
        print("Admin setup")
        self.logged_in = False
        self.username = None


    def get_admins(self):
        #admins = json.loads(open("secure/admins.json").read())["admins"]

        admins = {"iain": "iain",
                      "nico": "nico"}
        #print(admins)
        return admins

    def restore_login(self, resp=None):
        print("Restoring login session")
        user = request.cookies.get('username')
        password = request.cookies.get('password')
        #self.check_login(user, password, resp)
        return user, password

    def check_login(self, username=None, password=None, resp=None, from_form=False):

        sprint("Checking login", username, password)
        if username is None and password is None:
            if from_form:
                try:
                    print1("From form")
                    username = request.form["user"]
                    password = request.form["password"]
                    print2(username, password)
                except:
                    print("Login failed")
                    return self.logout()
            else:
                print1("Not from form")
                username, password = self.restore_login()
                print2(username, password)
        if username in self.get_admins().keys():
            if password == self.get_admins()[username]:
                self.username = username
                return self.login(username, password, resp)
        else:
            return self.logout()
        #return make_response(redirect("/admin/login"))

    def save_login(self, username, password, resp=None):
        print1("Saving login")
        if resp is None:
            resp = make_response()
        try:
            resp.set_cookie("username", username)
            resp.set_cookie("password", password)
        except:
            print("Filed to save cookies")
        self.username = username
        return resp

    def login(self, username, password, resp=None):
        print1("Logging in user")
        self.logged_in = True
        if resp is None:
            resp = make_response(admin_page())
        return self.save_login(username, password, resp)

    def logout(self, resp=None):
        print1("Logging out")
        self.logged_in = False
        if resp is None:
            resp = redirect("/admin/login")
        return self.save_login("None", "None", resp=resp)
