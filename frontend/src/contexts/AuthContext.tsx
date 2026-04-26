/**
 * Authentication Context for Sentinel IDS.
 * Manages JWT token storage, user state, and auth actions.
 */

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface User {
  id: number;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

// ─── Context ─────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ─── Helper: decode user from JWT payload ────────────────────────────────────

function decodeTokenPayload(token: string): User | null {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return {
      id: payload.sub,
      name: payload.name,
      email: payload.email,
    };
  } catch {
    return null;
  }
}

// ─── Provider ────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem("sentinel_token")
  );
  const [user, setUser] = useState<User | null>(() => {
    const storedToken = localStorage.getItem("sentinel_token");
    return storedToken ? decodeTokenPayload(storedToken) : null;
  });

  // Keep state in sync with localStorage
  useEffect(() => {
    if (token) {
      localStorage.setItem("sentinel_token", token);
      const decoded = decodeTokenPayload(token);
      setUser(decoded);
    } else {
      localStorage.removeItem("sentinel_token");
      setUser(null);
    }
  }, [token]);

  const login = (newToken: string, userData: User) => {
    setToken(newToken);
    setUser(userData);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
