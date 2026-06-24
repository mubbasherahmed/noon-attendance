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
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      {/* Background glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-accent/5 blur-[120px]" />
      </div>

      <div className="max-w-md w-full glass-card p-8 animate-fade-in text-center relative z-10">
        {/* Logo */}
        <div className="inline-flex bg-white rounded-full px-5 py-2 mb-6">
          <span className="text-black font-bold text-2xl tracking-tighter leading-none">noon</span>
        </div>

        <h1 className="text-2xl font-bold text-text-primary mb-1">
          Attendance System
        </h1>
        <p className="text-text-muted text-sm mb-8">Select your role to continue</p>

        {mode === "select" ? (
          <div className="space-y-3">
            <button
              onClick={loginAsUser}
              className="w-full p-4 rounded-xl border border-border bg-surface hover:bg-surface-hover hover:border-emerald/30 transition-all group flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-emerald/10 flex items-center justify-center">
                  <UserCircle className="text-emerald" size={20} />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-text-primary text-sm">User Mode</h3>
                  <p className="text-xs text-text-muted">Mark attendance only</p>
                </div>
              </div>
              <ArrowRight size={16} className="text-text-muted group-hover:text-emerald transition-colors" />
            </button>

            <button
              onClick={() => setMode("admin")}
              className="w-full p-4 rounded-xl border border-border bg-surface hover:bg-surface-hover hover:border-accent/30 transition-all group flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                  <Shield className="text-accent" size={20} />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-text-primary text-sm">Admin Mode</h3>
                  <p className="text-xs text-text-muted">Full access & management</p>
                </div>
              </div>
              <ArrowRight size={16} className="text-text-muted group-hover:text-accent transition-colors" />
            </button>
          </div>
        ) : (
          <form onSubmit={handleAdminLogin} className="space-y-4 animate-slide-up">
            <div className="text-left">
              <label className="block text-xs font-medium text-text-secondary mb-1.5">Admin Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password..."
                className="input-glass"
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
