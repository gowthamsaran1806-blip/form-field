"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bookmark, Trash2, ArrowRight, Printer, Scale, Sparkles } from "lucide-react";
import { useLang } from "@/lib/lang";
import { fmtNum } from "@/lib/i18n";
import { Panel } from "@/components/ui";

interface SavedPlan {
  crops: string[];
  score: number;
  district: string;
  savedAt: string;
}

export default function SavedPlansPage() {
  const { lang } = useLang();
  const [plans, setPlans] = useState<SavedPlan[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [selectedForCompare, setSelectedForCompare] = useState<number[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("field_shift_plans");
      if (stored) {
        setPlans(JSON.parse(stored));
      }
    } catch {
      // ignore
    } finally {
      setLoaded(true);
    }
  }, []);

  const handleDelete = (index: number) => {
    const updated = plans.filter((_, i) => i !== index);
    setPlans(updated);
    localStorage.setItem("field_shift_plans", JSON.stringify(updated));
    setSelectedForCompare((prev) => prev.filter((i) => i !== index));
  };

  const handleClearAll = () => {
    if (confirm(lang === "bn" ? "সব সংরক্ষিত পরিকল্পনা মুছে ফেলবেন?" : "Clear all saved plans?")) {
      setPlans([]);
      localStorage.removeItem("field_shift_plans");
      setSelectedForCompare([]);
    }
  };

  const toggleCompare = (index: number) => {
    setSelectedForCompare((prev) => {
      if (prev.includes(index)) {
        return prev.filter((i) => i !== index);
      }
      if (prev.length >= 2) {
        return [prev[1], index];
      }
      return [...prev, index];
    });
  };

  const handlePrint = (plan: SavedPlan) => {
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`
      <html><head><title>Saved Rotation - ${plan.district}</title>
      <style>body{font-family:Arial,sans-serif;padding:40px;color:#111}h1{color:#166534;border-bottom:2px solid #166534;padding-bottom:8px}.score{font-size:28px;font-weight:bold;color:#166534;margin:12px 0}.crops{font-size:18px;margin:10px 0;background:#f0fdf4;padding:12px;border-radius:6px}.footer{margin-top:40px;font-size:11px;color:#888}</style>
      </head><body>
      <h1>🌾 Field Shift — Saved Rotation Plan</h1>
      <p>District: ${plan.district} | Saved Date: ${new Date(plan.savedAt).toLocaleDateString()}</p>
      <div class="score">Score: ${plan.score}/100</div>
      <div class="crops">Sequence: ${plan.crops.join(" → ")}</div>
      <div class="footer">Field Shift — NASA Space Apps Challenge 2026 | https://field-shift-tan.vercel.app</div>
      </body></html>
    `);
    win.document.close();
    win.print();
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight flex items-center gap-2.5">
            <Bookmark className="h-7 w-7 text-lime" />
            {lang === "bn" ? "সংরক্ষিত ফসল পরিকল্পনা" : "Saved Crop Rotation Plans"}
          </h1>
          <p className="mt-1 text-sm text-ink-low">
            {lang === "bn"
              ? "আপনার সংরক্ষিত সব পরিকল্পনা এখানে দেখতে ও তুলনা করতে পারবেন"
              : "Review, compare side-by-side, and print your bookmarked rotation plans"}
          </p>
        </div>

        {plans.length > 0 && (
          <button
            onClick={handleClearAll}
            className="flex items-center gap-1.5 rounded-lg border border-risk/30 px-3 py-1.5 text-xs font-semibold text-risk hover:bg-risk/10 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
            {lang === "bn" ? "সব মুছুন" : "Clear All"}
          </button>
        )}
      </div>

      {/* Compare Panel if 2 selected */}
      {selectedForCompare.length === 2 && (
        <div className="mt-6 rounded-xl border border-action/40 bg-action/5 p-5 fade-up">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-base font-bold text-action flex items-center gap-2">
              <Scale className="h-4 w-4" />
              {lang === "bn" ? "পাশাপাশি তুলনা (Compare Mode)" : "Side-by-Side Comparison"}
            </h3>
            <button
              onClick={() => setSelectedForCompare([])}
              className="text-xs text-ink-low hover:text-ink-hi"
            >
              ✕ {lang === "bn" ? "বন্ধ করুন" : "Close"}
            </button>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4 divide-x divide-line">
            {[plans[selectedForCompare[0]], plans[selectedForCompare[1]]].map((p, idx) => (
              <div key={idx} className={idx === 1 ? "pl-4" : ""}>
                <span className="text-xs font-semibold uppercase tracking-wider text-ink-low">
                  Plan #{idx + 1} ({p.district})
                </span>
                <div className="mt-1 font-display text-2xl font-bold text-ink-hi">
                  {fmtNum(p.score, lang)}
                  <span className="text-xs text-ink-low font-normal">/100</span>
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {p.crops.map((c, i) => (
                    <span key={i} className="rounded bg-inset px-2 py-0.5 text-xs font-semibold text-ink-mid">
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Plans List */}
      <div className="mt-6">
        {!loaded ? (
          <div className="flex flex-col gap-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-28 w-full animate-pulse rounded-xl bg-inset" />
            ))}
          </div>
        ) : plans.length === 0 ? (
          <div className="rounded-xl border border-line bg-surface p-12 text-center">
            <Bookmark className="mx-auto h-12 w-12 text-ink-low opacity-40" />
            <h3 className="mt-3 font-display text-lg font-bold">
              {lang === "bn" ? "এখনও কোনো পরিকল্পনা সংরক্ষণ করা হয়নি" : "No saved plans yet"}
            </h3>
            <p className="mt-1 text-sm text-ink-low max-w-sm mx-auto">
              {lang === "bn"
                ? "ফসল পরিকল্পনা পেজে গিয়ে যেকোনো সুপারিশের পাশে 'পরিকল্পনা সংরক্ষণ' বাটনে চাপ দিন।"
                : "Head to the Crop Planning page to explore rotations and click 'Save Plan' to bookmark them here."}
            </p>
            <div className="mt-5 flex justify-center gap-3">
              <Link
                href="/plan"
                className="rounded-lg bg-lime px-4 py-2 text-sm font-bold text-canvas hover:bg-lime/90 transition-colors"
              >
                {lang === "bn" ? "পরিকল্পনা শুরু করুন" : "Start Planning"}
              </Link>
              <Link
                href="/quick"
                className="rounded-lg border border-line px-4 py-2 text-sm font-semibold text-ink-mid hover:text-ink-hi transition-colors"
              >
                {lang === "bn" ? "দ্রুত উত্তর" : "Quick Answer"}
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-3.5">
            {plans.map((p, i) => {
              const isComparing = selectedForCompare.includes(i);
              return (
                <div
                  key={i}
                  className={`rounded-xl border bg-surface p-4 transition-all ${
                    isComparing ? "border-action ring-1 ring-action" : "border-line hover:border-line-soft"
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-elevated font-display text-sm font-bold text-ink-hi">
                        #{i + 1}
                      </span>
                      <div>
                        <div className="flex flex-wrap items-center gap-1.5 font-semibold text-ink-hi text-sm">
                          {p.crops.map((crop, cIdx) => (
                            <span key={cIdx} className="flex items-center gap-1">
                              {cIdx > 0 && <span className="text-ink-low">→</span>}
                              <span className="rounded-md border border-line bg-inset px-2 py-0.5 text-xs font-semibold">
                                {crop}
                              </span>
                            </span>
                          ))}
                        </div>
                        <p className="mt-0.5 text-xs text-ink-low">
                          {p.district} · {new Date(p.savedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="font-display text-xl font-bold tabular text-ink-hi">
                          {fmtNum(p.score, lang)}
                        </span>
                        <span className="text-xs text-ink-low font-medium">/100</span>
                      </div>

                      <div className="flex items-center gap-1.5 border-l border-line pl-3">
                        <button
                          onClick={() => toggleCompare(i)}
                          title={lang === "bn" ? "তুলনা করুন" : "Compare"}
                          className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold border transition-colors ${
                            isComparing
                              ? "bg-action text-white border-action"
                              : "border-line text-ink-mid hover:text-ink-hi hover:bg-inset"
                          }`}
                        >
                          <Scale className="h-3.5 w-3.5" />
                        </button>

                        <button
                          onClick={() => handlePrint(p)}
                          title={lang === "bn" ? "প্রিন্ট করুন" : "Print"}
                          className="rounded-lg border border-line p-1.5 text-ink-mid hover:text-ink-hi hover:bg-inset transition-colors"
                        >
                          <Printer className="h-3.5 w-3.5" />
                        </button>

                        <button
                          onClick={() => handleDelete(i)}
                          title={lang === "bn" ? "মুছুন" : "Delete"}
                          className="rounded-lg border border-line p-1.5 text-ink-mid hover:text-risk hover:bg-risk/10 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
