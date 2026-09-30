import { 
  CitizenFeedbackResponse, 
  GovernmentStats, 
  HotspotSummary, 
  HotspotDetail, 
  ScenarioInfo 
} from "@/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1";

export async function submitTextFeedback(text: string, language: string = "mr"): Promise<CitizenFeedbackResponse> {
  const res = await fetch(`${API_BASE}/citizen/submit-text`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, language })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Submission failed" }));
    throw new Error(err.detail || "Failed to submit feedback");
  }
  return res.json();
}

export async function submitVoiceFeedback(audioBlob: Blob, language: string = "mr"): Promise<CitizenFeedbackResponse> {
  const formData = new FormData();
  formData.append("audio", audioBlob, "citizen_voice.webm");
  formData.append("language_hint", language);

  const res = await fetch(`${API_BASE}/citizen/submit-voice`, {
    method: "POST",
    body: formData
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Voice processing failed" }));
    throw new Error(err.detail || "Failed to submit voice recording");
  }
  return res.json();
}

export async function getGovStats(): Promise<GovernmentStats> {
  const res = await fetch(`${API_BASE}/gov/stats`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch dashboard stats");
  return res.json();
}

export async function getHotspots(params?: {
  district?: string;
  category?: string;
  min_score?: number;
}): Promise<HotspotSummary[]> {
  const query = new URLSearchParams();
  if (params?.district) query.append("district", params.district);
  if (params?.category) query.append("category", params.category);
  if (params?.min_score !== undefined && params.min_score > 0) query.append("min_score", params.min_score.toString());

  const url = `${API_BASE}/gov/hotspots?${query.toString()}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch hotspots");
  return res.json();
}

export async function getHotspotDetail(id: string): Promise<HotspotDetail> {
  const res = await fetch(`${API_BASE}/gov/hotspots/${id}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch hotspot details");
  return res.json();
}

export async function recalculateHotspots(): Promise<{ status: string; hotspots_generated: number }> {
  const res = await fetch(`${API_BASE}/gov/recalculate`, {
    method: "POST"
  });
  if (!res.ok) throw new Error("Recalculation failed");
  return res.json();
}

export async function seedDemoData(): Promise<any> {
  const res = await fetch(`${API_BASE}/admin/seed-demo`, {
    method: "POST"
  });
  if (!res.ok) throw new Error("Seeding demo data failed");
  return res.json();
}

export async function getScenarios(): Promise<ScenarioInfo[]> {
  const res = await fetch(`${API_BASE}/admin/scenarios`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch scenarios");
  return res.json();
}
