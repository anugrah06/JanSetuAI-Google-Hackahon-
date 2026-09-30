"use client";

import React, { useState, useRef, useEffect } from "react";
import { Mic, Square, Play, RotateCcw, Sparkles, Volume2 } from "lucide-react";
import { Language } from "@/types";
import { translations } from "@/lib/translations";

interface VoiceRecorderProps {
  currentLang: Language;
  onAudioRecorded: (blob: Blob) => void;
  onSimulateVoiceSample?: (sampleText: string, sampleLang: Language) => void;
  isProcessing: boolean;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  currentLang,
  onAudioRecorded,
  onSimulateVoiceSample,
  isProcessing,
}) => {
  const t = translations[currentLang];
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [permissionError, setPermissionError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  const startRecording = async () => {
    setPermissionError(null);
    setAudioUrl(null);
    audioChunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        onAudioRecorded(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start(200);
      setIsRecording(true);
      setRecordingSeconds(0);

      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.warn("Microphone access error:", err);
      setPermissionError(
        "Microphone access unavailable or denied. You can test voice below via one-click sample voice queries!"
      );
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${remainder.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 text-center shadow-xs">
      {/* Central Mic Button */}
      <div className="relative mb-4 flex items-center justify-center">
        {/* Restrained pulse ring during recording */}
        {isRecording && (
          <div className="absolute h-28 w-28 rounded-full bg-red-100 animate-ping opacity-75" />
        )}

        <button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isProcessing}
          className={`relative z-10 flex h-20 w-20 items-center justify-center rounded-full shadow-xs transition-all cursor-pointer ${
            isRecording
              ? "bg-red-600 text-white hover:bg-red-700"
              : isProcessing
              ? "bg-slate-100 text-slate-400 cursor-not-allowed"
              : "bg-indigo-600 hover:bg-indigo-700 text-white"
          }`}
          title={isRecording ? t.stopRecording : t.voiceRecordPrompt}
        >
          {isRecording ? (
            <Square className="h-7 w-7 fill-current" />
          ) : (
            <Mic className="h-8 w-8" />
          )}
        </button>
      </div>

      {/* Recording Status and Timer */}
      <div className="mb-4">
        {isRecording ? (
          <div className="flex flex-col items-center gap-1">
            <span className="flex items-center gap-2 text-sm font-semibold text-red-600">
              <span className="h-2.5 w-2.5 rounded-full bg-red-600 animate-pulse" />
              {t.recording}
            </span>
            <span className="font-mono text-2xl font-bold tracking-widest text-slate-900">
              {formatTime(recordingSeconds)}
            </span>
            {/* Audio Frequency bars */}
            <div className="mt-2 flex items-center gap-1">
              {[40, 70, 90, 50, 80, 100, 60, 85, 45, 95, 60, 30].map((h, i) => (
                <div
                  key={i}
                  className="w-1 rounded-full bg-indigo-500 transition-all duration-150"
                  style={{
                    height: `${Math.max(8, (h * ((recordingSeconds % 3) + 1)) / 3)}px`,
                  }}
                />
              ))}
            </div>
          </div>
        ) : isProcessing ? (
          <span className="flex items-center gap-2 text-sm font-medium text-indigo-700">
            <Sparkles className="h-4 w-4 animate-spin text-indigo-600" />
            {t.processing}
          </span>
        ) : (
          <div>
            <p className="text-sm font-semibold text-slate-800">
              {t.voiceRecordPrompt}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              Click to record via microphone, or choose a 1-click test below
            </p>
          </div>
        )}
      </div>

      {/* Playback preview if recorded */}
      {audioUrl && !isRecording && (
        <div className="mb-4 flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-2 border border-slate-200">
          <Volume2 className="h-4 w-4 text-emerald-600" />
          <audio src={audioUrl} controls className="h-7 w-56" />
          <button
            onClick={() => {
              setAudioUrl(null);
              setRecordingSeconds(0);
            }}
            className="rounded p-1 text-slate-500 hover:text-slate-900 cursor-pointer"
            title="Reset"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Permission Fallback Notice */}
      {permissionError && (
        <div className="mb-4 rounded-lg bg-amber-50 border border-amber-200 p-2.5 text-xs text-amber-800">
          {permissionError}
        </div>
      )}

      {/* One-Click Voice Simulation Buttons */}
      <div className="w-full pt-4 mt-2 border-t border-slate-200">
        <p className="mb-2.5 text-xs font-semibold text-slate-600 flex items-center justify-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
          Quick Audio Demonstration Queries (1-Click Test):
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          <button
            type="button"
            onClick={() =>
              onSimulateVoiceSample?.(
                "हमारे आष्टी ब्लॉक के वडगांव में पिछले 15 दिनों से पीने के पानी का टैंकर नहीं आया है। कुएं का पानी दूषित हो गया है और छोटे बच्चे बीमार पड़ रहे हैं। कृपया तुरंत पानी का टैंकर शुरू कराएं।",
                "hi"
              )
            }
            className="flex items-center gap-1.5 rounded-lg bg-slate-50 hover:bg-indigo-50/50 px-3 py-1.5 text-xs text-slate-700 hover:text-indigo-800 border border-slate-200 hover:border-indigo-300 transition-colors shadow-2xs font-medium cursor-pointer"
          >
            <Play className="h-3 w-3 text-indigo-600" />
            <span>Hindi: आष्टी पेयजल संकट (Water Crisis)</span>
          </button>
          <button
            type="button"
            onClick={() =>
              onSimulateVoiceSample?.(
                "बीड जिले के आष्टी ब्लॉक में बोरवेल का पानी पूरी तरह सूख गया है और महिलाओं को तीन किलोमीटर दूर से पानी लाना पड़ रहा है।",
                "hi"
              )
            }
            className="flex items-center gap-1.5 rounded-lg bg-slate-50 hover:bg-indigo-50/50 px-3 py-1.5 text-xs text-slate-700 hover:text-indigo-800 border border-slate-200 hover:border-indigo-300 transition-colors shadow-2xs font-medium cursor-pointer"
          >
            <Play className="h-3 w-3 text-indigo-600" />
            <span>Hindi: बोरवेल सूख गया (Dried Borewell)</span>
          </button>
          <button
            type="button"
            onClick={() =>
              onSimulateVoiceSample?.(
                "In Chiplun Ratnagiri, the main approach bridge road has caved in after flash rains and emergency ambulances are stuck.",
                "en"
              )
            }
            className="flex items-center gap-1.5 rounded-lg bg-slate-50 hover:bg-indigo-50/50 px-3 py-1.5 text-xs text-slate-700 hover:text-indigo-800 border border-slate-200 hover:border-indigo-300 transition-colors shadow-2xs font-medium cursor-pointer"
          >
            <Play className="h-3 w-3 text-indigo-600" />
            <span>English: Bridge Cave-in (Ratnagiri)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
