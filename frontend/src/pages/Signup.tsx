/**
 * Signup Page for Sentinel IDS.
 * Matches the existing dark cybersecurity theme with green accents.
 */

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Shield, UserPlus, Eye, EyeOff } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

const API_URL = "http://localhost:8000";

const Signup = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Client-side validation
    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      toast.error("Please fill in all fields.");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Signup failed.");
      }

      // Auto-login after successful signup
      login(data.token, data.user);
      toast.success("Account created successfully. Welcome aboard!");
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
              CREATE NEW OPERATOR ACCOUNT
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="signup-name" className="font-mono text-xs text-muted-foreground uppercase tracking-wider">
                Name
              </Label>
              <Input
                id="signup-name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-secondary border-border font-mono text-sm placeholder:text-muted-foreground/50 focus:border-primary"
                autoComplete="name"
                disabled={isLoading}
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="signup-email" className="font-mono text-xs text-muted-foreground uppercase tracking-wider">
                Email
              </Label>
              <Input
                id="signup-email"
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
              <Label htmlFor="signup-password" className="font-mono text-xs text-muted-foreground uppercase tracking-wider">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="signup-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Min 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-secondary border-border font-mono text-sm placeholder:text-muted-foreground/50 focus:border-primary pr-10"
                  autoComplete="new-password"
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

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="signup-confirm" className="font-mono text-xs text-muted-foreground uppercase tracking-wider">
                Confirm Password
              </Label>
              <div className="relative">
                <Input
                  id="signup-confirm"
                  type={showConfirm ? "text" : "password"}
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-secondary border-border font-mono text-sm placeholder:text-muted-foreground/50 focus:border-primary pr-10"
                  autoComplete="new-password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <Button
              id="signup-submit"
              type="submit"
              className="w-full font-mono text-sm tracking-wider mt-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  CREATING ACCOUNT...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  SIGN UP
                </span>
              )}
            </Button>
          </form>

          {/* Footer link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-primary hover:text-primary/80 font-mono font-medium transition-colors"
              >
                Login
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

export default Signup;
