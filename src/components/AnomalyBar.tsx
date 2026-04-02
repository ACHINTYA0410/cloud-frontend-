import type { PowerReading } from "@/lib/types";
import { motion } from "framer-motion";

interface Props {
  data: PowerReading[];
}

export default function AnomalyBar({ data }: Props) {
  const scores = data.map((d) => d.anomalyScore);
  const minScore = scores.length ? Math.min(...scores) : -0.3;
  const maxScore = scores.length ? Math.max(...scores) : 0;
  const range = maxScore - minScore || 0.01;

  return (
    <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
      <h3 className="font-sans text-lg font-semibold text-foreground mb-1">
        Anomaly Score Timeline
      </h3>
      <p className="text-xs text-muted-foreground font-sans mb-4">
        Reading-by-reading heatmap of anomaly intensity
      </p>

      {data.length === 0 ? (
        <div className="h-10 rounded-lg bg-secondary/50 flex items-center justify-center">
          <span className="text-xs text-muted-foreground font-sans">
            Start the stream to see scores
          </span>
        </div>
      ) : (
        <motion.div
          className="flex gap-[2px] h-10 rounded-lg overflow-hidden"
          initial="hidden"
          animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.02 } } }}
        >
          {data.map((d, i) => {
            const normalizedScore = (d.anomalyScore - minScore) / range;
            const opacity = 0.15 + normalizedScore * 0.85;
            return (
              <motion.div
                key={`${d.time}-${i}`}
                className="flex-1 relative group cursor-pointer transition-transform hover:scale-y-110 origin-bottom"
                style={{
                  backgroundColor: d.isAnomaly
                    ? `hsla(16, 65%, 55%, ${opacity})`
                    : `hsla(160, 40%, 50%, ${opacity})`,
                }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                <span className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md border border-border bg-card px-2 py-1 text-[10px] text-foreground opacity-0 shadow-sm transition-opacity group-hover:opacity-100">
                  {d.time} | {d.anomalyScore.toFixed(4)}
                </span>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      <div className="flex justify-between mt-2 text-[11px] text-muted-foreground font-sans tracking-wide">
        <span>{data[0]?.time ?? "—"}</span>
        <span>{data[Math.floor(data.length / 2)]?.time ?? ""}</span>
        <span>{data[data.length - 1]?.time ?? "—"}</span>
      </div>
    </div>
  );
}
