from flask import request, jsonify, redirect, render_template, url_for, flash, session
from chats import bp
from chats.controllers import ChatController


@bp.route('/chat')
@bp.route('/chat/<chat_id>')
def chat(chat_id=''):
    user_id = session['user_id']
    user_name = session['user_name']
    all_chats = ChatController.get_chats()
    chats = ChatController.get_user_chats(user_id)
    chat = None
    participants = None
    messages = None
    if chat_id != '':
        chat = ChatController.get_chat(chat_id)
        participants = chat.participants
        messages = chat.messages
    return render_template('chat.html', user_id=user_id, user_name=user_name, all_chats=all_chats, chats=chats, chat=chat, participants=participants, messages=messages)


@bp.route('/chat/create', methods=['GET', 'POST'])
def create_chat():
    user_id = session['user_id']
    if request.method == 'POST':
        name = request.form.get('name')
        chat = ChatController.create_chat(name,user_id)
        if chat:
            flash('Chat already exists!', category='error')

            return redirect(url_for('chats.chat'))
    return render_template('create_chat.html')

@bp.route('/chat/join/<chat_id>')
def join_chat(chat_id=''):
    user_id = session['user_id']
    if user_id != '' and chat_id != '':
        chat = ChatController.get_chat(chat_id)
        if chat:
            # ChatController.join_chat(chat_id, user_id)
            return redirect(url_for('chats.chat'))
    return render_template('chat.html')

@bp.route('/chat/leave/<chat_id>')
def leave_chat(chat_id=''):
    user_id = session['user_id']
    if user_id != '' and chat_id != '':
        chat = ChatController.get_chat(chat_id)
        if chat:
            # ChatController.leave_chat(chat_id, user_id)
            return redirect(url_for('chats.chat'))
    return render_template('chat.html')