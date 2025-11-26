from flask import Flask, send_from_directory
from flask_socketio import SocketIO, emit

app = Flask(__name__, static_folder="static")
socketio = SocketIO(app, cors_allowed_origins="*")

@app.route("/")
def index():
    return send_from_directory("static", "index.html")

@app.route("/cocreation")
def sketch():
    return send_from_directory("static", "canva.html")

@socketio.on("paint")
def handle_paint(data):
    # broadcast to all connected clients except sender
    emit("paint", data, broadcast=True, include_self=False)

if __name__ == "__main__":
    socketio.run(app, host="0.0.0.0", port=5000)
