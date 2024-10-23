import datetime
from config.db import db


class ChatsUsers(db.Model):
    __tablename__ = 'chats_users'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    chat_id = db.Column(db.Integer, db.ForeignKey("chats_chat.id"))
    user_id = db.Column(db.Integer, db.ForeignKey("User.id"))

    chat = db.relationship('Chat', backref='chatsuserschat', cascade='all,delete')
    user = db.relationship('User', backref='chatsusersuser', cascade='all,delete')


class User(db.Model):
    __tablename__ = 'User'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    username = db.Column(db.String(20), nullable=False)
    password = db.Column(db.String(20), nullable=False)

    chats = db.relationship("Chat", backref="userchats",secondary="chats_users", viewonly=True, cascade='all,delete')
    
    def __init__(self, username, password):
        self.username = username
        self.password = password

    def __repr__(self):
        return 'User {}'.format(self.id)
