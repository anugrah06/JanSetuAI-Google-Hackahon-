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
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-amber-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            {t.scenarioPresets}
          </h3>
        </div>
        <span className="text-[11px] text-slate-400">1-Click Demonstration Filters</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {scenarios.map((sc) => {
          const catName = categoryLabels[sc.category]?.[currentLang] || sc.category;

          return (
            <button
              key={sc.id}
              onClick={() => onSelectScenario(sc)}
              className="text-left rounded-xl border border-slate-800 bg-slate-950/70 hover:bg-slate-800/80 p-3.5 transition-all hover:scale-102 hover:border-amber-500/40 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-800 border border-slate-700">
                    {getIcon(sc.category)}
                  </div>
                  <span className="rounded bg-red-950/80 px-2 py-0.5 text-[10px] font-bold text-red-400 border border-red-500/30">
                    {sc.expected_priority}
                  </span>
                </div>

                <h4 className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors line-clamp-1 mb-1">
                  {sc.title}
                </h4>

                <p className="text-[11px] text-slate-400 line-clamp-2 mb-2 leading-relaxed">
                  {sc.description}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px]">
                <span className="font-semibold text-slate-300">{sc.region}</span>
                <span className="flex items-center gap-1 text-amber-400 font-bold group-hover:translate-x-0.5 transition-transform">
                  Explore <ArrowRight className="h-3 w-3" />
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
