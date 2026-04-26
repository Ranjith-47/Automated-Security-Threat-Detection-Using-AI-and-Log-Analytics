import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PredictionResult } from "@/types/ids";
import { Shield, Activity, Globe, Zap, Database } from "lucide-react";

interface PacketDetailModalProps {
  packet: PredictionResult | null;
  isOpen: boolean;
  onClose: () => void;
}

const PacketDetailModal = ({ packet, isOpen, onClose }: PacketDetailModalProps) => {
  if (!packet) return null;

  const isAttack = packet.prediction === "attack";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-card border-border shadow-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 font-mono text-lg border-b border-border pb-4">
            <div className={`p-2 rounded ${isAttack ? "bg-threat/10 text-threat" : "bg-safe/10 text-safe"}`}>
              <Shield className="h-5 w-5" />
            </div>
            PACKET ANALYSIS #{packet.id}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
          {/* Status Section */}
          <div className="space-y-4">
            <div className="bg-secondary/30 rounded-lg p-4 border border-border/50">
              <div className="flex items-center gap-2 mb-2 text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
                <Activity className="h-3 w-3" />
                Detection Status
              </div>
              <div className={`text-xl font-mono font-bold ${isAttack ? "text-threat" : "text-safe"}`}>
                {isAttack ? "⚠ MALICIOUS" : "✓ BENIGN"}
              </div>
              <div className="text-xs font-mono text-muted-foreground mt-1">
                Confidence: {(packet.confidence * 100).toFixed(2)}%
              </div>
              {packet.attack_type && isAttack && (
                <div className="mt-3 px-2 py-1 rounded bg-threat/20 border border-threat/20 text-threat text-xs font-mono inline-block">
                  TYPE: {packet.attack_type}
                </div>
              )}
            </div>

            <div className="bg-secondary/30 rounded-lg p-4 border border-border/50">
              <div className="flex items-center gap-2 mb-2 text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
                <Globe className="h-3 w-3" />
                Connectivity
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-mono text-muted-foreground">Source</span>
                  <span className="text-xs font-mono text-foreground">{packet.features.src_ip as string || "N/A"}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-mono text-muted-foreground">Destination</span>
                  <span className="text-xs font-mono text-foreground">{packet.features.dst_ip as string || "N/A"}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-mono text-muted-foreground">Protocol</span>
                  <span className="text-xs font-mono text-primary font-bold">{packet.features.protocol as string || "N/A"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Technical Payload Section */}
          <div className="bg-secondary/20 rounded-lg border border-border p-4 overflow-hidden">
             <div className="flex items-center gap-2 mb-3 text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
                <Database className="h-3 w-3" />
                Model Features
              </div>
              <div className="max-h-[250px] overflow-y-auto pr-2 custom-scrollbar space-y-1.5">
                {Object.entries(packet.features).map(([key, val]) => (
                  <div key={key} className="flex justify-between text-[9px] font-mono border-b border-border/10 pb-1">
                    <span className="text-muted-foreground truncate mr-4">{key}</span>
                    <span className="text-foreground shrink-0">{String(val)}</span>
                  </div>
                ))}
              </div>
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-border mt-4">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-secondary border border-border rounded text-[10px] font-mono hover:bg-secondary/80 transition-all"
          >
            CLOSE REPORT
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PacketDetailModal;
