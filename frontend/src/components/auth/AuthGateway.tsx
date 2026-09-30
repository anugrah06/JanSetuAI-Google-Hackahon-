"use client";

import React, { useState } from "react";
import { Logo } from "@/components/common/Logo";
import { useAuth } from "@/lib/auth";
import { 
  Users, 
  Building2, 
  Lock, 
  Mail, 
  Sparkles, 
  ShieldCheck, 
  AlertCircle, 
  ArrowRight,
  CheckCircle2,
  HelpCircle
} from "lucide-react";

interface AuthGatewayProps {
  onContinueAsGuest?: () => void;
  defaultRole?: "citizen" | "admin";
}

export const AuthGateway: React.FC<AuthGatewayProps> = ({
  onContinueAsGuest,
  defaultRole = "citizen",
}) => {
  const { loginCitizen, loginAdmin, isLoading } = useAuth();

  const [activeTab, setActiveTab] = useState<"citizen" | "admin">(defaultRole);
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleTabSwitch = (tab: "citizen" | "admin") => {
    setActiveTab(tab);
    setError(null);
    setUsernameOrEmail("");
    setPassword("");
  };

  const handleQuickFill = (role: "citizen" | "admin") => {
    setError(null);
    if (role === "citizen") {
      setUsernameOrEmail("citizen@jansetu.in");
      setPassword("Citizen@JanSetu2026!");
    } else {
      setUsernameOrEmail("admin@jansetu.gov.in");
      setPassword("Admin@JanSetu2026!");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!usernameOrEmail.trim() || !password) {
      setError("Please enter your username/email and password.");
      return;
    }

    try {
      if (activeTab === "citizen") {
        await loginCitizen(usernameOrEmail.trim(), password);
      } else {
        await loginAdmin(usernameOrEmail.trim(), password);
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed. Please verify your credentials.");
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-50 via-slate-100/60 to-slate-200/50 flex flex-col justify-between py-8 px-4 sm:px-6 lg:px-8">
      {/* Top Header Bar */}
      <div className="max-w-5xl mx-auto w-full flex items-center justify-between pb-4">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-semibold text-slate-500">JanSetu AI Secure Gateway</span>
        </div>
        <div className="text-xs text-slate-400 font-medium">
          English | हिंदी
        </div>
      </div>

      {/* Main Authentication Box */}
      <div className="sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
          {/* Header & Logo Section */}
          <div className="pt-8 pb-6 px-6 sm:px-10 text-center bg-linear-to-b from-white to-slate-50/70 border-b border-slate-100">
            <div className="flex justify-center mb-3">
              <Logo size="lg" />
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold tracking-wide uppercase border border-slate-200">
              <ShieldCheck className="h-3.5 w-3.5 text-indigo-600" />
              <span>Civic Technology Intelligence</span>
            </div>
            <h1 className="mt-3 text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Sign In to JanSetu AI
            </h1>
            <p className="mt-1.5 text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
              Please choose your role to access citizen grievance reporting or official governance intelligence.
            </p>

            {/* Role Switcher Tabs */}
            <div className="mt-6 grid grid-cols-2 p-1.5 rounded-2xl bg-slate-200/80 border border-slate-300/60 max-w-md mx-auto">
              <button
                type="button"
                onClick={() => handleTabSwitch("citizen")}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "citizen"
                    ? "bg-white text-teal-800 shadow-sm border border-slate-200/60"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Users className="h-4 w-4 text-teal-600" />
                <span>Citizen Login</span>
              </button>
              <button
                type="button"
                onClick={() => handleTabSwitch("admin")}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "admin"
                    ? "bg-slate-900 text-amber-400 shadow-sm border border-slate-900"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Building2 className="h-4 w-4 text-amber-400" />
                <span>Government Admin</span>
              </button>
            </div>
          </div>

          {/* Form Content */}
          <div className="py-7 px-6 sm:px-10">
            {/* Active Role Description */}
            <div className={`mb-5 p-3.5 rounded-xl border text-xs flex items-start gap-3 ${
              activeTab === "citizen"
                ? "bg-teal-50/60 border-teal-200 text-teal-900"
                : "bg-slate-900 text-slate-100 border-slate-800"
            }`}>
              {activeTab === "citizen" ? (
                <>
                  <Users className="h-4 w-4 text-teal-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Citizen Grievance Experience:</span> Submit complaints via voice or text in Hindi or English and track localized resolution.
                  </div>
                </>
              ) : (
                <>
                  <Building2 className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-amber-300">Government Command Center:</span> Access district infrastructure gaps, deterministic priority hotspots, and executive action briefs.
                  </div>
                </>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-5 flex items-start gap-2.5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 animate-in fade-in">
                <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  {activeTab === "citizen" ? "Citizen Email / Username" : "Admin Official Email / Username"}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    value={usernameOrEmail}
                    onChange={(e) => setUsernameOrEmail(e.target.value)}
                    placeholder={activeTab === "citizen" ? "citizen@jansetu.in" : "admin@jansetu.gov.in"}
                    required
                    className="w-full pl-10 pr-3.5 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    className="w-full pl-10 pr-3.5 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all text-slate-900"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full mt-2 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white transition-all shadow-md cursor-pointer disabled:opacity-60 ${
                  activeTab === "citizen"
                    ? "bg-teal-600 hover:bg-teal-700 active:bg-teal-800"
                    : "bg-slate-900 hover:bg-slate-800 active:bg-slate-950"
                }`}
              >
                {activeTab === "citizen" ? (
                  <Users className="h-4 w-4" />
                ) : (
                  <ShieldCheck className="h-4 w-4 text-amber-400" />
                )}
                <span>
                  {isLoading
                    ? "Authenticating..."
                    : activeTab === "citizen"
                    ? "Sign In as Citizen"
                    : "Sign In as Government Admin"}
                </span>
              </button>
            </form>

            {/* Quick Demo 1-Click Credentials */}
            <div className="mt-5 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-600 flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                  <span>Quick Test Account ({activeTab === "citizen" ? "Citizen" : "Admin"})</span>
                </span>
                <button
                  type="button"
                  onClick={() => handleQuickFill(activeTab)}
                  className="text-[11px] font-bold text-indigo-700 hover:text-indigo-900 underline cursor-pointer"
                >
                  1-Click Auto Fill
                </button>
              </div>
              <p className="text-[10px] text-slate-500 mt-1 font-mono">
                {activeTab === "citizen"
                  ? "citizen@jansetu.in • Citizen@JanSetu2026!"
                  : "admin@jansetu.gov.in • Admin@JanSetu2026!"}
              </p>
            </div>

            {/* Alternate Options */}
            {activeTab === "citizen" && onContinueAsGuest && (
              <div className="mt-5 pt-4 border-t border-slate-100 text-center">
                <button
                  type="button"
                  onClick={onContinueAsGuest}
                  className="text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer inline-flex items-center gap-1"
                >
                  <span>Explore Citizen Portal as Guest</span>
                  <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center py-4 text-xs text-slate-400">
        JanSetu AI • Multilingual Citizen Voice-to-Needs Civic Intelligence
      </div>
    </div>
  );
};
