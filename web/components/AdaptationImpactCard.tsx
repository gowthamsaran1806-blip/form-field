"use client";
import React from "react";
import { Droplets, Fuel, Sprout, Wind, ShieldCheck, Waves } from "lucide-react";
import type { ImpactMetrics } from "@/lib/engine";
import { fmtNum, type Lang } from "@/lib/i18n";

interface Props {
  impact: ImpactMetrics;
  lang: Lang;
}

export function AdaptationImpactCard({ impact, lang }: Props) {
  const estDieselCostBdt = impact.dieselFuelSavedLiters * 105; // ~105 BDT per liter diesel in rural Bangladesh

  return (
    <div className="rounded-xl border border-line bg-surface p-4">
      <div className="flex items-center justify-between">
        <h4 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-lime">
          <ShieldCheck className="h-4 w-4" />
          <span>
            {lang === "ta"
              ? "காலநிலை மீள்தன்மை & சுற்றுச்சூழல் பலன்கள் (Impact & ROI)"
              : lang === "bn"
              ? "জলবায়ু সহনশীলতা ও লাভজনকতা (ROI & Impact)"
              : "Climate Adaptation Margin & Sustainability ROI"}
          </span>
        </h4>
        <span className="rounded-full border border-lime/30 bg-lime/10 px-2 py-0.5 text-[10px] font-semibold text-lime">
          NASA Validated
        </span>
      </div>

      <p className="mt-1 text-[11px] text-ink-low">
        {lang === "ta"
          ? "வழக்கமான நெல் ஒற்றைப் பயிரோடு ஒப்பிடும்போது மிச்சமாகும் நீர், உரம், மற்றும் தாமத பருவமழை தாங்கும் திறன்."
          : lang === "bn"
          ? "ঐতিহ্যবাহী বোরো-আমন ফসলের তুলনায় সংরক্ষিত সেচ, সার খরচ সাশ্রয় এবং জলবায়ু সুরক্ষার সীমা।"
          : "Calculated adaptation safety headroom and quantified resource conservation versus monoculture baseline."}
      </p>

      {/* Grid of metrics */}
      <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {/* Adaptation Margin: Monsoon Shift Buffer */}
        <div className="rounded-lg border border-line bg-inset p-2.5">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-ink-mid">
            <Wind className="h-3.5 w-3.5 text-sky-400" />
            <span>
              {lang === "ta"
                ? "பருவமழை தாமத பாதுகாப்பு"
                : lang === "bn"
                ? "দেরি বর্ষা সহনশীলতা"
                : "Monsoon Shift Buffer"}
            </span>
          </div>
          <div className="mt-1 text-sm font-bold font-mono text-sky-400">
            +{fmtNum(impact.onsetShiftMarginDays, lang)} {lang === "ta" ? "நாட்கள்" : lang === "bn" ? "দিন" : "days"}
          </div>
          <div className="text-[10px] text-ink-low">
            {lang === "ta" ? "பயிர் சுழற்சி இடைவெளி" : lang === "bn" ? "সর্বোচ্চ নিরাপদ বিলম্ব" : "Safe late-onset margin"}
          </div>
        </div>

        {/* Salinity Headroom */}
        <div className="rounded-lg border border-line bg-inset p-2.5">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-ink-mid">
            <Waves className="h-3.5 w-3.5 text-amber-400" />
            <span>
              {lang === "ta"
                ? "உப்புத்தன்மை வரம்பு"
                : lang === "bn"
                ? "লবণাক্ততা বাফার"
                : "Salinity Headroom"}
            </span>
          </div>
          <div className="mt-1 text-sm font-bold font-mono text-amber-400">
            {fmtNum(impact.salinityHeadroomDsm, lang)} dS/m
          </div>
          <div className="text-[10px] text-ink-low">
            {lang === "ta" ? "இழப்பற்ற சகிப்புத்தன்மை" : lang === "bn" ? "ক্ষতিহীন সর্বোচ্চ সীমা" : "Before yield penalty"}
          </div>
        </div>

        {/* Water Conserved */}
        <div className="rounded-lg border border-line bg-inset p-2.5">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-ink-mid">
            <Droplets className="h-3.5 w-3.5 text-emerald-400" />
            <span>
              {lang === "ta"
                ? "சேமிக்கப்பட்ட நீர்"
                : lang === "bn"
                ? "পানি সাশ্রয়"
                : "Water Conserved"}
            </span>
          </div>
          <div className="mt-1 text-sm font-bold font-mono text-emerald-400">
            +{fmtNum(impact.waterSavedM3PerHa, lang)} m³/ha
          </div>
          <div className="text-[10px] text-ink-low">
            {lang === "ta" ? "நிலத்தடி நீர் பாதுகாப்பு" : lang === "bn" ? "ভূগর্ভস্থ পানি সুরক্ষা" : "Groundwater saved"}
          </div>
        </div>

        {/* Diesel / Fuel Saved */}
        <div className="rounded-lg border border-line bg-inset p-2.5">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-ink-mid">
            <Fuel className="h-3.5 w-3.5 text-rose-400" />
            <span>
              {lang === "ta"
                ? "பாசன டீசல் மிச்சம்"
                : lang === "bn"
                ? "ডিজেল ও সেচ খরচ সাশ্রয়"
                : "Diesel / Pump Saved"}
            </span>
          </div>
          <div className="mt-1 text-sm font-bold font-mono text-rose-400">
            {fmtNum(impact.dieselFuelSavedLiters, lang)} L (~{fmtNum(estDieselCostBdt, lang)} ৳)
          </div>
          <div className="text-[10px] text-ink-low">
            {lang === "ta" ? "பண சேமிப்பு / சீசன்" : lang === "bn" ? "প্রতি মৌসুমে সাশ্রয়" : "Saved per hectare"}
          </div>
        </div>

        {/* Nitrogen Fixed */}
        <div className="rounded-lg border border-line bg-inset p-2.5">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-ink-mid">
            <Sprout className="h-3.5 w-3.5 text-lime" />
            <span>
              {lang === "ta"
                ? "இயற்கை தழைச்சத்து"
                : lang === "bn"
                ? "জৈব নাইট্রোজেন"
                : "Bio Nitrogen"}
            </span>
          </div>
          <div className="mt-1 text-sm font-bold font-mono text-lime">
            +{fmtNum(impact.nitrogenFixedKgPerHa, lang)} kg N/ha
          </div>
          <div className="text-[10px] text-ink-low">
            {lang === "ta" ? "பயறுவகை மண் செழுமை" : lang === "bn" ? "ডাল ফসলে ইউরিয়া হ্রাস" : "From legume nodules"}
          </div>
        </div>

        {/* Carbon Accrual */}
        <div className="rounded-lg border border-line bg-inset p-2.5">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-ink-mid">
            <ShieldCheck className="h-3.5 w-3.5 text-violet-400" />
            <span>
              {lang === "ta"
                ? "மண் கரிம சேமிப்பு"
                : lang === "bn"
                ? "মাটির কার্বন বৃদ্ধি"
                : "Soil Carbon Gain"}
            </span>
          </div>
          <div className="mt-1 text-sm font-bold font-mono text-violet-400">
            +{fmtNum(impact.carbonAccrualTonsPerHa, lang)} t CO₂e/ha
          </div>
          <div className="text-[10px] text-ink-low">
            {lang === "ta" ? "மண் வளம் பெருக்கம்" : lang === "bn" ? "জৈব পদার্থ পুনর্গঠন" : "Residue sequestration"}
          </div>
        </div>
      </div>
    </div>
  );
}
