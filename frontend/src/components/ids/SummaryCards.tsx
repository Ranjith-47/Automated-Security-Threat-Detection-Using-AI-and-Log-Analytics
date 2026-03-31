import { Activity, AlertTriangle, CheckCircle, Database } from "lucide-react";
import { BatchResponse } from "@/types/ids";

interface SummaryCardsProps {
  data: BatchResponse;
}

const SummaryCards = ({ data }: SummaryCardsProps) => {
  const cards = [
    {
      label: "TOTAL RECORDS",
      value: data.total.toLocaleString(),
      icon: Database,
      colorClass: "text-primary",
      glowClass: "glow-green",
    },
    {
      label: "THREATS DETECTED",
      value: data.attacks.toLocaleString(),
      icon: AlertTriangle,
      colorClass: "text-threat",
      glowClass: "glow-red",
    },
    {
      label: "NORMAL TRAFFIC",
      value: data.normal.toLocaleString(),
      icon: CheckCircle,
      colorClass: "text-safe",
      glowClass: "glow-green",
    },
    {
      label: "THREAT RATE",
      value: `${((data.attacks / data.total) * 100).toFixed(1)}%`,
      icon: Activity,
      colorClass: data.attacks / data.total > 0.2 ? "text-threat" : "text-warning",
      glowClass: data.attacks / data.total > 0.2 ? "glow-red" : "",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className={`bg-card border border-border rounded-lg p-5 ${card.glowClass} transition-all hover:border-primary/30`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono text-muted-foreground tracking-wider">
              {card.label}
            </span>
            <card.icon className={`h-5 w-5 ${card.colorClass}`} />
          </div>
          <p className={`text-3xl font-bold font-mono ${card.colorClass}`}>
            {card.value}
          </p>
        </div>
      ))}
    </div>
  );
};

export default SummaryCards;
