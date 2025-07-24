from flask import Blueprint, request, jsonify
from flask_jwt_extended import (
    create_access_token,
    jwt_required,
    get_jwt_identity,
    get_jwt,
    create_refresh_token,
)
from app.extensions import db, jwt_blacklist
from .models import User
from .schemas import UserSchema

auth_bp = Blueprint("auth", __name__)

user_schema = UserSchema()
users_schema = UserSchema(many=True)


@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.json
    username = data.get("username")
    email = data.get("email")
    password = data.get("password")
    role = data.get("role", "clinician")

    if not username or not password:
        return jsonify({"error": "Username and password required"}), 400

    if User.query.filter_by(username=username).first():
        return jsonify({"error": "User already exists"}), 409

    user = User(username=username, email=email, role=role)
    user.set_password(password)
    db.session.add(user)
    db.session.commit()

    return jsonify({"message": "User registered successfully"}), 201


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.json
    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return jsonify({"error": "Username and password required"}), 400

    user = User.query.filter_by(username=username).first()
    if not user or not user.check_password(password):
        return jsonify({"error": "Invalid credentials"}), 401

    access_token = create_access_token(identity=user.id)
    refresh_token = create_refresh_token(identity=user.id)  # <-- create refresh token

    return jsonify(
        {
            "access_token": access_token,
            "refresh_token": refresh_token,  # <-- include refresh token here
            "user": {"id": user.id, "username": user.username, "role": user.role},
        }
    )


@auth_bp.route("/users", methods=["GET"])
def list_users():
    users = User.query.all()
    return users_schema.jsonify(users)


@auth_bp.route("/profile", methods=["GET"])
@jwt_required()
def profile():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    return jsonify({"id": user.id, "username": user.username, "role": user.role})


@auth_bp.route("/refresh", methods=["POST"])
@jwt_required(refresh=True)  # This endpoint requires a valid refresh token
def refresh():
    current_user_id = get_jwt_identity()
    new_access_token = create_access_token(identity=current_user_id)
    return jsonify(access_token=new_access_token)


@auth_bp.route("/logout/access", methods=["POST"])
@jwt_required()
def logout_access():
    jti = get_jwt()["jti"]
    jwt_blacklist.add(jti)
    return jsonify({"message": "Access token revoked"})


@auth_bp.route("/logout/refresh", methods=["POST"])
@jwt_required(refresh=True)
def logout_refresh():
    jti = get_jwt()["jti"]
    jwt_blacklist.add(jti)
    return jsonify({"message": "Refresh token revoked"})
