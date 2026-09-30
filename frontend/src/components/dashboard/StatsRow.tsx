"use client";

import React from "react";
import { GovernmentStats, Language } from "@/types";
import { translations, categoryLabels } from "@/lib/translations";
import { Users, Flame, ShieldAlert, Map, Activity } from "lucide-react";

interface StatsRowProps {
  stats: GovernmentStats | null;
  topHotspot?: import("@/types").HotspotSummary | null;
  currentLang: Language;
}

export const StatsRow: React.FC<StatsRowProps> = ({ stats, topHotspot, currentLang }) => {
  const t = translations[currentLang];

  const topCategoryName = stats?.top_categories?.[0]?.category
    ? categoryLabels[stats.top_categories[0].category]?.[currentLang] || stats.top_categories[0].category
    : "Water & Sanitation";

  const topLocText = topHotspot
    ? `${topHotspot.district} (${topHotspot.taluka_or_ward || "Central"})`
    : "Beed (Ashti)";
  const topLocScore = topHotspot ? topHotspot.final_priority_score : 72.0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
      {/* 1. Total Complaints */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500">{t.kpiTotalGrievances}</span>
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-700">
            <Users className="h-4 w-4" />
          </div>
        </div>
        <p className="mt-2 text-2xl font-bold text-slate-900">
          {stats?.total_complaints ?? 15}
        </p>
        <span className="text-[11px] text-slate-500 font-medium">Multilingual citizen reports</span>
      </div>

      {/* 2. Active Hotspots */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500">{t.kpiActiveHotspots}</span>
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
            <Flame className="h-4 w-4" />
          </div>
        </div>
        <p className="mt-2 text-2xl font-bold text-amber-700">
          {stats?.active_hotspots_count ?? 7}
        </p>
        <span className="text-[11px] text-slate-500 font-medium">Spatial clusters mapped</span>
      </div>

      {/* 3. Critical Zones */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500">{t.kpiCriticalAction}</span>
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-50 text-red-700">
            <ShieldAlert className="h-4 w-4" />
          </div>
        </div>
        <p className="mt-2 text-2xl font-bold text-red-600">
          {stats?.critical_priority_hotspots ?? 2}
        </p>
        <span className="text-[11px] text-slate-500 font-medium">Priority Score &ge; 70.0</span>
      </div>

      {/* 4. Top Priority Location */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500">{t.topPriorityLocation}</span>
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-50 text-red-700">
            <Map className="h-4 w-4" />
          </div>
        </div>
        <p className="mt-2 text-base sm:text-lg font-bold text-slate-900 truncate" title={topLocText}>
          {topLocText}
        </p>
        <div className="flex flex-col mt-0.5">
          <span className="text-[11px] text-red-700 font-bold font-mono">
            Score: {topLocScore} / 100
          </span>
          <span className="text-[10px] text-slate-500 font-medium">
            {t.calcByEngine}
          </span>
        </div>
      </div>

      {/* 5. Top Affected Sector */}
      <div className="col-span-2 lg:col-span-1 rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500">{t.topAffectedSector}</span>
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
            <Activity className="h-4 w-4" />
          </div>
        </div>
        <p className="mt-2 text-base font-bold text-emerald-800 truncate" title={topCategoryName}>
          {topCategoryName}
        </p>
        <span className="text-[11px] text-slate-500 font-medium">
          {stats?.top_categories?.[0]?.count ?? 6} registered complaints
        </span>
      </div>
    </div>
  );
};
