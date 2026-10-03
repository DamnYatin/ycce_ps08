"""
Verification test suite for KrishiMitra backend services and calculation formulas.
"""

import sys
import os
from pathlib import Path

# Ensure UTF-8 output encoding on Windows console
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent / "backend"
sys.path.insert(0, str(backend_dir))

from database.db_init import init_db
from database.seed_data import seed_db
from services.transport_cost_calculator import calculate_transport_cost
from services.cost_estimation_service import estimate_other_costs
from services.net_price_calculator import calculate_net_price
from services.maps_distance_service import get_distance_km
from services.ranking_recommendation_engine import rank_and_recommend_mandis
from services.tts_engine import generate_speech
from services.analytics_reports_service import get_crop_analytics
from services.notification_service import get_active_notifications
from models.crop_model import CropModel
from models.mandi_model import MandiModel

def test_all():
    print("==================================================")
    print("Testing KrishiMitra Services & Mathematical Formulas")
    print("==================================================")

    # 1. DB Init & Seed
    init_db()
    seed_db()
    print("[PASS] DB initialization & seeding passed.")

    # 2. Crops & Mandis
    crops = CropModel.get_all()
    mandis = MandiModel.get_all()
    print(f"[PASS] Retrieved {len(crops)} crops and {len(mandis)} mandis.")
    assert len(crops) >= 5, "Should have at least 5 crops"
    assert len(mandis) >= 5, "Should have at least 5 mandis"

    # 3. Transport Cost Calculator
    # Nagpur to Amravati: 145km * 0.80 = 116.0
    t_res = calculate_transport_cost(distance_km=145.0, rate_per_km_per_quintal=0.80, quantity_quintal=10)
    assert t_res["per_quintal"] == 116.0, f"Expected 116.0, got {t_res['per_quintal']}"
    assert t_res["total"] == 1160.0, f"Expected 1160.0, got {t_res['total']}"
    print("[PASS] Transport Cost Calculator formula verified (145km x Rs 0.80 = Rs 116/qtl).")

    # 4. Net Price Calculator
    # Mandi 7250 - (Transport 116 + Other 0) = 7134
    net_res = calculate_net_price(mandi_price_per_qtl=7250.0, transport_cost_per_qtl=116.0, other_costs_per_qtl=0.0, quantity_quintal=10)
    assert net_res["net_price_per_qtl"] == 7134.0, f"Expected 7134.0, got {net_res['net_price_per_qtl']}"
    assert net_res["total_net_return"] == 71340.0, f"Expected 71340.0, got {net_res['total_net_return']}"
    print("[PASS] Net Price Calculator verified (Rs 7,250 - Rs 116 = Rs 7,134/qtl).")

    # 5. Full Ranking Engine on Pitch Deck scenario (Cotton + Nagpur)
    cotton = next((c for c in crops if "cotton" in c["name"].lower()), crops[0])
    nagpur = next((m for m in mandis if "nagpur" in m["name"].lower()), mandis[0])

    ranking_res = rank_and_recommend_mandis(crop_id=cotton["id"], home_mandi_id=nagpur["id"], quantity_quintal=10)
    winner = ranking_res["recommended_mandi"]
    summary = ranking_res["effective_price_summary"]

    print("\n--- Pitch Deck Ranking Output ---")
    for m in ranking_res["ranked_mandis"]:
        print(f"Rank {m['rank']}: {m['mandi_name']} | Distance: {m['distance_km']}km | Listing: Rs {m['mandi_price_per_qtl']} | Trans: Rs {m['transport_cost_per_qtl']} | Other: Rs {m['other_costs_per_qtl']} | NET: Rs {m['net_price_per_qtl']}/qtl")

    assert "amravati" in winner["mandi_name"].lower(), f"Expected Amravati as winner, got {winner['mandi_name']}"
    assert winner["net_price_per_qtl"] == 7134.0, f"Expected 7134.0, got {winner['net_price_per_qtl']}"
    print(f"\n[PASS] Winner correctly determined: {winner['mandi_name']} with net price Rs {winner['net_price_per_qtl']}/qtl")

    # 6. Multilingual TTS
    mr_tts = generate_speech("Amravati", "Cotton", 7134, language="mr")
    print(f"[PASS] Multilingual Marathi TTS script generated successfully.")

    # 7. Analytics & Notifications
    analytics = get_crop_analytics(cotton["id"])
    notifications = get_active_notifications()
    assert "summary" in analytics, "Analytics should have summary"
    assert len(notifications) > 0, "Should have notifications"
    print(f"[PASS] Analytics and notifications verified. {len(notifications)} active alerts.")

    print("\n==================================================")
    print("🎉 ALL KRISHIMITRA SERVICE TESTS PASSED!")
    print("==================================================")

if __name__ == "__main__":
    test_all()
