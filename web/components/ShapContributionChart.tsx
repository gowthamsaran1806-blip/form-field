"use client";
import React from "react";
import type { RotationResult } from "@/lib/engine";
import { fmtNum, type Lang } from "@/lib/i18n";

interface Props {
  result: RotationResult;
  lang?: Lang;
}

interface FactorItem {
  label: string;
  value: number;
  isPositive: boolean;
  category: string;
}

export function ShapContributionChart({ result, lang = "en" }: Props) {
  // Extract positive contributions from components (scaled to score points)
  const positiveFactors: FactorItem[] = result.components.map((c) => {
    const points = Math.round(c.value * c.weight * 100 * 10) / 10;
    return {
      label: lang === "bn" ? c.label_bn : c.label,
      value: points,
      isPositive: true,
      category: "Component Score",
    };
  });

  // Extract negative deductions from penalties
  const negativeFactors: FactorItem[] = result.penalties.map((p) => {
    return {
      label: lang === "bn" ? p.rule.bn.slice(0, 32) + "…" : (p.rule.ta ? p.rule.ta.slice(0, 32) + "…" : p.rule.en.slice(0, 35) + "…"),
      value: p.amount,
      isPositive: false,
      category: "Penalty",
    };
  });

  // Early onset credit if any
  if (result.earlyCredit > 0) {
    positiveFactors.push({
      label: lang === "bn" ? "আগে বর্ষার সুবিধা" : lang === "ta" ? "முன்கூட்டிய பருவமழை வரவு" : "Early Onset Credit",
      value: result.earlyCredit,
      isPositive: true,
      category: "Bonus",
    });
  }

  const allFactors = [...positiveFactors, ...negativeFactors].sort(
    (a, b) => b.value - a.value
  );

  const maxValue = Math.max(30, ...allFactors.map((f) => f.value));

  return (
    <div className="rounded-xl border border-line bg-surface p-4">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold uppercase tracking-wider text-ink-low">
          {lang === "bn"
            ? "🔬 SHAP ব্যাখ্যাযোগ্যতা — কোন কারণে কত পয়েন্ট"
            : lang === "ta"
            ? "🔬 SHAP காரணிகள் — எந்த காரணிக்கு எவ்வளவு மதிப்பெண்"
            : "🔬 SHAP Explainability — Factor Contributions"}
        </h4>
        <span className="font-mono text-xs font-semibold text-lime">
          {fmtNum(result.total, lang)}/{fmtNum(100, lang)}
        </span>
      </div>
      <p className="mt-1 text-[11px] text-ink-low">
        {lang === "bn"
          ? "সবুজ বার স্কোর বৃদ্ধি করেছে (+) এবং লাল বার জলবায়ু ঝুঁকি ও লবণাক্ততার জন্য পয়েন্ট কেটেছে (−)"
          : lang === "ta"
          ? "பச்சை நிறம் அதிக மதிப்பெண்ணையும் (+), சிவப்பு நிறம் காலநிலை மற்றும் உப்புத்தன்மை அபாயங்களுக்கான குறைப்புகளையும் (−) குறிக்கிறது"
          : "Green factors increased the score (+), red factors deducted points for climate hazards & salinity (−)"}
      </p>

      <div className="mt-3 space-y-2">
        {allFactors.map((f, i) => {
          const widthPct = Math.min(100, (f.value / maxValue) * 100);
          return (
            <div key={i} className="flex flex-col gap-0.5 text-xs">
              <div className="flex items-center justify-between text-[11px]">
                <span className="truncate text-ink-mid max-w-[240px] font-medium">
                  {f.label}
                </span>
                <span
                  className={`font-mono font-bold ${
                    f.isPositive ? "text-emerald-500" : "text-rose-500"
                  }`}
                >
                  {f.isPositive ? "+" : "−"}
                  {fmtNum(f.value.toFixed(1), lang)}
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-inset">
                <div
                  className={`h-full rounded-full transition-all ${
                    f.isPositive
                      ? "bg-gradient-to-r from-emerald-600 to-lime"
                      : "bg-gradient-to-r from-rose-600 to-amber"
                  }`}
                  style={{ width: `${widthPct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
