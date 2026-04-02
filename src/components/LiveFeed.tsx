import { useEffect, useRef } from "react";
import type { PowerReading } from "@/lib/types";
import { AlertTriangle, CheckCircle, Radio } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  data: PowerReading[];
}

export default function LiveFeed({ data }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Scroll only the table container — not the whole page
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    // Only auto-scroll if user is near the bottom (within 80px)
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
    if (nearBottom || data.length <= 5) {
      el.scrollTop = el.scrollHeight;
    }
  }, [data.length]);

  // Chronological order: oldest at top, newest at bottom
  const entries = data.slice(-40);

  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative p-2 rounded-xl bg-primary/10">
            <Radio className="w-4 h-4 text-primary" />
            {data.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-primary animate-pulse" />
            )}
          </div>
          <div>
            <h3 className="font-serif text-base font-bold text-foreground">
              Real-time Feed
            </h3>
            <p className="text-xs text-muted-foreground font-sans">
              Latest sensor readings — anomalies highlighted
            </p>
          </div>
        </div>
        <span className="text-xs text-muted-foreground font-sans bg-secondary px-2.5 py-1 rounded-full">
          {data.length} readings
        </span>
      </div>

      {/* Fixed-height scrollable container — only THIS scrolls, not the page */}
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
                      className="px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap"
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {entries.map((row, i) => (
                <tr
                  key={`${row.time}-${i}`}
                  className={cn(
                    "border-t border-border transition-colors",
                    row.isAnomaly
                      ? "bg-primary/5 hover:bg-primary/10"
                      : "hover:bg-secondary/50"
                  )}
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
                      <span className="inline-flex items-center gap-1.5 bg-primary/10 text-primary text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap">
                        <AlertTriangle className="w-3 h-3" />
                        Anomaly
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 bg-green-500/10 text-green-700 text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap">
                        <CheckCircle className="w-3 h-3" />
                        Normal
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
