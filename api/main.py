import os
import time
from flask import Flask, render_template, request, redirect, url_for, session
from flask_socketio import SocketIO, emit, join_room, leave_room
from flask_cors import CORS
from flask_session import Session
from flask_migrate import Migrate
from users import bp as users_bp
from chats import bp as chats_bp
from config.base import Config
from config.db import db
from users.models import ChatsUsers
from chats.models import Chat, Message
from chats.controllers import ChatController

app = Flask(__name__)
app.config.from_object(Config)
app.config["SESSION_PERMANENT"] = False
app.config['SESSION_TYPE'] = 'filesystem'
app.config['SECRET_KEY'] = 'super secret key'

db.init_app(app)
migrate = Migrate(app, db, compare_type=True)

CORS(app, resources={r"/*": {"origins": "*"}})
socketio = SocketIO(
    app,
    # cors_allowed_origins="*"
    cors_allowed_origins=[
        "http://localhost",
        "http://localhost:3000",
        "http://localhost:5001",
        "http://localhost:8000",
        "http://127.0.0.1",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5001",
        "http://127.0.0.1:8000",
        "http://0.0.0.0",
        "http://0.0.0.0:3000",
    ]
)
Session(app)

app.register_blueprint(users_bp)
app.register_blueprint(chats_bp)

entity_vars = {}

@app.cli.command('initdb')
def initdb_command():
    """Drops and creates the database tables."""
    db.drop_all()
    db.create_all()
    print('Initialized the database.')


@app.route('/test/')
def test_page():
    return '<h1>Testing the Flask Application</h1>'


@app.route('/')
def index():
    if 'user_id' in session:
        print('user_id: ', session['user_id'])
        return redirect(url_for('chats.chat'))
    return render_template('index.html')


@socketio.on('join')
def handle_join(data):
    chat_id = data['chat_id']
    user_id = data['user_id']
    user_name = data['user_name']
    ChatController.join_chat(chat_id, user_id)
    join_room(chat_id)
    emit(
        'join',
        {
            'user_id': data['user_id'],
            'user_name': data['user_name'],
            'chat_id': data['chat_id'],
            'content': f"{data['content']}",
        },
        room=chat_id, broadcast=True,
    )
    print('user joined chat', chat_id)

@socketio.on('leave')
def handle_leave(data):
    chat_id = data['chat_id']
    user_id = data['user_id']
    user_name = data['user_name']
    ChatController.leave_chat(chat_id, user_id)
    leave_room(chat_id)
    emit(
        'leave',
        {
            'user_id': data['user_id'],
            'user_name': data['user_name'],
            'chat_id': data['chat_id'],
            'content': f"{data['content']}",
        },
        room=chat_id, broadcast=True,
    )
    print('user left chat', chat_id)

@socketio.on('message')
def handle_message(data):
    content = data['content']
    chat_id = data['chat_id']
    sender_id = data['user_id']
    user_name = data['user_name']
    ChatController.create_message(content,chat_id, sender_id)
    join_room(chat_id)
    emit(
        'message',
        {
            'user_id': data['user_id'],
            'user_name': data['user_name'],
            'chat_id': data['chat_id'],
            'content': data['content'],
        },
        room=chat_id, broadcast=True,
    )


if __name__ == '__main__':
    debug = bool(os.environ.get("DEBUG", True))
    port = int(os.environ.get("PORT", 5001))
    host = str(os.environ.get("HOST", "127.0.0.1"))
    socketio.run(app, debug=debug, port=port, host=host)
