
class Utils:
    @staticmethod
    def upper(string):
        return string.upper()

    @staticmethod
    def sum(*i ):
        return sum(*i)

    @staticmethod
    def len(i):
        return len(i)

    @staticmethod
    def str(s):
        return str(s)

    @staticmethod
    def type(s):
        return type(s)

    @staticmethod
    def strip(s):
        return s.strip()

    @staticmethod
    def enumerate(l):
        return enumerate(l)

    @staticmethod
    def str_to_list(str, delimiter=","):
        return str_to_list(str, delimiter)

def str_to_list(string, delimiter=","):
    if type(string) is list:
        return string
    ls = string.replace("[", "").replace("]", "").split(delimiter)
    return [l.replace("\'", "").strip() for l in ls]


def get_opcions():
    from flask import request
    opcions = {}
    opcions["material"] = request.args.get("material")
    opcions["variacio"] = request.args.get("variacio")
    opcions["talla"] = request.args.get("talla")
    opcions["color"] = request.args.get("color")
    if opcions["color"] is not None:
        if opcions["color"][0] == "[":
            opcions["color"] = opcions["color"].replace("[", "").replace("]", "").split("-")
        if len(opcions["color"]) == 0:
            opcions["color"] = "None"
    return opcions
