"""
routes/ambulances.py
Endpoint:
  GET /api/ambulances   — return live ambulance fleet with simulated GPS drift
"""

import random
from flask import Blueprint, jsonify
from models.hospital_data import AMBULANCES

ambulances_bp = Blueprint("ambulances", __name__)


@ambulances_bp.route("/api/ambulances")
def get_ambulances():
    """
    Return ambulance fleet status.
    Simulates small GPS position drift each call.
    In production: read live GPS positions from Firestore
    (each ambulance app writes its position every 5 seconds).
    """
    fleet = []
    for amb in AMBULANCES:
        a = dict(amb)
        # Simulate small position drift
        a["lat"] = round(a["lat"] + random.uniform(-0.001, 0.001), 6)
        a["lng"] = round(a["lng"] + random.uniform(-0.001, 0.001), 6)
        fleet.append(a)
    return jsonify(fleet)
