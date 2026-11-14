"use client";
import React from "react";
import { Mic } from "lucide-react";
import { useSpeechPriority, type SpeechMatch } from "@/hooks/useSpeechPriority";

interface Props {
  lang: "en" | "bn" | "ta";
  onPriorityChange: (key: string, value: number) => void;
}

export function VoicePriorityMic({ lang, onPriorityChange }: Props) {
  const { listening, transcript, supported, startListening } = useSpeechPriority(
    lang,
    (match: SpeechMatch) => {
      onPriorityChange(match.key, match.value);
    }
  );

  if (!supported) return null;

  return (
    <div className="flex items-center gap-1.5">
      {transcript && (
        <span className="text-[10px] text-ink-low truncate max-w-[110px] bg-inset px-1.5 py-0.5 rounded">
          &quot;{transcript}&quot;
        </span>
      )}
      <button
        type="button"
        onClick={startListening}
        title={
          lang === "ta"
            ? "குரல் வழி முன்னுரிமை அமைக்க (தண்ணீர், மண், மகசூல்)"
            : lang === "bn"
            ? "ভয়েস দিয়ে অগ্রাধিকার সেট করুন (যেমন: পানি, মাটি, ফলন)"
            : "Set priority by voice (e.g. water, soil, yield)"
        }
        className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold transition-all ${
          listening
            ? "animate-pulse bg-rose-500 text-white"
            : "border border-line bg-surface text-ink-mid hover:border-action hover:text-ink-hi"
        }`}
      >
        <Mic className={`h-3 w-3 ${listening ? "animate-bounce" : ""}`} />
        <span>
          {listening
            ? lang === "ta"
              ? "கேட்கிறது…"
              : lang === "bn"
              ? "শুনছি…"
              : "Listening…"
            : lang === "ta"
            ? "குரல்"
            : lang === "bn"
            ? "ভয়েস"
            : "Voice"}
        </span>
      </button>
    </div>
  );
}
