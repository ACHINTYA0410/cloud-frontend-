import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceDot,
} from "recharts";
import type { PowerReading } from "@/lib/types";

interface Props {
  data: PowerReading[];
}

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload as PowerReading;
  return (
    <div className="rounded-xl bg-card border border-border px-4 py-3 shadow-md font-sans text-sm">
      <p className="font-semibold text-foreground">{d.time}</p>
      <p className="text-muted-foreground">
        Consumption: <span className="text-foreground font-medium">{d.consumption} kW</span>
      </p>
      <p className="text-muted-foreground">
        Anomaly Score: <span className={d.isAnomaly ? "text-primary font-semibold" : "text-foreground font-medium"}>
          {d.anomalyScore.toFixed(4)}
        </span>
      </p>
      {d.isAnomaly && <p className="text-primary font-semibold mt-1">⚠ Anomaly Detected</p>}
    </div>
  );
};

export default function PowerChart({ data }: Props) {
  const anomalies = data.filter((d) => d.isAnomaly);

  return (
    <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
      <h2 className="font-serif text-xl font-bold text-foreground mb-1">Power Consumption Over Time</h2>
      <p className="text-sm text-muted-foreground font-sans mb-6">24-hour monitoring window · anomalies highlighted</p>
      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: -10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(35 18% 85%)" />
          <XAxis
            dataKey="time"
            tick={{ fill: "hsl(220 8% 50%)", fontSize: 12, fontFamily: "Source Sans 3" }}
            axisLine={{ stroke: "hsl(35 18% 85%)" }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "hsl(220 8% 50%)", fontSize: 12, fontFamily: "Source Sans 3" }}
            axisLine={false}
            tickLine={false}
            unit=" kW"
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="consumption"
            stroke="hsl(220 10% 35%)"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 5, fill: "hsl(220 10% 35%)" }}
          />
          {anomalies.map((a) => (
            <ReferenceDot
              key={a.hour}
              x={a.time}
              y={a.consumption}
              r={7}
              fill="hsl(16 65% 55%)"
              stroke="hsl(40 30% 97%)"
              strokeWidth={2.5}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
