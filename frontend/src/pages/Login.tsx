/**
 * Login Page for Sentinel IDS.
 * Matches the existing dark cybersecurity theme with green accents.
 */

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Shield, LogIn, Eye, EyeOff } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

const API_URL = "http://localhost:8000";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !password) {
      toast.error("Please fill in all fields.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Login failed.");
      }

      // Save auth state and redirect to dashboard
      login(data.token, data.user);
      toast.success("Login successful. Welcome back!");
      navigate("/", { replace: true });
    } catch (err: any) {
      toast.error(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background relative flex items-center justify-center p-4">
      {/* Grid overlay — same as dashboard */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(hsl(152 70% 45% / 0.3) 1px, transparent 1px), linear-gradient(90deg, hsl(152 70% 45% / 0.3) 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />

      {/* Scan line animation */}
      <div className="fixed inset-0 pointer-events-none scan-line" />

      <Card className="w-full max-w-md border-border bg-card/80 backdrop-blur-md glow-green relative z-10">
        <CardHeader className="text-center space-y-4">
          {/* Shield logo with pulse — matches DashboardHeader */}
          <div className="flex justify-center">
            <div className="relative">
              <Shield className="h-12 w-12 text-primary" />
              <div className="absolute inset-0 animate-ping opacity-20">
                <Shield className="h-12 w-12 text-primary" />
              </div>
            </div>
          </div>

          <div>
            <CardTitle className="text-2xl font-bold font-mono tracking-wider text-foreground glow-green-text">
              SENTINEL IDS
            </CardTitle>
            <CardDescription className="text-muted-foreground font-mono text-xs mt-1">
              SECURE ACCESS PORTAL
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="login-email" className="font-mono text-xs text-muted-foreground uppercase tracking-wider">
                Email
              </Label>
              <Input
                id="login-email"
                type="email"
                placeholder="operator@sentinel.ids"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-secondary border-border font-mono text-sm placeholder:text-muted-foreground/50 focus:border-primary"
                autoComplete="email"
                disabled={isLoading}
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="login-password" className="font-mono text-xs text-muted-foreground uppercase tracking-wider">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-secondary border-border font-mono text-sm placeholder:text-muted-foreground/50 focus:border-primary pr-10"
                  autoComplete="current-password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <Button
              id="login-submit"
              type="submit"
              className="w-full font-mono text-sm tracking-wider"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  AUTHENTICATING...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <LogIn className="h-4 w-4" />
                  LOGIN
                </span>
              )}
            </Button>
          </form>

          {/* Footer link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="text-primary hover:text-primary/80 font-mono font-medium transition-colors"
              >
                Sign up
              </Link>
            </p>
          </div>

          {/* Status indicator */}
          <div className="mt-4 flex items-center justify-center gap-2">
            <span className="h-2 w-2 rounded-full bg-safe animate-pulse" />
            <span className="text-xs font-mono text-safe">SYSTEM ONLINE</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
