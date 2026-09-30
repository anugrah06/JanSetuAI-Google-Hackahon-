"use client";

import React from "react";
import { Language } from "@/types";
import { translations } from "@/lib/translations";
import { ShieldCheck, Radio, Users, LayoutDashboard, Globe2 } from "lucide-react";

interface HeaderProps {
  currentLang: Language;
  onLanguageChange: (lang: Language) => void;
  activeTab: "citizen" | "dashboard";
  onTabChange: (tab: "citizen" | "dashboard") => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentLang,
  onLanguageChange,
  activeTab,
  onTabChange,
}) => {
  const t = translations[currentLang];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 via-orange-600 to-indigo-600 shadow-lg shadow-orange-500/20">
            <Radio className="h-5 w-5 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black tracking-tight text-white">
                JanSetu <span className="bg-gradient-to-r from-orange-400 via-amber-300 to-emerald-400 bg-clip-text text-transparent">AI</span>
              </span>
              <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] font-semibold tracking-wider text-emerald-400 border border-emerald-500/30">
                PROTOTYPE
              </span>
            </div>
            <p className="hidden text-xs text-slate-400 sm:block">
              {t.tagline}
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center rounded-xl bg-slate-900/90 p-1 border border-slate-800">
          <button
            onClick={() => onTabChange("citizen")}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
              activeTab === "citizen"
                ? "bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-md shadow-orange-600/30"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Users className="h-3.5 w-3.5" />
            <span>{t.portalCitizen}</span>
          </button>
          <button
            onClick={() => onTabChange("dashboard")}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
              activeTab === "dashboard"
                ? "bg-gradient-to-r from-indigo-600 to-emerald-600 text-white shadow-md shadow-indigo-600/30"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <LayoutDashboard className="h-3.5 w-3.5" />
            <span>{t.portalGov}</span>
          </button>
        </nav>

        {/* Language Selector & Engine Badge */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center rounded-lg bg-slate-900 border border-slate-800 p-1 text-xs">
            <Globe2 className="mx-1 h-3.5 w-3.5 text-slate-400" />
            {(["mr", "hi", "en"] as Language[]).map((lang) => (
              <button
                key={lang}
                onClick={() => onLanguageChange(lang)}
                className={`rounded px-2 py-1 font-medium transition-colors ${
                  currentLang === lang
                    ? "bg-slate-800 text-amber-300 font-bold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {lang === "mr" ? "मराठी" : lang === "hi" ? "हिंदी" : "EN"}
              </button>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-1.5 rounded-lg bg-emerald-950/40 border border-emerald-500/20 px-2.5 py-1 text-[11px] text-emerald-300">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span>Gemini 2.5 Verified</span>
          </div>
        </div>
      </div>
    </header>
  );
};
