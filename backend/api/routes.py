from flask import Blueprint, request, jsonify # type: ignore
from flask_jwt_extended import create_access_token, get_jwt_identity, jwt_required, get_current_user # type: ignore
from werkzeug.security import generate_password_hash, check_password_hash # type: ignore
from api.models import db, User

from .utils.email_utils import send_email  

api = Blueprint("api", __name__)


@api.route("/hello", methods=["GET"])
def hello():
    return jsonify({"message": "Hello World!"})

@api.route("/users", methods=["GET"])
def get_users():
    users = User.query.all()
    return jsonify([user.serialize() for user in users])

@api.route("/users", methods=["POST"])
def create_user():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")
    email = data.get("email")
    active = data.get("active")
    
    if not username or not password or not email:
        return jsonify({"error": "Missing required fields"}), 400
    
    user = User.query.filter_by(username=username).first()
    if user:
        return jsonify({"error": "Username already exists"}), 400
    
    user = User(username=username, password=generate_password_hash(password), email=email, active=active)
    db.session.add(user)
    db.session.commit()
    
    return jsonify(user.serialize()), 201

@api.route("/users/<int:user_id>", methods=["GET"])
def get_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    return jsonify(user.serialize())

@api.route("/users/<int:user_id>", methods=["PUT"])
def update_user(user_id):
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")
    email = data.get("email")
    active = data.get("active")
    
    if not username and not password and not email and not active:
        return jsonify({"error": "Missing required fields"}), 400
    
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    if username:
        user.username = username
    if password:
        user.password = generate_password_hash(password)
    if email:
        user.email = email
    if active:
        user.active = active
    
    db.session.commit()
    
    return jsonify(user.serialize())

@api.route("/users/<int:user_id>", methods=["DELETE"])
def delete_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    db.session.delete(user)
    db.session.commit()
    
    return jsonify({"message": "User deleted"}), 204