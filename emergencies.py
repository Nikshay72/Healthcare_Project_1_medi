"""
routes/emergencies.py
Endpoints:
  GET  /api/emergencies        — last 20 emergency dispatches
  POST /api/alert              — send pre-alert to hospital ER (+ optional Twilio SMS)
"""

import os
from datetime import datetime
from flask import Blueprint, request, jsonify
from models.hospital_data import HOSPITALS, EMERGENCIES

emergencies_bp = Blueprint("emergencies", __name__)


@emergencies_bp.route("/api/emergencies")
def get_emergencies():
    """Return the 20 most recent emergency records (newest first).

    Production upgrade: replace with Firestore query:
        from database.firebase.firebase_config import get_recent_emergencies
        return jsonify(get_recent_emergencies(20))
    """
    return jsonify(list(reversed(EMERGENCIES[-20:])))


@emergencies_bp.route("/api/alert", methods=["POST"])
def send_alert():
    """
    Send a pre-alert to a hospital ER team.

    Body: { hospital_id, condition, eta }

    Two delivery methods (configure via .env):
      1. Twilio SMS  — set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER
      2. Simulation  — returns success JSON (default / hackathon mode)
    """
    data        = request.get_json(force=True)
    hospital_id = data.get("hospital_id")
    condition   = data.get("condition", "Unknown")
    eta         = data.get("eta", "?")

    hospital = next((h for h in HOSPITALS if h["id"] == hospital_id), None)
    if not hospital:
        return jsonify({"success": False, "message": "Hospital not found"}), 404

    alert_time = datetime.now().strftime("%H:%M:%S")
    msg = (
        f"MEDIROUTE PRE-ALERT: {condition} patient incoming to "
        f"{hospital['name']} ER. ETA: {eta} min. Time: {alert_time}"
    )

    # ── Twilio SMS (active when env vars are set) ────────────────────────────
    twilio_sid   = os.getenv("TWILIO_ACCOUNT_SID")
    twilio_token = os.getenv("TWILIO_AUTH_TOKEN")
    twilio_from  = os.getenv("TWILIO_PHONE_NUMBER")

    sms_sent = False
    if twilio_sid and twilio_token and twilio_from:
        try:
            from twilio.rest import Client
            client = Client(twilio_sid, twilio_token)
            client.messages.create(
                to=hospital["phone"],
                from_=twilio_from,
                body=msg,
            )
            sms_sent = True
        except Exception as e:
            print(f"[Twilio] SMS failed: {e}")

    # ── Firestore logging (active when Firebase is configured) ───────────────
    try:
        from database.firebase.firebase_config import log_alert_to_firestore
        log_alert_to_firestore({
            "hospital_id":   hospital_id,
            "hospital_name": hospital["name"],
            "condition":     condition,
            "eta_min":       eta,
            "alert_time":    alert_time,
            "sms_sent":      sms_sent,
        })
    except Exception:
        pass  # Firebase not configured — silent fail

    return jsonify({
        "success":    True,
        "message":    f"✅ Pre-alert sent to {hospital['name']} ER team. Preparing for {condition} patient. ETA: {eta} min.",
        "hospital":   hospital["name"],
        "alert_time": alert_time,
        "sms_sent":   sms_sent,
    })
