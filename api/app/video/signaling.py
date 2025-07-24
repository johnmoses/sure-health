import functools
from flask import request
from flask_jwt_extended import decode_token
from flask_socketio import emit, join_room, leave_room, disconnect
from app.extensions import socketio, db
from app.video.models import TelemedicineSession
from datetime import datetime
from app.agents.multi_agents import VideoAgent

agent = VideoAgent()

# Helper: disconnect unauthenticated users
def authenticated_only(f):
    @functools.wraps(f)
    def wrapped(*args, **kwargs):
        token = None
        # Get the token from query string, or from auth payload if provided
        if 'token' in request.args:
            token = request.args.get('token')
        elif request.headers.get('Authorization'):
            auth_header = request.headers.get('Authorization')
            if auth_header.startswith("Bearer "):
                token = auth_header[7:]
        else:
            # For socketio 5+, token can come via `auth` argument in connect event, see connect()
            auth = request.namespace.session.get('auth', {})
            token = auth.get('token')

        if not token:
            disconnect()
            return

        try:
            identity = decode_token(token)['sub']
            # Store user identity in flask global (can be used inside handlers)
            request.environ['user_id'] = identity
        except Exception:
            disconnect()
            return

        return f(*args, **kwargs)

    return wrapped

# On socket connection, authenticate user
@socketio.on('connect')
def connect(auth):
    token = None
    # auth is dict sent by client during connection attempt
    if auth and "token" in auth:
        token = auth["token"]
    else:
        token = request.args.get("token")

    if not token:
        # Reject connection if no token
        return False

    try:
        identity = decode_token(token)['sub']
        # Optionally verify user presence in DB here
        # Store in session for this socket connection
        # Flask SocketIO stores session in request.namespace.session
        request.namespace.session['auth'] = {"token": token, "user_id": identity}
        emit('status', {'msg': f'User {identity} connected'})
    except Exception:
        return False  # refuse connection

# On disconnect
@socketio.on('disconnect')
def disconnect_handler():
    user_id = request.namespace.session.get('auth', {}).get('user_id')
    print(f"User {user_id} disconnected")

@socketio.on("join_video")
@authenticated_only
def join_video(data):
    user_id = request.environ.get("user_id")
    room = data.get("room")
    if not room:
        emit("error", {"msg": "Missing room"}, to=request.sid)
        return
    join_room(room)
    emit("status", {"msg": f"User {user_id} joined video room {room}"}, room=room)

@socketio.on("signal")
@authenticated_only
def handle_signal(data):
    room = data.get("room")
    if not room:
        emit("error", {"msg": "Missing room"}, to=request.sid)
        return
    emit("signal", data, room=room, include_self=False)

@socketio.on("leave_video")
@authenticated_only
def leave_video(data):
    user_id = request.environ.get('user_id')
    room = data.get("room")
    if room:
        leave_room(room)
        emit("status", {"msg": f"User {user_id} left video room {room}"}, room=room)

@socketio.on("start_session")
@authenticated_only
def start_session(data):
    user_id = request.environ.get("user_id")
    appointment_id = data.get("appointment_id")
    video_url = data.get("video_url", "")

    if not appointment_id:
        emit("error", {"msg": "Missing appointment_id"}, to=request.sid)
        return

    session = TelemedicineSession(
        appointment_id=appointment_id,
        video_url=video_url,
        started_at=datetime.utcnow()
    )
    db.session.add(session)
    db.session.commit()
    emit("session_started", {"session_id": session.id, "started_at": session.started_at.isoformat()}, to=request.sid)

@socketio.on("end_session")
@authenticated_only
def end_session(data):
    session_id = data.get("session_id")
    if not session_id:
        emit("error", {"msg": "Missing session_id"}, to=request.sid)
        return
    session = TelemedicineSession.query.get(session_id)
    if not session:
        emit("error", {"msg": "Session not found"}, to=request.sid)
        return
    session.ended_at = datetime.utcnow()
    db.session.commit()
    emit("session_ended", {"session_id": session.id, "ended_at": session.ended_at.isoformat()}, room=f"session_{session.id}")

@socketio.on("video_agent_query")
@authenticated_only
def video_agent_query(data):
    """
    Handle natural language queries about telemedicine video sessions.
    Expected keys: 'session_id' (optional), 'query' (string)
    """
    query = data.get("query", "").strip()
    session_id = data.get("session_id")

    if not query:
        emit("error", {"msg": "Query text required"}, to=request.sid)
        return

    context = ""
    if session_id:
        session = TelemedicineSession.query.get(session_id)
        if session:
            context = (
                f"Video session for appointment {session.appointment_id}.\n"
                f"Started at: {session.started_at}\n"
                f"Ended at: {session.ended_at if session.ended_at else 'Ongoing'}\n"
                f"Video URL: {session.video_url or 'N/A'}"
            )
    # Call the agent with user query and context
    try:
        answer = agent.answer(query, context)
        emit("video_agent_answer", {"answer": answer}, to=request.sid)
    except Exception as e:
        emit("error", {"msg": "Failed to generate answer"}, to=request.sid)