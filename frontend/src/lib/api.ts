import { 
  CitizenFeedbackResponse, 
  GovernmentStats, 
  HotspotSummary, 
  HotspotDetail, 
  ScenarioInfo,
  DemoComplaint 
} from "@/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1";

function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {};
  if (typeof window !== "undefined") {
    const token = sessionStorage.getItem("jansetu_auth_token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }
  return headers;
}

export async function submitTextFeedback(text: string, language: string = "en"): Promise<CitizenFeedbackResponse> {
  const res = await fetch(`${API_BASE}/citizen/submit-text`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    credentials: "include",
    body: JSON.stringify({ text, language })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Submission failed" }));
    throw new Error(err.detail || "Failed to submit feedback");
  }
  return res.json();
}

export async function submitVoiceFeedback(audioBlob: Blob, language: string = "en"): Promise<CitizenFeedbackResponse> {
  const formData = new FormData();
  formData.append("audio", audioBlob, "citizen_voice.webm");
  formData.append("language_hint", language);

  const res = await fetch(`${API_BASE}/citizen/submit-voice`, {
    method: "POST",
    headers: getAuthHeaders(),
    credentials: "include",
    body: formData
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Voice processing failed" }));
    throw new Error(err.detail || "Failed to submit voice recording");
  }
  return res.json();
}

export async function getGovStats(): Promise<GovernmentStats> {
  const res = await fetch(`${API_BASE}/gov/stats`, {
    headers: getAuthHeaders(),
    credentials: "include",
    cache: "no-store"
  });
  if (res.status === 401) throw new Error("UNAUTHENTICATED");
  if (res.status === 403) throw new Error("UNAUTHORIZED");
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
  const res = await fetch(url, {
    headers: getAuthHeaders(),
    credentials: "include",
    cache: "no-store"
  });
  if (res.status === 401) throw new Error("UNAUTHENTICATED");
  if (res.status === 403) throw new Error("UNAUTHORIZED");
  if (!res.ok) throw new Error("Failed to fetch hotspots");
  return res.json();
}

export async function getHotspotDetail(id: string): Promise<HotspotDetail> {
  const res = await fetch(`${API_BASE}/gov/hotspots/${id}`, {
    headers: getAuthHeaders(),
    credentials: "include",
    cache: "no-store"
  });
  if (res.status === 401) throw new Error("UNAUTHENTICATED");
  if (res.status === 403) throw new Error("UNAUTHORIZED");
  if (!res.ok) throw new Error("Failed to fetch hotspot details");
  return res.json();
}

export async function recalculateHotspots(): Promise<{ status: string; hotspots_generated: number }> {
  const res = await fetch(`${API_BASE}/gov/recalculate`, {
    method: "POST",
    headers: getAuthHeaders(),
    credentials: "include"
  });
  if (res.status === 401) throw new Error("UNAUTHENTICATED");
  if (res.status === 403) throw new Error("UNAUTHORIZED");
  if (!res.ok) throw new Error("Recalculation failed");
  return res.json();
}

export async function seedDemoData(resetUserRecords: boolean = false, scenarioId?: string): Promise<any> {
  const url = new URL(`${API_BASE}/admin/seed-demo`);
  if (resetUserRecords) url.searchParams.append("reset_user_records", "true");
  if (scenarioId) url.searchParams.append("scenario_id", scenarioId);
  const res = await fetch(url.toString(), {
    method: "POST",
    headers: getAuthHeaders(),
    credentials: "include"
  });
  if (!res.ok) throw new Error("Seeding demo data failed");
  return res.json();
}

export async function getScenarios(): Promise<ScenarioInfo[]> {
  const res = await fetch(`${API_BASE}/admin/scenarios`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch scenarios");
  return res.json();
}

export async function getDemoComplaints(scenarioId?: string): Promise<DemoComplaint[]> {
  const url = new URL(`${API_BASE}/admin/complaints`);
  if (scenarioId) url.searchParams.append("scenario_id", scenarioId);
  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch complaints");
  return res.json();
}

export async function resetDemoData(resetUserRecords: boolean = false): Promise<any> {
  const url = new URL(`${API_BASE}/admin/reset-demo`);
  if (resetUserRecords) url.searchParams.append("reset_user_records", "true");
  const res = await fetch(url.toString(), {
    method: "POST",
    headers: getAuthHeaders(),
    credentials: "include"
  });
  if (!res.ok) throw new Error("Resetting demo data failed");
  return res.json();
}

export async function getDemoHotspots(params?: {
  district?: string;
  category?: string;
}): Promise<HotspotSummary[]> {
  const query = new URLSearchParams();
  if (params?.district) query.append("district", params.district);
  if (params?.category) query.append("category", params.category);

  const url = `${API_BASE}/admin/demo-hotspots?${query.toString()}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch demo hotspots");
  return res.json();
}

export async function getDemoHotspotDetail(id: string): Promise<HotspotDetail> {
  const res = await fetch(`${API_BASE}/admin/demo-hotspots/${id}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch demo hotspot detail");
  return res.json();
}
