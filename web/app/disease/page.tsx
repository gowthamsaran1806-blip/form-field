"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { Stethoscope, Upload, Camera, Sparkles, AlertTriangle, ShieldCheck, RefreshCw, ArrowRight } from "lucide-react";
import { useLang } from "@/lib/lang";
import { fmtNum } from "@/lib/i18n";
import { Panel } from "@/components/ui";

interface DiagnosisResult {
  crop: string;
  crop_bn: string;
  disease: string;
  disease_bn: string;
  confidence: number;
  severity: string;
  severity_bn: string;
  symptoms: string;
  symptoms_bn: string;
  treatment: string;
  treatment_bn: string;
  rotationAdvice: string;
  rotationAdvice_bn: string;
  provider: string;
}

const SAMPLE_DISEASES = [
  {
    name_en: "Rice Blast (ধানের ব্লাস্ট)",
    crop: "Rice",
    hint: "Rice",
    // 1x1 green-brown pixel data URL as tiny valid image placeholder
    base64: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
  },
  {
    name_en: "Potato Late Blight (আলুর নাবি ধসা)",
    crop: "Potato",
    hint: "Potato",
    base64: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN8/+F/PwAIWwN7p6qZMAAAAABJRU5ErkJggg==",
  },
];

export default function CropDoctorPage() {
  const { lang } = useLang();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DiagnosisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = (file: File) => {
    setError(null);
    const reader = new FileReader();
    reader.onload = () => {
      const b64 = reader.result as string;
      setImagePreview(b64);
      runDiagnosis(b64);
    };
    reader.readAsDataURL(file);
  };

  const runDiagnosis = async (b64: string, cropHint?: string) => {
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const res = await fetch("/api/diagnose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: b64, cropHint, lang }),
      });

      if (!res.ok) {
        throw new Error("Diagnosis service busy");
      }

      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  const handleSampleClick = (sample: (typeof SAMPLE_DISEASES)[0]) => {
    setImagePreview(sample.base64);
    runDiagnosis(sample.base64, sample.crop);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 lg:px-8">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight flex items-center gap-2.5">
          <Stethoscope className="h-7 w-7 text-lime" />
          {lang === "bn" ? "ফসল ডাক্তার — রোগ নির্ণয় ও প্রতিকার" : "Crop Doctor — Plant Disease Diagnosis"}
        </h1>
        <p className="mt-1.5 text-sm text-ink-low">
          {lang === "bn"
            ? "আক্রান্ত পাতার ছবি আপলোড করুন। এআই মডেল রোগের ধরন, তাৎক্ষণিক প্রতিকার এবং কোন ফসল ঘুরিয়ে বুনতে হবে তা জানিয়ে দেবে।"
            : "Upload or capture a photo of an infected leaf. AI vision analyzes symptoms, recommends field treatment, and suggests rotation crops to break the pathogen cycle."}
        </p>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-[1fr_320px]">
        {/* Upload & Scanner Box */}
        <div className="flex flex-col gap-4">
          <div
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-line bg-surface p-8 text-center cursor-pointer hover:border-lime/60 hover:bg-inset transition-all"
          >
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) handleImageUpload(e.target.files[0]);
              }}
            />

            {imagePreview ? (
              <div className="relative flex flex-col items-center">
                <div className="h-44 w-44 overflow-hidden rounded-xl border border-line bg-inset flex items-center justify-center">
                  <img
                    src={imagePreview}
                    alt="Uploaded leaf"
                    className="h-full w-full object-cover"
                  />
                </div>
                <span className="mt-3 text-xs font-semibold text-lime flex items-center gap-1">
                  <RefreshCw className="h-3.5 w-3.5" />
                  {lang === "bn" ? "অন্য ছবি বেছে নিন" : "Change Photo"}
                </span>
              </div>
            ) : (
              <>
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-lime/10 text-lime mb-3">
                  <Camera className="h-6 w-6" />
                </div>
                <h3 className="font-display text-base font-bold text-ink-hi">
                  {lang === "bn" ? "পাতার ছবি তুলুন বা আপলোড করুন" : "Take a Photo or Upload Leaf Image"}
                </h3>
                <p className="mt-1 text-xs text-ink-low max-w-xs">
                  {lang === "bn"
                    ? "ক্যামেরা দিয়ে আক্রান্ত অংশের পরিষ্কার ছবি তুলুন (JPG, PNG)"
                    : "Snap a clear close-up of visible leaf spots or lesions"}
                </p>
                <button
                  type="button"
                  className="mt-4 flex items-center gap-1.5 rounded-lg bg-lime px-4 py-2 text-xs font-bold text-canvas hover:bg-lime/90"
                >
                  <Upload className="h-3.5 w-3.5" />
                  {lang === "bn" ? "ছবি বাছাই করুন" : "Select Image"}
                </button>
              </>
            )}
          </div>

          {/* Quick Demo Samples */}
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-low block mb-2">
              {lang === "bn" ? "বা দ্রুত ডেমো নমুনা দেখুন:" : "Or test with quick disease samples:"}
            </span>
            <div className="flex flex-wrap gap-2">
              {SAMPLE_DISEASES.map((sample, i) => (
                <button
                  key={i}
                  onClick={() => handleSampleClick(sample)}
                  className="rounded-lg border border-line bg-surface px-3 py-1.5 text-xs font-medium text-ink-mid hover:border-lime hover:text-ink-hi transition-colors"
                >
                  {sample.name_en}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Diagnostic Results Side */}
        <div>
          {loading && (
            <div className="rounded-xl border border-line bg-surface p-8 text-center animate-pulse">
              <Sparkles className="mx-auto h-8 w-8 text-lime animate-spin mb-3" />
              <h4 className="font-display text-sm font-bold text-ink-hi">
                {lang === "bn" ? "এআই পাতা পরীক্ষা করছে…" : "Analyzing leaf symptoms…"}
              </h4>
              <p className="mt-1 text-xs text-ink-low">
                {lang === "bn"
                  ? "রোগের দাগ ও ছত্রাকের ধরন শনাক্ত করা হচ্ছে"
                  : "Scanning lesion morphology and fungal pattern"}
              </p>
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-risk/40 bg-risk/10 p-4 text-xs text-risk">
              {error}
            </div>
          )}

          {result && (
            <div className="rounded-xl border border-line bg-surface p-5 fade-up space-y-4">
              <div className="flex items-start justify-between gap-2 border-b border-line pb-3">
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-low">
                    {lang === "bn" ? result.crop_bn : result.crop}
                  </span>
                  <h3 className="font-display text-lg font-bold text-ink-hi mt-0.5">
                    {lang === "bn" ? result.disease_bn : result.disease}
                  </h3>
                </div>
                <div className="text-right">
                  <span className="rounded-full bg-lime/10 px-2 py-0.5 font-mono text-xs font-bold text-lime">
                    {Math.round(result.confidence * 100)}% {lang === "bn" ? "নিশ্চিত" : "match"}
                  </span>
                </div>
              </div>

              {/* Severity & Symptoms */}
              <div>
                <span className="text-xs font-semibold text-ink-low block">
                  {lang === "bn" ? "লক্ষণ:" : "Symptoms:"}
                </span>
                <p className="mt-0.5 text-xs text-ink-mid leading-relaxed">
                  {lang === "bn" ? result.symptoms_bn : result.symptoms}
                </p>
              </div>

              {/* Treatment */}
              <div className="rounded-lg border border-line bg-inset p-3.5">
                <span className="text-xs font-bold text-ink-hi flex items-center gap-1.5 mb-1 text-emerald-400">
                  <ShieldCheck className="h-4 w-4" />
                  {lang === "bn" ? "মাঠের প্রতিকার ও ব্যবস্থা:" : "Recommended Treatment:"}
                </span>
                <p className="text-xs text-ink-mid leading-relaxed">
                  {lang === "bn" ? result.treatment_bn : result.treatment}
                </p>
              </div>

              {/* Crop Rotation Advice */}
              <div className="rounded-lg border border-amber/30 bg-amber/5 p-3.5">
                <span className="text-xs font-bold text-amber flex items-center gap-1.5 mb-1">
                  <AlertTriangle className="h-4 w-4" />
                  {lang === "bn" ? "ফসল আবর্তন চক্র ভাঙার পরামর্শ:" : "Crop Rotation Pathogen Break:"}
                </span>
                <p className="text-xs text-ink-mid leading-relaxed">
                  {lang === "bn" ? result.rotationAdvice_bn : result.rotationAdvice}
                </p>
                <div className="mt-3">
                  <Link
                    href="/plan"
                    className="inline-flex items-center gap-1 text-xs font-bold text-lime hover:underline"
                  >
                    {lang === "bn" ? "ফসল পরিকল্পনায় এই ব্রেক ফসল খুঁজুন" : "Find breaking rotations in Planner"}
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            </div>
          )}

          {!result && !loading && (
            <div className="rounded-xl border border-line bg-surface p-6 text-center text-ink-low text-xs">
              <Stethoscope className="mx-auto h-8 w-8 text-ink-low opacity-40 mb-2" />
              <p>
                {lang === "bn"
                  ? "ছবি আপলোড করলে এখানে তাৎক্ষণিক ফলাফল দেখা যাবে।"
                  : "Upload a photo or select a sample to see AI disease diagnosis."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
