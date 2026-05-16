"""
routes/hospitals.py
Endpoints:
  GET  /api/hospitals            — all hospitals with simulated live fluctuation
  GET  /api/hospital/<id>        — single hospital detail
  GET  /api/budget_hospitals     — hospitals grouped by budget tier
"""

import random
from datetime import datetime
from flask import Blueprint, jsonify
from models.hospital_data import HOSPITALS, BUDGET_TIERS

hospitals_bp = Blueprint("hospitals", __name__)


@hospitals_bp.route("/api/hospitals")
def get_hospitals():
    """Return all hospitals with small real-time bed/wait fluctuation."""
    result = []
    for h in HOSPITALS:
        hc = dict(h)
        # Simulate minor real-time changes (replace with Firestore live data in production)
        hc["available_beds"] = max(0, hc["available_beds"] + random.randint(-2, 2))
        hc["er_wait_min"]    = max(1, hc["er_wait_min"]    + random.randint(-3, 3))
        hc["last_updated"]   = datetime.now().strftime("%H:%M:%S")
        result.append(hc)
    return jsonify(result)


@hospitals_bp.route("/api/hospital/<int:hospital_id>")
def get_hospital(hospital_id):
    """Return full details for a single hospital."""
    hospital = next((h for h in HOSPITALS if h["id"] == hospital_id), None)
    if not hospital:
        return jsonify({"error": "Hospital not found"}), 404
    h = dict(hospital)
    h["last_updated"] = datetime.now().strftime("%H:%M:%S")
    return jsonify(h)


@hospitals_bp.route("/api/budget_hospitals")
def get_budget_hospitals():
    """Return hospitals grouped by budget tier (Low / Medium / High)."""
    grouped = {"Low": [], "Medium": [], "High": []}
    for h in HOSPITALS:
        tier = h.get("budget_tier", "Medium")
        grouped[tier].append({
            "id":               h["id"],
            "name":             h["name"],
            "address":          h["address"],
            "type":             h["type"],
            "rating":           h["rating"],
            "budget_tier":      tier,
            "consultation_fee": h.get("consultation_fee", "N/A"),
            "emergency_fee":    h.get("emergency_fee",    "N/A"),
            "icu_per_day":      h.get("icu_per_day",      "N/A"),
            "surgery_range":    h.get("surgery_range",    "N/A"),
            "services":         h.get("services",         []),
            "status":           h["status"],
        })
    return jsonify({"tiers": BUDGET_TIERS, "hospitals": grouped})
