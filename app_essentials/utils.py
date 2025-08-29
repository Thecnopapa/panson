import pandas as pd


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
    def lower(string):
        return string.lower()

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

    @staticmethod
    def sort_by_keys(data:dict, keys=None) -> dict:
        r = {k:v for k,v in sorted(data.items(), key=lambda x: x[0])}
        if keys is not None:
            if type(keys) is not list:
                keys = [keys]
            for key in keys:
                print(r, key)
                r = {k:v for k,v in sorted(r.items(), key=lambda x: x[1].get(key, False))}
        return r


    @staticmethod
    def float(*args, **kwargs):
        return float(*args, **kwargs)

    @staticmethod
    def mod(num1, num2):
        return num1 % num2

    @staticmethod
    def replace(string,old,new ):
        return string.replace(old,new)

    @staticmethod
    def table(path, *args, **kwargs):
        return table_to_html(path, *args, **kwargs)




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

def split_multiple(string, *delimiters):
    import re
    return re.split("|".join(delimiters), string)


def table_to_html(path, onclick_row="", onclick_cell=""):
    df = pd.read_excel(path)
    html = "<table>"
    html += "<tr>"
    for col in df.columns:
        html += f"<th>{col}</th>"
    html += "</tr>"
    for row in df.itertuples():
        html += f"<tr row={row[0]} onclick={onclick_row}>"
        for n, col in enumerate(row[1:]):
            if str(col) == "nan":
                col = ""
            html += f"<td col={n} val={col} onclick='{onclick_cell}'>{col}</td>"
        html += "</tr>"
    html += "</table>"
    return html


