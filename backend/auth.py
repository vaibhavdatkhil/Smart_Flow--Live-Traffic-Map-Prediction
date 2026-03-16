from flask import Blueprint, request, jsonify
from pymongo import MongoClient
from datetime import datetime

auth_bp = Blueprint("auth", __name__)

# MongoDB Atlas connection
client = MongoClient("mongodb+srv://prathameshdb:Pratham%401801@smartflow.r1dn2m6.mongodb.net/?appName=SmartFlow")
db = client["smartflow"]
users = db["users"]

print("✓ MongoDB Atlas connected successfully!")

# ---------------- REGISTER ----------------
@auth_bp.route("/register", methods=["POST"])
def register():

    data = request.json

    name = data.get("name")
    email = data.get("email")
    password = data.get("password")

    if users.find_one({"email": email}):
        return jsonify({"error": "User already exists"}), 400

    users.insert_one({
        "name": name,
        "email": email,
        "password": password,
        "created_at": datetime.utcnow()
    })

    return jsonify({
        "message": "Account created successfully",
        "user": {
            "name": name,
            "email": email
        }
    })


# ---------------- LOGIN ----------------
@auth_bp.route("/login", methods=["POST"])
def login():

    data = request.json

    email = data.get("email")
    password = data.get("password")

    user = users.find_one({"email": email})

    if not user:
        return jsonify({"error": "Invalid email"}), 401

    if user["password"] != password:
        return jsonify({"error": "Wrong password"}), 401

    return jsonify({
        "message": "Login successful",
        "user": {
            "name": user["name"],
            "email": user["email"]
        }
    })