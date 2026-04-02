import type { PowerReading } from "@/lib/types";
import { AlertTriangle, CheckCircle, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";
import AnimatedNumber from "@/components/AnimatedNumber";

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
    },
    {
      label: "Normal Readings",
      value: normal,
      icon: CheckCircle,
    },
    {
      label: "Anomaly Rate",
      value: Number(rate),
      icon: BarChart3,
    },
  ];

  return (
    <motion.div
      className="grid grid-cols-1 sm:grid-cols-3 gap-4"
      initial="hidden"
      animate="show"
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
    >
      {cards.map((c) => (
        <motion.div
          key={c.label}
          className="bg-card rounded-2xl border border-border p-5 shadow-sm flex items-start gap-4 transition-all hover:-translate-y-0.5 hover:shadow-md"
          variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
        >
          <div
            className={`p-3 rounded-xl ${
              c.label === "Total Anomalies"
                ? "bg-primary/15"
                : c.label === "Normal Readings"
                  ? "bg-green-500/15"
                  : "bg-secondary"
            }`}
          >
            <c.icon
              className={`w-5 h-5 ${
                c.label === "Total Anomalies"
                  ? "text-primary"
                  : c.label === "Normal Readings"
                    ? "text-green-700"
                    : "text-muted-foreground"
              }`}
            />
          </div>
          <div
            className={`border-l-4 pl-3 ${
              c.label === "Total Anomalies"
                ? "border-primary"
                : c.label === "Normal Readings"
                  ? "border-green-500"
                  : "border-border"
            }`}
          >
            <p className="text-sm text-muted-foreground font-sans">{c.label}</p>
            <AnimatedNumber
              value={typeof c.value === "number" ? c.value : 0}
              className={`text-3xl font-bold font-sans mt-1 ${
                c.label === "Total Anomalies"
                  ? "text-primary"
                  : c.label === "Normal Readings"
                    ? "text-green-700"
                    : "text-foreground"
              }`}
              decimals={c.label === "Anomaly Rate" ? 1 : 0}
              suffix={c.label === "Anomaly Rate" ? "%" : ""}
            />
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
