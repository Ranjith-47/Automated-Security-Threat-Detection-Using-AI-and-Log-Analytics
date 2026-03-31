import { useState } from "react";
import { Terminal, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SinglePredictionResponse } from "@/types/ids";
import { generateMockSingleResponse } from "@/lib/mock-api";

const FIELDS = [
  { key: "src_ip", label: "Source IP", placeholder: "192.168.1.10" },
  { key: "dst_ip", label: "Destination IP", placeholder: "10.0.0.5" },
  { key: "src_port", label: "Source Port", placeholder: "49152" },
  { key: "dst_port", label: "Destination Port", placeholder: "443" },
  { key: "protocol", label: "Protocol", placeholder: "TCP" },
  { key: "duration", label: "Duration (s)", placeholder: "1.5" },
  { key: "bytes", label: "Bytes", placeholder: "2048" },
];

const ManualInput = () => {
  const [values, setValues] = useState<Record<string, string>>({});
  const [result, setResult] = useState<SinglePredictionResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    setResult(null);
    // Simulate API call — replace with real axios POST /predict-single
    await new Promise((r) => setTimeout(r, 1200));
    setResult(generateMockSingleResponse());
    setLoading(false);
  };

  return (
    <div className="bg-card border border-border rounded-lg p-5 space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Terminal className="h-4 w-4 text-primary" />
        <h3 className="text-xs font-mono text-muted-foreground tracking-wider">
          MANUAL PACKET ANALYSIS
        </h3>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {FIELDS.map((f) => (
          <div key={f.key}>
            <label className="text-xs font-mono text-muted-foreground mb-1 block">{f.label}</label>
            <Input
              placeholder={f.placeholder}
              value={values[f.key] || ""}
              onChange={(e) => setValues({ ...values, [f.key]: e.target.value })}
              className="font-mono text-xs bg-secondary border-border h-8"
            />
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <Button
          onClick={handleSubmit}
          disabled={loading}
          size="sm"
          className="font-mono text-xs bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Send className="h-3 w-3 mr-1.5" />
          {loading ? "ANALYZING..." : "ANALYZE PACKET"}
        </Button>

        {result && (
          <div className={`flex items-center gap-3 px-4 py-2 rounded-lg font-mono text-sm ${
            result.prediction === "attack"
              ? "bg-threat/10 border border-threat/30 text-threat"
              : "bg-safe/10 border border-safe/30 text-safe"
          }`}>
            <span className="font-semibold">
              {result.prediction === "attack" ? "⚠ THREAT DETECTED" : "✓ NORMAL TRAFFIC"}
            </span>
            {result.attack_type && (
              <span className="text-xs opacity-80">Type: {result.attack_type}</span>
            )}
            <span className="text-xs opacity-60">
              Confidence: {(result.confidence * 100).toFixed(1)}%
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManualInput;
