print("importing firestore.py")



import firebase_admin
from firebase_admin import credentials



print("Firestore imported")


# Initialize Firebase Admin SDK (if not already initialized)
# Replace 'path/to/your/serviceAccountKey.json' with the actual path
cred = credentials.Certificate(".secure/panson-129fa5c973a8.json")
app = firebase_admin.initialize_app(cred)




print("credentials initialized")
from firebase_admin import firestore
db = firestore.client(app, database_id="productes")
print("firestore client initialized")



'''from google.cloud import firestore
db = firestore.Client(project="panson", credentials=cred, database="productes")
'''


#collecions = db.collection("collecions")
productes = db.collection("productes")




def get_products_by_collecio(collecio_value):


    query = productes.where("collecio", "==", collecio_value)
    #(query.__dict__)
    #print(query.get())
    #docs = query.stream()

    #for doc in docs:
    #    print(f"{doc.id} => {doc.to_dict()}")

# Example usage: Get products where 'collecio' is 'winter2024'
get_products_by_collecio("serpentina")


def new_product(id):
    from flask import request

    input_text = request.form["mytext"]
    print(input_text)

    productes.document(id).set({"nom": id, "descripcio":input_text})