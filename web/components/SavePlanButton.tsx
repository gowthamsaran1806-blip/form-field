"use client";
import { useState } from "react";

interface Props {
  crops: string[];
  score: number;
  district: string;
  lang?: "en" | "bn" | "ta";
}

export function SavePlanButton({ crops, score, district, lang = "en" }: Props) {
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    const plans = JSON.parse(localStorage.getItem("field_shift_plans") ?? "[]") as unknown[];
    plans.unshift({ crops, score, district, savedAt: new Date().toISOString() });
    localStorage.setItem("field_shift_plans", JSON.stringify(plans.slice(0, 20)));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <button onClick={handleSave}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${saved ? "bg-emerald-50 border-emerald-300 text-emerald-700" : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"}`}>
      {saved ? "✅" : "🔖"}{" "}
      {saved
        ? lang === "ta"
          ? "சேமிக்கப்பட்டது!"
          : lang === "bn"
          ? "সংরক্ষিত!"
          : "Saved!"
        : lang === "ta"
        ? "திட்டத்தை சேமிக்க"
        : lang === "bn"
        ? "পরিকল্পনা সংরক্ষণ"
        : "Save Plan"}
    </button>
  );
}
