"""
EHVRM-System — Backend Entry Point
Flask REST API for the Emergency Hospital Vehicle Routing & Management System

HOW TO RUN:
  pip install -r requirements.txt
  cp .env.example .env   # fill in your values
  python app.py

API will be available at: http://localhost:5000/api/...
"""

import os
from dotenv import load_dotenv
load_dotenv()   # loads backend/.env

from flask import Flask
from flask_cors import CORS

from routes.hospitals   import hospitals_bp
from routes.routing     import routing_bp
from routes.ambulances  import ambulances_bp
from routes.emergencies import emergencies_bp
from routes.stats       import stats_bp

app = Flask(__name__)
app.secret_key = os.getenv("SECRET_KEY", "dev-secret-change-me")

# ── CORS: allow the React frontend to call this backend ──────────────────────
allowed_origins = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:5173,http://localhost:3000"
).split(",")
CORS(app, resources={r"/api/*": {"origins": allowed_origins}})

# ── REGISTER BLUEPRINTS ──────────────────────────────────────────────────────
app.register_blueprint(hospitals_bp)
app.register_blueprint(routing_bp)
app.register_blueprint(ambulances_bp)
app.register_blueprint(emergencies_bp)
app.register_blueprint(stats_bp)

@app.route("/")
def index():
    return {"status": "EHVRM Backend Running", "version": "1.0"}, 200

if __name__ == "__main__":
    port = int(os.getenv("FLASK_PORT", 5000))
    print(f"\n🚑  EHVRM Backend is running!")
    print(f"   API available at http://localhost:{port}\n")
    app.run(debug=os.getenv("FLASK_ENV") == "development", port=port, use_reloader=True)
