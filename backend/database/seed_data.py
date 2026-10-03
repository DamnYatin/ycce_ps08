"""
File: seed_data.py
Purpose: Seeds initial realistic agricultural market data into SQLite database,
         for Maharashtra Mandis (Nagpur, Amravati,
         Pune, Akola, Nashik) and crops (Cotton, Soybean, Wheat, Onion, Tur, Gram).
Inputs:  db_path (optional str, defaults to Config.DB_PATH)
Outputs: Populated SQLite tables with crops, mandis, rates, distances, costs, and historical prices
Usage:   from database.seed_data import seed_db
         seed_db()
"""

import datetime
from database.db_connection import get_db_connection
from database.db_init import init_db

def seed_db(db_path=None):
    """Populates database with initial realistic sample data."""
    init_db(db_path)

    with get_db_connection(db_path) as conn:
        cursor = conn.cursor()

        # Check if already seeded
        cursor.execute("SELECT COUNT(*) as cnt FROM crops")
        if cursor.fetchone()["cnt"] > 0:
            return

        # 1. Seed Crops
        crops = [
            ("Cotton (कपास / कापूस)",),
            ("Soybean (सोयाबीन)",),
            ("Wheat (गेहूं / गहू)",),
            ("Onion (प्याज / कांदा)",),
            ("Tur / Arhar (तूर / अरहर)",),
            ("Gram / Chana (चना / हरभरा)",)
        ]
        cursor.executemany("INSERT INTO crops (name) VALUES (?)", crops)

        # 2. Seed Mandis with realistic Lat/Lng
        mandis = [
            ("Nagpur (नागपूर)", 21.1458, 79.0882),
            ("Amravati (अमरावती)", 20.9374, 77.7796),
            ("Pune (पुणे)", 18.5204, 73.8567),
            ("Akola (अकोला)", 20.7002, 77.0082),
            ("Nashik (नाशिक)", 19.9975, 73.7898)
        ]
        cursor.executemany("INSERT INTO mandis (name, latitude, longitude) VALUES (?, ?, ?)", mandis)

        # Retrieve IDs
        cursor.execute("SELECT id, name FROM crops")
        crop_map = {row["name"]: row["id"] for row in cursor.fetchall()}

        cursor.execute("SELECT id, name FROM mandis")
        mandi_map = {row["name"].split(" ")[0]: row["id"] for row in cursor.fetchall()}

        # 3. Transport Rates (₹/km/quintal)
        cursor.execute("INSERT INTO transport_rates (rate_per_km_per_quintal) VALUES (?)", (0.80,))

        # 4. Other Costs (Loading + Unloading + Market Charges per quintal)
        other_costs_data = [
            (mandi_map["Amravati"], 0.0, 0.0, 0.0),    # Total = 0
            (mandi_map["Nagpur"], 40.0, 36.0, 40.0),    # Total = 116
            (mandi_map["Pune"], 0.0, 0.0, 0.0),        # Total = 0
            (mandi_map["Akola"], 0.0, 0.0, 0.0),       # Total = 0
            (mandi_map["Nashik"], 40.0, 30.0, 30.0),   # Total = 100
        ]
        cursor.executemany(
            "INSERT INTO other_costs (mandi_id, loading, unloading, market_charge) VALUES (?, ?, ?, ?)",
            other_costs_data
        )

        # 5. Distances between Mandis (Bidirectional)
        distance_pairs = [
            ("Nagpur", "Nagpur", 0.0),
            ("Nagpur", "Amravati", 145.0),
            ("Nagpur", "Pune", 600.0),
            ("Nagpur", "Akola", 312.5),
            ("Nagpur", "Nashik", 875.0),

            ("Amravati", "Amravati", 0.0),
            ("Amravati", "Nagpur", 145.0),
            ("Amravati", "Akola", 98.0),
            ("Amravati", "Pune", 560.0),
            ("Amravati", "Nashik", 540.0),

            ("Akola", "Akola", 0.0),
            ("Akola", "Nagpur", 312.5),
            ("Akola", "Amravati", 98.0),
            ("Akola", "Pune", 470.0),
            ("Akola", "Nashik", 440.0),

            ("Pune", "Pune", 0.0),
            ("Pune", "Nagpur", 600.0),
            ("Pune", "Amravati", 560.0),
            ("Pune", "Akola", 470.0),
            ("Pune", "Nashik", 210.0),

            ("Nashik", "Nashik", 0.0),
            ("Nashik", "Nagpur", 875.0),
            ("Nashik", "Amravati", 540.0),
            ("Nashik", "Akola", 440.0),
            ("Nashik", "Pune", 210.0),
        ]
        distance_records = [
            (mandi_map[src], mandi_map[dst], dist)
            for src, dst, dist in distance_pairs
        ]
        cursor.executemany(
            "INSERT INTO distances (from_mandi_id_or_village, to_mandi_id, distance_km) VALUES (?, ?, ?)",
            distance_records
        )

        # 6. Current Mandi Prices matching Pitch Deck specifications
        # Cotton target: Amravati 7250, Nagpur 7216, Pune 7348, Akola 7013, Nashik 7090
        cotton_id = crop_map["Cotton (कपास / कापूस)"]
        soybean_id = crop_map["Soybean (सोयाबीन)"]
        wheat_id = crop_map["Wheat (गेहूं / गहू)"]
        onion_id = crop_map["Onion (प्याज / कांदा)"]
        tur_id = crop_map["Tur / Arhar (तूर / अरहर)"]
        gram_id = crop_map["Gram / Chana (चना / हरभरा)"]

        prices_data = [
            # Cotton
            (cotton_id, mandi_map["Amravati"], 7250.0),
            (cotton_id, mandi_map["Nagpur"], 7216.0),
            (cotton_id, mandi_map["Pune"], 7348.0),
            (cotton_id, mandi_map["Akola"], 7013.0),
            (cotton_id, mandi_map["Nashik"], 7090.0),

            # Soybean
            (soybean_id, mandi_map["Amravati"], 4850.0),
            (soybean_id, mandi_map["Nagpur"], 4720.0),
            (soybean_id, mandi_map["Pune"], 4920.0),
            (soybean_id, mandi_map["Akola"], 4780.0),
            (soybean_id, mandi_map["Nashik"], 4650.0),

            # Wheat
            (wheat_id, mandi_map["Amravati"], 2450.0),
            (wheat_id, mandi_map["Nagpur"], 2500.0),
            (wheat_id, mandi_map["Pune"], 2620.0),
            (wheat_id, mandi_map["Akola"], 2420.0),
            (wheat_id, mandi_map["Nashik"], 2580.0),

            # Onion
            (onion_id, mandi_map["Amravati"], 1850.0),
            (onion_id, mandi_map["Nagpur"], 1900.0),
            (onion_id, mandi_map["Pune"], 2200.0),
            (onion_id, mandi_map["Akola"], 1750.0),
            (onion_id, mandi_map["Nashik"], 2350.0),

            # Tur
            (tur_id, mandi_map["Amravati"], 9800.0),
            (tur_id, mandi_map["Nagpur"], 9650.0),
            (tur_id, mandi_map["Pune"], 9950.0),
            (tur_id, mandi_map["Akola"], 9900.0),
            (tur_id, mandi_map["Nashik"], 9500.0),

            # Gram
            (gram_id, mandi_map["Amravati"], 5900.0),
            (gram_id, mandi_map["Nagpur"], 5820.0),
            (gram_id, mandi_map["Pune"], 6100.0),
            (gram_id, mandi_map["Akola"], 5950.0),
            (gram_id, mandi_map["Nashik"], 5750.0),
        ]
        cursor.executemany(
            "INSERT INTO prices (crop_id, mandi_id, price_per_quintal) VALUES (?, ?, ?)",
            prices_data
        )

        # 7. Seed 7-day Historical Price Trends for Analytics
        today = datetime.date.today()
        history_records = []
        for days_ago in range(7, 0, -1):
            record_date = (today - datetime.timedelta(days=days_ago)).isoformat()
            # Generate historical points around current price
            for crop_id, m_id, current_p in prices_data:
                # small variation per day
                factor = 1.0 + ((days_ago - 3) * 0.006)
                hist_p = round(current_p * factor, 2)
                history_records.append((crop_id, m_id, hist_p, record_date))

        cursor.executemany(
            "INSERT INTO price_history (crop_id, mandi_id, price_per_quintal, recorded_date) VALUES (?, ?, ?, ?)",
            history_records
        )

        # 8. Seed Demo Users
        users = [
            ("Ramesh Patil (रमेश पाटील)", "9823012345", mandi_map["Nagpur"]),
            ("Suresh Deshmukh (सुरेश देशमुख)", "9823098765", mandi_map["Amravati"]),
            ("Kisan Vikas (किसान विकास)", "9421098712", mandi_map["Akola"])
        ]
        cursor.executemany(
            "INSERT INTO users (name, phone, home_mandi_id) VALUES (?, ?, ?)",
            users
        )

if __name__ == "__main__":
    seed_db()
    print("Database seeded with sample data matching pitch deck successfully.")
