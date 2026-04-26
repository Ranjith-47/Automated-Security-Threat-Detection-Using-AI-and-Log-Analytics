import { Activity, AlertTriangle, ShieldCheck, Zap } from "lucide-react";
import { BatchResponse } from "@/types/ids";

interface SummaryCardsProps {
  data: BatchResponse;
}

const SummaryCards = ({ data }: SummaryCardsProps) => {
  const cards = [
    {
      label: "Analyzed Packets",
      value: data.total_packets.toLocaleString(),
      icon: Activity,
      color: "text-primary",
      bg: "bg-primary/5",
      desc: "Total traffic processed"
    },
    {
      label: "Threats Identified",
      value: data.threats_detected.toLocaleString(),
      icon: AlertTriangle,
      color: "text-threat",
      bg: "bg-threat/5",
      desc: "Malicious vectors found"
    },
    {
      label: "Clean Traffic",
      value: (data.total_packets - data.threats_detected).toLocaleString(),
      icon: ShieldCheck,
      color: "text-safe",
      bg: "bg-safe/5",
      desc: "Verified benign flows"
    },
    {
      label: "Engine Confidence",
      value: `${(data.avg_confidence * 100).toFixed(1)}%`,
      icon: Zap,
      color: "text-primary",
      bg: "bg-primary/5",
      desc: "Mean prediction certainty"
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className={`relative overflow-hidden bg-card border border-border/60 rounded-xl p-5 hover:border-primary/30 transition-all group`}
        >
          <div className={`absolute top-0 right-0 w-16 h-16 ${card.bg} rounded-bl-full opacity-50 -mr-4 -mt-4 transition-transform group-hover:scale-110`} />
          
          <div className="flex items-center justify-between mb-4 relative z-10">
            <div className={`p-1.5 rounded-lg ${card.bg}`}>
               <card.icon className={`h-4 w-4 ${card.color}`} />
            </div>
            <span className="text-[10px] font-mono text-muted-foreground/60 font-bold uppercase tracking-widest">
              {card.label}
            </span>
          </div>
          <div className="relative z-10">
            <p className={`text-3xl font-bold font-mono tracking-tighter ${card.color}`}>
              {card.value}
            </p>
            <p className="text-[9px] font-mono text-muted-foreground mt-1 uppercase opacity-60">
              {card.desc}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SummaryCards;
