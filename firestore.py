import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore

# Initialize Firebase Admin SDK (if not already initialized)
# Replace 'path/to/your/serviceAccountKey.json' with the actual path
cred = credentials.Certificate("path/to/your/serviceAccountKey.json")
firebase_admin.initialize_app(cred)

db = firestore.client()
productes_ref = db.collection("productes")

def get_products_by_collecio(collecio_value):
    query = productes_ref.where("collecio", "==", collecio_value)
    docs = query.stream()

    for doc in docs:
        print(f"{doc.id} => {doc.to_dict()}")

# Example usage: Get products where 'collecio' is 'winter2024'
get_products_by_collecio("serpentina")
