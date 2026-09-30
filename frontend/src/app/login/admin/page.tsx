"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/common/Logo";
import { useAuth } from "@/lib/auth";
import { ShieldCheck, Lock, Mail, ArrowRight, AlertCircle, Building2, Sparkles, LayoutDashboard } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const { loginAdmin, isLoading } = useAuth();

  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!usernameOrEmail.trim() || !password) {
      setError("Please enter your administrative email/username and password.");
      return;
    }

    try {
      await loginAdmin(usernameOrEmail.trim(), password);
      router.push("/?tab=dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to authenticate administrator.");
    }
  };

  const handleQuickFill = () => {
    setUsernameOrEmail("admin@jansetu.gov.in");
    setPassword("Admin@JanSetu2026!");
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-100/70 flex flex-col justify-between py-8 px-4 sm:px-6 lg:px-8">
      {/* Top Bar */}
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between pb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors">
          ← Back to JanSetu Home
        </Link>
        <Link
          href="/login/citizen"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-800 bg-teal-50/80 border border-teal-200 px-3 py-1.5 rounded-lg shadow-2xs hover:bg-teal-100/70 transition-colors"
        >
          <span>Citizen Login</span>
          <ArrowRight className="h-3.5 w-3.5 text-teal-600" />
        </Link>
      </div>

      {/* Main Admin Card */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-2xl border-2 border-slate-300/80 shadow-md">
          {/* Header & Logo */}
          <div className="flex flex-col items-center justify-center text-center pb-6 border-b border-slate-100">
            <Logo size="lg" className="mb-2" />
            <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 text-amber-400 text-xs font-bold tracking-wider uppercase">
              <Building2 className="h-3.5 w-3.5 text-amber-400" />
              <span>Government Portal</span>
            </div>
            <h1 className="mt-3 text-2xl font-black text-slate-900 tracking-tight">Government / Admin Login</h1>
            <p className="mt-1 text-xs text-slate-600 max-w-xs">
              Access civic intelligence, district infrastructure deficits, hotspots, and administrative action briefs.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-6 flex items-start gap-2.5 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800">
              <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Admin Official Email / Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  value={usernameOrEmail}
                  onChange={(e) => setUsernameOrEmail(e.target.value)}
                  placeholder="admin@jansetu.gov.in"
                  required
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-xl bg-slate-50/50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-800/20 focus:border-slate-900 transition-all text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-xl bg-slate-50/50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-800/20 focus:border-slate-900 transition-all text-slate-900"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 active:bg-slate-950 transition-all shadow-xs cursor-pointer disabled:opacity-50"
            >
              <ShieldCheck className="h-4 w-4 text-amber-400" />
              <span>{isLoading ? "Authenticating..." : "Sign In as Government Admin"}</span>
            </button>
          </form>

          {/* Quick Demo Fill Helper */}
          <div className="mt-5 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-600 flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-amber-500" />
                <span>Judge / Demo Admin Account</span>
              </span>
              <button
                type="button"
                onClick={handleQuickFill}
                className="text-[11px] font-bold text-indigo-700 hover:text-indigo-900 underline cursor-pointer"
              >
                Auto Fill
              </button>
            </div>
            <p className="text-[10px] text-slate-500 mt-1 font-mono">
              admin@jansetu.gov.in • Admin@JanSetu2026!
            </p>
          </div>

          {/* Security Notice & Alternate links */}
          <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col items-center gap-2">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              <span>Protected by Role-Based Server Authorization</span>
            </div>
            <Link
              href="/login/citizen"
              className="text-xs font-medium text-slate-600 hover:text-teal-700"
            >
              Citizen user? <span className="font-bold underline">Go to Citizen Login</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center py-4 text-xs text-slate-400">
        JanSetu AI • Authorized Administrative Access Only
      </div>
    </div>
  );
}
