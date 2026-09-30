import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.services.priority_engine import calculate_priority_score

def test_priority_score_weights():
    """
    Verifies that the 5 components sum exactly to 100% when all factors are maximized:
    35% Demand + 25% Infra Gap + 20% Population + 10% Severity + 10% Investment Gap = 100.0
    """
    final_score, breakdown = calculate_priority_score(
        complaint_count=50, # Exceeds threshold -> raw 100.0
        avg_severity=5.0,   # Max severity -> raw 100.0
        infra_gap_score=100.0, # Max deficit -> raw 100.0
        investment_gap_score=100.0, # Max capex deficit -> raw 100.0
        district_population=10_000_000, # Max population -> 70.0
        vulnerability_index=1.0 # Max vulnerability -> 30.0 (Total pop = 100.0)
    )

    assert breakdown.citizen_demand.weighted_score == 35.0
    assert breakdown.infrastructure_gap.weighted_score == 25.0
    assert breakdown.population_impact.weighted_score == 20.0
    assert breakdown.severity.weighted_score == 10.0
    assert breakdown.investment_gap.weighted_score == 10.0
    assert final_score == 100.0

def test_zero_baseline_score():
    """
    Verifies that with minimal values, the score is near zero.
    """
    final_score, breakdown = calculate_priority_score(
        complaint_count=0,
        avg_severity=0.0,
        infra_gap_score=0.0,
        investment_gap_score=0.0,
        district_population=0,
        vulnerability_index=0.0
    )

    assert final_score == 0.0

if __name__ == "__main__":
    test_priority_score_weights()
    test_zero_baseline_score()
    print("Priority Engine Mathematical Verification Passed Successfully!")
