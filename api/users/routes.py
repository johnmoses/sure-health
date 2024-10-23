from flask import request, jsonify, redirect, render_template, url_for, flash, session
from flask_login import login_user , logout_user , login_required , current_user
from users import bp
from users.controllers import UserController

@bp.route('/signup', methods=['GET', 'POST'])
def signup():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        user = UserController.get_user_by_name(username)
        if user:
            flash('User already exists!', category='error')
        else:
            new_user = UserController.create_user(username,password)
            flash('Account created', category='success')

            # login_user(new_user, remember=True)
            return redirect(url_for('accounts.signin'))
    return render_template('signup.html')

@bp.route('/signin', methods=['GET', 'POST'])
def signin():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        user = UserController.sign_in(username,password)
        if user:
            session['user_id'] = user.id
            session['user_name'] = user.username
            flash('Welcome!', category='success')
            # login_user(user, remember=True)
            return redirect(url_for('chats.chat'))
        else:
            flash('Incorrect password or email, try again', category='error')
    return render_template('signin.html', user=current_user)

@bp.route('/signout')
def signout():
    # logout_user()
    session['user_id'] = None
    session['user_name'] = None
    flash('Logout Successfull' , category='success')
    return render_template('index.html')