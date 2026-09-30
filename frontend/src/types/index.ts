export type Language = 'en' | 'hi' | 'mr';

export type Category = 
  | 'WATER_AND_SANITATION'
  | 'ROADS_AND_TRANSPORT'
  | 'ELECTRICITY_AND_ENERGY'
  | 'HEALTHCARE'
  | 'EDUCATION'
  | 'CIVIC_AMENITIES';

export interface FactorComponent {
  name: string;
  weight_percentage: number;
  raw_score: number;
  weighted_score: number;
  benchmark_data: string;
}

export interface ScoreBreakdown {
  citizen_demand: FactorComponent;
  infrastructure_gap: FactorComponent;
  population_impact: FactorComponent;
  severity: FactorComponent;
  investment_gap: FactorComponent;
  final_score: number;
}

export interface EvidenceCitation {
  source_type: string;
  language?: string;
  quote: string;
  location_marker?: string;
  timestamp?: string;
  is_synthetic: boolean;
}

export interface ActionItem {
  step_number: number;
  title: string;
  action_type: 'IMMEDIATE' | 'MEDIUM_TERM' | 'POLICY_BUDGET' | string;
  responsible_agency: string;
  estimated_timeline: string;
  description: string;
}

export interface HotspotSummary {
  id: string;
  category: Category;
  state: string;
  district: string;
  taluka_or_ward?: string;
  center_lat: number;
  center_lng: number;
  radius_km: number;
  complaint_count: number;
  dominant_urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  avg_severity: number;
  final_priority_score: number;
  detected_headline: string;
  last_updated: string;
}

export interface HotspotDetail extends HotspotSummary {
  affected_groups_summary: string[];
  score_breakdown: ScoreBreakdown;
  evidence_citations: EvidenceCitation[];
  gemini_narrative: string;
  suggested_action_plan: ActionItem[];
}

export interface GovernmentStats {
  total_complaints: number;
  active_hotspots_count: number;
  critical_priority_hotspots: number;
  top_categories: { category: Category; count: number }[];
  language_breakdown: Record<string, number>;
  districts_covered: number;
  synthetic_notice: string;
}

export interface CitizenFeedbackResponse {
  ticket_id: string;
  created_at: string;
  input_mode: string;
  detected_language: string;
  raw_input: string;
  category: Category;
  sub_issue: string;
  state: string;
  district: string;
  taluka_or_ward?: string;
  landmark?: string;
  severity_score: number;
  urgency: string;
  affected_group?: string;
  is_synthetic: boolean;
  assigned_hotspot_id?: string;
}

export interface ScenarioInfo {
  id: string;
  title: string;
  region: string;
  category: Category;
  description: string;
  languages: string[];
  expected_priority: string;
}
