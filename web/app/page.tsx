"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Bookmark,
  CalendarRange,
  Droplets,
  Flame,
  Globe2,
  MapPin,
  Satellite,
  Shield,
  Sparkles,
  Sprout,
  Stethoscope,
  Thermometer,
  Zap,
} from "lucide-react";
import {
  CROPS,
  FARMS,
  districtName,
  divisionName,
  farmContext,
  farmName,
  getFarm,
} from "@/lib/data";
import { withRealData } from "@/lib/packs";
import {
  DEFAULT_PRIORITIES,
  DEFAULT_SCENARIO,
  generateRotations,
  onsetShiftSignificant,
  type Priorities,
  type RotationResult,
} from "@/lib/engine";
import { useLang } from "@/lib/lang";
import { fmtNum, t } from "@/lib/i18n";
import { Panel } from "@/components/ui";
import { RotationCard, WhyDrawer } from "@/components/RotationCard";
import { WeatherForecastCard } from "@/components/WeatherForecastCard";
import { FieldAreaCalculator } from "@/components/FieldAreaCalculator";
import { VoicePriorityMic } from "@/components/VoicePriorityMic";
import { SavePlanButton } from "@/components/SavePlanButton";
import { ExportPDFButton } from "@/components/ExportPDFButton";
import { DownloadTamilButton } from "@/components/DownloadLocaleButton";

const ALL_CROP_IDS = new Set(CROPS.map((c) => c.id));

export default function UnifiedHome() {
  const { lang } = useLang();
  const [selectedFarmId, setSelectedFarmId] = useState("farm-12");
  const [priorities, setPriorities] = useState<Priorities>(DEFAULT_PRIORITIES);
  const [whyResult, setWhyResult] = useState<RotationResult | null>(null);

  // Active farm pack
  const farm = useMemo(() => withRealData(getFarm(selectedFarmId)), [selectedFarmId]);

  // Live top rotations for the active farm
  const rotations = useMemo(
    () => generateRotations(farm, priorities, DEFAULT_SCENARIO, ALL_CROP_IDS),
    [farm, priorities]
  );
  const topRotation = rotations[0];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8 space-y-8">
      {/* 🚀 1. NASA Space Apps Challenge Hero Header */}
      <section className="rounded-2xl border border-lime/40 bg-gradient-to-br from-surface via-elevated to-surface p-6 lg:p-8 shadow-sm fade-up">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-lime/50 bg-lime/10 px-3 py-1 text-xs font-bold text-lime">
            <Satellite className="h-3.5 w-3.5" />
            NASA Space Apps Challenge 2026 · Team Orion
          </div>
          <div className="flex items-center gap-2 text-xs text-ink-low font-mono">
            <span>NASA POWER</span> · <span>GPM IMERG</span> · <span>SMAP</span> · <span>MODIS</span> · <span>GRACE</span>
          </div>
        </div>

        <h1 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-ink-hi lg:text-5xl">
          {t("hero_line1", lang)}{" "}
          <span className="text-lime">{t("hero_line2", lang)}</span>
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-ink-mid lg:text-base">
          {t("hero_intro", lang)}
        </p>

        {/* Quick Jump Pills for All Core Features */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-line-soft">
          <div className="flex flex-wrap gap-2">
            {[
              { href: "/quick", icon: Zap, label: lang === "ta" ? "உடனடி தீர்வு" : lang === "bn" ? "দ্রুত উত্তর" : "Quick Answer" },
              { href: "/plan", icon: CalendarRange, label: lang === "ta" ? "பயிர் திட்டம்" : lang === "bn" ? "ফসল পরিকল্পনা" : "Crop Planner" },
              { href: "/disease", icon: Stethoscope, label: lang === "ta" ? "பயிர் மருத்துவர்" : lang === "bn" ? "ফসল ডাক্তার" : "Crop Doctor" },
              { href: "/saved", icon: Bookmark, label: lang === "ta" ? "சேமிக்கப்பட்டவை" : lang === "bn" ? "সংরক্ষিত পরিকল্পনা" : "Saved Plans" },
              { href: "/locate", icon: MapPin, label: lang === "ta" ? "இடம் தேர்வு" : lang === "bn" ? "স্থান ও আয়তন" : "Location & Area" },
              { href: "/field", icon: Sprout, label: lang === "ta" ? "நில ஆய்வு" : lang === "bn" ? "মাঠ বিশ্লেষণ" : "Field Analysis" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-1.5 rounded-lg border border-line bg-surface/80 px-3 py-1.5 text-xs font-semibold text-ink-hi hover:border-lime hover:text-lime transition-all"
              >
                <item.icon className="h-3.5 w-3.5 text-lime" />
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
          <DownloadTamilButton />
        </div>
      </section>

      {/* 🧭 2. Unified Mission Control Command Center */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-xl font-bold tracking-tight text-ink-hi flex items-center gap-2">
              <Globe2 className="h-5 w-5 text-action" />
              {lang === "bn" ? "খামার নির্বাচন ও আবহাওয়া কমান্ড সেন্টার" : "Farm & Climate Mission Control"}
            </h2>
            <p className="text-xs text-ink-low mt-0.5">
              {lang === "bn"
                ? "খামার পরিবর্তন করুন — স্বয়ংক্রিয়ভাবে নাসা উপগ্রহ ডেটা, ঘূর্ণন স্কোর এবং পূর্বাভাস আপডেট হবে"
                : "Switch monitored demo farm to dynamically recompute NASA satellite scores and weather"}
            </p>
          </div>

          {/* Farm Switcher Buttons */}
          <div className="flex flex-wrap gap-1.5">
            {FARMS.map((f) => (
              <button
                key={f.id}
                onClick={() => setSelectedFarmId(f.id)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold border transition-all ${
                  selectedFarmId === f.id
                    ? "bg-lime text-canvas border-lime shadow-sm"
                    : "bg-surface text-ink-mid border-line hover:border-line-soft hover:text-ink-hi"
                }`}
              >
                {districtName(f, lang)}
              </button>
            ))}
          </div>
        </div>

        {/* 7-Day Live Open-Meteo Weather Forecast */}
        <WeatherForecastCard lat={farm.lat} lon={farm.lon} lang={lang} />
      </section>

      {/* 🌾 3. Interactive Crop Rotation Recommendation with Voice & Actions */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h2 className="font-display text-xl font-bold tracking-tight text-ink-hi flex items-center gap-2">
              <Sprout className="h-5 w-5 text-lime" />
              {lang === "bn" ? "সেরা ৩-মৌসুম ফসল আবর্তন পরিকল্পনা" : "Top Ranked 3-Season Crop Rotation"}
            </h2>
            <span className="rounded-full bg-lime/10 border border-lime/30 px-2 py-0.5 text-[11px] font-bold text-lime">
              {farmName(farm, lang)} ({districtName(farm, lang)})
            </span>
          </div>

          {/* Voice Input & Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <VoicePriorityMic
              lang={lang}
              onPriorityChange={(k, v) => setPriorities((p) => ({ ...p, [k]: v }))}
            />
            {topRotation && (
              <>
                <SavePlanButton
                  crops={topRotation.crops.map((c) => (lang === "bn" ? c.name_bn : c.name_en))}
                  score={topRotation.total}
                  district={districtName(farm, lang)}
                  lang={lang}
                />
                <ExportPDFButton
                  district={districtName(farm, lang)}
                  crops={topRotation.crops.map((c) => (lang === "bn" ? c.name_bn : c.name_en))}
                  score={topRotation.total}
                  lang={lang}
                />
              </>
            )}
          </div>
        </div>

        {/* Top 2 Rotation Cards */}
        <div className="grid gap-4 md:grid-cols-2">
          {rotations.slice(0, 2).map((r, i) => (
            <RotationCard
              key={r.id}
              result={r}
              rank={i + 1}
              selected={i === 0}
              onWhy={() => setWhyResult(r)}
            />
          ))}
        </div>

        <div className="text-right">
          <Link
            href={`/plan?farm=${farm.id}`}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-link hover:underline"
          >
            {lang === "bn" ? "পুরো ফসল পরিকল্পনাকারী পেজে যান (সব দৃশ্যপট ও স্লাইডার সহ)" : "Open Full Crop Planner with scenario sliders & crop pool"}
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </section>

      {/* 🔬 4. Dual Tools: Crop Doctor & Turf.js Field Calculator */}
      <section className="grid gap-6 md:grid-cols-2">
        {/* Left: Crop Doctor Teaser */}
        <div className="rounded-2xl border border-line bg-surface p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-lime/15 text-lime">
                <Stethoscope className="h-5 w-5" />
              </span>
              <span className="rounded-full bg-lime/10 px-2 py-0.5 text-[10px] font-bold text-lime">
                AI Vision
              </span>
            </div>
            <h3 className="mt-3 font-display text-lg font-bold text-ink-hi">
              {lang === "bn" ? "ফসল ডাক্তার — রোগ শনাক্তকরণ" : "Crop Doctor — Disease Diagnostics"}
            </h3>
            <p className="mt-1.5 text-xs leading-relaxed text-ink-mid">
              {lang === "bn"
                ? "পাতায় দাগ বা রোগ দেখা দিলে ছবি আপলোড করে রোগ নির্ণয় করুন। এআই মডেল রোগের চিকিৎসা এবং জমি রোগমুক্ত রাখতে কোন ফসল আবর্তন করতে হবে তা বাতলে দেবে।"
                : "Upload an infected leaf photo to identify diseases like Rice Blast or Late Blight. Receive treatment advice and non-host rotation recommendations."}
            </p>
          </div>
          <div className="mt-5">
            <Link
              href="/disease"
              className="inline-flex items-center gap-1.5 rounded-lg bg-lime px-4 py-2 text-xs font-bold text-canvas hover:bg-lime/90 transition-colors"
            >
              {lang === "bn" ? "রোগ পরীক্ষা করুন" : "Scan Leaf Disease"}
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* Right: Turf.js Field Area Calculator */}
        <div>
          <FieldAreaCalculator />
        </div>
      </section>

      {/* 🗺️ 5. Monitored NASA Demo Farms Across Bangladesh */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-low">
          {t("farms_heading", lang)}
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {FARMS.map((base) => {
            const f = withRealData(base);
            const active = f.id === selectedFarmId;
            return (
              <div
                key={f.id}
                onClick={() => setSelectedFarmId(f.id)}
                className={`cursor-pointer rounded-xl border p-4 transition-all ${
                  active
                    ? "border-lime bg-lime/5 shadow-sm"
                    : "border-line bg-surface hover:border-line-soft"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-display text-base font-bold text-ink-hi">
                      {farmName(f, lang)}
                    </p>
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-ink-low">
                      <MapPin className="h-3 w-3" /> {districtName(f, lang)}, {divisionName(f, lang)}
                    </p>
                  </div>
                  <span className="rounded-full border border-line px-2 py-0.5 text-[10px] text-ink-mid">
                    {farmContext(f, lang)}
                  </span>
                </div>
                <div className="mt-4 flex items-center gap-3 text-xs">
                  <span
                    className={`tabular font-semibold ${
                      onsetShiftSignificant(f)
                        ? f.onset.shiftDays > 0
                          ? "text-amber"
                          : "text-lime"
                        : "text-ink-mid"
                    }`}
                  >
                    {t("card_onset", lang)} {f.onset.shiftDays > 0 ? "+" : ""}
                    {fmtNum(f.onset.shiftDays, lang)} {t("unit_days_short", lang)}
                  </span>
                  <span className="flex items-center gap-1 text-ink-mid">
                    <Droplets className="h-3.5 w-3.5 text-blue-400" />
                    {fmtNum(f.metrics.soilMoisturePct, lang)}%
                  </span>
                  <span className="flex items-center gap-1 text-ink-mid">
                    <Thermometer className="h-3.5 w-3.5 text-rose-400" />
                    {fmtNum(f.metrics.heatDays, lang)}d
                  </span>
                  <Link
                    href={`/field?farm=${f.id}`}
                    className="ml-auto text-xs font-semibold text-link hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Details →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* "Why" Drawer for SHAP & AI Explanation */}
      {whyResult && (
        <WhyDrawer result={whyResult} onClose={() => setWhyResult(null)} />
      )}
    </div>
  );
}
