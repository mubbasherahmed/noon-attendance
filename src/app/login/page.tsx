"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { User, Shield, ArrowRight, Settings2 } from "lucide-react";
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
    <div className="min-h-screen flex items-center justify-center bg-appBg text-textMain font-sans p-4">
      <main className="w-full max-w-md px-4 relative z-10 animate-fade-in">
        {/* Login Card */}
        <div className="bg-cardBg border border-cardBorder rounded-xl overflow-hidden shadow-lg">
          {/* Card Header */}
          <header className="text-center pt-8 pb-6 px-6">
            <div className="inline-flex items-center justify-center bg-black text-white font-bold text-xl rounded px-2 py-1 mb-4 leading-none tracking-tighter">
              noon
            </div>
            <h1 className="text-2xl font-bold text-textMain mb-2 tracking-tight">Attendance System</h1>
            <p className="text-sm text-textMuted">Select your role to continue</p>
          </header>

          {/* Role Options List */}
          {mode === "select" ? (
            <div className="flex flex-col border-t border-cardBorder">
              {/* User Mode Option */}
              <button 
                onClick={loginAsUser}
                className="w-full group flex items-center text-left p-4 hover:bg-hoverBg transition-colors border-b border-cardBorder"
              >
                <div className="flex-shrink-0 mr-4 text-accent bg-accent/10 p-2 rounded-full group-hover:bg-accent/20 transition-colors">
                  <User size={24} />
                </div>
                <div className="flex-grow">
                  <h2 className="text-base font-semibold text-textMain group-hover:text-accent transition-colors">User Mode</h2>
                  <p className="text-xs text-textMuted mt-0.5">Mark attendance only</p>
                </div>
                <div className="flex-shrink-0 text-textMuted group-hover:text-accent transition-colors">
                  <ArrowRight size={20} />
                </div>
              </button>

              {/* Admin Mode Option */}
              <button 
                onClick={() => setMode("admin")}
                className="w-full group flex items-center text-left p-4 hover:bg-hoverBg transition-colors"
              >
                <div className="flex-shrink-0 mr-4 text-accent bg-accent/10 p-2 rounded-full group-hover:bg-accent/20 transition-colors">
                  <Shield size={24} />
                </div>
                <div className="flex-grow">
                  <h2 className="text-base font-semibold text-textMain group-hover:text-accent transition-colors">Admin Mode</h2>
                  <p className="text-xs text-textMuted mt-0.5">Full access & management</p>
                </div>
                <div className="flex-shrink-0 text-textMuted group-hover:text-accent transition-colors">
                  <ArrowRight size={20} />
                </div>
              </button>
            </div>
          ) : (
            <div className="border-t border-cardBorder p-6 bg-hoverBg/50 animate-slide-up">
              <form onSubmit={handleAdminLogin} className="space-y-4">
                <div className="text-left">
                  <label className="block text-xs font-semibold text-textMuted mb-2">Admin Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password..."
                    className="w-full px-4 py-2 border border-cardBorder rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent text-sm bg-cardBg"
                    autoFocus
                  />
                </div>

                {error && <p className="text-error text-xs font-medium">{error}</p>}

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => { setMode("select"); setError(""); setPassword(""); }}
                    className="flex-1 py-2.5 px-4 bg-cardBg border border-cardBorder hover:bg-hoverBg text-textMain text-sm font-semibold rounded-lg transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !password}
                    className="flex-1 py-2.5 px-4 bg-accent hover:bg-accent/90 text-white text-sm font-semibold rounded-lg transition-colors flex justify-center items-center"
                  >
                    {loading ? <LoadingSpinner size={16} /> : "Login"}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </main>

      {/* Floating action button in bottom right corner */}
      <div className="fixed bottom-6 right-6">
        <button aria-label="Settings" className="bg-cardBg border border-cardBorder hover:bg-hoverBg text-textMuted hover:text-textMain p-3 rounded-full shadow-lg transition-colors">
          <Settings2 size={20} />
        </button>
      </div>
    </div>
  );
}
