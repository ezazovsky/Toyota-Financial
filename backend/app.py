from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# In-memory demo data. In production, use Firestore/SQL.
DEALERSHIPS = [
    {"id": "d1", "name": "Seattle Toyota", "zip": "98101", "address": "123 Pine St, Seattle, WA"},
    {"id": "d2", "name": "Bellevue Toyota", "zip": "98004", "address": "456 Main St, Bellevue, WA"},
    {"id": "d3", "name": "Redmond Toyota", "zip": "98052", "address": "789 161st Ave NE, Redmond, WA"},
]

PLANS = {
    "finance": [
        {"id": "f1", "name": "Standard 60", "apr": 3.9, "terms": [24,36,48,60,72]},
    ],
    "lease": [
        {"id": "l1", "name": "Popular 36", "money_factor": 0.00125, "terms": [24,36,48,60], "mileage": [10000,12000,15000]},
    ],
    "offers": [
        {"id": "o1", "name": "College or Military", "amount": 500},
    ],
}

@app.get("/")
def root():
    return jsonify({"status": "ok"})

@app.get("/dealerships")
def dealerships():
    zip_query = request.args.get("zip")
    if not zip_query:
        return jsonify(DEALERSHIPS)
    # naive: filter by exact zip, could add distance calc
    matches = [d for d in DEALERSHIPS if d["zip"] == zip_query]
    return jsonify(matches or DEALERSHIPS)

@app.get("/plans")
def get_plans():
    return jsonify(PLANS)

@app.post("/plans")
def add_plan():
    data = request.get_json(force=True)
    kind = data.get("kind")
    plan = data.get("plan")
    if kind not in ("finance","lease","offers"):
        return jsonify({"error":"invalid kind"}), 400
    PLANS[kind].append(plan)
    return jsonify({"ok": True, "count": len(PLANS[kind])})

@app.post("/dealerships")
def add_dealership():
    data = request.get_json(force=True)
    if not all(k in data for k in ("name","zip","address")):
        return jsonify({"error":"missing fields"}), 400
    data["id"] = f"d{len(DEALERSHIPS)+1}"
    DEALERSHIPS.append(data)
    return jsonify({"ok": True, "id": data["id"]})

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5001, debug=True)
