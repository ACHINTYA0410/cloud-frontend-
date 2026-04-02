import { useState, useEffect } from "react";
import { fetchModelInfo } from "@/api";
import type { ModelInfo } from "@/lib/types";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  BrainCircuit,
  Award,
  RefreshCw,
  AlertTriangle,
  Calendar,
  Database,
  Layers,
  Percent,
} from "lucide-react";

// ── Feature name formatter ─────────────────────────────────────────────────────
function fmt(name: string) {
  const map: Record<string, string> = {
    Global_active_power:   "Active Power",
    Global_reactive_power: "Reactive Power",
    Voltage:               "Voltage",
    Global_intensity:      "Intensity",
    Sub_metering_1:        "Sub-meter 1",
    Sub_metering_2:        "Sub-meter 2",
    Sub_metering_3:        "Sub-meter 3",
  };
  return map[name] ?? name;
}

// ── Custom tooltip ─────────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl bg-card border border-border px-3 py-2 shadow-md text-sm font-sans">
      <p className="font-semibold text-foreground">{payload[0].payload.feature}</p>
      <p className="text-muted-foreground">
        Std. Dev:{" "}
        <span className="text-foreground font-medium">
          {payload[0].value.toFixed(4)}
        </span>
      </p>
    </div>
  );
};

export default function ModelInfoPage() {
  const [info, setInfo]       = useState<ModelInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchModelInfo();
      setInfo(data);
    } catch (e: any) {
      setError(e.message ?? "Failed to load model info.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // Build chart data from feature stds (higher std → more variance → more influence)
  const chartData = info
    ? info.features.map((f) => ({
        feature: fmt(f),
        value:   info.feature_stds[f] ?? 0,
      }))
    : [];

  const maxVal = chartData.length ? Math.max(...chartData.map((d) => d.value)) : 1;

  return (
    <div className="min-h-screen bg-background">
      <div className="px-8 py-8 flex flex-col gap-6">
        {/* Page title */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="font-serif text-2xl font-bold text-foreground leading-tight">
              Model Information
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Isolation Forest — configuration &amp; feature analysis
            </p>
          </div>
          <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 text-xs font-semibold px-3 py-1.5 rounded-full">
            <Award className="w-3.5 h-3.5" />
            Model Status: Live on AWS
          </div>
        </div>
        {/* ── Error / loading states ───────────────────────────────────── */}
        {error && (
          <div className="bg-card rounded-2xl border border-border p-8 text-center">
            <AlertTriangle className="w-10 h-10 text-primary mx-auto mb-3 opacity-60" />
            <p className="font-semibold text-foreground">{error}</p>
            <p className="text-sm text-muted-foreground mt-1">
              Make sure the Flask backend is running and the model is trained.
            </p>
            <button
              onClick={load}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90"
            >
              <RefreshCw className="w-4 h-4" /> Retry
            </button>
          </div>
        )}

        {loading && !error && (
          <div className="flex items-center justify-center py-24 gap-3 text-muted-foreground">
            <RefreshCw className="w-5 h-5 animate-spin" />
            <span className="font-sans text-sm">Loading model metadata…</span>
          </div>
        )}

        {info && (
          <>
            {/* ── Stat cards ─────────────────────────────────────────────── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  icon: BrainCircuit,
                  label: "Model Type",
                  value: info.model_type,
                  accent: false,
                },
                {
                  icon: Percent,
                  label: "Contamination Rate",
                  value: `${(info.contamination * 100).toFixed(0)}%`,
                  accent: true,
                },
                {
                  icon: Layers,
                  label: "Estimators",
                  value: info.n_estimators,
                  accent: false,
                },
                {
                  icon: Database,
                  label: "Records Trained",
                  value: info.total_records_trained.toLocaleString(),
                  accent: false,
                },
              ].map(({ icon: Icon, label, value, accent }) => (
                <div
                  key={label}
                  className="bg-card rounded-2xl border border-border p-5 shadow-sm flex items-start gap-4"
                >
                  <div className={`p-2.5 rounded-xl ${accent ? "bg-primary/10" : "bg-secondary"}`}>
                    <Icon className={`w-5 h-5 ${accent ? "text-primary" : "text-muted-foreground"}`} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-muted-foreground font-sans">{label}</p>
                    <p className={`text-xl font-bold font-serif mt-0.5 truncate ${accent ? "text-primary" : "text-foreground"}`}>
                      {value}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Training date + feature list */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Training info */}
              <div className="bg-card rounded-2xl border border-border p-6 shadow-sm flex flex-col gap-4">
                <h2 className="font-serif text-lg font-bold text-foreground">
                  Training Details
                </h2>
                <div className="flex items-center gap-3 text-sm">
                  <div className="p-2 rounded-xl bg-secondary">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Training Date</p>
                    <p className="font-semibold text-foreground">{info.training_date}</p>
                  </div>
                </div>
                <div className="flex flex-col gap-2 pt-2">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">
                    Features used ({info.features.length})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {info.features.map((f) => (
                      <span
                        key={f}
                        className="bg-secondary text-foreground text-xs font-mono px-2.5 py-1 rounded-full border border-border"
                      >
                        {fmt(f)}
                      </span>
                    ))}
                  </div>
                </div>
                {/* Feature means table */}
                <div className="mt-2">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold mb-2">
                    Dataset means
                  </p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {info.features.map((f) => (
                      <div
                        key={f}
                        className="flex justify-between items-center bg-secondary/60 rounded-lg px-3 py-1.5 text-xs"
                      >
                        <span className="text-muted-foreground">{fmt(f)}</span>
                        <span className="font-mono font-medium text-foreground">
                          {info.feature_means[f]?.toFixed(3)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Feature importance chart */}
              <div className="bg-card rounded-2xl border border-border p-6 shadow-sm flex flex-col gap-4">
                <div>
                  <h2 className="font-serif text-lg font-bold text-foreground">
                    Feature Variance
                  </h2>
                  <p className="text-sm text-muted-foreground font-sans mt-0.5">
                    Standard deviation per feature — higher variance drives more anomaly contribution
                  </p>
                </div>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart
                    data={chartData}
                    layout="vertical"
                    margin={{ top: 0, right: 16, bottom: 0, left: 8 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="hsl(35 18% 85%)"
                      horizontal={false}
                    />
                    <XAxis
                      type="number"
                      tick={{ fill: "hsl(220 8% 50%)", fontSize: 11, fontFamily: "Source Sans 3" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      type="category"
                      dataKey="feature"
                      width={90}
                      tick={{ fill: "hsl(220 8% 50%)", fontSize: 11, fontFamily: "Source Sans 3" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: "hsl(35 25% 88%)" }} />
                    <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            entry.value === maxVal
                              ? "hsl(16 65% 55%)"
                              : "hsl(35 25% 75%)"
                          }
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* ── Tech stack badge row ──────────────────────────────────── */}
            <div className="bg-card rounded-2xl border border-border p-5 shadow-sm flex flex-wrap gap-3 items-center">
              <span className="text-sm font-semibold text-muted-foreground mr-2">Stack:</span>
              {[
                { label: "Isolation Forest", color: "bg-primary/10 text-primary border-primary/20" },
                { label: "scikit-learn 1.3", color: "bg-blue-500/10 text-blue-700 border-blue-500/20" },
                { label: "Flask + Gunicorn", color: "bg-purple-500/10 text-purple-700 border-purple-500/20" },
                { label: "AWS Elastic Beanstalk", color: "bg-orange-500/10 text-orange-700 border-orange-500/20" },
                { label: "Supabase PostgreSQL", color: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20" },
                { label: "Supabase Realtime", color: "bg-teal-500/10 text-teal-700 border-teal-500/20" },
              ].map(({ label, color }) => (
                <span
                  key={label}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${color}`}
                >
                  {label}
                </span>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
