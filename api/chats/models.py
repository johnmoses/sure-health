import datetime
from config.db import db

class Chat(db.Model):
    __tablename__ = 'chats_chat'

    id = db.Column(db.BigInteger(), primary_key=True, autoincrement=True)
    name = db.Column(db.String(50), nullable=False)
    description = db.Column(db.String(100), nullable=True)

    participants = db.relationship('User', backref='chatschatparticipants', secondary='chats_users', viewonly=True, cascade='all,delete')
    messages = db.relationship('Message', backref='chatschatmessages', cascade='all,delete')

    def __init__(self, name, description):
        self.name = name
        self.description = description

    def __repr__(self):
        return 'Chat {}'.format(self.id)


class Message(db.Model):
    __tablename__ = 'chats_message'

    id = db.Column(db.BigInteger(), primary_key=True, autoincrement=True)
    content = db.Column(db.Text(), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.datetime.now())
    chat_id = db.Column(db.Integer, db.ForeignKey('chats_chat.id'))
    sender_id = db.Column(db.Integer, db.ForeignKey('User.id'))

    chat = db.relationship("Chat", backref="chatsmessagechat", viewonly=True, cascade='all,delete')
    sender = db.relationship('User', backref="chatsmessagesender", cascade='all,delete')

    def __init__(self, content, chat_id, sender_id):
        self.content = content
        self.chat_id = chat_id
        self.sender_id = sender_id

    def __repr__(self):
        return 'Message {}'.format(self.id)
