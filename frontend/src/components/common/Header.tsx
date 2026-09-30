"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Language } from "@/types";
import { translations } from "@/lib/translations";
import { Logo } from "@/components/common/Logo";
import { useAuth } from "@/lib/auth";
import { 
  Users, 
  LayoutDashboard, 
  Globe2, 
  Sparkles, 
  LogOut, 
  ShieldCheck, 
  User as UserIcon,
  ChevronDown,
  Building2
} from "lucide-react";

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
  const { user, isAuthenticated, logout } = useAuth();
  const [showLoginDropdown, setShowLoginDropdown] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-sm shadow-xs">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-3 py-2.5 sm:px-6 lg:px-8">
        {/* Brand with Official JanSetu AI Logo */}
        <div className="flex items-center gap-3">
          <Logo size="sm" onClick={() => onTabChange("citizen")} />
          <span className="hidden xl:inline-block rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold tracking-wider text-slate-600 border border-slate-200">
            PROTOTYPE
          </span>
        </div>

        {/* Core Navigation: Citizen & Government */}
        <nav className="flex items-center rounded-lg bg-slate-100 p-1 border border-slate-200/80">
          <button
            onClick={() => onTabChange("citizen")}
            className={`flex items-center gap-1.5 rounded-md px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "citizen"
                ? "bg-white text-teal-800 shadow-xs border border-slate-200/60 font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Users className="h-3.5 w-3.5 text-teal-600" />
            <span>{t.portalCitizen}</span>
          </button>
          <button
            onClick={() => onTabChange("dashboard")}
            className={`flex items-center gap-1.5 rounded-md px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "dashboard"
                ? "bg-slate-900 text-amber-400 shadow-xs border border-slate-800 font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <LayoutDashboard className="h-3.5 w-3.5 text-slate-700" />
            <span>{t.portalGov}</span>
          </button>
        </nav>

        {/* Right Section: Language + Auth State */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Language Selector */}
          <div className="flex items-center rounded-lg bg-slate-100 border border-slate-200/80 p-0.5 text-xs">
            <Globe2 className="mx-1.5 h-3.5 w-3.5 text-slate-500" />
            {(["en", "hi"] as Language[]).map((lang) => (
              <button
                key={lang}
                onClick={() => onLanguageChange(lang)}
                className={`rounded px-2.5 py-1 font-medium transition-colors cursor-pointer ${
                  currentLang === lang
                    ? "bg-white text-slate-900 font-bold shadow-xs border border-slate-200/60"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {lang === "hi" ? "हिंदी" : "English"}
              </button>
            ))}
          </div>

          {/* Authentication Status / Control */}
          {isAuthenticated && user ? (
            <div className="flex items-center gap-2">
              <div className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${
                user.role === "GOVERNMENT_ADMIN"
                  ? "bg-slate-900 text-amber-400 border-slate-800"
                  : "bg-teal-50 text-teal-800 border-teal-200"
              }`}>
                {user.role === "GOVERNMENT_ADMIN" ? (
                  <Building2 className="h-3.5 w-3.5 text-amber-400" />
                ) : (
                  <UserIcon className="h-3.5 w-3.5 text-teal-600" />
                )}
                <span>{user.username}</span>
              </div>
              <button
                onClick={() => logout()}
                title="Sign Out"
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-red-700 hover:bg-red-50 border border-slate-200 transition-colors cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          ) : (
            <div className="relative">
              <button
                onClick={() => setShowLoginDropdown(!showLoginDropdown)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-700 bg-white border border-slate-200 shadow-2xs hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <UserIcon className="h-3.5 w-3.5 text-slate-500" />
                <span>Sign In</span>
                <ChevronDown className="h-3 w-3 text-slate-400" />
              </button>

              {showLoginDropdown && (
                <div 
                  className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-50 animate-in fade-in slide-in-from-top-1"
                  onMouseLeave={() => setShowLoginDropdown(false)}
                >
                  <Link
                    href="/login/citizen"
                    onClick={() => setShowLoginDropdown(false)}
                    className="flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-teal-50 hover:text-teal-900 transition-colors"
                  >
                    <Users className="h-4 w-4 text-teal-600" />
                    <div>
                      <div className="font-bold">Citizen Login</div>
                      <div className="text-[10px] text-slate-500 font-normal">Report & track complaints</div>
                    </div>
                  </Link>
                  <div className="my-1 border-t border-slate-100" />
                  <Link
                    href="/login/admin"
                    onClick={() => setShowLoginDropdown(false)}
                    className="flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-950 transition-colors"
                  >
                    <Building2 className="h-4 w-4 text-slate-800" />
                    <div>
                      <div className="font-bold">Government / Admin</div>
                      <div className="text-[10px] text-slate-500 font-normal">Civic intelligence & hotspots</div>
                    </div>
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
