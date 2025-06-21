from pymongo import MongoClient

def connect_to_db(uri, db_name, collection_name):
    client = MongoClient(uri)
    db = client[db_name]
    collection = db[collection_name]
    return collection