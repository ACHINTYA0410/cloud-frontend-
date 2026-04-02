import type { PowerReading } from "@/lib/types";
import { AlertTriangle, CheckCircle, BarChart3 } from "lucide-react";

interface Props {
  data: PowerReading[];
}

export default function StatsCards({ data }: Props) {
  const anomalies = data.filter((d) => d.isAnomaly).length;
  const normal = data.length - anomalies;
  const rate = ((anomalies / data.length) * 100).toFixed(1);

  const cards = [
    {
      label: "Total Anomalies",
      value: anomalies,
      icon: AlertTriangle,
      accent: true,
    },
    {
      label: "Normal Readings",
      value: normal,
      icon: CheckCircle,
      accent: false,
    },
    {
      label: "Anomaly Rate",
      value: `${rate}%`,
      icon: BarChart3,
      accent: false,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {cards.map((c) => (
        <div
          key={c.label}
          className="bg-card rounded-2xl border border-border p-5 shadow-sm flex items-start gap-4"
        >
          <div className={`p-2.5 rounded-xl ${c.accent ? "bg-primary/10" : "bg-secondary"}`}>
            <c.icon className={`w-5 h-5 ${c.accent ? "text-primary" : "text-muted-foreground"}`} />
          </div>
          <div>
            <p className="text-sm text-muted-foreground font-sans">{c.label}</p>
            <p className={`text-2xl font-bold font-serif mt-0.5 ${c.accent ? "text-primary" : "text-foreground"}`}>
              {c.value}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
