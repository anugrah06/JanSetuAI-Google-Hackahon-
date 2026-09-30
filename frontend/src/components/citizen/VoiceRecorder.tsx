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
    <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/60 p-6 text-center backdrop-blur-sm">
      {/* Central Visualizer & Mic Button */}
      <div className="relative mb-4 flex items-center justify-center">
        {/* Pulsing ring during recording */}
        {isRecording && (
          <>
            <div className="absolute h-32 w-32 animate-ping rounded-full bg-orange-500/20" />
            <div className="absolute h-24 w-24 animate-pulse rounded-full bg-orange-500/30" />
          </>
        )}

        <button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isProcessing}
          className={`relative z-10 flex h-20 w-20 items-center justify-center rounded-full shadow-2xl transition-all ${
            isRecording
              ? "bg-red-600 text-white shadow-red-600/40 hover:scale-105"
              : isProcessing
              ? "bg-slate-800 text-slate-500 cursor-not-allowed"
              : "bg-gradient-to-tr from-orange-600 via-amber-500 to-orange-500 text-white shadow-orange-500/30 hover:scale-105 hover:shadow-orange-500/50"
          }`}
          title={isRecording ? t.stopRecording : t.voiceRecordPrompt}
        >
          {isRecording ? (
            <Square className="h-8 w-8 fill-current" />
          ) : (
            <Mic className="h-8 w-8" />
          )}
        </button>
      </div>

      {/* Recording Status and Timer */}
      <div className="mb-4">
        {isRecording ? (
          <div className="flex flex-col items-center gap-1">
            <span className="flex items-center gap-2 text-sm font-semibold text-red-400">
              <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-red-500" />
              {t.recording}
            </span>
            <span className="font-mono text-2xl font-bold tracking-widest text-white">
              {formatTime(recordingSeconds)}
            </span>
            {/* Animated Audio Frequency bars */}
            <div className="mt-2 flex items-center gap-1">
              {[40, 70, 90, 50, 80, 100, 60, 85, 45, 95, 60, 30].map((h, i) => (
                <div
                  key={i}
                  className="w-1 rounded-full bg-orange-400 transition-all duration-150 animate-pulse"
                  style={{
                    height: `${Math.max(8, (h * (recordingSeconds % 3 + 1)) / 3)}px`,
                    animationDelay: `${i * 70}ms`
                  }}
                />
              ))}
            </div>
          </div>
        ) : isProcessing ? (
          <span className="flex items-center gap-2 text-sm font-medium text-amber-300">
            <Sparkles className="h-4 w-4 animate-spin text-amber-400" />
            {t.processing}
          </span>
        ) : (
          <p className="text-sm font-medium text-slate-300">
            {t.voiceRecordPrompt}
          </p>
        )}
      </div>

      {/* Playback preview if recorded */}
      {audioUrl && !isRecording && (
        <div className="mb-4 flex items-center gap-3 rounded-xl bg-slate-800/80 px-4 py-2 border border-slate-700">
          <Volume2 className="h-4 w-4 text-emerald-400" />
          <audio src={audioUrl} controls className="h-7 w-56" />
          <button
            onClick={() => {
              setAudioUrl(null);
              setRecordingSeconds(0);
            }}
            className="rounded p-1 text-slate-400 hover:text-white"
            title="Reset"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Permission Fallback Notice */}
      {permissionError && (
        <div className="mb-4 rounded-lg bg-amber-950/40 border border-amber-500/30 p-2.5 text-xs text-amber-300">
          {permissionError}
        </div>
      )}

      {/* One-Click Voice Simulation Buttons */}
      <div className="w-full pt-3 border-t border-slate-800/80">
        <p className="mb-2 text-xs font-semibold text-slate-400 flex items-center justify-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-orange-400" />
          Quick Audio Demonstration Queries (1-Click Test):
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          <button
            type="button"
            onClick={() =>
              onSimulateVoiceSample?.(
                "आमच्या आष्टी तालुक्यातील वडगावमध्ये गेल्या १५ दिवसांपासून पिण्याच्या पाण्याचा टँकर आलेला नाही. विहिरीचे पाणी दूषित झाले असून लहान मुले आजारी पडत आहेत.",
                "mr"
              )
            }
            className="flex items-center gap-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 px-3 py-1.5 text-xs text-amber-300 border border-amber-500/20 transition-all hover:scale-102"
          >
            <Play className="h-3 w-3 text-orange-400" />
            <span>Marathi: आष्टी पाणीटंचाई (Water Crisis)</span>
          </button>
          <button
            type="button"
            onClick={() =>
              onSimulateVoiceSample?.(
                "बीड जिले के आष्टी ब्लॉक में बोरवेल का पानी पूरी तरह सूख गया है और महिलाओं को तीन किलोमीटर दूर से पानी लाना पड़ रहा है।",
                "hi"
              )
            }
            className="flex items-center gap-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 px-3 py-1.5 text-xs text-blue-300 border border-blue-500/20 transition-all hover:scale-102"
          >
            <Play className="h-3 w-3 text-blue-400" />
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
            className="flex items-center gap-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 px-3 py-1.5 text-xs text-emerald-300 border border-emerald-500/20 transition-all hover:scale-102"
          >
            <Play className="h-3 w-3 text-emerald-400" />
            <span>English: Bridge Cave-in (Ratnagiri)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
