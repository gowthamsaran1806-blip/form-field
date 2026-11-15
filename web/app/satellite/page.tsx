"use client";

import { useState } from "react";
import Link from "next/link";
import { Globe, Layers, Calendar, ExternalLink, Satellite, ShieldCheck, ArrowRight } from "lucide-react";
import { useLang } from "@/lib/lang";
import { FARMS, districtName, farmName } from "@/lib/data";

interface GibsLayer {
  id: string;
  name_en: string;
  name_bn: string;
  name_ta: string;
  mission: string;
  resolution: string;
  description_en: string;
  description_bn: string;
  description_ta: string;
}

const GIBS_LAYERS: GibsLayer[] = [
  {
    id: "MODIS_Terra_CorrectedReflectance_TrueColor",
    name_en: "MODIS Terra (True Color 250m)",
    name_bn: "মোডিস টেরা (ট্রু কালার ২৫০মি)",
    name_ta: "மோடிஸ் டெரா (நேரடி செயற்கைக்கோள் வண்ணப் படம்)",
    mission: "NASA Terra EOS AM-1",
    resolution: "250m",
    description_en: "Daily natural color surface reflectance showing real cloud cover, river siltation, and crop greenness.",
    description_bn: "মেঘের আবরণ, নদী অববাহিকা ও ফসলের সবুজাভতা নির্দেশকারী দৈনিক প্রাকৃতিক রঙের স্যাটেলাইট চিত্র।",
    description_ta: "மேக மூட்டம், ஆறுகளின் வண்டல் மற்றும் பயிர் பசுமையை காட்டும் தினசரி இயற்கை வண்ணப் படம்.",
  },
  {
    id: "MODIS_Aqua_CorrectedReflectance_TrueColor",
    name_en: "MODIS Aqua (Afternoon Overpass 250m)",
    name_bn: "মোডিস অ্যাকোয়া (দুপুর ২টা ওভারপাস)",
    name_ta: "மோடிஸ் அக்வா (பிற்பகல் படம் 250m)",
    mission: "NASA Aqua EOS PM-1",
    resolution: "250m",
    description_en: "Afternoon satellite pass capturing peak daytime thermal and cloud convection across South Asia.",
    description_bn: "দক্ষিণ এশিয়ার দুপুরের তাপমাত্রা ও পরিচলন মেঘ ধারণকারী স্যাটেলাইট চিত্র।",
    description_ta: "பிற்பகல் வெப்ப அலை மற்றும் மேக இயக்கங்களை கண்காணிக்கும் நாசா செயற்கைக்கோள் பார்வை.",
  },
  {
    id: "VIIRS_SNPP_CorrectedReflectance_TrueColor",
    name_en: "VIIRS Suomi-NPP (True Color 375m)",
    name_bn: "ভিআইআইআরএস সুওমি-এনপিপি (৩৭৫মি)",
    name_ta: "விஐஐஆர்எஸ் சுவோமி-என்பிபி (375m)",
    mission: "NASA / NOAA Suomi NPP",
    resolution: "375m",
    description_en: "High-resolution sensor tracking agricultural field boundaries, floods, and vegetation vigor.",
    description_bn: "কৃষিজমির সীমানা, বন্যা ও ফসলের জীবনীশক্তি পর্যবেক্ষণকারী উচ্চ-রেজোলিউশন সেন্সর।",
    description_ta: "விவசாய நில எல்லைகள், வெள்ளம் மற்றும் பயிர் வளர்ச்சியை துல்லியமாக காட்டும் சென்சார்.",
  },
  {
    id: "MODIS_Terra_NDVI_8Day",
    name_en: "MODIS 8-Day NDVI Vegetation Index",
    name_bn: "মোডিস ৮-দিনের এনডিভিআই সবুজাভতা সূচক",
    name_ta: "மோடிஸ் 8-நாள் தாவர பசுமை குறியீடு (NDVI)",
    mission: "NASA Terra MOD13Q1",
    resolution: "250m",
    description_en: "Photosynthetic activity and canopy vigor index identifying crop growth cycles vs bare fallow soil.",
    description_bn: "ফসল বৃদ্ধি চক্র বনাম খালি পতিত জমি শনাক্তকারী সালোকসংশ্লেষণ সূচক।",
    description_ta: "பயிர்களின் பசுமை ஆரோக்கியம் மற்றும் தரிசு நிலத்தை வேறுபடுத்தும் பசுமை குறியீடு.",
  },
];

export default function SatellitePage() {
  const { lang } = useLang();
  const [selectedFarm, setSelectedFarm] = useState(FARMS[0]);
  const [selectedLayer, setSelectedLayer] = useState(GIBS_LAYERS[0]);
  const [targetDate, setTargetDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 2); // 2 days ago for guaranteed composite availability
    return d.toISOString().split("T")[0];
  });

  // Calculate bbox around Bangladesh / farm coordinates
  const lat = selectedFarm.lat;
  const lon = selectedFarm.lon;
  const delta = 1.8;
  const bbox = `${(lon - delta).toFixed(2)},${(lat - delta).toFixed(2)},${(lon + delta).toFixed(2)},${(lat + delta).toFixed(2)}`;

  // NASA Worldview interactive URL
  const worldviewUrl = `https://worldview.earthdata.nasa.gov/?v=${bbox}&l=${selectedLayer.id},Reference_Labels_15m,Reference_Features_15m,Coastlines_15m&t=${targetDate}`;

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 lg:px-8">
      {/* Header */}
      <div className="rounded-2xl border border-lime/30 bg-surface p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-action to-earth text-lime shadow-md">
              <Globe className="h-5 w-5" />
            </span>
            <div>
              <h1 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-ink-hi">
                {lang === "ta"
                  ? "நாசா GIBS நேரடி செயற்கைக்கோள் பார்வை"
                  : lang === "bn"
                  ? "নাসা গিবস (GIBS) লাইভ স্যাটেলাইট ভিউ"
                  : "NASA GIBS Live Satellite Observation"}
              </h1>
              <p className="text-xs text-ink-low">
                Global Imagery Browse Services (GIBS) · NASA Earth Observing System Data and Information System (EOSDIS)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-lime/40 bg-lime/10 px-3 py-1 text-xs font-semibold text-lime">
              <span className="h-2 w-2 rounded-full bg-lime animate-ping" />
              <span>NASA EOSDIS LIVE</span>
            </span>
          </div>
        </div>

        <p className="mt-3 text-xs leading-relaxed text-ink-mid max-w-3xl">
          {lang === "ta"
            ? "நாசாவின் டெரா, அக்வா மற்றும் சுவோமி-என்பிபி செயற்கைக்கோள்கள் தெற்காசியாவின் விவசாய நிலங்களை தினமும் படம் பிடிக்கின்றன. மேக மூட்டம், வெள்ள அபாயம் மற்றும் பயிர் பசுமையை நேரடியாகக் காணுங்கள்."
            : lang === "bn"
            ? "নাসার টেরা, অ্যাকোয়া এবং সুওমি-এনপিপি স্যাটেলাইট প্রতিদিন দক্ষিণ এশিয়ার কৃষিজমি স্ক্যান করে। আপনার নির্বাচিত জেলার বাস্তব স্যাটেলাইট ছবি, বন্যা পরিস্থিতি ও উদ্ভিদের সবুজাভতা এখানে সরাসরি পর্যবেক্ষণ করুন।"
            : "NASA GIBS ingests imagery from Terra, Aqua, and Suomi NPP polar-orbiting satellites to provide full-resolution imagery of Earth within 3 hours of observation. Explore actual cloud cover, river flooding, and canopy greenness over your selected farming district."}
        </p>
      </div>

      {/* Control Panel: Farm & Layer & Date Selector */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Farm / District Selector */}
        <div className="rounded-xl border border-line bg-surface p-4">
          <label className="text-xs font-semibold uppercase tracking-wider text-ink-low flex items-center gap-1.5">
            <Satellite className="h-3.5 w-3.5 text-lime" />
            <span>{lang === "ta" ? "பண்ணை / மாவட்டம்" : lang === "bn" ? "খামার ও জেলা" : "District & Farm"}</span>
          </label>
          <select
            value={selectedFarm.id}
            onChange={(e) => {
              const f = FARMS.find((x) => x.id === e.target.value);
              if (f) setSelectedFarm(f);
            }}
            className="mt-2 w-full rounded-lg border border-line bg-inset p-2.5 text-xs font-medium text-ink-hi focus:border-lime focus:outline-none"
          >
            {FARMS.map((f) => (
              <option key={f.id} value={f.id}>
                {farmName(f, lang)} ({districtName(f, lang)}) — {f.lat.toFixed(2)}°N, {f.lon.toFixed(2)}°E
              </option>
            ))}
          </select>
          <div className="mt-2 flex items-center justify-between text-[11px] text-ink-low">
            <span>{selectedFarm.division} Division</span>
            <span>Elevation: ~{selectedFarm.id === "barishal" ? "2m" : "18m"}</span>
          </div>
        </div>

        {/* Satellite Layer Selector */}
        <div className="rounded-xl border border-line bg-surface p-4">
          <label className="text-xs font-semibold uppercase tracking-wider text-ink-low flex items-center gap-1.5">
            <Layers className="h-3.5 w-3.5 text-sky-400" />
            <span>{lang === "ta" ? "செயற்கைக்கோள் அடுக்கு" : lang === "bn" ? "স্যাটেলাইট লেয়ার" : "Satellite Layer"}</span>
          </label>
          <select
            value={selectedLayer.id}
            onChange={(e) => {
              const l = GIBS_LAYERS.find((x) => x.id === e.target.value);
              if (l) setSelectedLayer(l);
            }}
            className="mt-2 w-full rounded-lg border border-line bg-inset p-2.5 text-xs font-medium text-ink-hi focus:border-sky-400 focus:outline-none"
          >
            {GIBS_LAYERS.map((l) => (
              <option key={l.id} value={l.id}>
                {lang === "ta" ? l.name_ta : lang === "bn" ? l.name_bn : l.name_en} ({l.resolution})
              </option>
            ))}
          </select>
          <div className="mt-2 text-[11px] text-ink-low truncate">
            {lang === "ta" ? selectedLayer.description_ta : lang === "bn" ? selectedLayer.description_bn : selectedLayer.description_en}
          </div>
        </div>

        {/* Date Selector */}
        <div className="rounded-xl border border-line bg-surface p-4">
          <label className="text-xs font-semibold uppercase tracking-wider text-ink-low flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-amber-400" />
            <span>{lang === "ta" ? "கண்காணிப்பு தேதி" : lang === "bn" ? "পর্যবেক্ষণ তারিখ" : "Observation Date"}</span>
          </label>
          <input
            type="date"
            value={targetDate}
            max={new Date().toISOString().split("T")[0]}
            onChange={(e) => setTargetDate(e.target.value)}
            className="mt-2 w-full rounded-lg border border-line bg-inset p-2.5 text-xs font-medium text-ink-hi focus:border-amber-400 focus:outline-none"
          />
          <div className="mt-2 flex items-center justify-between text-[11px] text-ink-low">
            <span>NASA Archive: 2000–Present</span>
            <span className="text-lime font-mono">Synced</span>
          </div>
        </div>
      </div>

      {/* Main Interactive Viewer Frame */}
      <div className="rounded-2xl border border-line bg-surface overflow-hidden shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line bg-canvas/80 px-4 py-3">
          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold text-ink-hi">
              {districtName(selectedFarm, lang)} · {farmName(selectedFarm, lang)}
            </span>
            <span className="text-ink-low font-mono">
              [{lat.toFixed(3)}°N, {lon.toFixed(3)}°E]
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/plan?farm=${selectedFarm.id}`}
              className="inline-flex items-center gap-1 rounded-lg border border-lime/50 bg-lime/10 px-3 py-1.5 text-xs font-semibold text-lime hover:bg-lime/20 transition-all"
            >
              <span>{lang === "ta" ? "பயிர் திட்டத்தை தொடங்கு" : lang === "bn" ? "ফসল পরিকল্পনা দেখুন" : "Plan Crop Rotation"}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <a
              href={worldviewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-lg border border-line bg-inset px-3 py-1.5 text-xs font-medium text-ink-mid hover:text-ink-hi transition-all"
            >
              <span>NASA Worldview</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>

        {/* Embedded Worldview Frame */}
        <div className="relative aspect-[16/9] w-full min-h-[440px] bg-black/90">
          <iframe
            src={worldviewUrl}
            title={`NASA Worldview - ${selectedFarm.name_en}`}
            className="h-full w-full border-0"
            loading="lazy"
            allow="fullscreen"
          />
        </div>

        <div className="border-t border-line bg-surface px-4 py-3 text-xs text-ink-low flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-lime" />
            <span>
              {lang === "ta"
                ? "நாசா அதிகாரப்பூர்வ GIBS & Worldview மூலம் இயக்கப்படுகிறது (அனுமதி: பொது பயன்பாடு CC0)."
                : lang === "bn"
                ? "নাসা অফিশিয়াল GIBS ও ওয়ার্ল্ডভিউ দ্বারা চালিত (উন্মুক্ত লাইসেন্স)।"
                : "Powered by official NASA GIBS and NASA EOSDIS Worldview (Open Access)."}
            </span>
          </div>
          <span className="font-mono text-[11px] text-ink-mid">
            Tile Spec: EPSG:4326 / EPSG:3857 Web Mercator
          </span>
        </div>
      </div>
    </div>
  );
}
