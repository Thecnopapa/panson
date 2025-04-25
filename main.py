import os
import json
from flask import Flask, send_file
import requests
app = Flask(__name__)
base_url = "https://firestore.googleapis.com/v1/"
cols_path = base_url + "projects/panson/databases/productes/documents/collecions"


def get_col_data(col):
    url = base_url + col
    print(url)
    response = json.loads(requests.get(url).text)
    print(response)
    return response

def test():

    response = json.loads(requests.get(cols_path).text)
    print(response)
    col_list = []
    for col in response["documents"]:
        print(col)
        col_list.append(get_col_data(col["name"]))

    return col_list




@app.route("/")
def index():
    return send_file('src/index.html')

@app.route("/collecions")
def collecions():
    built = ""
    cols = get_collecions()
    for col in cols:
      built += render_template('collecions.html', id = col["id"])
    return built
def main():
    app.run(port=int(os.environ.get('PORT', 80)))

if __name__ == "__main__":
    main()
