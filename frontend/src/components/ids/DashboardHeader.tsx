import { Shield } from "lucide-react";

const DashboardHeader = () => {
  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container flex items-center justify-between h-16 px-6">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Shield className="h-8 w-8 text-primary" />
            <div className="absolute inset-0 animate-ping opacity-20">
              <Shield className="h-8 w-8 text-primary" />
            </div>
          </div>
          <div>
            <h1 className="text-lg font-bold font-mono tracking-wider text-foreground glow-green-text">
              SENTINEL IDS
            </h1>
            <p className="text-xs text-muted-foreground font-mono">
              Intrusion Detection System v2.4
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-safe animate-pulse" />
            <span className="text-xs font-mono text-safe">SYSTEM ONLINE</span>
          </div>
          <span className="text-xs font-mono text-muted-foreground">
            {new Date().toLocaleString()}
          </span>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
