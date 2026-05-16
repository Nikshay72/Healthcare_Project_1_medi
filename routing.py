"""
routes/routing.py
Endpoint:
  POST /api/route   — core emergency routing engine
  Body: { lat, lng, condition, severity }
"""

import random
from datetime import datetime
from flask import Blueprint, request, jsonify
from models.hospital_data import HOSPITALS, EMERGENCIES
from utils.routing_engine import score_hospital, haversine_km, estimate_eta

routing_bp = Blueprint("routing", __name__)


@routing_bp.route("/api/route", methods=["POST"])
def find_route():
    """
    Core routing engine:
      1. Receives patient GPS + condition + severity
      2. Scores every hospital using weighted algorithm
      3. Returns top 6 recommendations sorted by score
      4. Logs the emergency to the in-memory EMERGENCIES list
         (replace EMERGENCIES with Firestore write in production)
    """
    data = request.get_json(force=True)

    patient_lat = float(data.get("lat",       26.292))
    patient_lng = float(data.get("lng",       73.014))
    condition   = data.get("condition",       "General Emergency")
    severity    = data.get("severity",        "High")

    results = []
    for hospital in HOSPITALS:
        score = score_hospital(hospital, condition, patient_lat, patient_lng)
        if score < 0:
            continue

        distance = haversine_km(patient_lat, patient_lng, hospital["lat"], hospital["lng"])
        traffic  = random.choice(["light", "normal", "heavy"])
        eta      = estimate_eta(distance, traffic)

        results.append({
            "hospital":    hospital,
            "score":       score,
            "distance_km": round(distance, 2),
            "eta_min":     eta,
            "traffic":     traffic,
            "recommended": False,
        })

    # Sort descending by score
    results.sort(key=lambda x: x["score"], reverse=True)

    # Mark top 3 as recommended
    for i, r in enumerate(results[:3]):
        r["recommended"] = True
        r["rank"] = i + 1

    # Log emergency (in-memory; swap for Firestore in production)
    emergency_id = f"EMR-{len(EMERGENCIES) + 1:04d}"
    EMERGENCIES.append({
        "id":        emergency_id,
        "condition": condition,
        "severity":  severity,
        "time":      datetime.now().strftime("%H:%M:%S"),
        "status":    "Dispatched",
        "hospital":  results[0]["hospital"]["name"] if results else "None",
    })

    return jsonify({
        "emergency_id":      emergency_id,
        "patient_location":  {"lat": patient_lat, "lng": patient_lng},
        "condition":         condition,
        "severity":          severity,
        "recommendations":   results[:6],
        "timestamp":         datetime.now().strftime("%d %b %Y, %H:%M:%S"),
    })
