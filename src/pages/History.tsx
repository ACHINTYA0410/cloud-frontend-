import { useState, useEffect, useCallback } from "react";
import { fetchHistory } from "@/api";
import { supabase } from "@/supabaseClient";
import type { HistoryRow } from "@/lib/types";
import {
  AlertTriangle,
  CheckCircle,
  Download,
  Filter,
  History as HistoryIcon,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── CSV export ─────────────────────────────────────────────────────────────────
function exportToCsv(rows: HistoryRow[]) {
  const headers = [
    "id", "timestamp", "global_active_power", "global_reactive_power",
    "voltage", "global_intensity", "sub_metering_1", "sub_metering_2",
    "sub_metering_3", "anomaly_score", "is_anomaly",
  ];
  const csvContent = [
    headers.join(","),
    ...rows.map((r) =>
      [
        r.id,
        r.timestamp,
        r.global_active_power,
        r.global_reactive_power,
        r.voltage,
        r.global_intensity,
        r.sub_metering_1,
        r.sub_metering_2,
        r.sub_metering_3,
        r.anomaly_score,
        r.is_anomaly,
      ].join(",")
    ),
  ].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = `anomaly-history-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Helpers ────────────────────────────────────────────────────────────────────
function fmt(ts: string) {
  try {
    return new Date(ts).toLocaleString("en-GB", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit", second: "2-digit",
    });
  } catch {
    return ts;
  }
}

export default function HistoryPage() {
  const [rows, setRows]            = useState<HistoryRow[]>([]);
  const [loading, setLoading]      = useState(true);
  const [error, setError]          = useState<string | null>(null);
  const [anomaliesOnly, setAnomaliesOnly] = useState(false);
  const [limit, setLimit]          = useState(100);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchHistory(limit, anomaliesOnly);
      setRows(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setError(e.message ?? "Failed to load history. Is the backend running?");
    } finally {
      setLoading(false);
    }
  }, [limit, anomaliesOnly]);

  // Initial load
  useEffect(() => { load(); }, [load]);

  // Supabase Realtime — live updates on new INSERT
  useEffect(() => {
    const channel = supabase
      .channel("predictions-feed")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "predictions" },
        (payload) => {
          const newRow = payload.new as HistoryRow;
          if (anomaliesOnly && !newRow.is_anomaly) return;
          setRows((prev) => [newRow, ...prev].slice(0, limit));
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [anomaliesOnly, limit]);

  const anomalyCount  = rows.filter((r) => r.is_anomaly).length;
  const normalCount   = rows.length - anomalyCount;

  return (
    <div className="min-h-screen bg-background">
      <div className="px-8 py-8 flex flex-col gap-6">
        {/* Page title */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="font-serif text-2xl font-bold text-foreground leading-tight">
              Historical Analysis
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Past anomaly detections from Supabase
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-medium text-green-700 bg-green-500/10 border border-green-500/20 px-3 py-1.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            Live
          </div>
        </div>
        {/* ── Summary cards ──────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "Records Shown",    value: rows.length,   icon: HistoryIcon,     accent: false },
            { label: "Anomalies",        value: anomalyCount,  icon: AlertTriangle,   accent: true  },
            { label: "Normal Readings",  value: normalCount,   icon: CheckCircle,     accent: false },
          ].map(({ label, value, icon: Icon, accent }) => (
            <div
              key={label}
              className="bg-card rounded-2xl border border-border p-5 shadow-sm flex items-start gap-4"
            >
              <div className={`p-2.5 rounded-xl ${accent ? "bg-primary/10" : "bg-secondary"}`}>
                <Icon className={`w-5 h-5 ${accent ? "text-primary" : "text-muted-foreground"}`} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-sans">{label}</p>
                <p className={`text-2xl font-bold font-serif mt-0.5 ${accent ? "text-primary" : "text-foreground"}`}>
                  {value}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Toolbar ────────────────────────────────────────────────────── */}
        <div className="bg-card rounded-2xl border border-border p-4 shadow-sm flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          {/* Anomalies toggle */}
          <label className="flex items-center gap-2.5 cursor-pointer select-none">
            <div
              role="checkbox"
              aria-checked={anomaliesOnly}
              tabIndex={0}
              onClick={() => setAnomaliesOnly((v) => !v)}
              onKeyDown={(e) => e.key === "Enter" && setAnomaliesOnly((v) => !v)}
              className={cn(
                "w-9 h-5 rounded-full transition-colors duration-200 relative",
                anomaliesOnly ? "bg-primary" : "bg-border"
              )}
            >
              <span
                className={cn(
                  "absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200",
                  anomaliesOnly ? "translate-x-4" : "translate-x-0.5"
                )}
              />
            </div>
            <Filter className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">Anomalies only</span>
          </label>

          {/* Limit select */}
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-sm text-muted-foreground">Show</span>
            <select
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              className="rounded-xl border border-border bg-card text-sm font-sans text-foreground px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              {[50, 100, 200, 500].map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
            <span className="text-sm text-muted-foreground">rows</span>
          </div>

          {/* Refresh */}
          <button
            onClick={load}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-card text-foreground text-sm font-medium hover:bg-secondary transition-colors disabled:opacity-50"
          >
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
            Refresh
          </button>

          {/* Export CSV */}
          <button
            onClick={() => exportToCsv(rows)}
            disabled={rows.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity shadow-sm disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>

        {/* ── Table ──────────────────────────────────────────────────────── */}
        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          {error ? (
            <div className="px-8 py-16 text-center">
              <AlertTriangle className="w-10 h-10 text-primary mx-auto mb-3 opacity-60" />
              <p className="text-foreground font-semibold">{error}</p>
              <p className="text-sm text-muted-foreground mt-1">
                Make sure the Flask backend is running on port 5000.
              </p>
              <button
                onClick={load}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
              >
                <RefreshCw className="w-4 h-4" /> Retry
              </button>
            </div>
          ) : loading ? (
            <div className="flex items-center justify-center py-20 gap-3 text-muted-foreground">
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span className="font-sans text-sm">Loading from Supabase…</span>
            </div>
          ) : rows.length === 0 ? (
            <div className="px-8 py-16 text-center text-muted-foreground">
              <HistoryIcon className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="font-semibold">No records found</p>
              <p className="text-sm mt-1">Start the stream on the Dashboard to generate predictions.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm font-sans">
                <thead className="bg-secondary/60 border-b border-border">
                  <tr>
                    {[
                      "Timestamp", "Power (kW)", "React. Power", "Voltage (V)",
                      "Intensity (A)", "SM-1", "SM-2", "SM-3", "Score", "Status",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, i) => (
                    <tr
                      key={r.id ?? i}
                      className={cn(
                        "border-t border-border transition-colors",
                        r.is_anomaly
                          ? "bg-primary/5 hover:bg-primary/10"
                          : "hover:bg-secondary/40"
                      )}
                    >
                      <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap tabular-nums">
                        {fmt(r.timestamp)}
                      </td>
                      <td className={cn("px-4 py-3 font-semibold tabular-nums", r.is_anomaly ? "text-primary" : "text-foreground")}>
                        {r.global_active_power?.toFixed(3)}
                      </td>
                      <td className="px-4 py-3 text-foreground tabular-nums">
                        {r.global_reactive_power?.toFixed(3)}
                      </td>
                      <td className="px-4 py-3 text-foreground tabular-nums">
                        {r.voltage?.toFixed(1)}
                      </td>
                      <td className="px-4 py-3 text-foreground tabular-nums">
                        {r.global_intensity?.toFixed(1)}
                      </td>
                      <td className="px-4 py-3 text-foreground tabular-nums">{r.sub_metering_1?.toFixed(0)}</td>
                      <td className="px-4 py-3 text-foreground tabular-nums">{r.sub_metering_2?.toFixed(0)}</td>
                      <td className="px-4 py-3 text-foreground tabular-nums">{r.sub_metering_3?.toFixed(0)}</td>
                      <td className="px-4 py-3 tabular-nums">
                        <span className={cn("text-xs font-mono", r.is_anomaly ? "text-primary font-bold" : "text-muted-foreground")}>
                          {r.anomaly_score?.toFixed(4)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {r.is_anomaly ? (
                          <span className="inline-flex items-center gap-1 bg-primary/10 text-primary text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap">
                            <AlertTriangle className="w-3 h-3" /> Anomaly
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-green-500/10 text-green-700 text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap">
                            <CheckCircle className="w-3 h-3" /> Normal
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
