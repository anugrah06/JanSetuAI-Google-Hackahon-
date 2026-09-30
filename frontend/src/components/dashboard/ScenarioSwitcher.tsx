"use client";

import React from "react";
import { ScenarioInfo, Language } from "@/types";
import { translations, categoryLabels } from "@/lib/translations";
import { Sparkles, ArrowRight, ShieldAlert, Droplet, Truck, Zap, Building2 } from "lucide-react";

interface ScenarioSwitcherProps {
  scenarios: ScenarioInfo[];
  currentLang: Language;
  onSelectScenario: (scenario: ScenarioInfo) => void;
}

export const ScenarioSwitcher: React.FC<ScenarioSwitcherProps> = ({
  scenarios,
  currentLang,
  onSelectScenario,
}) => {
  const t = translations[currentLang];

  const getIcon = (cat: string) => {
    switch (cat) {
      case "WATER_AND_SANITATION":
        return <Droplet className="h-4 w-4 text-cyan-400" />;
      case "ROADS_AND_TRANSPORT":
        return <Truck className="h-4 w-4 text-amber-400" />;
      case "ELECTRICITY_AND_ENERGY":
        return <Zap className="h-4 w-4 text-yellow-400" />;
      default:
        return <Building2 className="h-4 w-4 text-emerald-400" />;
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-3.5">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-indigo-600" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
            {t.scenarioPresets}
          </h3>
        </div>
        <span className="text-[11px] text-slate-500 font-medium">
          4 Fixed Demonstration Scenarios • Deterministic Seed Data
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {scenarios.map((sc) => {
          const isCritical = sc.expected_priority.includes("CRITICAL");
          const isHigh = sc.expected_priority.includes("HIGH");

          // Fallbacks for storytelling fields if not yet loaded from backend
          const complaintCount =
            sc.synthetic_complaints_count ??
            (sc.id === "marathwada_water_crisis"
              ? 6
              : sc.id === "urban_sanitation_overflow"
              ? 2
              : 3);

          const hotspotName =
            sc.resulting_hotspot ??
            (sc.id === "marathwada_water_crisis"
              ? "Beed (Ashti) — Rank #1 Hotspot"
              : sc.id === "konkan_road_washout"
              ? "Ratnagiri (Chiplun) — Rank #2 Hotspot"
              : sc.id === "vidarbha_grid_failure"
              ? "Chandrapur (Bhadravati) — Rank #4 Hotspot"
              : "Pune (Haveli) — Rank #5 Hotspot");

          const scoreVal =
            sc.priority_score ??
            (sc.id === "marathwada_water_crisis"
              ? 72.0
              : sc.id === "konkan_road_washout"
              ? 63.0
              : sc.id === "vidarbha_grid_failure"
              ? 55.0
              : 48.4);

          const civicProblem = sc.civic_problem || sc.description;

          return (
            <button
              key={sc.id}
              onClick={() => onSelectScenario(sc)}
              className="text-left rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-indigo-50/40 p-4 transition-all hover:border-indigo-300 flex flex-col justify-between group cursor-pointer shadow-2xs space-y-3"
            >
              <div>
                {/* Header: Icon, Category & Priority Badge */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white border border-slate-200 shadow-2xs">
                    {getIcon(sc.category)}
                  </div>
                  <span
                    className={`rounded px-2 py-0.5 text-[10px] font-bold border ${
                      isCritical
                        ? "bg-red-50 text-red-700 border-red-200 font-mono"
                        : isHigh
                        ? "bg-amber-50 text-amber-800 border-amber-200 font-mono"
                        : "bg-slate-100 text-slate-700 border-slate-200 font-mono"
                    }`}
                  >
                    Score: {scoreVal}
                  </span>
                </div>

                {/* Scenario Name */}
                <h4 className="text-xs font-bold text-slate-900 group-hover:text-indigo-700 transition-colors line-clamp-1 mb-1">
                  {sc.title}
                </h4>

                {/* Civic Problem */}
                <p className="text-[11px] text-slate-600 line-clamp-2 mb-2.5 leading-relaxed">
                  {civicProblem}
                </p>

                {/* Micro Meta: Region, Complaint Count, Resulting Hotspot */}
                <div className="space-y-1 text-[11px] text-slate-500 bg-white/80 p-2 rounded-lg border border-slate-200/80">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-medium">Region:</span>
                    <span className="font-semibold text-slate-700 truncate">{sc.region}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-medium">Complaints:</span>
                    <span className="font-bold text-indigo-700">{complaintCount} Synthetic</span>
                  </div>
                  <div className="flex items-center justify-between pt-0.5 border-t border-slate-100">
                    <span className="text-slate-400 font-medium">Hotspot:</span>
                    <span className="font-semibold text-slate-800 text-[10px] truncate">{hotspotName}</span>
                  </div>
                </div>
              </div>

              {/* Action Link */}
              <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px]">
                <span className="font-mono text-[10px] text-slate-500">
                  {sc.expected_priority}
                </span>
                <span className="flex items-center gap-1 text-indigo-600 font-bold group-hover:translate-x-0.5 transition-transform">
                  Inspect Scenario <ArrowRight className="h-3 w-3" />
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
