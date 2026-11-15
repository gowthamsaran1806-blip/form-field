"use client";
import React, { useState, useEffect, useRef } from "react";
import { Volume2, VolumeX, Square } from "lucide-react";
import type { Lang } from "@/lib/i18n";

interface Props {
  text: string;
  lang: Lang;
  className?: string;
}

export function AudioAdvisoryButton({ text, lang, className }: Props) {
  const [speaking, setSpeaking] = useState(false);
  const [supported, setSupported] = useState(false);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      synthRef.current = window.speechSynthesis;
      setSupported(true);
    }
  }, []);

  const handleToggleSpeak = () => {
    if (!synthRef.current) return;

    if (speaking) {
      synthRef.current.cancel();
      setSpeaking(false);
      return;
    }

    synthRef.current.cancel(); // Clear any queued speech

    // Clean text: strip technical symbols like p=0.001 or markdown bullets
    const cleanText = text
      .replace(/\(p=[\d\.]+\)/g, "")
      .replace(/→/g, ", ")
      .replace(/[><]/g, " ")
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 0.95; // Slightly slower for clear agricultural comprehension
    utterance.pitch = 1.0;

    // Pick appropriate BCP-47 language tag
    if (lang === "ta") {
      utterance.lang = "ta-IN";
    } else if (lang === "bn") {
      utterance.lang = "bn-BD";
    } else {
      utterance.lang = "en-US";
    }

    // Try to match available system voices
    const voices = synthRef.current.getVoices?.() || [];
    const targetPrefix = lang === "ta" ? "ta" : lang === "bn" ? "bn" : "en";
    const matchedVoice = voices.find((v) => v.lang.toLowerCase().startsWith(targetPrefix));
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);

    synthRef.current.speak(utterance);
  };

  if (!supported) return null;

  return (
    <button
      type="button"
      onClick={handleToggleSpeak}
      title={
        speaking
          ? lang === "ta"
            ? "ஆடியோவை நிறுத்து"
            : lang === "bn"
            ? "ভয়েস থামান"
            : "Stop Audio"
          : lang === "ta"
          ? "ஆலோசனை குரல்வழியாக கேட்க (Audio)"
          : lang === "bn"
          ? "পরামর্শ শুনুন (Audio)"
          : "Listen to Advisory (Audio)"
      }
      className={
        className ??
        `inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
          speaking
            ? "border-emerald-500 bg-emerald-500/10 text-emerald-500 animate-pulse"
            : "border-line bg-inset text-ink-mid hover:border-lime hover:text-lime"
        }`
      }
    >
      {speaking ? (
        <>
          <Square className="h-3.5 w-3.5 fill-current" />
          <span>
            {lang === "ta" ? "நிறுத்து" : lang === "bn" ? "থামান" : "Stop"}
          </span>
        </>
      ) : (
        <>
          <Volume2 className="h-3.5 w-3.5" />
          <span>
            {lang === "ta" ? "கேட்க (Audio)" : lang === "bn" ? "শুনুন" : "Listen"}
          </span>
        </>
      )}
    </button>
  );
}
