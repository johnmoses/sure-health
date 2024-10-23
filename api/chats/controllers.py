# """
# API functions
# """
from sqlalchemy import desc, text
from sqlalchemy.dialects.postgresql import insert
from .models import db, Chat, Message
from users.models import User, ChatsUsers


class ChatController:
    def __init__():
        pass

    def get_chat(id):
        chat = Chat.query.filter_by(id=id).first()
        return chat if chat else []

    def get_chats():
        chat = Chat.query.all()
        return chat if chat else []

    def get_user_chats(user_id):
        chats = Chat.query.filter(Chat.participants.any(
            id=user_id)).all()
        return chats if chats else []

    def create_chat(name,user_id):
        insert_stmt = text(
            "INSERT INTO chats_chat(name) values(:name) returning(chats_chat.id)")
        db.session.execute(
            insert_stmt, {'name':name})
        select_stmt = text("SELECT * FROM chats_chat WHERE name = :name")
        res = db.session.execute(select_stmt, {'name': name})
        if res:
            chatid = res.fetchone()[0]
            db.session.execute(
                ChatsUsers.__table__.insert(),
                {'chat_id': chatid, 'user_id': user_id}
            )
            db.session.commit()

    def join_chat(chat_id, user_id):
        chat = Chat.query.filter_by(id=chat_id).first()
        db.session.execute(
            ChatsUsers.__table__.insert(),
            {'chat_id': chat_id, 'user_id': user_id}
        )
        db.session.commit()

    def leave_chat(chat_id, user_id):
        # chatuser = ChatsUsers.query.filter_by(chat_id=chat_id,user_id=user_id)
        delete_stmt = text(
            "DELETE FROM chats_users WHERE chat_id=:chat_id AND user_id=:user_id")
        delete_values = {'chat_id': chat_id, 'user_id': user_id}
        db.session.execute(delete_stmt, delete_values)
        # db.session.delete(chatuser)
        db.session.commit()


    def get_chat_messages(chat_id):
        msgs = Message.query.filter(Message.chat_id==chat_id).all()[::-1]
        return msgs if msgs else []

    def create_message(content, chat_id, sender_id):
        msg = Message(content, chat_id, sender_id)
        chat = Chat.query.filter_by(id=chat_id).first()
        db.session.add(msg)
        db.session.commit()