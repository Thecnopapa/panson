import os

from flask import Flask, send_file

app = Flask(__name__)

@app.route("/")
def index():
    return send_file('src/index.html')

@app.route("/collecions")
def collecions():
    return send_file('src/collecions.html')

def main():
    app.run(port=int(os.environ.get('PORT', 80)))

if __name__ == "__main__":
    main()
