"""
routes/stats.py
Endpoint:
  GET /api/stats   — dashboard summary statistics
"""

import random
from datetime import datetime
from flask import Blueprint, jsonify
from models.hospital_data import HOSPITALS, AMBULANCES, EMERGENCIES

stats_bp = Blueprint("stats", __name__)


@stats_bp.route("/api/stats")
def get_stats():
    """
    Aggregate live statistics for the dashboard.
    """
    total_available = sum(
        h["available_beds"] for h in HOSPITALS if h.get("status") != "Full"
    )
    total_icu       = sum(h["icu_available"]  for h in HOSPITALS)
    full_hospitals  = sum(1 for h in HOSPITALS if h.get("status") == "Full")
    available_ambs  = sum(1 for a in AMBULANCES if a["status"] == "Available")

    return jsonify({
        "total_hospitals":   len(HOSPITALS),
        "available_beds":    total_available,
        "icu_available":     total_icu,
        "full_hospitals":    full_hospitals,
        "ambulances_ready":  available_ambs,
        "emergencies_today": len(EMERGENCIES),
        "avg_response_time": f"{random.randint(8, 15)} min",
        "last_updated":      datetime.now().strftime("%H:%M:%S"),
    })
