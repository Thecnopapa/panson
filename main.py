import os
import json

import flask
from flask import Flask, send_file, render_template
import requests
app = Flask(__name__)
base_url = "https://firestore.googleapis.com/v1/"
cols_path = base_url + "projects/panson/databases/productes/documents/collecions"


def get_col_data(path):
    url = base_url + path
    print("Getting data from url: ")
    print(url)
    data = json.loads(requests.get(url).text)
    name = url.split("/")[-1]
    description = ""
    if "fields" in data:
        print(data["fields"])
        description = data["fields"]["descripcio"]["stringValue"]
    return name, description


def get_collections():
    print("Getting all collections:")
    print(cols_path)
    all_cols = json.loads(requests.get(cols_path).text)["documents"]
    print(all_cols)
    print("")
    data=[]
    for col in all_cols:
        print(col)
        col_path = col["name"]
        print(col_path)
        name, description = get_col_data(col_path)
        print(name, description)
        data.append((name,description))
    html = render_template("collecio.html", data=data)
    #print(html)
    return html


@app.route("/")
def index():
    print(send_file('templates/index.html').mimetype)
    return render_template('index.html') + render_template( "navigation.html")

@app.route("/navigation")
def navigation():
    return render_template('navigation.html')

@app.route("/collecions")
def collections():
    html = get_collections()
    return html + render_template( "navigation.html")




def main():
    app.run(port=int(os.environ.get('PORT', 80)))

if __name__ == "__main__":
    main()
