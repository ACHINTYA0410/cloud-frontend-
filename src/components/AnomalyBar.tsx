import type { PowerReading } from "@/lib/types";

interface Props {
  data: PowerReading[];
}

export default function AnomalyBar({ data }: Props) {
  // Isolation Forest score_samples() returns negative values.
  // More negative = more normal. Less negative (closer to 0) = more anomalous.
  // Normalize to [0, 1] using the data's own range so bars always render.
  const scores = data.map((d) => d.anomalyScore);
  const minScore = scores.length ? Math.min(...scores) : -0.3;
  const maxScore = scores.length ? Math.max(...scores) : 0;
  const range = maxScore - minScore || 0.01;

  return (
    <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
      <h3 className="font-serif text-lg font-bold text-foreground mb-1">
        Anomaly Score Timeline
      </h3>
      <p className="text-sm text-muted-foreground font-sans mb-4">
        Score intensity across readings — red = anomalous, green = normal
      </p>

      {data.length === 0 ? (
        <div className="h-10 rounded-lg bg-secondary/50 flex items-center justify-center">
          <span className="text-xs text-muted-foreground font-sans">
            Start the stream to see scores
          </span>
        </div>
      ) : (
        <div className="flex gap-[2px] h-10 rounded-lg overflow-hidden">
          {data.map((d, i) => {
            // normalizedScore: 0 = most normal, 1 = most anomalous
            const normalizedScore = (d.anomalyScore - minScore) / range;
            const opacity = 0.15 + normalizedScore * 0.85;
            return (
              <div
                key={`${d.time}-${i}`}
                className="flex-1 relative group cursor-pointer transition-transform hover:scale-y-110 origin-bottom"
                style={{
                  backgroundColor: d.isAnomaly
                    ? `hsla(16, 65%, 55%, ${opacity})`
                    : `hsla(160, 40%, 50%, ${opacity})`,
                }}
                title={`${d.time} — Score: ${d.anomalyScore.toFixed(4)} · ${d.isAnomaly ? "Anomaly" : "Normal"}`}
              />
            );
          })}
        </div>
      )}

      <div className="flex justify-between mt-2 text-xs text-muted-foreground font-sans">
        <span>{data[0]?.time ?? "—"}</span>
        <span>{data[Math.floor(data.length / 2)]?.time ?? ""}</span>
        <span>{data[data.length - 1]?.time ?? "—"}</span>
      </div>
    </div>
  );
}
