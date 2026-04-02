import { useEffect, useRef } from "react";
import type { PowerReading } from "@/lib/types";
import { AlertTriangle, CheckCircle, Radio } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface Props {
  data: PowerReading[];
}

export default function LiveFeed({ data }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
    if (nearBottom || data.length <= 5) {
      el.scrollTop = el.scrollHeight;
    }
  }, [data.length]);

  const entries = data.slice(-40);
  const getStatusLabel = (row: PowerReading) => {
    if (!row.isAnomaly) return "Inlier";
    if (row.anomalyClass === "critical_outlier") return "Critical Outlier";
    if (row.anomalyClass === "moderate_outlier") return "Moderate Outlier";
    return "Borderline Outlier";
  };

  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-border/60 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative p-2 rounded-xl bg-primary/10">
            <Radio className="w-4 h-4 text-primary" />
            {data.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-primary animate-pulse" />
            )}
          </div>
          <div>
            <h3 className="font-sans text-base font-semibold text-foreground">
              Real-time Feed
            </h3>
            <p className="text-xs text-muted-foreground font-sans tracking-wide">
              Latest readings
            </p>
          </div>
        </div>
        <span className="text-xs text-muted-foreground font-sans bg-secondary/70 px-2.5 py-1 rounded-full border border-border/60">
          {data.length} readings
        </span>
      </div>

      <div
        ref={scrollRef}
        className="overflow-y-auto"
        style={{ height: "260px" }}
      >
        {entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-2">
            <Radio className="w-8 h-8 opacity-30" />
            <p className="text-sm font-sans">Start the stream to see live data</p>
          </div>
        ) : (
          <table className="w-full text-sm font-sans">
            <thead className="sticky top-0 bg-secondary/90 backdrop-blur-sm z-10">
              <tr className="text-left">
                {["Timestamp", "Power (kW)", "Voltage (V)", "Score", "Status"].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-4 py-2.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.08em] whitespace-nowrap"
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <motion.tbody
              initial="hidden"
              animate="show"
              variants={{ hidden: {}, show: { transition: { staggerChildren: 0.04 } } }}
            >
              {entries.map((row, i) => (
                <motion.tr
                  key={`${row.time}-${i}`}
                  className={cn(
                    "border-t border-border/60 transition-colors",
                    row.isAnomaly
                      ? "hover:bg-primary/10 border-l-[3px] border-l-primary"
                      : "hover:bg-secondary/40"
                  )}
                  variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
                >
                  <td className="px-4 py-2.5 text-muted-foreground tabular-nums text-xs whitespace-nowrap">
                    {row.time}
                  </td>
                  <td
                    className={cn(
                      "px-4 py-2.5 font-semibold tabular-nums",
                      row.isAnomaly ? "text-primary" : "text-foreground"
                    )}
                  >
                    {row.consumption.toFixed(3)}
                  </td>
                  <td className="px-4 py-2.5 text-foreground tabular-nums">
                    {row.voltage?.toFixed(1) ?? "—"}
                  </td>
                  <td className="px-4 py-2.5 tabular-nums text-xs">
                    <span
                      className={cn(
                        "font-mono",
                        row.isAnomaly ? "text-primary font-bold" : "text-muted-foreground"
                      )}
                    >
                      {row.anomalyScore.toFixed(4)}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    {row.isAnomaly ? (
                      <motion.span
                        className="inline-flex items-center gap-1.5 bg-primary/10 text-primary text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.2, ease: "backOut" }}
                      >
                        <AlertTriangle className="w-3 h-3" />
                        {getStatusLabel(row)}
                      </motion.span>
                    ) : (
                      <motion.span
                        className="inline-flex items-center gap-1.5 bg-green-500/10 text-green-700 text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.2, ease: "backOut" }}
                      >
                        <CheckCircle className="w-3 h-3" />
                        {getStatusLabel(row)}
                      </motion.span>
                    )}
                  </td>
                </motion.tr>
              ))}
            </motion.tbody>
          </table>
        )}
      </div>
    </div>
  );
}
