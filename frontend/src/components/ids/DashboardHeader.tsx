import { Shield, LogOut, Terminal, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const DashboardHeader = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <header className="border-b border-border bg-card/60 backdrop-blur-md sticky top-0 z-50">
      <div className="container flex items-center justify-between h-16 px-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-4">
          <div className="relative group">
            <div className="absolute -inset-1 bg-primary/20 rounded-full blur group-hover:bg-primary/30 transition duration-500"></div>
            <div className="relative bg-card rounded-full p-2 border border-primary/20">
              <Shield className="h-6 w-6 text-primary" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold font-mono tracking-tighter text-foreground glow-green-text">
                SENTINEL<span className="text-primary/80">.IDS</span>
              </h1>
              <div className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-secondary border border-border">
                <Activity className="h-3 w-3 text-safe animate-pulse" />
                <span className="text-[10px] font-mono text-safe font-semibold">LIVE</span>
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-[0.2em]">
              Autonomous Threat Intelligence Engine
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="hidden md:flex flex-col items-end gap-0.5">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-safe border border-safe/50 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
              <span className="text-[10px] font-mono text-safe font-medium tracking-wide">CORE SECURE</span>
            </div>
            <span className="text-[10px] font-mono text-muted-foreground/60">
              {new Date().toLocaleDateString()} • {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          {user && (
            <div className="flex items-center gap-4 pl-6 border-l border-border/50">
              <div className="flex flex-col items-end">
                <span className="text-xs font-mono font-medium text-foreground">
                  {user.name}
                </span>
                <span className="text-[9px] font-mono text-primary/70 uppercase">Analyst</span>
              </div>
              <Button
                id="logout-button"
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="h-8 px-3 text-[10px] font-mono border-border hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-all rounded"
              >
                <LogOut className="h-3 w-3 mr-1.5" />
                EXIT
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
