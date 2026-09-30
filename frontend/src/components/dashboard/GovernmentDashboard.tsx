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
  Sparkles,
  Calculator,
} from "lucide-react";

interface GovernmentDashboardProps {
  currentLang: Language;
  initialHotspotId?: string;
}

export const GovernmentDashboard: React.FC<GovernmentDashboardProps> = ({
  currentLang,
  initialHotspotId,
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

  useEffect(() => {
    if (initialHotspotId) {
      getHotspotDetail(initialHotspotId)
        .then(detail => setSelectedHotspot(detail))
        .catch(err => console.error("Error opening initial hotspot:", err));
    }
  }, [initialHotspotId]);

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
            <span>{t.portalGov}</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Aggregated Multilingual Civic Demand Hotspots & Deterministic Priority Ranking (Maharashtra State)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 rounded-lg bg-white border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs">
            <Layers className="h-3.5 w-3.5 text-indigo-600" />
            <span>Demand 35% • Infra 25% • Pop 20% • Sev 10% • Capex 10%</span>
          </span>
        </div>
      </div>

      {/* Technical Transparency Indicator */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-slate-50 border border-slate-200/90 px-4 py-2.5 shadow-2xs">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-md bg-indigo-50 border border-indigo-200/80 px-2 py-0.5 text-xs font-bold text-indigo-700">
            <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
            <span>AI-Assisted Extraction</span>
          </div>
          <span className="text-xs font-bold text-slate-400">+</span>
          <div className="flex items-center gap-1.5 rounded-md bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 text-xs font-bold text-emerald-800">
            <Calculator className="h-3.5 w-3.5 text-emerald-600" />
            <span>Deterministic Scoring Engine</span>
          </div>
        </div>
        <p className="text-[11px] text-slate-500 font-medium">
          {t.techTransparencyDesc}
        </p>
      </div>

      {/* Connection Notice */}
      {errorNotice && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-xs text-red-700 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
          <span>{errorNotice}</span>
        </div>
      )}

      {/* KPI Stats Row */}
      <StatsRow stats={stats} topHotspot={hotspots[0] || null} currentLang={currentLang} />

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
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Flame className="h-4 w-4 text-orange-600" />
              Prioritized Infrastructure Hotspots ({hotspots.length})
            </h2>
            <span className="text-[11px] text-slate-500 font-mono">Ranked by Transparent Math Score</span>
          </div>

          <div className="space-y-3 max-h-[580px] overflow-y-auto pr-1">
            {hotspots.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-xs text-slate-500 shadow-xs">
                No hotspots found matching selected filters. Try lowering the score threshold or clearing category filter.
              </div>
            ) : (
              hotspots.map((h, index) => {
                const catLabel = categoryLabels[h.category]?.[currentLang] || h.category;
                const isCritical = h.final_priority_score >= 70.0;
                const isHigh = h.final_priority_score >= 50.0 && h.final_priority_score < 70.0;
                const isTop = index === 0;

                return (
                  <div
                    key={h.id}
                    onClick={() => handleSelectHotspot(h)}
                    className={`group cursor-pointer rounded-xl p-4 transition-all flex flex-col justify-between shadow-xs ${
                      isTop
                        ? "border-2 border-red-400 bg-red-50/15 hover:bg-red-50/30"
                        : "border border-slate-200 bg-white hover:bg-indigo-50/20 hover:border-indigo-300"
                    }`}
                  >
                    <div>
                      {/* Top Row: Rank, Category, Score */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className={`flex h-5 w-5 items-center justify-center rounded-md text-[10px] font-mono font-bold ${
                            isTop ? "bg-red-100 text-red-900 border border-red-300" : "bg-slate-100 text-slate-700"
                          }`}>
                            #{index + 1}
                          </span>
                          {isTop && (
                            <span className="rounded bg-red-100 border border-red-200 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-red-700">
                              {t.topHotspotBadge}
                            </span>
                          )}
                          <span className="rounded bg-indigo-50 border border-indigo-200/80 px-2 py-0.5 text-[10px] font-bold text-indigo-700">
                            {catLabel}
                          </span>
                        </div>

                        {/* Priority Badge */}
                        <div className="flex flex-col items-end">
                          <div
                            title={t.calcByEngine}
                            className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-bold border ${
                              isCritical
                                ? "bg-red-50 text-red-700 border-red-200"
                                : isHigh
                                ? "bg-amber-50 text-amber-800 border-amber-200"
                                : "bg-emerald-50 text-emerald-800 border-emerald-200"
                            }`}
                          >
                            <span>{h.final_priority_score}</span>
                            <span className="text-[10px] font-normal text-slate-500">/100</span>
                          </div>
                          <span className="text-[9px] text-slate-400 font-mono mt-0.5">
                            {t.calcByEngine}
                          </span>
                        </div>
                      </div>

                      {/* Headline */}
                      <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-indigo-700 transition-colors line-clamp-2 leading-snug mb-1.5">
                        {h.detected_headline}
                      </h3>
                    </div>

                    {/* Footer Row */}
                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                      <span className="flex items-center gap-1 font-semibold text-slate-700">
                        <MapPin className="h-3 w-3 text-indigo-600" />
                        {h.taluka_or_ward ? `${h.taluka_or_ward}, ` : ""}{h.district}
                      </span>

                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded text-[10px]">
                          {h.complaint_count} Complaints
                        </span>
                        <span className="flex items-center gap-0.5 text-xs font-bold text-indigo-600 group-hover:translate-x-0.5 transition-transform">
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
