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
  MapPin,
  Users,
  Compass,
  BarChart3,
  AlertTriangle,
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
      barColor: "bg-orange-500",
      accent: "text-orange-700",
    },
    {
      key: "infra",
      component: sb.infrastructure_gap,
      barColor: "bg-blue-600",
      accent: "text-blue-700",
    },
    {
      key: "population",
      component: sb.population_impact,
      barColor: "bg-indigo-600",
      accent: "text-indigo-700",
    },
    {
      key: "severity",
      component: sb.severity,
      barColor: "bg-red-600",
      accent: "text-red-700",
    },
    {
      key: "investment",
      component: sb.investment_gap,
      barColor: "bg-emerald-600",
      accent: "text-emerald-700",
    },
  ];

  const citizenEvidence = hotspot.evidence_citations.filter(
    (c) => c.source_type !== "district_baseline"
  );
  const baselineEvidence = hotspot.evidence_citations.filter(
    (c) => c.source_type === "district_baseline"
  );

  const isCritical = hotspot.final_priority_score >= 70.0 || hotspot.dominant_urgency === "CRITICAL";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-900/40 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-xl flex flex-col">
        {/* Sticky Header */}
        <div className="sticky top-0 z-20 flex items-start justify-between border-b border-slate-200 bg-white/95 p-5 backdrop-blur-xs">
          <div className="pr-4">
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="rounded-md bg-indigo-50 px-2.5 py-0.5 text-xs font-bold text-indigo-700 border border-indigo-200">
                {catLabel}
              </span>
              <span className="text-xs font-semibold text-slate-600">
                {hotspot.taluka_or_ward ? `${hotspot.taluka_or_ward}, ` : ""}{hotspot.district}, {hotspot.state}
              </span>
              <span
                className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold border ${
                  isCritical
                    ? "bg-red-50 text-red-700 border-red-200 font-mono"
                    : "bg-amber-50 text-amber-800 border-amber-200 font-mono"
                }`}
              >
                Urgency: {hotspot.dominant_urgency}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
              {hotspot.detected_headline}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            {/* Deterministic Score Badge */}
            <div className="flex flex-col items-center justify-center rounded-xl bg-slate-50 border border-slate-200 px-4 py-2 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Priority Score</span>
              <span className="text-2xl font-black text-slate-900">{hotspot.final_priority_score}</span>
              <span className="text-[10px] text-slate-500 font-medium font-mono">out of 100</span>
              <span className="text-[9px] text-indigo-700 font-semibold mt-0.5 text-center">
                {t.calcByEngine}
              </span>
            </div>

            <button
              onClick={onClose}
              className="rounded-lg bg-slate-100 p-2 text-slate-500 hover:bg-slate-200 hover:text-slate-900 transition-colors cursor-pointer"
              title={t.close}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content Body Organized into Steps A through F */}
        <div className="p-5 sm:p-6 space-y-6">
          {/* ================================================================ */}
          {/* STEP A: WHY THIS AREA? */}
          {/* ================================================================ */}
          <section className="rounded-xl border border-slate-200 bg-slate-50/70 p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Compass className="h-4 w-4 text-indigo-700" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                A. Why This Area? (Spatial Context)
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              JanSetu AI flagged <strong>{hotspot.taluka_or_ward ? `${hotspot.taluka_or_ward}, ` : ""}{hotspot.district}</strong> as a prioritized infrastructure zone because multiple citizen grievance signals converge directly with an acute baseline infrastructure deficit in <strong>{catLabel}</strong>.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
              <div className="rounded-lg bg-white p-3 border border-slate-200 shadow-2xs">
                <span className="text-[11px] text-slate-500 font-medium block">Active Grievances</span>
                <span className="text-sm font-bold text-slate-900">{hotspot.complaint_count} Citizen Reports</span>
              </div>
              <div className="rounded-lg bg-white p-3 border border-slate-200 shadow-2xs">
                <span className="text-[11px] text-slate-500 font-medium block">Average Severity</span>
                <span className="text-sm font-bold text-red-700">{hotspot.avg_severity} / 5.0 Scale</span>
              </div>
              <div className="rounded-lg bg-white p-3 border border-slate-200 shadow-2xs">
                <span className="text-[11px] text-slate-500 font-medium block">Dominant Urgency</span>
                <span className="text-sm font-bold text-amber-700">{hotspot.dominant_urgency}</span>
              </div>
              <div className="rounded-lg bg-white p-3 border border-slate-200 shadow-2xs">
                <span className="text-[11px] text-slate-500 font-medium block">Affected Population</span>
                <span className="text-sm font-bold text-slate-900 truncate block">
                  {hotspot.affected_groups_summary?.[0] || "Local Residents"}
                </span>
              </div>
            </div>
          </section>

          {/* ================================================================ */}
          {/* STEP B: WHAT ARE CITIZENS REPORTING? */}
          {/* ================================================================ */}
          <section className="rounded-xl border border-slate-200 bg-slate-50/70 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-orange-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  B. What Are Citizens Reporting? ({citizenEvidence.length} Ground Grievances)
                </h3>
              </div>
              <span className="text-[11px] text-slate-500 font-medium">Multilingual Voice & Text</span>
            </div>

            <div className="space-y-2.5">
              {citizenEvidence.map((c, i) => (
                <div
                  key={i}
                  className="rounded-lg border border-slate-200 bg-white p-3.5 text-xs flex items-start gap-2.5 shadow-2xs"
                >
                  <Quote className="h-4 w-4 shrink-0 text-slate-400 mt-0.5" />
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-700 border border-slate-200">
                        {c.source_type.replace("_", " ")}
                      </span>
                      {c.language && (
                        <span className="text-[10px] text-indigo-700 font-bold uppercase">
                          {c.language === "hi" ? "Hindi (हिंदी)" : "English"}
                        </span>
                      )}
                      {c.location_marker && (
                        <span className="text-[10px] text-slate-500">
                          • {c.location_marker}
                        </span>
                      )}
                      <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                        Verified Signal
                      </span>
                    </div>
                    <p className="text-slate-800 italic leading-relaxed">
                      "{c.quote}"
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ================================================================ */}
          {/* STEP C: HOW WAS THE SCORE CALCULATED? */}
          {/* ================================================================ */}
          <section className="rounded-xl border border-slate-200 bg-slate-50/70 p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
              <div className="flex items-center gap-2">
                <Calculator className="h-4 w-4 text-indigo-700" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  C. How Was the Score Calculated? ({t.calcByEngine})
                </h3>
              </div>
              <span className="text-xs text-slate-500 flex items-center gap-1 font-mono">
                <Layers className="h-3.5 w-3.5 text-emerald-600" />
                Deterministic Scoring Engine (0% LLM Interference)
              </span>
            </div>

            {/* Score Equation Banner */}
            <div className="rounded-lg bg-white p-3.5 border border-slate-200 text-xs font-mono text-slate-700 flex flex-wrap items-center justify-between gap-2 shadow-2xs">
              <span>
                <strong className="text-orange-700">Demand</strong> (35%) +{" "}
                <strong className="text-blue-700">Infra Gap</strong> (25%) +{" "}
                <strong className="text-indigo-700">Population</strong> (20%) +{" "}
                <strong className="text-red-700">Severity</strong> (10%) +{" "}
                <strong className="text-emerald-700">Capex Gap</strong> (10%)
              </span>
              <span className="font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded border border-slate-200">
                = {hotspot.final_priority_score} / 100
              </span>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed font-mono bg-white/70 p-2.5 rounded-lg border border-slate-200">
              * Verified Source: 100% computed from ground grievance counts, census demographics, and official district infrastructure baselines. AI language models have zero weighting or ability to alter these mathematical factors.
            </p>

            {/* 5 Factor Breakdown Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {scoreFactors.map((f) => (
                <div key={f.key} className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-800">{f.component.name}</span>
                        <span className="text-[10px] text-slate-500 font-mono">({f.component.weight_percentage}%)</span>
                      </div>
                      <span className={`font-mono font-bold ${f.accent}`}>
                        +{f.component.weighted_score.toFixed(1)} pts
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="my-2 h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${f.barColor} transition-all duration-500`}
                        style={{ width: `${Math.min(100, f.component.raw_score)}%` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-1 pt-1.5 border-t border-slate-100 text-[11px] text-slate-500">
                    <div className="flex items-center justify-between">
                      <span className="truncate pr-2">{f.component.benchmark_data}</span>
                      <span className="font-mono text-slate-700 shrink-0 font-semibold">
                        Raw: {f.component.raw_score} / 100
                      </span>
                    </div>
                    <div className="flex items-center justify-between pt-0.5">
                      <span className="rounded bg-slate-100 border border-slate-200 px-1.5 py-0.2 text-[9px] font-bold text-slate-600 uppercase tracking-wider">
                        {t.deterministicFactorBadge}
                      </span>
                      <span className="text-[10px] text-emerald-700 font-semibold font-mono">
                        Formula weight: {f.component.weight_percentage}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ================================================================ */}
          {/* STEP D: WHAT BASELINE GAP EXISTS? */}
          {/* ================================================================ */}
          {baselineEvidence.length > 0 && (
            <section className="rounded-xl border border-slate-200 bg-slate-50/70 p-5 space-y-3">
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4 text-slate-700" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  D. What Baseline Gap Exists? (Official District Deficits)
                </h3>
              </div>
              <div className="space-y-2">
                {baselineEvidence.map((b, i) => (
                  <div
                    key={i}
                    className="rounded-lg border border-slate-200 bg-white p-3.5 text-xs flex items-center justify-between shadow-2xs"
                  >
                    <span className="text-slate-800 font-medium">{b.quote}</span>
                    <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 border border-slate-200">
                      Official Baseline
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ================================================================ */}
          {/* STEP E: WHAT DOES THE AI SUMMARY SAY? */}
          {/* ================================================================ */}
          <section className="rounded-xl border border-indigo-200 bg-indigo-50/40 p-5 shadow-2xs space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-indigo-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-950">
                  E. {t.aiExecutiveBrief}
                </h3>
              </div>
              <span className="rounded bg-indigo-100 text-indigo-800 border border-indigo-200 px-2 py-0.5 text-[10px] font-semibold">
                Google Gemini 2.5 Synthesized
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              {hotspot.gemini_narrative}
            </p>
            <p className="text-[11px] text-indigo-900/80 font-medium pt-2 border-t border-indigo-100 leading-relaxed">
              * {t.aiBriefExplanation}
            </p>
          </section>

          {/* ================================================================ */}
          {/* STEP F: AI-SUGGESTED ACTIONS */}
          {/* ================================================================ */}
          <section className="rounded-xl border border-slate-200 bg-slate-50/70 p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
              <div className="flex items-center gap-2">
                <CheckSquare className="h-4 w-4 text-emerald-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  F. {t.aiSuggestedActions}
                </h3>
              </div>
              <span className="text-[11px] text-amber-800 font-semibold bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                {currentLang === "hi" ? "केवल परामर्श — वैधानिक निर्णय नहीं" : "Advisory Recommendations — Not a Statutory Decision"}
              </span>
            </div>

            <p className="text-[11px] text-slate-600 leading-relaxed bg-white p-2.5 rounded-lg border border-slate-200">
              <strong>{currentLang === "hi" ? "प्रशासनिक विवेकाधिकार:" : "Administrative Authority Notice:"}</strong>{" "}
              {t.actionAuthorityNote}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {hotspot.suggested_action_plan.map((item, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-50 text-[10px] font-bold text-indigo-700 border border-indigo-200">
                        {item.step_number}
                      </span>
                      <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                        {item.action_type}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 mb-1.5 leading-snug">
                      {item.title}
                    </h4>
                    <p className="text-[11px] text-slate-600 leading-relaxed mb-3">
                      {item.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-500 space-y-1">
                    <p className="flex items-center gap-1">
                      <Building className="h-3 w-3 text-slate-400" />
                      <span className="truncate font-medium text-slate-700">{item.responsible_agency}</span>
                    </p>
                    <p className="flex items-center gap-1 font-semibold text-emerald-700">
                      <Clock className="h-3 w-3 text-emerald-600" />
                      <span>{item.estimated_timeline}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ================================================================ */}
          {/* STEP G: ETHICAL POSITIONING STATEMENT */}
          {/* ================================================================ */}
          <div className="rounded-xl bg-slate-100/80 p-3.5 border border-slate-200 text-[11px] text-slate-600 leading-relaxed flex items-start gap-2">
            <ShieldAlert className="h-4 w-4 shrink-0 text-slate-500 mt-0.5" />
            <div>
              <strong className="text-slate-800 font-semibold">Assistive Governance Architecture:</strong> JanSetu AI assists public officials and district collectors by calculating transparent, mathematical priorities from citizen feedback and baseline public works datasets. It does not replace statutory administrative discretion, public tender processes, or financial sanctions.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
