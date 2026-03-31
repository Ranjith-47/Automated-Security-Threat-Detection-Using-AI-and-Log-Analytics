import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

const AnalysisProgress = () => {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("Initializing scan...");

  const statuses = [
    "Initializing scan...",
    "Parsing network packets...",
    "Extracting flow features...",
    "Running binary classifier...",
    "Classifying attack types...",
    "Generating threat report...",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((p) => {
        const next = Math.min(p + Math.random() * 15, 95);
        const idx = Math.min(Math.floor(next / 18), statuses.length - 1);
        setStatus(statuses[idx]);
        return next;
      });
    }, 300);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-card border border-border rounded-lg p-8 text-center space-y-4">
      <Loader2 className="h-10 w-10 text-primary mx-auto animate-spin" />
      <div className="space-y-2">
        <p className="font-mono text-sm text-primary glow-green-text">{status}</p>
        <div className="w-full max-w-md mx-auto bg-secondary rounded-full h-2 overflow-hidden">
          <div
            className="bg-primary h-full rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground font-mono">{progress.toFixed(0)}% complete</p>
      </div>
    </div>
  );
};

export default AnalysisProgress;
