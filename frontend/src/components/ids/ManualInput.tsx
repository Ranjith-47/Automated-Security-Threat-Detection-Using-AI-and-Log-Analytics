import { useState } from "react";
import { Terminal, Send, AlertTriangle, CheckCircle, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import axios from "axios";
import { toast } from "sonner";

const FIELDS = [
  { key: "Flow Duration", label: "Flow Duration", placeholder: "1000", type: "number" },
  { key: "Total Fwd Packets", label: "Fwd Packets", placeholder: "2", type: "number" },
  { key: "Total Backward Packets", label: "Bwd Packets", placeholder: "1", type: "number" },
  { key: "Flow Bytes/s", label: "Flow Bytes/s", placeholder: "2048", type: "number" },
  { key: "Flow Packets/s", label: "Flow Packets/s", placeholder: "10", type: "number" },
  { key: "Src IP", label: "Source IP (Metadata)", placeholder: "192.168.1.1", type: "text" },
  { key: "Dst IP", label: "Dest IP (Metadata)", placeholder: "10.0.0.5", type: "text" },
  { key: "Protocol", label: "Protocol", placeholder: "6", type: "number" },
];

const ManualInput = () => {
  const [values, setValues] = useState<Record<string, string>>({});
  const [result, setResult] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      // Map input values to numbers where applicable
      const payload: Record<string, any> = {};
      FIELDS.forEach(f => {
        const val = values[f.key];
        if (val) {
          payload[f.key] = f.type === "number" ? parseFloat(val) : val;
        }
      });

      const response = await axios.post("http://localhost:8000/predict/single", payload);
      setResult(response.data);
      
      if (response.data.Prediction.toLowerCase() !== "normal") {
        toast.error(`Threat Detected: ${response.data.Attack_Type}`);
      } else {
        toast.success("Traffic verified as Benign.");
      }
    } catch (error) {
      console.error("Prediction error:", error);
      toast.error("Failed to connect to the analysis engine.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-card border border-border rounded-xl p-6 space-y-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Terminal className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h3 className="text-xs font-mono font-bold text-muted-foreground tracking-widest uppercase">
              Manual Forensics Console
            </h3>
            <p className="text-[10px] text-muted-foreground/60 font-mono italic">Inject individual flow parameters for immediate AI validation.</p>
          </div>
        </div>
        <Shield className="h-4 w-4 text-muted-foreground/20" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {FIELDS.map((f) => (
          <div key={f.key} className="space-y-1.5">
            <label className="text-[10px] font-mono text-muted-foreground font-semibold uppercase tracking-tight">{f.label}</label>
            <Input
              type={f.type}
              placeholder={f.placeholder}
              value={values[f.key] || ""}
              onChange={(e) => setValues({ ...values, [f.key]: e.target.value })}
              className="font-mono text-xs bg-secondary/30 border-border focus:border-primary/50 transition-colors h-9"
            />
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4 pt-2 border-t border-border/50 mt-4">
        <Button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full sm:w-auto font-mono text-[10px] h-9 px-6 bg-primary text-primary-foreground hover:bg-primary/90 uppercase tracking-widest font-bold shrink-0"
        >
          <Send className="h-3 w-3 mr-2" />
          {loading ? "PROCESSING..." : "ANALYZE FLOW"}
        </Button>

        {result && (
          <div className={`w-full flex items-center justify-between px-4 py-3 rounded-lg border animate-in slide-in-from-left-2 duration-300 ${
            result.Prediction.toLowerCase() !== "normal"
              ? "bg-threat/5 border-threat/20 text-threat"
              : "bg-safe/5 border-safe/20 text-safe"
          }`}>
            <div className="flex items-center gap-3">
              {result.Prediction.toLowerCase() !== "normal" ? (
                <AlertTriangle className="h-4 w-4" />
              ) : (
                <CheckCircle className="h-4 w-4" />
              )}
              <div>
                <div className="text-[10px] font-mono font-bold uppercase tracking-widest">
                  Result: {result.Prediction.toUpperCase()}
                </div>
                {result.Attack_Type !== "Normal" && (
                  <div className="text-[9px] font-mono opacity-80 uppercase">
                    Classification: {result.Attack_Type}
                  </div>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="text-[8px] font-mono opacity-60 uppercase">Confidence</div>
              <div className="text-sm font-mono font-bold">{(result.Confidence * 100).toFixed(2)}%</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManualInput;
