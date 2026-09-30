"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Language } from "@/types";
import { Header } from "@/components/common/Header";
import { SyntheticBanner } from "@/components/common/SyntheticBanner";
import { CitizenPortal } from "@/components/citizen/CitizenPortal";
import { GovernmentDashboard } from "@/components/dashboard/GovernmentDashboard";
import { AuthGateway } from "@/components/auth/AuthGateway";
import { Logo } from "@/components/common/Logo";
import { useAuth } from "@/lib/auth";
import { 
  Users, 
  Building2, 
  ShieldAlert, 
  ShieldCheck, 
  Lock, 
  LogIn
} from "lucide-react";

function HomeContent() {
  const searchParams = useSearchParams();
  const { user, isAuthenticated, role, isLoading } = useAuth();

  const [currentLang, setCurrentLang] = useState<Language>("en");
  const [activeTab, setActiveTab] = useState<"citizen" | "dashboard">("citizen");
  const [targetHotspotId, setTargetHotspotId] = useState<string | undefined>(undefined);
  const [isGuest, setIsGuest] = useState<boolean>(false);

  // Sync default tab when role becomes available
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam === "dashboard" || tabParam === "government") {
      setActiveTab("dashboard");
    } else if (tabParam === "citizen") {
      setActiveTab("citizen");
    } else if (isAuthenticated && role === "GOVERNMENT_ADMIN") {
      setActiveTab("dashboard");
    } else if (isAuthenticated && role === "CITIZEN") {
      setActiveTab("citizen");
    }
  }, [searchParams, isAuthenticated, role]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <Logo size="lg" className="animate-pulse mb-3" />
        <p className="text-xs font-semibold text-slate-500 tracking-wide">
          Connecting to JanSetu AI Secure Infrastructure...
        </p>
      </div>
    );
  }

  // When not authenticated and not in guest mode, show the unified Login & Role Gateway
  if (!isAuthenticated && !isGuest) {
    return (
      <AuthGateway
        defaultRole={searchParams.get("role") === "admin" ? "admin" : "citizen"}
        onContinueAsGuest={() => {
          setIsGuest(true);
          setActiveTab("citizen");
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-indigo-600 selection:text-white">
      {/* Top Navigation */}
      <Header
        currentLang={currentLang}
        onLanguageChange={setCurrentLang}
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
      />

      {/* Guest Mode Indicator (if applicable) */}
      {isGuest && !isAuthenticated && (
        <div className="w-full bg-teal-50 border-b border-teal-200 py-1.5 px-4 text-xs text-teal-900 flex items-center justify-between">
          <div className="mx-auto max-w-7xl w-full flex items-center justify-between">
            <span className="font-medium">
              👋 Exploring as <strong>Guest Citizen</strong>. Submissions will be processed by JanSetu AI.
            </span>
            <button
              onClick={() => setIsGuest(false)}
              className="inline-flex items-center gap-1 font-bold text-teal-800 hover:text-teal-950 underline cursor-pointer"
            >
              <LogIn className="h-3.5 w-3.5" />
              <span>Sign In to Your Account</span>
            </button>
          </div>
        </div>
      )}

      {/* Synthetic Demonstration Data Disclaimer Banner */}
      <SyntheticBanner currentLang={currentLang} />

      {/* Main View Area */}
      <main className="flex-1">
        {activeTab === "citizen" ? (
          <CitizenPortal
            currentLang={currentLang}
            onGoToDashboard={() => setActiveTab("dashboard")}
          />
        ) : (
          /* Government Tab — Protected by Role-Based Authorization */
          !isAuthenticated ? (
            <div className="max-w-xl mx-auto my-12 p-8 bg-white rounded-2xl border-2 border-slate-200 shadow-sm text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-amber-400 mb-4 shadow-xs">
                <Lock className="h-7 w-7" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">
                Government Administrator Access Required
              </h2>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                The Government Dashboard contains administrative civic intelligence, confidential hotspot analyses, and deterministic capex allocation briefs.
              </p>
              <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/login/admin"
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 transition-colors shadow-xs"
                >
                  <ShieldCheck className="h-4 w-4 text-amber-400" />
                  <span>Sign In as Government Admin</span>
                </Link>
                <button
                  onClick={() => setActiveTab("citizen")}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-teal-800 bg-teal-50 hover:bg-teal-100 transition-colors cursor-pointer"
                >
                  <Users className="h-3.5 w-3.5 text-teal-600" />
                  <span>Return to Citizen Portal</span>
                </button>
              </div>
            </div>
          ) : role !== "GOVERNMENT_ADMIN" ? (
            <div className="max-w-xl mx-auto my-12 p-8 bg-white rounded-2xl border-2 border-amber-300 shadow-sm text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 mb-4 border border-amber-200">
                <ShieldAlert className="h-7 w-7" />
              </div>
              <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-3 py-1 rounded-full uppercase tracking-wider">
                403 Forbidden — Citizen Account
              </span>
              <h2 className="mt-3 text-xl font-bold text-slate-900">
                Administrative Privileges Required
              </h2>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                You are currently signed in as a Citizen (<span className="font-semibold text-slate-800">{user?.username}</span>). Normal citizen accounts cannot view or modify administrative governance intelligence.
              </p>
              <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/login/admin"
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 transition-colors shadow-xs"
                >
                  <Building2 className="h-4 w-4 text-amber-400" />
                  <span>Switch to Government Admin Account</span>
                </Link>
                <button
                  onClick={() => setActiveTab("citizen")}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-teal-800 bg-teal-50 hover:bg-teal-100 transition-colors cursor-pointer"
                >
                  <Users className="h-3.5 w-3.5 text-teal-600" />
                  <span>Return to Citizen Portal</span>
                </button>
              </div>
            </div>
          ) : (
            <GovernmentDashboard 
              currentLang={currentLang} 
              initialHotspotId={targetHotspotId}
            />
          )
        )}
      </main>

      {/* Civic Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-xs text-slate-500 mt-auto">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">JanSetu AI</span>
            <span>• AI-Assisted Civic Infrastructure Intelligence</span>
          </div>
          <div className="text-[11px] text-slate-500 font-mono">
            Deterministic Prioritization: Demand 35% | Infra Gap 25% | Population 20% | Severity 10% | Capex Gap 10%
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center text-xs text-slate-400">Loading JanSetu AI...</div>}>
      <HomeContent />
    </Suspense>
  );
}
