"use client";

import React, { useState } from "react";
import { Language, CitizenFeedbackResponse } from "@/types";
import { translations } from "@/lib/translations";
import { VoiceRecorder } from "./VoiceRecorder";
import { TicketCard } from "./TicketCard";
import { submitTextFeedback, submitVoiceFeedback } from "@/lib/api";
import { Mic, Edit3, Send, Sparkles, AlertCircle } from "lucide-react";

interface CitizenPortalProps {
  currentLang: Language;
  onGoToDashboard: () => void;
}

export const CitizenPortal: React.FC<CitizenPortalProps> = ({
  currentLang,
  onGoToDashboard,
}) => {
  const t = translations[currentLang];
  const [inputMode, setInputMode] = useState<"voice" | "text">("voice");
  const [textInput, setTextInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [latestTicket, setLatestTicket] = useState<CitizenFeedbackResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const samplePrompts: { title: string; text: string; lang: Language }[] = [
    {
      title: "हिंदी: आष्टी पेयजल दूषित व टैंकर बंद (Water Contamination)",
      text: "हमारे आष्टी ब्लॉक के वडगांव में पिछले 15 दिनों से पीने के पानी का टैंकर नहीं आया है। कुएं का पानी दूषित हो गया है और छोटे बच्चे बीमार पड़ रहे हैं।",
      lang: "hi"
    },
    {
      title: "हिंदी: आष्टी बोरवेल सूख गया (Borewell Failure)",
      text: "बीड जिले के आष्टी ब्लॉक में बोरवेल का पानी पूरी तरह सूख गया है और महिलाओं को तीन किलोमीटर दूर से पानी लाना पड़ रहा है।",
      lang: "hi"
    },
    {
      title: "हिंदी: चिपळूण घाट सड़क क्षति व गड्ढे (Ghat Road Washout)",
      text: "चिपळूण के कुंभारली घाट के पास मुख्य सड़क का हिस्सा धंस गया है। गहरे गड्ढों की वजह से एम्बुलेंस भी रास्ते में फंस रही हैं।",
      lang: "hi"
    },
    {
      title: "English: Ratnagiri Bridge Damage",
      text: "The main arterial culvert bridge on Chiplun-Karad link road has developed structural cracks after heavy rains. Heavy vehicles risk overturning.",
      lang: "en"
    }
  ];

  const handleTextSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!textInput.trim() || textInput.trim().length < 5) {
      setErrorMessage("Please enter at least 5 characters describing the issue.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const response = await submitTextFeedback(textInput, currentLang);
      setLatestTicket(response);
      setTextInput("");
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to submit grievance. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAudioRecorded = async (blob: Blob) => {
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const response = await submitVoiceFeedback(blob, currentLang);
      setLatestTicket(response);
    } catch (err: any) {
      setErrorMessage(err.message || "Voice submission failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSimulateVoice = async (sampleText: string, sampleLang: Language) => {
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const response = await submitTextFeedback(sampleText, sampleLang);
      setLatestTicket(response);
    } catch (err: any) {
      setErrorMessage(err.message || "Demo voice query failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      {/* Intro Hero Card */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 border border-indigo-200 px-3 py-1 text-xs font-semibold text-indigo-700 mb-3">
          <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
          <span>Multilingual Civic Voice-to-Needs Intake</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          {t.firstTimeGuide}
        </h1>
        <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Speak naturally or type your grievance in Hindi or English. JanSetu AI's multilingual intake converts raw citizen input into structured data for transparent, deterministic district infrastructure prioritization.
        </p>

        {/* Input Mode Selector */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200 shadow-2xs">
            <button
              onClick={() => setInputMode("voice")}
              className={`flex items-center gap-2 rounded-lg px-6 py-2.5 text-xs font-semibold transition-all cursor-pointer ${
                inputMode === "voice"
                  ? "bg-white text-indigo-700 font-bold shadow-xs border border-slate-200/80"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Mic className="h-4 w-4 text-indigo-600" />
              <span>{t.voiceInput}</span>
            </button>
            <button
              onClick={() => setInputMode("text")}
              className={`flex items-center gap-2 rounded-lg px-6 py-2.5 text-xs font-semibold transition-all cursor-pointer ${
                inputMode === "text"
                  ? "bg-white text-indigo-700 font-bold shadow-xs border border-slate-200/80"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Edit3 className="h-4 w-4 text-indigo-600" />
              <span>{t.textInput}</span>
            </button>
          </div>
        </div>

        {/* Sub-label for selected mode */}
        <p className="mt-2.5 text-xs text-slate-500 font-medium">
          {inputMode === "voice"
            ? "🎙️ Voice Mode: Record spoken grievance via microphone or choose from demonstration audio samples"
            : "✍️ Text Mode: Type or paste your localized grievance in Hindi or English"}
        </p>
      </div>

      {/* Error Notice */}
      {errorMessage && (
        <div className="mb-6 flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 p-3 text-xs text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Input Box */}
      <div className="mb-8">
        {inputMode === "voice" ? (
          <VoiceRecorder
            currentLang={currentLang}
            onAudioRecorded={handleAudioRecorded}
            onSimulateVoiceSample={handleSimulateVoice}
            isProcessing={isSubmitting}
          />
        ) : (
          <form onSubmit={handleTextSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
              Describe your infrastructure issue:
            </label>
            <textarea
              rows={4}
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="e.g. हमारे आष्टी गांव में पिछले दो हफ़्तों से पीने के पानी की मुख्य पाइपलाइन टूटी हुई है... (Hindi / English)"
              className="w-full rounded-xl border border-slate-300 bg-slate-50/50 p-4 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600/10 transition-colors"
            />

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs text-slate-500">
                {textInput.length} characters • Structured Output via Google Gemini
              </span>

              <button
                type="submit"
                disabled={isSubmitting || textInput.trim().length < 5}
                className="flex items-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 px-6 py-2.5 text-xs font-bold text-white shadow-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Sparkles className="h-4 w-4 animate-spin text-white" />
                    <span>{t.processing}</span>
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 text-white" />
                    <span>{t.submitComplaint}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Preset Text Chips */}
      {inputMode === "text" && (
        <div className="mb-8 rounded-xl bg-slate-100/70 p-4 border border-slate-200">
          <p className="text-xs font-semibold text-slate-700 mb-2.5">
            {t.samplePromptsTitle}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {samplePrompts.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setTextInput(p.text)}
                className="text-left rounded-lg bg-white hover:bg-indigo-50/40 p-3 text-xs border border-slate-200 hover:border-indigo-300 transition-all shadow-2xs group cursor-pointer"
              >
                <span className="font-semibold text-indigo-700 group-hover:text-indigo-800 block">{p.title}</span>
                <span className="text-slate-500 truncate block mt-1">{p.text}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Latest Ticket Display */}
      {latestTicket && (
        <div className="mt-8">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 mb-3 flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-indigo-600" />
            Civic Grievance Acknowledgment:
          </h2>
          <TicketCard
            ticket={latestTicket}
            currentLang={currentLang}
            onGoToDashboard={onGoToDashboard}
          />
        </div>
      )}
    </div>
  );
};
