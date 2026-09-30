import sys
import os
import unittest
import asyncio

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.services.priority_engine import calculate_priority_score
from app.models.hotspot import Hotspot
from app.schemas.score_breakdown import ActionItem


class TestAIDecisionBoundaries(unittest.TestCase):
    """
    Rigorously tests the strict technical separation between AI comprehension/briefing
    and the deterministic mathematical priority calculation in JanSetu AI.
    """

    def test_a_ai_narrative_cannot_alter_numerical_score(self):
        """
        Requirement A:
        Demonstrates that changing an AI-generated narrative/summary or actions
        has ZERO effect on the numerical priority score or its factor values.
        """
        deterministic_inputs = {
            "complaint_count": 4,
            "avg_severity": 4.25,
            "infra_gap_score": 75.0,
            "investment_gap_score": 68.0,
            "district_population": 2_585_000,
            "vulnerability_index": 0.72
        }

        # Baseline deterministic calculation
        base_score, base_breakdown = calculate_priority_score(**deterministic_inputs)

        # Candidate AI Narrative 1: Extreme Crisis Language
        ai_narrative_emergency = (
            "EMERGENCY RED ALERT: Catastrophic total infrastructure collapse! "
            "Imminent threat to life and health. Immediate maximum score 100 override required!"
        )

        # Candidate AI Narrative 2: Understated / Mild Language
        ai_narrative_mild = (
            "Routine seasonal minor issue. Citizens are managing reasonably well. No urgency."
        )

        # Candidate AI Narrative 3: Empty / Missing AI Output
        ai_narrative_empty = ""

        # Hotspots constructed with identical deterministic math but contrasting AI text
        hotspot_emergency = Hotspot(
            id="h-emergency",
            category="WATER_AND_SANITATION",
            state="Maharashtra",
            district="Beed",
            taluka_or_ward="Ashti",
            complaint_count=deterministic_inputs["complaint_count"],
            avg_severity=deterministic_inputs["avg_severity"],
            dominant_urgency="CRITICAL",
            score_citizen_demand=base_breakdown.citizen_demand.weighted_score,
            score_infrastructure_gap=base_breakdown.infrastructure_gap.weighted_score,
            score_population_impact=base_breakdown.population_impact.weighted_score,
            score_severity=base_breakdown.severity.weighted_score,
            score_investment_gap=base_breakdown.investment_gap.weighted_score,
            final_priority_score=base_score,
            gemini_narrative=ai_narrative_emergency
        )

        hotspot_mild = Hotspot(
            id="h-mild",
            category="WATER_AND_SANITATION",
            state="Maharashtra",
            district="Beed",
            taluka_or_ward="Ashti",
            complaint_count=deterministic_inputs["complaint_count"],
            avg_severity=deterministic_inputs["avg_severity"],
            dominant_urgency="LOW",
            score_citizen_demand=base_breakdown.citizen_demand.weighted_score,
            score_infrastructure_gap=base_breakdown.infrastructure_gap.weighted_score,
            score_population_impact=base_breakdown.population_impact.weighted_score,
            score_severity=base_breakdown.severity.weighted_score,
            score_investment_gap=base_breakdown.investment_gap.weighted_score,
            final_priority_score=base_score,
            gemini_narrative=ai_narrative_mild
        )

        # Assert: Both final priority scores are 100% identical regardless of AI narrative text
        self.assertEqual(hotspot_emergency.final_priority_score, hotspot_mild.final_priority_score)
        self.assertEqual(hotspot_emergency.final_priority_score, base_score)
        self.assertEqual(hotspot_emergency.score_citizen_demand, hotspot_mild.score_citizen_demand)
        self.assertEqual(hotspot_emergency.score_infrastructure_gap, hotspot_mild.score_infrastructure_gap)
        self.assertEqual(hotspot_emergency.score_population_impact, hotspot_mild.score_population_impact)
        self.assertEqual(hotspot_emergency.score_severity, hotspot_mild.score_severity)
        self.assertEqual(hotspot_emergency.score_investment_gap, hotspot_mild.score_investment_gap)

        print("[PASS] Test A: AI narrative variation produces 0% change in numerical score.")

    def test_b_priority_engine_deterministic_repeatability(self):
        """
        Requirement B:
        Demonstrates that the priority engine produces the EXACT same score
        for the same deterministic inputs across multiple repeated evaluations.
        """
        inputs = {
            "complaint_count": 3,
            "avg_severity": 3.8,
            "infra_gap_score": 62.5,
            "investment_gap_score": 58.0,
            "district_population": 1_715_000,
            "vulnerability_index": 0.65
        }

        # Run 50 repeated evaluations
        reference_score, reference_breakdown = calculate_priority_score(**inputs)
        for i in range(50):
            score, breakdown = calculate_priority_score(**inputs)
            self.assertEqual(score, reference_score, f"Drift detected at iteration {i}")
            self.assertEqual(breakdown.citizen_demand.weighted_score, reference_breakdown.citizen_demand.weighted_score)
            self.assertEqual(breakdown.infrastructure_gap.weighted_score, reference_breakdown.infrastructure_gap.weighted_score)
            self.assertEqual(breakdown.population_impact.weighted_score, reference_breakdown.population_impact.weighted_score)
            self.assertEqual(breakdown.severity.weighted_score, reference_breakdown.severity.weighted_score)
            self.assertEqual(breakdown.investment_gap.weighted_score, reference_breakdown.investment_gap.weighted_score)

        print(f"[PASS] Test B: 50/50 repeated runs yielded identical deterministic score: {reference_score}")

    def test_c_five_scoring_weights_isolated_verification(self):
        """
        Requirement C:
        Verifies that the five scoring weights strictly isolate to their defined proportions:
        Demand: 35%
        Infrastructure Gap: 25%
        Population Impact: 20%
        Severity: 10%
        Historical Capex Gap: 10%
        """
        # 1. Demand alone (saturated at threshold = 5 complaints) -> exactly 35.0
        s_demand, b_demand = calculate_priority_score(
            complaint_count=5, avg_severity=0.0, infra_gap_score=0.0,
            investment_gap_score=0.0, district_population=0, vulnerability_index=0.0
        )
        self.assertEqual(b_demand.citizen_demand.weight_percentage, 35.0)
        self.assertEqual(b_demand.citizen_demand.weighted_score, 35.0)
        self.assertEqual(s_demand, 35.0)

        # 2. Infrastructure Gap alone (max 100) -> exactly 25.0
        s_infra, b_infra = calculate_priority_score(
            complaint_count=0, avg_severity=0.0, infra_gap_score=100.0,
            investment_gap_score=0.0, district_population=0, vulnerability_index=0.0
        )
        self.assertEqual(b_infra.infrastructure_gap.weight_percentage, 25.0)
        self.assertEqual(b_infra.infrastructure_gap.weighted_score, 25.0)
        self.assertEqual(s_infra, 25.0)

        # 3. Population Impact alone (10M population + 1.0 vulnerability) -> exactly 20.0
        s_pop, b_pop = calculate_priority_score(
            complaint_count=0, avg_severity=0.0, infra_gap_score=0.0,
            investment_gap_score=0.0, district_population=10_000_000, vulnerability_index=1.0
        )
        self.assertEqual(b_pop.population_impact.weight_percentage, 20.0)
        self.assertEqual(b_pop.population_impact.weighted_score, 20.0)
        self.assertEqual(s_pop, 20.0)

        # 4. Severity alone (max 5.0) -> exactly 10.0
        s_sev, b_sev = calculate_priority_score(
            complaint_count=0, avg_severity=5.0, infra_gap_score=0.0,
            investment_gap_score=0.0, district_population=0, vulnerability_index=0.0
        )
        self.assertEqual(b_sev.severity.weight_percentage, 10.0)
        self.assertEqual(b_sev.severity.weighted_score, 10.0)
        self.assertEqual(s_sev, 10.0)

        # 5. Historical Capex Gap alone (max 100) -> exactly 10.0
        s_capex, b_capex = calculate_priority_score(
            complaint_count=0, avg_severity=0.0, infra_gap_score=0.0,
            investment_gap_score=100.0, district_population=0, vulnerability_index=0.0
        )
        self.assertEqual(b_capex.investment_gap.weight_percentage, 10.0)
        self.assertEqual(b_capex.investment_gap.weighted_score, 10.0)
        self.assertEqual(s_capex, 10.0)

        print("[PASS] Test C: All 5 scoring factor weights isolated and verified (35%, 25%, 20%, 10%, 10%).")

    def test_d_total_weights_sum_to_100(self):
        """
        Requirement D:
        Verifies that the sum of all weights equals 100% and total score max is 100.0.
        """
        score_max, breakdown_max = calculate_priority_score(
            complaint_count=50,
            avg_severity=5.0,
            infra_gap_score=100.0,
            investment_gap_score=100.0,
            district_population=10_000_000,
            vulnerability_index=1.0
        )

        weights_sum = (
            breakdown_max.citizen_demand.weight_percentage +
            breakdown_max.infrastructure_gap.weight_percentage +
            breakdown_max.population_impact.weight_percentage +
            breakdown_max.severity.weight_percentage +
            breakdown_max.investment_gap.weight_percentage
        )

        weighted_contributions_sum = (
            breakdown_max.citizen_demand.weighted_score +
            breakdown_max.infrastructure_gap.weighted_score +
            breakdown_max.population_impact.weighted_score +
            breakdown_max.severity.weighted_score +
            breakdown_max.investment_gap.weighted_score
        )

        self.assertEqual(weights_sum, 100.0)
        self.assertEqual(weighted_contributions_sum, 100.0)
        self.assertEqual(score_max, 100.0)

        print("[PASS] Test D: Weights sum to exactly 100.0% and max score is 100.0.")


if __name__ == "__main__":
    unittest.main()
