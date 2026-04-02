import { useState, useEffect } from "react";
import { fetchModelInfo } from "@/api";
import type { ModelInfo } from "@/lib/types";
import { motion } from "framer-motion";
import { BrainCircuit, RefreshCw, AlertTriangle, Calendar, Database, Layers, Percent } from "lucide-react";
import AnimatedNumber from "@/components/AnimatedNumber";

function fmt(name: string) {
  const map: Record<string, string> = {
    Global_active_power: "Active Power",
    Global_reactive_power: "Reactive Power",
    Voltage: "Voltage",
    Global_intensity: "Intensity",
    Sub_metering_1: "Sub-meter 1",
    Sub_metering_2: "Sub-meter 2",
    Sub_metering_3: "Sub-meter 3",
  };
  return map[name] ?? name;
}

export default function ModelInfoPage() {
  const [info, setInfo] = useState<ModelInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => {
    load();
  }, []);

  const chartData = info
    ? info.features.map((f) => ({
        feature: fmt(f),
        value: info.feature_stds[f] ?? 0,
      }))
    : [];

  const maxVal = chartData.length ? Math.max(...chartData.map((d) => d.value)) : 1;
  const trainingDateOnly = info?.training_date?.split("T")[0] ?? "—";

  return (
    <div className="h-[calc(100vh-56px)] overflow-hidden bg-background">
      <div className="px-8 py-4 h-full flex flex-col gap-4">
        <div>
          <h1 className="font-sans text-3xl font-bold tracking-tight text-foreground leading-tight">Model Information</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Model configuration &amp; feature analysis</p>
        </div>

        {error && (
          <div className="bg-card rounded-2xl border border-border p-8 text-center">
            <AlertTriangle className="w-10 h-10 text-primary mx-auto mb-3 opacity-60" />
            <p className="font-semibold text-foreground">{error}</p>
            <motion.button onClick={load} className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
              <RefreshCw className="w-4 h-4" /> Retry
            </motion.button>
          </div>
        )}

        {loading && !error && (
          <div className="flex items-center justify-center py-24 gap-3 text-muted-foreground">
            <RefreshCw className="w-5 h-5 animate-spin" />
            <span className="font-sans text-sm">Loading model metadata…</span>
          </div>
        )}

        {info && (
          <div className="grid grid-cols-12 gap-4 h-full min-h-0">
            <div className="col-span-12 lg:col-span-5 flex flex-col gap-4 min-h-0">
              <motion.div className="grid grid-cols-2 gap-3" initial="hidden" animate="show" variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}>
                {[{ icon: BrainCircuit, label: "Model Type", value: info.model_type, accent: false }, { icon: Percent, label: "Contamination", value: `${(info.contamination * 100).toFixed(0)}%`, accent: true }, { icon: Layers, label: "Estimators", value: info.n_estimators, accent: false }, { icon: Database, label: "Records Trained", value: info.total_records_trained, accent: false }].map(({ icon: Icon, label, value, accent }) => (
                  <motion.div key={label} className="bg-card rounded-xl border border-border p-4 shadow-sm flex items-start gap-3" variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}>
                    <div className={`p-2 rounded-lg ${accent ? "bg-primary/10" : "bg-secondary"}`}>
                      <Icon className={`w-4 h-4 ${accent ? "text-primary" : "text-muted-foreground"}`} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">{label}</p>
                      {label === "Records Trained" ? (
                        <AnimatedNumber value={Number(value)} className="text-lg font-semibold text-foreground" useGrouping />
                      ) : (
                        <p className={`text-lg font-semibold truncate ${accent ? "text-primary" : "text-foreground"}`}>{value}</p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              <div className="bg-card rounded-xl border border-border p-4 shadow-sm flex flex-col gap-3 min-h-0">
                <h2 className="font-sans text-base font-semibold text-foreground">Training Details</h2>
                <div className="flex items-center gap-2 text-sm">
                  <div className="p-1.5 rounded-lg bg-secondary">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Last Updated</p>
                    <p className="font-semibold text-foreground">{trainingDateOnly}</p>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <p className="text-[11px] text-muted-foreground uppercase tracking-wide font-semibold">Features Used</p>
                  <div className="flex flex-wrap gap-1.5">
                    {info.features.map((f) => (
                      <span key={f} className="bg-secondary text-foreground text-[11px] font-mono px-2 py-0.5 rounded-full border border-border">
                        {fmt(f)}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="min-h-0">
                  <p className="text-[11px] text-muted-foreground uppercase tracking-wide font-semibold mb-2">Dataset Means</p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {info.features.map((f) => (
                      <div key={f} className="flex justify-between items-center bg-secondary/60 rounded-md px-2 py-1 text-[11px]">
                        <span className="text-muted-foreground">{fmt(f)}</span>
                        <span className="font-mono font-medium text-foreground">{info.feature_means[f]?.toFixed(3)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="col-span-12 lg:col-span-7">
              <div className="bg-card rounded-xl border border-border p-5 shadow-sm h-full flex flex-col gap-3">
                <div>
                  <h2 className="font-sans text-base font-semibold text-foreground">Feature Variance</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">Higher variance indicates stronger anomaly contribution</p>
                </div>
                <div className="flex-1 flex flex-col gap-2 overflow-hidden">
                  {chartData.map((item, index) => {
                    const width = `${(item.value / maxVal) * 100}%`;
                    const highlight = item.feature === "Sub-meter 3";
                    return (
                      <div key={item.feature} className="grid grid-cols-[120px_1fr_56px] items-center gap-2">
                        <span className="text-xs text-muted-foreground">{item.feature}</span>
                        <div className="h-6 rounded-md bg-secondary/70 overflow-hidden">
                          <motion.div className={`h-full ${highlight ? "bg-primary" : "bg-secondary-foreground/30"}`} initial={{ width: 0 }} animate={{ width }} transition={{ duration: 0.45, delay: index * 0.06, ease: "easeOut" }} />
                        </div>
                        <span className="text-xs font-mono text-foreground text-right">{item.value.toFixed(4)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
