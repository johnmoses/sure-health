from flask import Blueprint, request, jsonify
from marshmallow import ValidationError
from .models import User
from .schemas import UserSchema
from app.extensions import db
from flask_jwt_extended import create_access_token

auth_bp = Blueprint("auth", __name__)
user_schema = UserSchema()

@auth_bp.route("/register", methods=["POST"])
def register():
    json_data = request.get_json()
    if not json_data:
        return jsonify({"msg": "No input data"}), 400
    try:
        data = user_schema.load(json_data)
    except ValidationError as err:
        return jsonify(err.messages), 422
    if User.query.filter_by(username=data["username"]).first():
        return jsonify({"msg": "User already exists"}), 400
    user = User(username=data["username"], role=data["role"])
    user.set_password(data["password"])
    db.session.add(user)
    db.session.commit()
    return jsonify({"user": user_schema.dump(user), "msg": "User registered"}), 201


@auth_bp.route("/login", methods=["POST"])
def login():
    json_data = request.get_json()
    if not json_data:
        return jsonify({"msg": "No input data"}), 400
    try:
        data = user_schema.load(json_data)
    except ValidationError as err:
        return jsonify(err.messages), 422
    user = User.query.filter_by(username=data["username"]).first()
    if not user or not user.check_password(data["password"]):
        return jsonify({"msg": "Invalid username or password"}), 401
    access_token = create_access_token(identity=user.id)
    return jsonify({"user": user_schema.dump(user), "access_token": access_token, "msg": "Login successful"}), 200
