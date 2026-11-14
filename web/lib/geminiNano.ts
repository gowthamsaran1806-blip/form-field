"use client";
import type { Lang } from "./i18n";

export interface AIExplanationResult {
  text: string;
  provider: "on-device-nano" | "cloud-gemini" | "fallback";
}

/**
 * Generate a farmer-friendly explanation using Chrome 127+ Gemini Nano (on-device)
 * or gracefully fall back to the cloud Gemini 2.0 Flash endpoint.
 */
export async function generateFarmerExplanation(
  rotationName: string,
  score: number,
  district: string,
  keySignals: string[],
  lang: Lang = "en"
): Promise<AIExplanationResult> {
  const signalText = keySignals.slice(0, 2).join("; ");

  // 1. Check for Chrome 127+ Built-in Gemini Nano (`window.ai`)
  if (
    typeof window !== "undefined" &&
    "ai" in window &&
    (window as any).ai?.languageModel
  ) {
    try {
      const session = await (window as any).ai.languageModel.create({
        systemPrompt:
          lang === "bn"
            ? "আপনি একজন কৃষি বিশেষজ্ঞ। বাংলাদেশের ক্ষুদ্র কৃষকদের জন্য সহজে দুই বাক্যে বুঝিয়ে বলুন।"
            : lang === "ta"
            ? "நீங்கள் ஒரு விவசாய ஆலோசகர். விவசாயிகளுக்கு எளிய 2 வாக்கியங்களில் தமிழில் சுருக்கமாக விளக்குங்கள்."
            : "You are a friendly agricultural advisor. Explain in 2 plain sentences for smallholder farmers in Bangladesh.",
      });

      const prompt =
        lang === "bn"
          ? `${district} জেলার জন্য "${rotationName}" ফসলের ক্রমটির স্কোর ১০০-র মধ্যে ${score} হয়েছে। প্রধান কারণ: ${signalText}। কৃষকের জন্য এর অর্থ কী তা ২টি সহজ বাক্যে লিখুন।`
          : lang === "ta"
          ? `${district} மாவட்டத்திற்கு "${rotationName}" பயிர் சுழற்சிக்கு 100-க்கு ${score} புள்ளிகள் கிடைத்துள்ளது. முக்கிய காரணங்கள்: ${signalText}. ஒரு விவசாயிக்கு இதன் பலன் என்ன என்பதை 2 எளிய வாக்கியங்களில் விளக்குங்கள்.`
          : `For ${district} district, the crop rotation "${rotationName}" scored ${score}/100 based on NASA climate data. Main signals: ${signalText}. Write 2 plain sentences explaining what this means for a farmer.`;

      const result = await session.prompt(prompt);
      session.destroy?.();

      if (result && result.trim()) {
        return { text: result.trim(), provider: "on-device-nano" };
      }
    } catch (err) {
      console.warn("Gemini Nano on-device unavailable, falling back:", err);
    }
  }

  // 2. Cloud Gemini fallback via our Next.js API route
  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [
          {
            role: "user",
            content:
              lang === "bn"
                ? `${district} জেলায় "${rotationName}" ক্রমটির স্কোর ${score}/100। মূল কারণ: ${signalText}। কৃষকের জন্য সহজ পরামর্শ দিন (সর্বোচ্চ ৬০ শব্দ)।`
                : lang === "ta"
                ? `${district} மாவட்டத்தில் "${rotationName}" பயிர் சுழற்சிக்கு மதிப்பெண் ${score}/100. முக்கிய காரணங்கள்: ${signalText}. விவசாயிகளுக்கான சுருக்கமான ஆலோசனை தருக (அதிகபட்சம் 60 வார்த்தைகள்).`
                : `For ${district}, rotation "${rotationName}" scored ${score}/100. Signals: ${signalText}. Give a 2-sentence farmer summary.`,
          },
        ],
        farmContext: { district, rotationName, score, signals: keySignals },
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.reply) {
        return { text: data.reply, provider: "cloud-gemini" };
      }
    }
  } catch (err) {
    console.warn("Cloud AI fetch error:", err);
  }

  // 3. Fallback deterministic summary
  const defaultText =
    lang === "bn"
      ? `এই ফসলের ক্রমটি ${district} জেলার জন্য ${score}/১০০ স্কোর পেয়েছে। এটি আপনার জমির পানি ও মাটির স্বাস্থ্যের সাথে সামঞ্জস্যপূর্ণ।`
      : lang === "ta"
      ? `இந்த "${rotationName}" பயிர் சுழற்சி ${district} மாவட்டத்திற்கு 100-க்கு ${score} மதிப்பெண் பெற்றுள்ளது. இது மண்ணின் வளம் மற்றும் பருவமழை நீரின் அளவிற்கு மிகவும் உகந்தது.`
      : `The ${rotationName} rotation scored ${score}/100 in ${district}. It balances seasonal water adequacy and soil organic recovery.`;

  return { text: defaultText, provider: "fallback" };
}
