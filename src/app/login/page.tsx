"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { UserCircle, Shield, ArrowRight } from "lucide-react";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function LoginPage() {
  const { loginAsAdmin, loginAsUser } = useAuth();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mode, setMode] = useState<"select" | "admin">("select");

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const result = await loginAsAdmin(password);
    if (!result.success) {
      setError(result.error || "Invalid password");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full glass-card p-8 animate-fade-in text-center">
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-accent to-emerald mb-2">
          Noon Attendance
        </h1>
        <p className="text-text-muted mb-8">Select your role to continue</p>

        {mode === "select" ? (
          <div className="space-y-4">
            <button
              onClick={loginAsUser}
              className="w-full p-4 rounded-xl border border-border bg-surface hover:bg-surface-hover hover:border-accent/50 transition-all group flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-emerald/10 flex items-center justify-center">
                  <UserCircle className="text-emerald" size={20} />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-text-primary">User Mode</h3>
                  <p className="text-xs text-text-muted">Mark attendance only</p>
                </div>
              </div>
              <ArrowRight size={16} className="text-text-muted group-hover:text-accent transition-colors" />
            </button>

            <button
              onClick={() => setMode("admin")}
              className="w-full p-4 rounded-xl border border-border bg-surface hover:bg-surface-hover hover:border-accent/50 transition-all group flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                  <Shield className="text-accent" size={20} />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-text-primary">Admin Mode</h3>
                  <p className="text-xs text-text-muted">Full access & enrollments</p>
                </div>
              </div>
              <ArrowRight size={16} className="text-text-muted group-hover:text-accent transition-colors" />
            </button>
          </div>
        ) : (
          <form onSubmit={handleAdminLogin} className="space-y-4 animate-slide-up">
            <div className="text-left">
              <label className="block text-sm font-medium text-text-secondary mb-1">Admin Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password..."
                className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent"
                autoFocus
              />
            </div>
            
            {error && <p className="text-rose text-sm text-left">{error}</p>}
            
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => { setMode("select"); setError(""); setPassword(""); }}
                className="flex-1 btn-secondary py-3"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading || !password}
                className="flex-1 btn-primary py-3"
              >
                {loading ? <LoadingSpinner size={16} /> : "Login"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
