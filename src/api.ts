import type { HistoryResponse, StatsData, ModelInfo, PredictResult } from "@/lib/types";

export const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

// ── Predict ────────────────────────────────────────────────────────────────────
// readings: array of [gap, grp, voltage, gi, sm1, sm2, sm3]
export async function predictAnomalies(
  readings: number[][]
): Promise<PredictResult[]> {
  const res = await fetch(`${API_BASE}/predict`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "ngrok-skip-browser-warning": "true",
    },
    body: JSON.stringify({ readings }),
  });
  if (!res.ok) throw new Error(`predict failed: ${res.status}`);
  return res.json();
}

// ── History ────────────────────────────────────────────────────────────────────
export async function fetchHistory(
  pageSize = 100,
  anomaliesOnly = false,
  page = 1,
): Promise<HistoryResponse> {
  const res = await fetch(
    `${API_BASE}/history?page_size=${pageSize}&page=${page}&anomalies_only=${anomaliesOnly}`,
    { headers: { "ngrok-skip-browser-warning": "true" } }
  );
  if (!res.ok) throw new Error(`history failed: ${res.status}`);
  return res.json();
}

// ── Stats ──────────────────────────────────────────────────────────────────────
export async function fetchStats(): Promise<StatsData> {
  const res = await fetch(`${API_BASE}/stats`, {
    headers: { "ngrok-skip-browser-warning": "true" },
  });
  if (!res.ok) throw new Error(`stats failed: ${res.status}`);
  return res.json();
}

// ── Model info ─────────────────────────────────────────────────────────────────
export async function fetchModelInfo(): Promise<ModelInfo> {
  const res = await fetch(`${API_BASE}/model-info`, {
    headers: { "ngrok-skip-browser-warning": "true" },
  });
  if (!res.ok) throw new Error(`model-info failed: ${res.status}`);
  return res.json();
}

// ── Health ─────────────────────────────────────────────────────────────────────
export async function fetchHealth(): Promise<{ status: string; model_loaded: boolean; supabase_configured: boolean }> {
  const res = await fetch(`${API_BASE}/health`, {
    headers: { "ngrok-skip-browser-warning": "true" },
  });
  if (!res.ok) throw new Error(`health failed: ${res.status}`);
  return res.json();
}
