from app import create_app, db, socketio
import logging


# Configure root logger
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)

app = create_app()
app.logger.setLevel(logging.INFO)
logging.getLogger('werkzeug').setLevel(logging.INFO)  # HTTP request logs at INFO level

if __name__ == '__main__':
    with app.app_context():
        db.create_all()  # Create database tables if they don't exist

    # Run app with Socket.IO support using eventlet web server for async
    socketio.run(app, host='0.0.0.0', port=5001, use_reloader=False, debug=True)
