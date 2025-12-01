from flask import Blueprint, request, jsonify  
from flask_jwt_extended import create_access_token, jwt_required  
from werkzeug.security import generate_password_hash, check_password_hash  
from api.models import db, User, Vehicle

api = Blueprint("api", __name__)

# -------------------------------------------------------------------
# TEST
# -------------------------------------------------------------------
@api.route("/hello", methods=["GET"])
def hello():
    return jsonify({"message": "Hello World!"})


# -------------------------------------------------------------------
# USERS
# -------------------------------------------------------------------

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
    role = data.get("role", "operator")
    active = data.get("active", True)

    if not username or not password or not email:
        return jsonify({"error": "Missing required fields"}), 400

    # prevent duplicated username
    if User.query.filter_by(username=username).first():
        return jsonify({"error": "Username already exists"}), 400

    # check if an admin already exists
    admin_exists = User.query.filter_by(role="admin").first()

    # if admin exists, no more admins can be created
    if admin_exists and role == "admin":
        return jsonify({"error": "Admin already exists"}), 403

    # if admin already exists → force role = operator
    if admin_exists:
        role = "operator"

    new_user = User(
        username=username,
        password=generate_password_hash(password),
        email=email,
        role=role,
        active=active
    )

    db.session.add(new_user)
    db.session.commit()

    return jsonify(new_user.serialize()), 201


@api.route("/users/<int:user_id>", methods=["GET"])
@jwt_required()
def get_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    return jsonify(user.serialize())


@api.route("/users/<int:user_id>", methods=["PUT"])
@jwt_required()
def update_user(user_id):
    data = request.get_json()
    user = User.query.get(user_id)

    if not user:
        return jsonify({"error": "User not found"}), 404

    if "username" in data: user.username = data["username"]
    if "password" in data: user.password = generate_password_hash(data["password"])
    if "email" in data: user.email = data["email"]
    if "role" in data: user.role = data["role"]
    if "active" in data: user.active = data["active"]

    db.session.commit()
    return jsonify(user.serialize())


@api.route("/users/<int:user_id>", methods=["DELETE"])
@jwt_required()
def delete_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    db.session.delete(user)
    db.session.commit()

    return jsonify({"message": "User deleted"}), 200


# -------------------------------------------------------------------
# LOGIN
# -------------------------------------------------------------------
@api.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return jsonify({"error": "Missing credentials"}), 400

    user = User.query.filter_by(username=username).first()

    if not user or not check_password_hash(user.password, password):
        return jsonify({"error": "Invalid username or password"}), 401

    access_token = create_access_token(identity=user.id)
    return jsonify({"access_token": access_token, "user": user.serialize()}), 200


# -------------------------------------------------------------------
# VEHICLES
# -------------------------------------------------------------------
@api.route("/vehicles", methods=["GET"])
@jwt_required()
def get_vehicles():
    vehicles = Vehicle.query.all()
    return jsonify([vehicle.serialize() for vehicle in vehicles])


@api.route("/vehicles", methods=["POST"])
@jwt_required()
def create_vehicle():
    data = request.get_json()
    plate = data.get("plate", "").strip().upper()
    status = data.get("status")
    description = data.get("description")

    if not plate or not status:
        return jsonify({"error": "Missing required fields"}), 400

    if Vehicle.query.filter_by(plate=plate).first():
        return jsonify({"error": "Plate already exists"}), 400

    vehicle = Vehicle(
        plate=plate,
        status=status,
        description=description
    )
    db.session.add(vehicle)
    db.session.commit()

    return jsonify(vehicle.serialize()), 201



# -------------------------------------------------------------------
# CHECK PLATES
# -------------------------------------------------------------------
@api.route("/check-plates", methods=["POST"])
def check_plates():
    data = request.get_json()
    plate = data.get("plate", "").strip().upper()

    if not plate:
        return jsonify({"error": "Missing plate"}), 400

    vehicle = Vehicle.query.filter_by(plate=plate).first()

    if vehicle:
        return jsonify({
            "plate": plate,
            "exists": True,
            "status": vehicle.status,        
            "description": vehicle.description
        }), 200

    # NO existe en la base
    return jsonify({
        "plate": plate,
        "exists": False,
        "status": "not_found"
    }), 200

