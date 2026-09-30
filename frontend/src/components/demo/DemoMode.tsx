"use client";

import React, { useState, useEffect } from "react";
import { 
  ScenarioInfo, 
  DemoComplaint, 
  HotspotDetail, 
  Language 
} from "@/types";
import { translations, categoryLabels } from "@/lib/translations";
import { 
  getScenarios, 
  getDemoComplaints, 
  getDemoHotspots, 
  getDemoHotspotDetail, 
  resetDemoData 
} from "@/lib/api";
import { Logo } from "@/components/common/Logo";
import { 
  Sparkles, 
  RotateCcw, 
  Play, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  FileText, 
  Layers, 
  Compass, 
  Calculator, 
  CheckSquare, 
  Building, 
  Clock, 
  Users, 
  MapPin, 
  Activity, 
  AlertCircle, 
  Quote, 
  ExternalLink 
} from "lucide-react";

interface DemoModeProps {
  currentLang: Language;
  onNavigateToDashboard: (hotspotId?: string) => void;
}

export const DemoMode: React.FC<DemoModeProps> = ({
  currentLang,
  onNavigateToDashboard
}) => {
  const t = translations[currentLang];
  const [scenarios, setScenarios] = useState<ScenarioInfo[]>([]);
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>("marathwada_water_crisis");
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [complaints, setComplaints] = useState<DemoComplaint[]>([]);
  const [activeHotspotDetail, setActiveHotspotDetail] = useState<HotspotDetail | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isResetting, setIsResetting] = useState<boolean>(false);
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  // Load scenarios on mount
  useEffect(() => {
    async function loadInitial() {
      try {
        const scList = await getScenarios();
        setScenarios(scList);
        if (scList.length > 0 && !selectedScenarioId) {
          setSelectedScenarioId(scList[0].id);
        }
      } catch (err) {
        console.error("Failed to load scenarios:", err);
      }
    }
    loadInitial();
  }, []);

  // Fetch complaints and hotspot when scenario changes
  useEffect(() => {
    async function loadScenarioData() {
      if (!selectedScenarioId) return;
      setIsLoading(true);
      try {
        const [complaintList, hotspotsList] = await Promise.all([
          getDemoComplaints(selectedScenarioId).catch(() => []),
          getDemoHotspots().catch(() => [])
        ]);
        setComplaints(complaintList);

        // Find corresponding hotspot
        let targetHotspot = null;
        if (selectedScenarioId === "marathwada_water_crisis") {
          targetHotspot = hotspotsList.find(h => h.district === "Beed" && h.taluka_or_ward?.includes("Ashti"));
        } else if (selectedScenarioId === "konkan_road_washout") {
          targetHotspot = hotspotsList.find(h => h.district === "Ratnagiri");
        } else if (selectedScenarioId === "vidarbha_grid_failure") {
          targetHotspot = hotspotsList.find(h => h.district === "Chandrapur");
        } else if (selectedScenarioId === "urban_sanitation_overflow") {
          targetHotspot = hotspotsList.find(h => h.district === "Pune");
        }

        if (!targetHotspot && hotspotsList.length > 0) {
          targetHotspot = hotspotsList[0];
        }

        if (targetHotspot) {
          const detail = await getDemoHotspotDetail(targetHotspot.id);
          setActiveHotspotDetail(detail);
        }
      } catch (err) {
        console.error("Failed to load scenario details:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadScenarioData();
  }, [selectedScenarioId]);

  // Handle Demo Reset
  const handleResetDemo = async () => {
    setIsResetting(true);
    setResetMessage(null);
    try {
      await resetDemoData(false); // Preserve genuine user grievances
      setResetMessage(t.demoResetSuccess);
      // Reload complaints & hotspot
      const [complaintList, hotspotsList] = await Promise.all([
        getDemoComplaints(selectedScenarioId),
        getDemoHotspots()
      ]);
      setComplaints(complaintList);
      if (hotspotsList.length > 0) {
        const detail = await getDemoHotspotDetail(hotspotsList[0].id);
        setActiveHotspotDetail(detail);
      }
      setTimeout(() => setResetMessage(null), 5000);
    } catch (err: any) {
      setResetMessage("Reset failed: " + (err.message || "Unknown error"));
    } finally {
      setIsResetting(false);
    }
  };

  const selectedScenario = scenarios.find(s => s.id === selectedScenarioId) || scenarios[0];

  const steps = [
    { number: 1, title: t.step1Title, desc: t.step1Desc },
    { number: 2, title: t.step2Title, desc: t.step2Desc },
    { number: 3, title: t.step3Title, desc: t.step3Desc },
    { number: 4, title: t.step4Title, desc: t.step4Desc },
    { number: 5, title: t.step5Title, desc: t.step5Desc },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      {/* 1. DEMO MODE HEADER */}
      <div className="rounded-2xl border border-indigo-200 bg-linear-to-r from-indigo-900 via-indigo-850 to-slate-900 p-6 text-white shadow-md">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="hidden sm:flex bg-white p-2 rounded-xl shadow-xs shrink-0">
              <Logo size="sm" />
            </div>
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-indigo-200 backdrop-blur-xs mb-2">
                <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                <span>{t.demoBadge}</span>
                <span className="text-white/40">•</span>
                <span className="text-emerald-300">100% Deterministic Seed</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                {t.hackathonDemoTab}
              </h1>
              <p className="mt-1.5 text-xs sm:text-sm text-indigo-200 max-w-2xl leading-relaxed">
                {t.demoSubtitle}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Reset Demo Button */}
            <button
              onClick={handleResetDemo}
              disabled={isResetting}
              className="inline-flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-2.5 text-xs font-bold text-white transition-all cursor-pointer backdrop-blur-xs shadow-xs"
              title="Reset demonstration data to deterministic state without touching real citizen records"
            >
              <RotateCcw className={`h-4 w-4 text-amber-400 ${isResetting ? "animate-spin" : ""}`} />
              <span>{isResetting ? t.resettingDemo : t.resetDemoBtn}</span>
            </button>

            {/* Quick Launch Full Flow */}
            <button
              onClick={() => setCurrentStep(5)}
              className="inline-flex items-center gap-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 px-4 py-2.5 text-xs font-black transition-all cursor-pointer shadow-xs"
            >
              <Play className="h-4 w-4 fill-slate-950" />
              <span>{t.quickLaunchBtn}</span>
            </button>
          </div>
        </div>

        {/* Reset Confirmation Alert */}
        {resetMessage && (
          <div className="mt-4 rounded-xl bg-emerald-500/20 border border-emerald-400/40 p-3 text-xs text-emerald-200 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
            <span>{resetMessage}</span>
          </div>
        )}
      </div>

      {/* 2. SYNTHETIC DATA DISCLOSURE (BILINGUAL) */}
      <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3.5 text-xs text-amber-900 flex items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-2.5">
          <AlertCircle className="h-4 w-4 shrink-0 text-amber-600" />
          <p className="font-medium">
            <strong>{currentLang === "hi" ? "कृत्रिम डेटा प्रकटीकरण:" : "Synthetic Data Disclosure:"}</strong>{" "}
            {t.syntheticDisclosure}
          </p>
        </div>
        <span className="hidden sm:inline-block rounded bg-amber-100 text-amber-800 border border-amber-300 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider shrink-0">
          Non-Statutory Prototype
        </span>
      </div>

      {/* 3. SCENARIO SWITCHER */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
          {t.selectScenarioPrompt}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {scenarios.map((sc) => {
            const isSelected = sc.id === selectedScenarioId;
            return (
              <button
                key={sc.id}
                onClick={() => {
                  setSelectedScenarioId(sc.id);
                  setCurrentStep(1);
                }}
                className={`text-left rounded-xl p-3.5 border transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? "border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-600/20 shadow-xs"
                    : "border-slate-200 bg-slate-50/70 hover:bg-slate-100/70 hover:border-slate-300"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      {categoryLabels[sc.category]?.[currentLang] || sc.category}
                    </span>
                    <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                      sc.expected_priority.includes("CRITICAL")
                        ? "bg-red-50 text-red-700 border border-red-200"
                        : "bg-amber-50 text-amber-800 border border-amber-200"
                    }`}>
                      Score: {sc.priority_score ?? 70.0}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 mb-1">
                    {sc.title}
                  </h4>
                  <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                    {sc.civic_problem || sc.description}
                  </p>
                </div>
                <div className="mt-2.5 pt-2 border-t border-slate-200/80 flex items-center justify-between text-[10px] text-slate-500">
                  <span>{sc.region}</span>
                  <span className="font-bold text-indigo-700">{sc.synthetic_complaints_count ?? 3} Signals</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. DEMO STEP PROGRESS RIBBON */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs overflow-x-auto">
        <div className="flex items-center justify-between min-w-[720px] gap-2">
          {steps.map((st) => {
            const isActive = currentStep === st.number;
            const isCompleted = currentStep > st.number;
            return (
              <button
                key={st.number}
                onClick={() => setCurrentStep(st.number)}
                className={`flex-1 rounded-xl p-2.5 border transition-all text-left cursor-pointer ${
                  isActive
                    ? "border-indigo-600 bg-indigo-600 text-white shadow-xs"
                    : isCompleted
                    ? "border-emerald-200 bg-emerald-50/60 text-slate-800 hover:bg-emerald-100/60"
                    : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className={`flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold ${
                    isActive
                      ? "bg-white text-indigo-700"
                      : isCompleted
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-200 text-slate-700"
                  }`}>
                    {isCompleted ? "✓" : st.number}
                  </span>
                  <span className={`text-xs font-bold uppercase tracking-wider truncate ${
                    isActive ? "text-white" : "text-slate-900"
                  }`}>
                    Step {st.number}
                  </span>
                </div>
                <p className={`text-[11px] truncate ${
                  isActive ? "text-indigo-100" : "text-slate-500"
                }`}>
                  {st.title.split("—")[1]?.trim() || st.title}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. ACTIVE STEP CONTENT CONTAINER */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        {isLoading ? (
          <div className="py-16 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-r-transparent" />
            <p className="mt-3 text-xs font-medium text-slate-500">Loading deterministic scenario data...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Header of Active Step */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-200 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                  {selectedScenario?.title} • Walkthrough Stage {currentStep} of 5
                </span>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 mt-0.5">
                  {steps[currentStep - 1].title}
                </h2>
                <p className="text-xs text-slate-600 mt-0.5">
                  {steps[currentStep - 1].desc}
                </p>
              </div>

              {/* Navigation Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
                  disabled={currentStep === 1}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>{t.prevStepBtn}</span>
                </button>
                <button
                  onClick={() => setCurrentStep(prev => Math.min(5, prev + 1))}
                  disabled={currentStep === 5}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 px-3.5 py-1.5 text-xs font-bold text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  <span>{t.nextStepBtn}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* STEP 1: CITIZEN SIGNALS */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-200 text-xs text-slate-700 flex items-center justify-between">
                  <span>
                    <strong>{complaints.length} Synthetic Grievances</strong> logged in Hindi and Indian English for this scenario.
                  </span>
                  <span className="font-mono text-[10px] text-slate-500">
                    Source: data/synthetic_complaints.json
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {complaints.map((c, idx) => (
                    <div
                      key={c.id}
                      className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs space-y-2.5 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between text-[11px] mb-1.5">
                          <span className="rounded bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 border border-indigo-200">
                            Signal #{idx + 1} • {c.input_mode.toUpperCase()}
                          </span>
                          <span className="font-semibold text-slate-600">
                            {c.language === "hi" ? "हिंदी (Hindi)" : "English"}
                          </span>
                        </div>
                        <p className="text-xs italic text-slate-800 leading-relaxed">
                          "{c.raw_input}"
                        </p>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-indigo-600" />
                          {c.landmark || c.taluka_or_ward}, {c.district}
                        </span>
                        <span className="rounded bg-slate-100 px-1.5 py-0.2 text-[10px] font-mono">
                          Severity: {c.severity_score}/5
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 2: AI EXTRACTION */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="rounded-xl bg-indigo-50/50 p-3.5 border border-indigo-200 text-xs text-indigo-900 flex items-center justify-between">
                  <span>
                    <strong>Gemini 2.5 Structured Entities:</strong> Unstructured audio/text transformed into standardized schema (Category, Sub-issue, Coordinates, Severity, Urgency, Demographic).
                  </span>
                  <span className="font-mono text-[10px] text-indigo-700">
                    Schema: CitizenFeedbackExtraction
                  </span>
                </div>

                <div className="space-y-3">
                  {complaints.map((c, idx) => (
                    <div
                      key={c.id}
                      className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 shadow-2xs"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/80 pb-2 mb-2.5">
                        <span className="font-bold text-xs text-slate-900">
                          Signal #{idx + 1}: {c.sub_issue}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className={`rounded px-2 py-0.5 text-[10px] font-bold border ${
                            c.severity_score >= 4
                              ? "bg-red-50 text-red-700 border-red-200"
                              : "bg-amber-50 text-amber-800 border-amber-200"
                          }`}>
                            Severity {c.severity_score}/5
                          </span>
                          <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700 border border-slate-200">
                            {c.urgency}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                        <div className="rounded-lg bg-white p-2.5 border border-slate-200">
                          <span className="text-[10px] text-slate-400 font-medium block">Category</span>
                          <span className="font-bold text-indigo-700 truncate block">
                            {categoryLabels[c.category]?.[currentLang] || c.category}
                          </span>
                        </div>
                        <div className="rounded-lg bg-white p-2.5 border border-slate-200">
                          <span className="text-[10px] text-slate-400 font-medium block">Geographic Location</span>
                          <span className="font-semibold text-slate-800 truncate block">
                            {c.taluka_or_ward ? `${c.taluka_or_ward}, ` : ""}{c.district}
                          </span>
                        </div>
                        <div className="rounded-lg bg-white p-2.5 border border-slate-200">
                          <span className="text-[10px] text-slate-400 font-medium block">Impacted Demographic</span>
                          <span className="font-semibold text-slate-800 truncate block">
                            {c.affected_group || "Local community"}
                          </span>
                        </div>
                        <div className="rounded-lg bg-white p-2.5 border border-slate-200">
                          <span className="text-[10px] text-slate-400 font-medium block">Extracted Landmark</span>
                          <span className="font-semibold text-slate-800 truncate block">
                            {c.landmark || "District Center"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 3: HOTSPOT FORMATION */}
            {currentStep === 3 && activeHotspotDetail && (
              <div className="space-y-4">
                <div className="rounded-xl bg-slate-50 p-4 border border-slate-200 text-xs text-slate-700 space-y-1">
                  <p className="font-semibold text-slate-900">
                    Geographic & Sector Evidence Convergence:
                  </p>
                  <p className="text-slate-600 leading-relaxed">
                    Multiple grievances from <strong>{activeHotspotDetail.taluka_or_ward}, {activeHotspotDetail.district}</strong> in sector <strong>{categoryLabels[activeHotspotDetail.category]?.[currentLang] || activeHotspotDetail.category}</strong> converged within a 5.0 km radius, triggering hotspot cluster formation.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
                    <span className="text-xs text-slate-500 font-medium block">Grievance Saturation</span>
                    <span className="text-2xl font-bold text-indigo-700 mt-1 block">
                      {activeHotspotDetail.complaint_count} Complaints
                    </span>
                    <span className="text-[11px] text-slate-500">Benchmark threshold: 5.0</span>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
                    <span className="text-xs text-slate-500 font-medium block">Cluster Center Coordinates</span>
                    <span className="text-base font-mono font-bold text-slate-900 mt-1.5 block">
                      {activeHotspotDetail.center_lat.toFixed(4)}°N, {activeHotspotDetail.center_lng.toFixed(4)}°E
                    </span>
                    <span className="text-[11px] text-slate-500">Radius: {activeHotspotDetail.radius_km} km cluster</span>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
                    <span className="text-xs text-slate-500 font-medium block">Average Severity Rating</span>
                    <span className="text-2xl font-bold text-red-600 mt-1 block">
                      {activeHotspotDetail.avg_severity} / 5.0
                    </span>
                    <span className="text-[11px] text-slate-500">Dominant Urgency: {activeHotspotDetail.dominant_urgency}</span>
                  </div>
                </div>

                {/* Ground Citations */}
                <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2.5 shadow-2xs">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Converged Ground Evidence Citations
                  </h4>
                  <div className="space-y-2">
                    {activeHotspotDetail.evidence_citations.slice(0, 3).map((cit, i) => (
                      <div key={i} className="rounded-lg bg-slate-50 p-3 text-xs border border-slate-200/80 flex items-start gap-2">
                        <Quote className="h-3.5 w-3.5 shrink-0 text-slate-400 mt-0.5" />
                        <div className="flex-1">
                          <p className="italic text-slate-800">"{cit.quote}"</p>
                          <span className="text-[10px] text-slate-500 mt-1 block font-mono">
                            {cit.source_type} • {cit.location_marker}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: PRIORITY CALCULATION */}
            {currentStep === 4 && activeHotspotDetail && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded-xl bg-slate-50 p-4 border border-slate-200 shadow-2xs">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Authoritative Deterministic Priority Score
                    </span>
                    <div className="flex items-baseline gap-2 mt-0.5">
                      <span className="text-3xl font-black text-slate-900">{activeHotspotDetail.final_priority_score}</span>
                      <span className="text-sm font-semibold text-slate-500">/ 100</span>
                      <span className="rounded bg-indigo-50 border border-indigo-200 px-2 py-0.5 text-xs font-bold text-indigo-700 font-mono">
                        {t.calcByEngine}
                      </span>
                    </div>
                  </div>

                  <div className="text-right text-xs text-slate-500 font-mono">
                    <p className="font-bold text-slate-800">0% LLM Interference</p>
                    <p>Formula: Demand 35% + Infra 25% + Pop 20% + Sev 10% + Capex 10%</p>
                  </div>
                </div>

                {/* 5-Factor Mathematical Breakdown Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {[
                    { factor: activeHotspotDetail.score_breakdown.citizen_demand, weight: 35, accent: "text-orange-700", bar: "bg-orange-600" },
                    { factor: activeHotspotDetail.score_breakdown.infrastructure_gap, weight: 25, accent: "text-blue-700", bar: "bg-blue-600" },
                    { factor: activeHotspotDetail.score_breakdown.population_impact, weight: 20, accent: "text-indigo-700", bar: "bg-indigo-600" },
                    { factor: activeHotspotDetail.score_breakdown.severity, weight: 10, accent: "text-red-700", bar: "bg-red-600" },
                    { factor: activeHotspotDetail.score_breakdown.investment_gap, weight: 10, accent: "text-emerald-700", bar: "bg-emerald-600" },
                  ].map((f, i) => (
                    <div key={i} className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-800">{f.factor.name}</span>
                        <span className={`font-mono font-bold ${f.accent}`}>
                          +{f.factor.weighted_score.toFixed(1)} pts
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${f.bar}`}
                          style={{ width: `${Math.min(100, f.factor.raw_score)}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                        <span className="truncate pr-2">{f.factor.benchmark_data}</span>
                        <span className="font-mono font-semibold text-slate-700 shrink-0">
                          Raw: {f.factor.raw_score}/100
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 5: GOVERNMENT RESPONSE */}
            {currentStep === 5 && activeHotspotDetail && (
              <div className="space-y-4">
                {/* Executive Summary */}
                <div className="rounded-xl border border-indigo-200 bg-indigo-50/40 p-4 space-y-2 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="h-4 w-4 text-indigo-600" />
                      <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-950">
                        {t.aiExecutiveBrief}
                      </h4>
                    </div>
                    <span className="rounded bg-indigo-100 text-indigo-800 border border-indigo-200 px-2 py-0.5 text-[10px] font-semibold">
                      Assistive AI Synthesized
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                    {activeHotspotDetail.gemini_narrative}
                  </p>
                  <p className="text-[10px] text-indigo-900/70 font-medium pt-1 border-t border-indigo-100">
                    * Note: This brief is assistive intelligence explaining evidence for human administrators; it does not set the mathematical score.
                  </p>
                </div>

                {/* 3-Tier Operational Roadmap */}
                <div className="space-y-2.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    {t.aiSuggestedActions} (3-Tier Operational Roadmap)
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {activeHotspotDetail.suggested_action_plan.map((act, i) => (
                      <div key={i} className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-50 text-[10px] font-bold text-indigo-700 border border-indigo-200">
                              {act.step_number}
                            </span>
                            <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                              {act.action_type}
                            </span>
                          </div>
                          <h5 className="text-xs font-bold text-slate-900 mb-1">{act.title}</h5>
                          <p className="text-[11px] text-slate-600 leading-relaxed mb-2.5">{act.description}</p>
                        </div>
                        <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-500 space-y-0.5">
                          <p className="truncate font-medium text-slate-700">{act.responsible_agency}</p>
                          <p className="font-semibold text-emerald-700">{act.estimated_timeline}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action button to open full Government Dashboard */}
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => onNavigateToDashboard(activeHotspotDetail.id)}
                    className="inline-flex items-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 text-xs font-bold transition-colors cursor-pointer shadow-xs"
                  >
                    <span>Inspect this Hotspot on Government Map & Drawer</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
