"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/common/Logo";
import { useAuth } from "@/lib/auth";
import { Users, Lock, Mail, ArrowRight, ShieldCheck, AlertCircle, Sparkles } from "lucide-react";

export default function CitizenLoginPage() {
  const router = useRouter();
  const { loginCitizen, isLoading } = useAuth();

  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!usernameOrEmail.trim() || !password) {
      setError("Please enter your email/username and password.");
      return;
    }

    try {
      await loginCitizen(usernameOrEmail.trim(), password);
      router.push("/?tab=citizen");
    } catch (err: any) {
      setError(err.message || "Failed to sign in. Please verify your credentials.");
    }
  };

  const handleQuickFill = () => {
    setUsernameOrEmail("citizen@jansetu.in");
    setPassword("Citizen@JanSetu2026!");
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between py-8 px-4 sm:px-6 lg:px-8">
      {/* Top Bar */}
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between pb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors">
          ← Back to JanSetu Home
        </Link>
        <Link
          href="/login/admin"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-2xs hover:bg-slate-50 transition-colors"
        >
          <span>Government / Admin Login</span>
          <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
        </Link>
      </div>

      {/* Main Card */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-2xl border border-slate-200 shadow-sm">
          {/* Official Logo */}
          <div className="flex flex-col items-center justify-center text-center pb-6 border-b border-slate-100">
            <Logo size="lg" className="mb-2" />
            <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200/80 text-teal-800 text-xs font-bold">
              <Users className="h-3.5 w-3.5 text-teal-600" />
              <span>Citizen Portal</span>
            </div>
            <h1 className="mt-3 text-2xl font-black text-slate-900 tracking-tight">Citizen Login</h1>
            <p className="mt-1 text-xs text-slate-600 max-w-xs">
              Raise civic issues, register voice or text complaints, and track grievance resolution.
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
                Email / Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  value={usernameOrEmail}
                  onChange={(e) => setUsernameOrEmail(e.target.value)}
                  placeholder="citizen@jansetu.in"
                  required
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-all text-slate-900"
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
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-all text-slate-900"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-bold text-white bg-teal-600 hover:bg-teal-700 active:bg-teal-800 transition-all shadow-xs cursor-pointer disabled:opacity-50"
            >
              <Users className="h-4 w-4" />
              <span>{isLoading ? "Signing in..." : "Sign In as Citizen"}</span>
            </button>
          </form>

          {/* Quick Demo Fill Helper */}
          <div className="mt-5 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-600 flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-amber-500" />
                <span>Judge / Demo Citizen Account</span>
              </span>
              <button
                type="button"
                onClick={handleQuickFill}
                className="text-[11px] font-bold text-teal-700 hover:text-teal-900 underline cursor-pointer"
              >
                Auto Fill
              </button>
            </div>
            <p className="text-[10px] text-slate-500 mt-1 font-mono">
              citizen@jansetu.in • Citizen@JanSetu2026!
            </p>
          </div>

          {/* Alternative actions */}
          <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col items-center gap-2">
            <Link
              href="/?tab=citizen"
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 underline"
            >
              Continue as Guest Citizen
            </Link>
            <Link
              href="/login/admin"
              className="text-xs font-medium text-slate-500 hover:text-indigo-600"
            >
              Need Administrator Access? <span className="font-bold underline">Go to Admin Login</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center py-4 text-xs text-slate-400">
        JanSetu AI • Secure Civic Technology Platform
      </div>
    </div>
  );
}
