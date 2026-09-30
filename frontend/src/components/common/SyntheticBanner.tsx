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
    <div className="w-full bg-amber-50/90 border-b border-amber-200/80 px-4 py-2">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 text-xs text-amber-900">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" />
          <span className="font-medium">
            <strong className="text-amber-950 font-semibold">RESEARCH & DEMO PROTOCOL:</strong> {t.demoDisclaimer}
          </span>
        </div>
        <div className="hidden md:flex items-center gap-1.5 text-[11px] text-amber-800 bg-amber-100/80 px-2.5 py-0.5 rounded-md border border-amber-200 font-medium">
          <Info className="h-3.5 w-3.5 text-amber-700" />
          <span>Non-statutory recommendation model</span>
        </div>
      </div>
    </div>
  );
};
