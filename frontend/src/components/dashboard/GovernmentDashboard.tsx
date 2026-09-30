"use client";

import React, { useState, useEffect } from "react";
import {
  GovernmentStats,
  HotspotSummary,
  HotspotDetail,
  ScenarioInfo,
  Language,
} from "@/types";
import { translations, categoryLabels } from "@/lib/translations";
import { StatsRow } from "./StatsRow";
import { FilterBar } from "./FilterBar";
import { InteractiveMap } from "./InteractiveMap";
import { HotspotDetailDrawer } from "./HotspotDetailDrawer";
import { ScenarioSwitcher } from "./ScenarioSwitcher";
import {
  getGovStats,
  getHotspots,
  getHotspotDetail,
  recalculateHotspots,
  getScenarios,
} from "@/lib/api";
import {
  Flame,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Eye,
  Layers,
  MapPin,
} from "lucide-react";

interface GovernmentDashboardProps {
  currentLang: Language;
}

export const GovernmentDashboard: React.FC<GovernmentDashboardProps> = ({
  currentLang,
}) => {
  const t = translations[currentLang];
  const [stats, setStats] = useState<GovernmentStats | null>(null);
  const [hotspots, setHotspots] = useState<HotspotSummary[]>([]);
  const [scenarios, setScenarios] = useState<ScenarioInfo[]>([]);
  const [selectedHotspot, setSelectedHotspot] = useState<HotspotDetail | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");
  const [minScore, setMinScore] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRecalculating, setIsRecalculating] = useState<boolean>(false);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    setErrorNotice(null);
    try {
      const [sData, hData, scData] = await Promise.all([
        getGovStats().catch(() => null),
        getHotspots({
          category: selectedCategory || undefined,
          district: selectedDistrict || undefined,
          min_score: minScore > 0 ? minScore : undefined,
        }).catch(() => []),
        getScenarios().catch(() => []),
      ]);

      if (sData) setStats(sData);
      setHotspots(hData);
      setScenarios(scData);
    } catch (err: any) {
      setErrorNotice("Could not connect to JanSetu backend. Ensure backend is running on port 8000.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedCategory, selectedDistrict, minScore]);

  const handleSelectHotspot = async (summary: HotspotSummary) => {
    try {
      const detail = await getHotspotDetail(summary.id);
      setSelectedHotspot(detail);
    } catch (err) {
      console.error("Error fetching hotspot detail:", err);
    }
  };

  const handleRecalculate = async () => {
    setIsRecalculating(true);
    try {
      await recalculateHotspots();
      await fetchData();
    } catch (err) {
      console.error("Recalculation error:", err);
    } finally {
      setIsRecalculating(false);
    }
  };

  const handleSelectScenario = (scenario: ScenarioInfo) => {
    setSelectedCategory(scenario.category);
    // Find district from scenario
    if (scenario.region.includes("Beed")) setSelectedDistrict("Beed");
    else if (scenario.region.includes("Ratnagiri")) setSelectedDistrict("Ratnagiri");
    else if (scenario.region.includes("Chandrapur")) setSelectedDistrict("Chandrapur");
    else if (scenario.region.includes("Pune")) setSelectedDistrict("Pune");
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">
      {/* Dashboard Top Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2.5">
            <span className="bg-gradient-to-r from-orange-400 via-amber-300 to-emerald-400 bg-clip-text text-transparent">
              {t.portalGov}
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Aggregated Multilingual Civic Demand Hotspots & Deterministic Priority Ranking (Maharashtra State)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 rounded-lg bg-slate-900 border border-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-300">
            <Layers className="h-3.5 w-3.5 text-amber-400" />
            <span>35% Demand • 25% Infra • 20% Pop • 10% Sev • 10% Capex</span>
          </span>
        </div>
      </div>

      {/* Connection Notice */}
      {errorNotice && (
        <div className="rounded-xl bg-red-950/60 border border-red-500/40 p-3 text-xs text-red-300 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
          <span>{errorNotice}</span>
        </div>
      )}

      {/* KPI Stats Row */}
      <StatsRow stats={stats} currentLang={currentLang} />

      {/* Preset Demonstration Scenario Switcher */}
      {scenarios.length > 0 && (
        <ScenarioSwitcher
          scenarios={scenarios}
          currentLang={currentLang}
          onSelectScenario={handleSelectScenario}
        />
      )}

      {/* Filter Toolbar */}
      <FilterBar
        currentLang={currentLang}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        selectedDistrict={selectedDistrict}
        onDistrictChange={setSelectedDistrict}
        minScore={minScore}
        onMinScoreChange={setMinScore}
        onRecalculate={handleRecalculate}
        isRecalculating={isRecalculating}
      />

      {/* Main Grid: Interactive Map + Ranked Hotspots List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Interactive Map (7 Cols) */}
        <div className="lg:col-span-7">
          <InteractiveMap
            hotspots={hotspots}
            selectedHotspotId={selectedHotspot?.id ?? null}
            onSelectHotspot={handleSelectHotspot}
            currentLang={currentLang}
          />
        </div>

        {/* Right: Ranked Hotspots Cards (5 Cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Flame className="h-4 w-4 text-orange-500" />
              Prioritized Infrastructure Hotspots ({hotspots.length})
            </h2>
            <span className="text-[11px] text-slate-500 font-mono">Ranked by Transparent Math Score</span>
          </div>

          <div className="space-y-3 max-h-[580px] overflow-y-auto pr-1">
            {hotspots.length === 0 ? (
              <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-8 text-center text-xs text-slate-400">
                No hotspots found matching selected filters. Try lowering the score threshold or clearing category filter.
              </div>
            ) : (
              hotspots.map((h, index) => {
                const catLabel = categoryLabels[h.category]?.[currentLang] || h.category;
                const isCritical = h.final_priority_score >= 70.0;
                const isHigh = h.final_priority_score >= 50.0 && h.final_priority_score < 70.0;

                return (
                  <div
                    key={h.id}
                    onClick={() => handleSelectHotspot(h)}
                    className="group cursor-pointer rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-800/80 p-4 transition-all hover:border-amber-500/40 hover:scale-101 flex flex-col justify-between"
                  >
                    <div>
                      {/* Top Row: Rank, Category, Score */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="flex h-5 w-5 items-center justify-center rounded-md bg-slate-800 text-[10px] font-mono font-bold text-slate-300">
                            #{index + 1}
                          </span>
                          <span className="rounded bg-slate-800/90 px-2 py-0.5 text-[10px] font-bold text-amber-400">
                            {catLabel}
                          </span>
                        </div>

                        {/* Priority Badge */}
                        <div
                          className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-black border ${
                            isCritical
                              ? "bg-red-950/80 text-red-300 border-red-500/40 shadow-sm shadow-red-500/20"
                              : isHigh
                              ? "bg-amber-950/80 text-amber-300 border-amber-500/40"
                              : "bg-emerald-950/80 text-emerald-300 border-emerald-500/40"
                          }`}
                        >
                          <span>{h.final_priority_score}</span>
                          <span className="text-[9px] font-normal text-slate-400">/100</span>
                        </div>
                      </div>

                      {/* Headline */}
                      <h3 className="text-xs sm:text-sm font-bold text-white group-hover:text-amber-300 transition-colors line-clamp-2 leading-snug mb-1.5">
                        {h.detected_headline}
                      </h3>
                    </div>

                    {/* Footer Row */}
                    <div className="mt-3 pt-2.5 border-t border-slate-800/70 flex items-center justify-between text-[11px] text-slate-400">
                      <span className="flex items-center gap-1 font-semibold text-slate-300">
                        <MapPin className="h-3 w-3 text-indigo-400" />
                        {h.taluka_or_ward ? `${h.taluka_or_ward}, ` : ""}{h.district}
                      </span>

                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-orange-400">
                          {h.complaint_count} Complaints
                        </span>
                        <span className="flex items-center gap-0.5 text-xs font-bold text-amber-400 group-hover:translate-x-0.5 transition-transform">
                          <Eye className="h-3 w-3" />
                          <span>Inspect</span>
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Explainability Inspector Drawer Modal */}
      <HotspotDetailDrawer
        hotspot={selectedHotspot}
        onClose={() => setSelectedHotspot(null)}
        currentLang={currentLang}
      />
    </div>
  );
};
