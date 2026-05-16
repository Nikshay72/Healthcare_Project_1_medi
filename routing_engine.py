"""
utils/routing_engine.py
Core scoring and distance calculation logic for the Emergency Router.
"""

import math
import random


def haversine_km(lat1, lng1, lat2, lng2):
    """
    Calculate real-world distance in km between two GPS coordinates
    using the Haversine formula.
    """
    R = 6371
    dlat = math.radians(lat2 - lat1)
    dlng = math.radians(lng2 - lng1)
    a = (math.sin(dlat / 2) ** 2
         + math.cos(math.radians(lat1))
         * math.cos(math.radians(lat2))
         * math.sin(dlng / 2) ** 2)
    return R * 2 * math.asin(math.sqrt(a))


def estimate_eta(distance_km, traffic="normal"):
    """
    Estimate ETA in minutes based on distance and traffic condition.
    Adds a small random variation to simulate real-world variance.
    """
    speeds = {"light": 55, "normal": 40, "heavy": 25}
    speed = speeds.get(traffic, 40)
    minutes = (distance_km / speed) * 60
    return max(1, round(minutes + random.uniform(-2, 2)))


# Condition → required specialist + equipment mapping
CONDITION_MAP = {
    "Cardiac Arrest":    {"specialist": "Cardiologist",    "equipment": "Cath Lab"},
    "Trauma / Accident": {"specialist": "Trauma Surgeon",  "equipment": "CT Scanner"},
    "Burns":             {"specialist": "Burns Specialist", "equipment": "Ventilator"},
    "Neurological":      {"specialist": "Neurosurgeon",    "equipment": "MRI Scanner"},
    "Kidney Failure":    {"specialist": "Nephrologist",    "equipment": "Dialysis"},
    "General Emergency": {"specialist": "Orthopedic",      "equipment": "CT Scanner"},
}


def score_hospital(hospital, condition, patient_lat, patient_lng):
    """
    Score a hospital on a 0–100 scale using:
      - Distance    (35% weight) — closer is better
      - Bed count   (25% weight) — more available beds is better
      - ER wait     (15% weight) — lower wait is better
      - Condition   (25% weight) — right specialist + equipment present

    Returns -1 to exclude full hospitals from results.
    """
    if hospital.get("status") == "Full":
        return -1

    distance = haversine_km(patient_lat, patient_lng, hospital["lat"], hospital["lng"])
    if distance == 0:
        distance = 0.1

    distance_score = max(0, 100 - distance * 8)
    bed_score      = min(100, hospital.get("available_beds", 0) * 1.5)
    wait_score     = max(0, 100 - hospital.get("er_wait_min", 30) * 2)

    condition_bonus = 0
    if condition in CONDITION_MAP:
        spec  = CONDITION_MAP[condition]["specialist"]
        equip = CONDITION_MAP[condition]["equipment"]
        if hospital.get("specialists", {}).get(spec):
            condition_bonus += 40
        if hospital.get("equipment", {}).get(equip):
            condition_bonus += 30

    total = (
        (distance_score  * 0.35)
        + (bed_score     * 0.25)
        + (wait_score    * 0.15)
        + (condition_bonus * 0.25)
    )
    return round(total, 1)
