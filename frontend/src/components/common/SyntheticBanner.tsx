"use client";

import React from "react";
import { AlertTriangle, Info } from "lucide-react";
import { translations } from "@/lib/translations";
import { Language } from "@/types";

interface SyntheticBannerProps {
  currentLang: Language;
}

export const SyntheticBanner: React.FC<SyntheticBannerProps> = ({ currentLang }) => {
  const t = translations[currentLang];

  return (
    <div className="w-full bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 border-b border-amber-500/20 px-4 py-2">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 text-xs text-amber-300">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400" />
          <span className="font-medium">
            <strong className="text-amber-200">RESEARCH & DEMO PROTOCOL:</strong> {t.demoDisclaimer}
          </span>
        </div>
        <div className="hidden md:flex items-center gap-1.5 text-[11px] text-amber-400/80 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
          <Info className="h-3 w-3" />
          <span>Non-statutory recommendation model</span>
        </div>
      </div>
    </div>
  );
};
