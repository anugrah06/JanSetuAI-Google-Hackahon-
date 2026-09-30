import asyncio
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import AsyncSessionLocal, init_db
from app.api.v1.admin import execute_deterministic_seed
from app.models.feedback import CitizenFeedback
from app.models.hotspot import Hotspot
from sqlalchemy import select, func, desc


async def run_deterministic_demo_test():
    print("==================================================")
    print("Testing JanSetu AI Deterministic Demonstration Flow")
    print("==================================================")

    await init_db()

    # --- RUN 1: Seed Demo Data ---
    print("\n[Step 1] Executing First Demo Seed Operation...")
    async with AsyncSessionLocal() as db:
        res1 = await execute_deterministic_seed(db, reset_user_records=True)
        print("Run 1 Result:", res1)

        # Inspect database counts
        c_count_1 = (await db.execute(select(func.count(CitizenFeedback.id)))).scalar()
        h_count_1 = (await db.execute(select(func.count(Hotspot.id)))).scalar()

        # Query all hotspots and record their attributes
        hotspots_q1 = (await db.execute(select(Hotspot).order_by(desc(Hotspot.final_priority_score)))).scalars().all()
        hotspots_1 = [
            {
                "id": str(h.id),
                "district": h.district,
                "taluka": h.taluka_or_ward,
                "category": h.category,
                "count": h.complaint_count,
                "avg_severity": h.avg_severity,
                "score": h.final_priority_score,
                "headline": h.detected_headline
            }
            for h in hotspots_q1
        ]

    print(f"Run 1 Summary: Complaints={c_count_1}, Hotspots={h_count_1}")
    for h in hotspots_1:
        print(f"  -> {h['district']} ({h['taluka']}) | {h['category']} | Count: {h['count']} | Score: {h['score']}")

    # --- RUN 2: Re-run Exact Same Demo Seed Operation ---
    print("\n[Step 2] Executing Second Demo Seed Operation (Checking Idempotence)...")
    async with AsyncSessionLocal() as db:
        res2 = await execute_deterministic_seed(db, reset_user_records=False)
        print("Run 2 Result:", res2)

        c_count_2 = (await db.execute(select(func.count(CitizenFeedback.id)))).scalar()
        h_count_2 = (await db.execute(select(func.count(Hotspot.id)))).scalar()

        hotspots_q2 = (await db.execute(select(Hotspot).order_by(desc(Hotspot.final_priority_score)))).scalars().all()
        hotspots_2 = [
            {
                "id": str(h.id),
                "district": h.district,
                "taluka": h.taluka_or_ward,
                "category": h.category,
                "count": h.complaint_count,
                "avg_severity": h.avg_severity,
                "score": h.final_priority_score,
                "headline": h.detected_headline
            }
            for h in hotspots_q2
        ]

    print(f"Run 2 Summary: Complaints={c_count_2}, Hotspots={h_count_2}")
    for h in hotspots_2:
        print(f"  -> {h['district']} ({h['taluka']}) | {h['category']} | Count: {h['count']} | Score: {h['score']}")

    # --- ASSERTIONS FOR DETERMINISM ---
    assert c_count_1 == c_count_2 == 15, f"Expected 15 complaints, got {c_count_1} and {c_count_2}"
    assert h_count_1 == h_count_2 == 7, f"Expected 7 hotspots, got {h_count_1} and {h_count_2}"

    assert len(hotspots_1) == len(hotspots_2)
    for h1, h2 in zip(hotspots_1, hotspots_2):
        assert h1["id"] == h2["id"], f"Hotspot IDs differed: {h1['id']} vs {h2['id']}"
        assert h1["district"] == h2["district"]
        assert h1["taluka"] == h2["taluka"]
        assert h1["category"] == h2["category"]
        assert h1["count"] == h2["count"], f"Counts differed for {h1['district']}"
        assert h1["score"] == h2["score"], f"Scores differed for {h1['district']}: {h1['score']} vs {h2['score']}"

    print("\n[PASS] Verification Passed: Run 1 and Run 2 produced 100% IDENTICAL hotspot counts and priority scores!")
    print("[PASS] Verification Passed: ZERO duplicate synthetic complaints were created!")

    # --- TEST 3: User Record Preservation ---
    print("\n[Step 3] Testing Real User Record Preservation...")
    async with AsyncSessionLocal() as db:
        user_complaint = CitizenFeedback(
            id="user-live-grievance-test-1",
            language="hi",
            input_mode="text",
            raw_input="हमारे गांव में प्राथमिक स्वास्थ्य केंद्र में डॉक्टर नहीं हैं।",
            category="HEALTHCARE",
            sub_issue="Doctor shortage at rural PHC",
            state="Maharashtra",
            district="Beed",
            taluka_or_ward="Ashti",
            severity_score=4,
            urgency="HIGH",
            affected_group="Rural patients",
            is_synthetic=False, # Genuine citizen feedback
            demo_scenario_id=None
        )
        db.add(user_complaint)
        await db.commit()

        # Check total before re-seeding: 15 synthetic + 1 user = 16
        total_before = (await db.execute(select(func.count(CitizenFeedback.id)))).scalar()
        assert total_before == 16, f"Expected 16, got {total_before}"

        # Re-seed demo without clearing user records
        res3 = await execute_deterministic_seed(db, reset_user_records=False)
        print("Run 3 (with user record present) Result:", res3)
        assert res3["user_records_preserved"] == 1

        # Check total after re-seeding: still 16 (15 synthetic + 1 user preserved!)
        total_after = (await db.execute(select(func.count(CitizenFeedback.id)))).scalar()
        assert total_after == 16, f"Expected 16, got {total_after}"

        # Confirm the exact user record is still in the database
        preserved = (await db.execute(select(CitizenFeedback).where(CitizenFeedback.id == "user-live-grievance-test-1"))).scalar_one_or_none()
        assert preserved is not None, "Real citizen record was deleted!"
        assert preserved.is_synthetic is False

        # Clean up test user complaint to return DB to pristine demo state
        await db.delete(preserved)
        await db.commit()

        # Re-seed back to pure 15 records
        await execute_deterministic_seed(db, reset_user_records=True)

    print("[PASS] Verification Passed: Real citizen grievances are PRESERVED during demo reset!")
    print("\nALL DETERMINISTIC DEMO TESTS PASSED SUCCESSFULLY!")


if __name__ == "__main__":
    asyncio.run(run_deterministic_demo_test())
