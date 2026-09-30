"use client";

import React from "react";
import { GovernmentStats, Language } from "@/types";
import { translations, categoryLabels } from "@/lib/translations";
import { Users, Flame, ShieldAlert, Map, Activity } from "lucide-react";

interface StatsRowProps {
  stats: GovernmentStats | null;
  currentLang: Language;
}

export const StatsRow: React.FC<StatsRowProps> = ({ stats, currentLang }) => {
  const t = translations[currentLang];

  const topCategoryName = stats?.top_categories?.[0]?.category
    ? categoryLabels[stats.top_categories[0].category]?.[currentLang] || stats.top_categories[0].category
    : "Water & Sanitation";

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
      {/* 1. Total Complaints */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400">{t.kpiTotalGrievances}</span>
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-500/10 text-orange-400">
            <Users className="h-4 w-4" />
          </div>
        </div>
        <p className="mt-2 text-2xl font-black text-white">
          {stats?.total_complaints ?? 15}
        </p>
        <span className="text-[10px] text-slate-500 font-medium">Multilingual citizen reports</span>
      </div>

      {/* 2. Active Hotspots */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400">{t.kpiActiveHotspots}</span>
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400">
            <Flame className="h-4 w-4" />
          </div>
        </div>
        <p className="mt-2 text-2xl font-black text-amber-400">
          {stats?.active_hotspots_count ?? 7}
        </p>
        <span className="text-[10px] text-slate-500 font-medium">Spatial clusters mapped</span>
      </div>

      {/* 3. Critical Zones */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400">{t.kpiCriticalAction}</span>
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-500/10 text-red-400">
            <ShieldAlert className="h-4 w-4" />
          </div>
        </div>
        <p className="mt-2 text-2xl font-black text-red-400">
          {stats?.critical_priority_hotspots ?? 2}
        </p>
        <span className="text-[10px] text-slate-500 font-medium">Priority Score &ge; 70.0</span>
      </div>

      {/* 4. Districts Monitored */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400">{t.kpiDistricts}</span>
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
            <Map className="h-4 w-4" />
          </div>
        </div>
        <p className="mt-2 text-2xl font-black text-indigo-300">
          {stats?.districts_covered ?? 5}
        </p>
        <span className="text-[10px] text-slate-500 font-medium">Maharashtra Baseline</span>
      </div>

      {/* 5. Top Deficit Sector */}
      <div className="col-span-2 lg:col-span-1 rounded-xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400">Primary Demand</span>
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
            <Activity className="h-4 w-4" />
          </div>
        </div>
        <p className="mt-2 text-sm font-bold text-emerald-300 truncate" title={topCategoryName}>
          {topCategoryName}
        </p>
        <span className="text-[10px] text-slate-500 font-medium">
          {stats?.top_categories?.[0]?.count ?? 6} active complaints
        </span>
      </div>
    </div>
  );
};
