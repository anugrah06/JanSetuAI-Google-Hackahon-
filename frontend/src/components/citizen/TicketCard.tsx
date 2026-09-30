"use client";

import React from "react";
import { CitizenFeedbackResponse, Language } from "@/types";
import { translations, categoryLabels } from "@/lib/translations";
import { CheckCircle2, MapPin, AlertCircle, Users, Activity, FileText, ArrowRight, Sparkles, Network } from "lucide-react";

interface TicketCardProps {
  ticket: CitizenFeedbackResponse;
  currentLang: Language;
  onGoToDashboard?: () => void;
}

export const TicketCard: React.FC<TicketCardProps> = ({
  ticket,
  currentLang,
  onGoToDashboard,
}) => {
  const t = translations[currentLang];
  const catLabel = categoryLabels[ticket.category]?.[currentLang] || ticket.category;

  const severityColor =
    ticket.severity_score >= 4
      ? "bg-red-50 text-red-700 border-red-200 font-bold"
      : ticket.severity_score === 3
      ? "bg-amber-50 text-amber-800 border-amber-200 font-bold"
      : "bg-emerald-50 text-emerald-800 border-emerald-200 font-bold";

  const urgencyColor =
    ticket.urgency === "CRITICAL"
      ? "bg-red-50 text-red-700 border-red-200 font-bold"
      : ticket.urgency === "HIGH"
      ? "bg-amber-50 text-amber-800 border-amber-200 font-bold"
      : "bg-indigo-50 text-indigo-700 border-indigo-200 font-bold";

  return (
    <div className="overflow-hidden rounded-2xl border border-emerald-200 bg-white p-6 shadow-xs space-y-5">
      {/* 1. Extraction -> Priority Connection Transition */}
      <div className="rounded-xl bg-slate-50 border border-slate-200 p-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">
              ✓
            </span>
            <span className="text-xs font-semibold text-slate-800">
              {t.structuredTransition}
            </span>
          </div>

          <div className="flex items-center gap-2 text-slate-400">
            <span className="hidden sm:inline font-mono">→</span>
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold">
                <Network className="h-3 w-3" />
              </span>
              <span className="text-xs font-semibold text-indigo-800">
                {t.signalAdded}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Registered Ticket Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {t.ticketGenerated}
            </h3>
            <p className="text-xs text-slate-500">
              {t.ticketId}: <span className="font-mono text-emerald-700 font-semibold">{ticket.ticket_id}</span>
            </p>
          </div>
        </div>

        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 border border-slate-200">
          {ticket.input_mode.toUpperCase()} ({ticket.detected_language.toUpperCase()})
        </span>
      </div>

      {/* 3. Raw Citizen Signal */}
      <div className="rounded-xl bg-slate-50 p-4 border border-slate-200">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1 flex items-center gap-1.5">
          <FileText className="h-3.5 w-3.5 text-indigo-600" />
          Citizen Grievance Transcript:
        </p>
        <p className="text-sm italic text-slate-800 leading-relaxed">
          "{ticket.raw_input}"
        </p>
      </div>

      {/* 4. AI-EXTRACTED INFORMATION */}
      <div className="rounded-xl border border-indigo-200/80 bg-indigo-50/20 p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 border-b border-indigo-100 pb-2.5">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-indigo-600" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-950">
              {t.aiExtractedInfo}
            </h4>
          </div>
          <span className="rounded bg-indigo-100 text-indigo-800 border border-indigo-200 px-2 py-0.5 text-[10px] font-semibold">
            {t.aiExtractionSubtext}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {/* Department / Category */}
          <div className="rounded-xl bg-white p-3.5 border border-slate-200 shadow-2xs">
            <span className="text-slate-500 font-medium">{t.detectedCategory}:</span>
            <p className="text-sm font-bold text-indigo-700 mt-0.5">{catLabel}</p>
          </div>

          {/* Specific Civic Issue */}
          <div className="rounded-xl bg-white p-3.5 border border-slate-200 shadow-2xs">
            <span className="text-slate-500 font-medium">{t.detectedIssue}:</span>
            <p className="text-sm font-semibold text-slate-900 mt-0.5">{ticket.sub_issue}</p>
          </div>

          {/* Location */}
          <div className="rounded-xl bg-white p-3.5 border border-slate-200 shadow-2xs">
            <span className="text-slate-500 font-medium flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 text-indigo-600" />
              {t.location}:
            </span>
            <p className="text-sm font-semibold text-slate-900 mt-0.5">
              {ticket.taluka_or_ward ? `${ticket.taluka_or_ward}, ` : ""}{ticket.district}, {ticket.state}
            </p>
            {ticket.landmark && (
              <p className="text-[11px] text-slate-500 mt-0.5">Landmark: {ticket.landmark}</p>
            )}
          </div>

          {/* Affected Demographic */}
          <div className="rounded-xl bg-white p-3.5 border border-slate-200 shadow-2xs">
            <span className="text-slate-500 font-medium flex items-center gap-1">
              <Users className="h-3.5 w-3.5 text-indigo-600" />
              {t.affectedDemographic}:
            </span>
            <p className="text-sm font-semibold text-slate-900 mt-0.5">
              {ticket.affected_group || "Local community"}
            </p>
          </div>
        </div>

        {/* Severity & Urgency Sub-indicators */}
        <div className="flex flex-wrap items-center gap-3 pt-1">
          <div className="flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 border border-slate-200 shadow-2xs">
            <Activity className="h-3.5 w-3.5 text-slate-500" />
            <span className="text-xs text-slate-600">{t.severity}:</span>
            <span className={`rounded-md px-2 py-0.5 text-xs border ${severityColor}`}>
              Level {ticket.severity_score} / 5
            </span>
          </div>

          <div className="flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 border border-slate-200 shadow-2xs">
            <AlertCircle className="h-3.5 w-3.5 text-slate-500" />
            <span className="text-xs text-slate-600">{t.urgency}:</span>
            <span className={`rounded-md px-2 py-0.5 text-xs border ${urgencyColor}`}>
              {ticket.urgency}
            </span>
          </div>
        </div>
      </div>

      {/* 5. DETERMINISTIC PRIORITY CALCULATION */}
      <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 border-b border-slate-200 pb-2.5">
          <div className="flex items-center gap-2">
            <Network className="h-4 w-4 text-emerald-600" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              {t.deterministicPriorityCalc}
            </h4>
          </div>
          <span className="rounded bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 text-[10px] font-semibold">
            {t.calcByEngine}
          </span>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          {t.deterministicPrioritySubtext} {currentLang === "hi" 
            ? "यह शिकायत जिले के क्लस्टर में शामिल हो गई है। अंतिम प्राथमिकता स्कोर मांग (35%), बुनियादी ढांचा कमी (25%), जनसंख्या प्रभाव (20%), गंभीरता (10%) और बजट अंतर (10%) के गणितीय सूत्र द्वारा अलग से तय होता है।"
            : "This grievance joins the civic evidence pool for this district and taluka. Numerical prioritization is computed separately through the transparent 5-factor deterministic formula (Demand 35% + Infrastructure Deficit 25% + Population Impact 20% + Severity 10% + Capex Deficit 10%) without black-box AI score alteration."}
        </p>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <span className="text-[11px] text-slate-500 font-mono">
            Zero LLM Numerical Weighting • Statutory Human Discretion Retained
          </span>

          {onGoToDashboard && (
            <button
              onClick={onGoToDashboard}
              className="flex items-center gap-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs transition-colors cursor-pointer"
            >
              <span>{t.viewOnDashboard}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 6. Unobtrusive Ethical Disclaimer */}
      <p className="text-[11px] text-slate-500 leading-relaxed pt-2 border-t border-slate-100">
        <strong>Assistive AI Governance Notice:</strong> JanSetu AI translates and structures multilingual citizen input to surface civic demands for administrative dashboards. Final prioritization scores are computed mathematically, and statutory resource allocation remains under human administrative oversight.
      </p>
    </div>
  );
};
