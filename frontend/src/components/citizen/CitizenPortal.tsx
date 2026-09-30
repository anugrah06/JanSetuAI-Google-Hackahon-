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

  const samplePrompts = [
    {
      title: "मराठी: आष्टी विहिरीचे पाणी दूषित (Water Contamination)",
      text: "आमच्या आष्टी तालुक्यातील वडगावमध्ये गेल्या १५ दिवसांपासून पिण्याच्या पाण्याचा टँकर आलेला नाही. विहिरीचे पाणी दूषित झाले असून लहान मुले आजारी पडत आहेत.",
      lang: "mr"
    },
    {
      title: "हिंदी: आष्टी बोरवेल सूख गया (Borewell Failure)",
      text: "बीड जिले के आष्टी ब्लॉक में बोरवेल का पानी पूरी तरह सूख गया है और महिलाओं को तीन किलोमीटर दूर से पानी लाना पड़ रहा है।",
      lang: "hi"
    },
    {
      title: "मराठी: चिपळूण घाट रस्ता खचला (Ghat Road Washout)",
      text: "चिपळूण तालुक्यातील कुंभार्ली घाटाजवळ मुख्य रस्त्याचा काही भाग खचला आहे. मोठ्या खड्ड्यांमुळे रुग्णवाहिका अडकून पडत आहेत.",
      lang: "mr"
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
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
          {t.portalCitizen}
        </h1>
        <p className="mt-2 text-sm sm:text-base text-slate-400 max-w-2xl mx-auto">
          Speak or write your local infrastructure problem in your mother tongue.
          Google Gemini automatically extracts and connects your request to transparent district priorities.
        </p>

        {/* Input Mode Selector */}
        <div className="mt-6 inline-flex rounded-xl bg-slate-900 p-1 border border-slate-800 shadow-inner">
          <button
            onClick={() => setInputMode("voice")}
            className={`flex items-center gap-2 rounded-lg px-5 py-2 text-xs font-bold transition-all ${
              inputMode === "voice"
                ? "bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-lg shadow-orange-600/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Mic className="h-4 w-4" />
            <span>{t.voiceInput}</span>
          </button>
          <button
            onClick={() => setInputMode("text")}
            className={`flex items-center gap-2 rounded-lg px-5 py-2 text-xs font-bold transition-all ${
              inputMode === "text"
                ? "bg-gradient-to-r from-indigo-600 to-emerald-600 text-white shadow-lg shadow-indigo-600/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Edit3 className="h-4 w-4" />
            <span>{t.textInput}</span>
          </button>
        </div>
      </div>

      {/* Error Notice */}
      {errorMessage && (
        <div className="mb-6 flex items-center gap-2 rounded-xl bg-red-950/50 border border-red-500/40 p-3 text-xs text-red-300">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
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
          <form onSubmit={handleTextSubmit} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Describe your infrastructure issue:
            </label>
            <textarea
              rows={4}
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="e.g. आमच्या आष्टी गावात गेल्या दोन आठवड्यांपासून पाण्याची पाईपलाईन फुटली आहे... (Marathi / Hindi / English)"
              className="w-full rounded-xl border border-slate-800 bg-slate-950/80 p-4 text-sm text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-colors"
            />

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs text-slate-500">
                {textInput.length} characters • Powered by Gemini 2.5 Structured Output
              </span>

              <button
                type="submit"
                disabled={isSubmitting || textInput.trim().length < 5}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-orange-600/30 hover:scale-102 hover:shadow-orange-600/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Sparkles className="h-4 w-4 animate-spin" />
                    <span>{t.processing}</span>
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
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
        <div className="mb-8 rounded-xl bg-slate-900/40 p-4 border border-slate-800/80">
          <p className="text-xs font-semibold text-slate-400 mb-2.5">
            {t.samplePromptsTitle}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {samplePrompts.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setTextInput(p.text)}
                className="text-left rounded-lg bg-slate-800/50 hover:bg-slate-800 p-2.5 text-xs text-slate-300 border border-slate-700/50 hover:border-amber-500/30 transition-all"
              >
                <span className="font-semibold text-amber-300 block">{p.title}</span>
                <span className="text-slate-400 truncate block mt-0.5">{p.text}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Latest Ticket Display */}
      {latestTicket && (
        <div className="mt-8">
          <h2 className="text-sm font-bold uppercase tracking-wider text-emerald-400 mb-3 flex items-center gap-1.5">
            <Sparkles className="h-4 w-4" />
            Real-Time AI Extraction Confirmation:
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
