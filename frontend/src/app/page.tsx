"use client";

import React, { useState } from "react";
import { Language } from "@/types";
import { Header } from "@/components/common/Header";
import { SyntheticBanner } from "@/components/common/SyntheticBanner";
import { CitizenPortal } from "@/components/citizen/CitizenPortal";
import { GovernmentDashboard } from "@/components/dashboard/GovernmentDashboard";

export default function Home() {
  const [currentLang, setCurrentLang] = useState<Language>("mr");
  const [activeTab, setActiveTab] = useState<"citizen" | "dashboard">("dashboard");

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-orange-500 selection:text-white">
      {/* Top Navigation */}
      <Header
        currentLang={currentLang}
        onLanguageChange={setCurrentLang}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

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
          <GovernmentDashboard currentLang={currentLang} />
        )}
      </main>

      {/* Civic Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-400">JanSetu AI</span>
            <span>• Multilingual Citizen Voice-to-Needs Civic Intelligence</span>
          </div>
          <div className="text-[11px] text-slate-600">
            Transparent Prioritization: Demand 35% | Infrastructure 25% | Population 20% | Severity 10% | Capex 10%
          </div>
        </div>
      </footer>
    </div>
  );
}
