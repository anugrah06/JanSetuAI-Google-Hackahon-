"use client";

import React from "react";
import { HotspotDetail, Language } from "@/types";
import { translations, categoryLabels } from "@/lib/translations";
import {
  X,
  ShieldAlert,
  Calculator,
  FileText,
  Sparkles,
  CheckSquare,
  Clock,
  Building,
  Quote,
  Activity,
  Layers,
  HelpCircle,
} from "lucide-react";

interface HotspotDetailDrawerProps {
  hotspot: HotspotDetail | null;
  onClose: () => void;
  currentLang: Language;
}

export const HotspotDetailDrawer: React.FC<HotspotDetailDrawerProps> = ({
  hotspot,
  onClose,
  currentLang,
}) => {
  if (!hotspot) return null;

  const t = translations[currentLang];
  const catLabel = categoryLabels[hotspot.category]?.[currentLang] || hotspot.category;
  const sb = hotspot.score_breakdown;

  const scoreFactors = [
    {
      key: "demand",
      component: sb.citizen_demand,
      color: "from-orange-500 to-amber-500",
      barColor: "bg-orange-500",
      accent: "text-orange-400",
    },
    {
      key: "infra",
      component: sb.infrastructure_gap,
      color: "from-blue-500 to-cyan-500",
      barColor: "bg-blue-500",
      accent: "text-blue-400",
    },
    {
      key: "population",
      component: sb.population_impact,
      color: "from-indigo-500 to-purple-500",
      barColor: "bg-indigo-500",
      accent: "text-indigo-400",
    },
    {
      key: "severity",
      component: sb.severity,
      color: "from-rose-500 to-red-500",
      barColor: "bg-rose-500",
      accent: "text-rose-400",
    },
    {
      key: "investment",
      component: sb.investment_gap,
      color: "from-emerald-500 to-teal-500",
      barColor: "bg-emerald-500",
      accent: "text-emerald-400",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-3xl border border-slate-700 bg-slate-900 shadow-2xl shadow-black/80 flex flex-col">
        {/* Sticky Header */}
        <div className="sticky top-0 z-20 flex items-start justify-between border-b border-slate-800 bg-slate-900/95 p-5 backdrop-blur-md">
          <div className="pr-4">
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="rounded-full bg-slate-800 px-3 py-0.5 text-xs font-bold text-amber-400 border border-amber-500/30">
                {catLabel}
              </span>
              <span className="text-xs font-semibold text-slate-400">
                {hotspot.taluka_or_ward ? `${hotspot.taluka_or_ward}, ` : ""}{hotspot.district}, {hotspot.state}
              </span>
              <span className="rounded-full bg-red-950/80 px-2.5 py-0.5 text-[11px] font-bold text-red-400 border border-red-500/30">
                Urgency: {hotspot.dominant_urgency}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-white leading-snug">
              {hotspot.detected_headline}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            {/* Composite Score Circle */}
            <div className="flex flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-red-600/20 to-orange-600/20 border border-orange-500/40 px-4 py-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-orange-300">Priority Score</span>
              <span className="text-2xl font-black text-white">{hotspot.final_priority_score}</span>
              <span className="text-[10px] text-slate-400 font-medium">out of 100</span>
            </div>

            <button
              onClick={onClose}
              className="rounded-full bg-slate-800 p-2 text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
              title={t.close}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-6">
          {/* SECTION 1: Transparent 5-Factor Score Calculation */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Calculator className="h-5 w-5 text-amber-400" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                  {t.transparentBreakdown}
                </h3>
              </div>
              <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                <Layers className="h-3.5 w-3.5 text-emerald-400" />
                Pure Math Engine • Zero LLM Hallucination
              </span>
            </div>

            {/* Score Equation Banner */}
            <div className="mb-4 rounded-xl bg-slate-900/90 p-3 border border-slate-800 text-xs font-mono text-slate-300 flex flex-wrap items-center justify-between gap-2">
              <span>
                <strong className="text-orange-400">Demand</strong> (35%) +{" "}
                <strong className="text-blue-400">Infra Gap</strong> (25%) +{" "}
                <strong className="text-indigo-400">Population</strong> (20%) +{" "}
                <strong className="text-rose-400">Severity</strong> (10%) +{" "}
                <strong className="text-emerald-400">Capex Gap</strong> (10%)
              </span>
              <span className="font-bold text-amber-300 bg-slate-800 px-2.5 py-1 rounded border border-slate-700">
                = {hotspot.final_priority_score} / 100
              </span>
            </div>

            {/* Individual Factor Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {scoreFactors.map((f) => (
                <div key={f.key} className="rounded-xl border border-slate-800/90 bg-slate-900/40 p-3.5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-200">{f.component.name}</span>
                      <span className={`font-mono font-bold ${f.accent}`}>
                        +{f.component.weighted_score.toFixed(1)} pts
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="my-2 h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${f.barColor} transition-all duration-500`}
                        style={{ width: `${f.component.raw_score}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/60">
                    <span className="truncate pr-2">{f.component.benchmark_data}</span>
                    <span className="font-mono text-slate-300 shrink-0">
                      {f.component.weight_percentage}% &times; {f.component.raw_score}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 2: Ground Evidence Used */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="h-5 w-5 text-orange-400" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                {t.evidenceUsed} ({hotspot.complaint_count} Verified Signals)
              </h3>
            </div>

            <div className="space-y-2.5">
              {hotspot.evidence_citations.map((c, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-3 text-xs flex items-start gap-2.5"
                >
                  <Quote className="h-4 w-4 shrink-0 text-slate-500 mt-0.5" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-400 border border-slate-700">
                        {c.source_type.replace("_", " ")}
                      </span>
                      {c.language && (
                        <span className="text-[10px] text-slate-400 font-semibold uppercase">
                          {c.language}
                        </span>
                      )}
                      {c.location_marker && (
                        <span className="text-[10px] text-slate-500 truncate">
                          • {c.location_marker}
                        </span>
                      )}
                    </div>
                    <p className="text-slate-200 italic leading-relaxed">
                      "{c.quote}"
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 3: Gemini Executive Narrative */}
          <div className="rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-indigo-950/20 via-slate-900 to-indigo-950/30 p-5 shadow-lg">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-5 w-5 text-indigo-400" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-300">
                {t.geminiBrief}
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {hotspot.gemini_narrative}
            </p>
          </div>

          {/* SECTION 4: Recommended Operational Action Plan */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
            <div className="flex items-center gap-2 mb-4">
              <CheckSquare className="h-5 w-5 text-emerald-400" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                {t.actionPlan}
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {hotspot.suggested_action_plan.map((item, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-slate-800 bg-slate-900/90 p-4 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
                        {item.step_number}
                      </span>
                      <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-300">
                        {item.action_type}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-white mb-1.5 leading-snug">
                      {item.title}
                    </h4>
                    <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
                      {item.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 text-[10px] text-slate-400 space-y-0.5">
                    <p className="flex items-center gap-1">
                      <Building className="h-3 w-3 text-slate-500" />
                      <span className="truncate">{item.responsible_agency}</span>
                    </p>
                    <p className="flex items-center gap-1 font-semibold text-emerald-400">
                      <Clock className="h-3 w-3 text-emerald-500" />
                      <span>{item.estimated_timeline}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
