# """
# API functions
# """
from .models import db, User

class UserController:
    def __init__(self):
        pass

    def get_users():
        users = User.query.all()
        return users if users else []
    
    def get_user(id):
        user = User.query.filter_by(id=id).first()
        return user if user else []

    def get_user_by_name(username):
        user = User.query.filter_by(username=username).first()
        return user if user else []

    def sign_in(username,password):
        user = User.query.filter_by(username=username,password=password).first()
        return user if user else []

    def create_user(username,password):
        user = User(username,password)
        db.session.add(user)
        db.session.commit()
