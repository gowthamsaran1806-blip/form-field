"use client";

import { useState } from "react";
import { Ruler, Sparkles, Check } from "lucide-react";
import { calculateFieldArea } from "@/lib/geoTurf";
import { useLang } from "@/lib/lang";
import { fmtNum } from "@/lib/i18n";

export function FieldAreaCalculator() {
  const { lang } = useLang();
  const [lengthM, setLengthM] = useState(100);
  const [widthM, setWidthM] = useState(80);

  // Generate rectangle coords in Dhaka coordinates to calculate
  const baseLat = 23.8;
  const baseLon = 90.4;
  const dLat = lengthM / 111320;
  const dLon = widthM / (111320 * Math.cos((baseLat * Math.PI) / 180));

  const coords: [number, number][] = [
    [baseLat, baseLon],
    [baseLat + dLat, baseLon],
    [baseLat + dLat, baseLon + dLon],
    [baseLat, baseLon + dLon],
  ];

  const { areaM2, areaHa, areaBigha } = calculateFieldArea(coords);

  return (
    <div className="rounded-xl border border-line bg-surface p-4">
      <div className="flex items-center gap-2">
        <Ruler className="h-4 w-4 text-lime" />
        <h3 className="font-display text-sm font-bold text-ink-hi">
          {lang === "ta"
            ? "நில பரப்பளவு கணக்கீட்டாளர் (Turf.js)"
            : lang === "bn"
            ? "জমির আয়তন ক্যালকুলেটর (Turf.js)"
            : "Field Area Calculator (Turf.js)"}
        </h3>
      </div>
      <p className="mt-1 text-xs text-ink-low">
        {lang === "ta"
          ? "நிலத்தின் நீளம் மற்றும் அகலத்தை மீட்டரில் உள்ளிடவும் — ஹெக்டேர் மற்றும் பிகாவில் கணக்கிடப்படும்"
          : lang === "bn"
          ? "আপনার জমির দৈর্ঘ্য ও প্রস্থ দিন — স্বয়ংক্রিয়ভাবে হেক্টর ও বিঘায় হিসাব হবে"
          : "Enter field dimensions to calculate area in Hectares and local Bigha"}
      </p>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-ink-mid">
            {lang === "ta"
              ? "நீளம் (மீட்டர்)"
              : lang === "bn"
              ? "দৈর্ঘ্য (মিটার)"
              : "Length (meters)"}
          </label>
          <input
            type="number"
            min={10}
            max={5000}
            value={lengthM}
            onChange={(e) => setLengthM(Math.max(1, Number(e.target.value)))}
            className="mt-1 w-full rounded-lg border border-line bg-inset px-3 py-1.5 text-sm font-mono text-ink-hi focus:border-lime focus:outline-none"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-ink-mid">
            {lang === "ta"
              ? "அகலம் (மீட்டர்)"
              : lang === "bn"
              ? "প্রস্থ (মিটার)"
              : "Width (meters)"}
          </label>
          <input
            type="number"
            min={10}
            max={5000}
            value={widthM}
            onChange={(e) => setWidthM(Math.max(1, Number(e.target.value)))}
            className="mt-1 w-full rounded-lg border border-line bg-inset px-3 py-1.5 text-sm font-mono text-ink-hi focus:border-lime focus:outline-none"
          />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 rounded-lg bg-inset p-3 text-center">
        <div>
          <span className="block text-[10px] uppercase font-semibold text-ink-low">
            {lang === "ta" ? "சதுர மீட்டர்" : lang === "bn" ? "বর্গমিটার" : "Sq Meters"}
          </span>
          <span className="font-mono text-base font-bold text-ink-hi">
            {fmtNum(areaM2, lang)}
          </span>
        </div>

        <div className="border-x border-line">
          <span className="block text-[10px] uppercase font-semibold text-lime">
            {lang === "ta" ? "ஹெக்டேர்" : lang === "bn" ? "হেক্টর" : "Hectares"}
          </span>
          <span className="font-mono text-base font-bold text-lime">
            {fmtNum(areaHa.toFixed(2), lang)}
          </span>
        </div>

        <div>
          <span className="block text-[10px] uppercase font-semibold text-amber">
            {lang === "ta" ? "பிகா" : lang === "bn" ? "বিঘা" : "Bigha"}
          </span>
          <span className="font-mono text-base font-bold text-amber">
            {fmtNum(areaBigha.toFixed(1), lang)}
          </span>
        </div>
      </div>
    </div>
  );
}
