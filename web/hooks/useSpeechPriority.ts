"use client";
import { useState, useCallback } from "react";

export type SliderKey = "water" | "soilHealth" | "stability" | "riskSafety";

export interface SpeechMatch {
  key: SliderKey;
  value: number;
  label: string;
}

export function parseVoiceInput(text: string): SpeechMatch | null {
  const lower = text.toLowerCase();

  // Water priority (English, Bengali & Tamil keywords)
  if (
    lower.includes("water") ||
    lower.includes("irrigation") ||
    lower.includes("rain") ||
    lower.includes("পানি") ||
    lower.includes("সেচ") ||
    lower.includes("জল") ||
    lower.includes("বৃষ্টি") ||
    lower.includes("தண்ணீர்") ||
    lower.includes("நீர்") ||
    lower.includes("மழை") ||
    lower.includes("பாசனம்")
  ) {
    return { key: "water", value: 90, label: "Water Saving (நீர் சேமிப்பு)" };
  }

  // Soil health priority
  if (
    lower.includes("soil") ||
    lower.includes("fertil") ||
    lower.includes("organic") ||
    lower.includes("মাটি") ||
    lower.includes("উর্বর") ||
    lower.includes("সার") ||
    lower.includes("জৈব") ||
    lower.includes("மண்") ||
    lower.includes("உரம்") ||
    lower.includes("வளம்") ||
    lower.includes("இயற்கை")
  ) {
    return { key: "soilHealth", value: 90, label: "Soil Health (மண் வளம்)" };
  }

  // Harvest stability / food first
  if (
    lower.includes("yield") ||
    lower.includes("harvest") ||
    lower.includes("food") ||
    lower.includes("income") ||
    lower.includes("ফলন") ||
    lower.includes("খাদ্য") ||
    lower.includes("আয়") ||
    lower.includes("ধান") ||
    lower.includes("மகசூல்") ||
    lower.includes("விளைச்சல்") ||
    lower.includes("உணவு") ||
    lower.includes("வருமானம்")
  ) {
    return { key: "stability", value: 90, label: "Stable Harvest (நிலையான மகசூல்)" };
  }

  // Risk & climate safety
  if (
    lower.includes("risk") ||
    lower.includes("flood") ||
    lower.includes("heat") ||
    lower.includes("storm") ||
    lower.includes("safety") ||
    lower.includes("ঝুঁকি") ||
    lower.includes("বন্যা") ||
    lower.includes("গরম") ||
    lower.includes("তাপ") ||
    lower.includes("নিরাপত্তা") ||
    lower.includes("பாதுகாப்பு") ||
    lower.includes("வெள்ளம்") ||
    lower.includes("வெப்பம்") ||
    lower.includes("அபாயம்")
  ) {
    return { key: "riskSafety", value: 90, label: "Climate Safety (காலநிலை பாதுகாப்பு)" };
  }

  return null;
}

export function useSpeechPriority(
  lang: "en" | "bn" | "ta",
  onMatch: (match: SpeechMatch) => void
) {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [supported, setSupported] = useState(true);

  const startListening = useCallback(() => {
    // Check for webkitSpeechRecognition or standard SpeechRecognition
    const SpeechRecognition =
      typeof window !== "undefined"
        ? (window as unknown as { SpeechRecognition?: any; webkitSpeechRecognition?: any })
            .SpeechRecognition ||
          (window as unknown as { SpeechRecognition?: any; webkitSpeechRecognition?: any })
            .webkitSpeechRecognition
        : null;

    if (!SpeechRecognition) {
      setSupported(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = lang === "ta" ? "ta-IN" : lang === "bn" ? "bn-BD" : "en-US";
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setListening(true);
        setTranscript("");
      };

      recognition.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        setTranscript(text);
        const match = parseVoiceInput(text);
        if (match) {
          onMatch(match);
        }
      };

      recognition.onerror = () => {
        setListening(false);
      };

      recognition.onend = () => {
        setListening(false);
      };

      recognition.start();
    } catch {
      setListening(false);
    }
  }, [lang, onMatch]);

  return { listening, transcript, supported, startListening };
}
