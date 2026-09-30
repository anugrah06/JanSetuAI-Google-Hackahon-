"use client";

import React from "react";
import { CitizenFeedbackResponse, Language } from "@/types";
import { translations, categoryLabels } from "@/lib/translations";
import { CheckCircle2, MapPin, AlertCircle, Users, Activity, FileText, ArrowRight } from "lucide-react";

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
      ? "bg-red-500/20 text-red-300 border-red-500/30"
      : ticket.severity_score === 3
      ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
      : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";

  const urgencyColor =
    ticket.urgency === "CRITICAL"
      ? "bg-red-950 text-red-400 border-red-500/40"
      : ticket.urgency === "HIGH"
      ? "bg-orange-950 text-orange-400 border-orange-500/40"
      : "bg-blue-950 text-blue-400 border-blue-500/40";

  return (
    <div className="overflow-hidden rounded-2xl border border-emerald-500/30 bg-gradient-to-b from-slate-900 to-slate-950 p-6 shadow-2xl shadow-emerald-950/20 backdrop-blur-md">
      {/* Success Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">
              {t.ticketGenerated}
            </h3>
            <p className="text-xs text-slate-400">
              {t.ticketId}: <span className="font-mono text-emerald-400">{ticket.ticket_id.slice(0, 13)}...</span>
            </p>
          </div>
        </div>

        <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-300 border border-slate-700">
          Mode: {ticket.input_mode.toUpperCase()} ({ticket.detected_language.toUpperCase()})
        </span>
      </div>

      {/* Raw Transcript */}
      <div className="my-4 rounded-xl bg-slate-950/80 p-3.5 border border-slate-800/80">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1.5">
          <FileText className="h-3.5 w-3.5 text-amber-400" />
          Original Citizen Signal:
        </p>
        <p className="text-sm italic text-slate-200">
          "{ticket.raw_input}"
        </p>
      </div>

      {/* Gemini Structured Extraction Matrix */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        {/* Category */}
        <div className="rounded-xl bg-slate-800/40 p-3 border border-slate-800">
          <span className="text-slate-400">{t.detectedCategory}:</span>
          <p className="text-sm font-bold text-amber-300 mt-0.5">{catLabel}</p>
        </div>

        {/* Specific Issue */}
        <div className="rounded-xl bg-slate-800/40 p-3 border border-slate-800">
          <span className="text-slate-400">{t.detectedIssue}:</span>
          <p className="text-sm font-semibold text-white mt-0.5">{ticket.sub_issue}</p>
        </div>

        {/* Location */}
        <div className="rounded-xl bg-slate-800/40 p-3 border border-slate-800">
          <span className="text-slate-400 flex items-center gap-1">
            <MapPin className="h-3 w-3 text-indigo-400" />
            {t.location}:
          </span>
          <p className="text-sm font-semibold text-white mt-0.5">
            {ticket.taluka_or_ward ? `${ticket.taluka_or_ward}, ` : ""}{ticket.district}, {ticket.state}
          </p>
          {ticket.landmark && (
            <p className="text-[11px] text-slate-400 mt-0.5">Landmark: {ticket.landmark}</p>
          )}
        </div>

        {/* Affected Group */}
        <div className="rounded-xl bg-slate-800/40 p-3 border border-slate-800">
          <span className="text-slate-400 flex items-center gap-1">
            <Users className="h-3 w-3 text-orange-400" />
            {t.affectedDemographic}:
          </span>
          <p className="text-sm font-semibold text-white mt-0.5">
            {ticket.affected_group || "Local community"}
          </p>
        </div>
      </div>

      {/* Severity & Urgency Indicators */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-slate-900/60 p-3 border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <Activity className="h-4 w-4 text-slate-400" />
            <span className="text-xs text-slate-400">{t.severity}:</span>
            <span className={`rounded px-2 py-0.5 text-xs font-bold border ${severityColor}`}>
              Level {ticket.severity_score} / 5
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <AlertCircle className="h-4 w-4 text-slate-400" />
            <span className="text-xs text-slate-400">{t.urgency}:</span>
            <span className={`rounded px-2 py-0.5 text-xs font-bold border ${urgencyColor}`}>
              {ticket.urgency}
            </span>
          </div>
        </div>

        {onGoToDashboard && (
          <button
            onClick={onGoToDashboard}
            className="flex items-center gap-1 text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors"
          >
            <span>View on Government Priority Map</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
