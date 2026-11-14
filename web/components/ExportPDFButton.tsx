"use client";
import { useState } from "react";

interface Props {
  district: string;
  crops: string[];
  score: number;
  lang?: "en" | "bn" | "ta";
}

export function ExportPDFButton({ district, crops, score, lang = "en" }: Props) {
  const [exporting, setExporting] = useState(false);

  const handleExport = () => {
    setExporting(true);
    const win = window.open("", "_blank");
    if (win) {
      win.document.write(`<html><head><title>Field Shift Advisory</title>
        <style>body{font-family:Arial,sans-serif;padding:40px;color:#111}h1{color:#166534;border-bottom:2px solid #166534;padding-bottom:8px}.rotation{background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;margin:16px 0}.score{font-size:28px;font-weight:bold;color:#166534}.footer{margin-top:40px;font-size:11px;color:#999;border-top:1px solid #eee;padding-top:16px}</style>
      </head><body>
        <h1>🌾 Field Shift — Crop Rotation Advisory</h1>
        <p style="color:#666;font-size:13px">District: ${district} | Generated: ${new Date().toLocaleDateString()} | NASA POWER + SRDI</p>
        <div class="rotation"><div class="score">Score: ${score}/100</div><div style="font-size:18px;margin-top:8px">${crops.join(" → ")}</div></div>
        <div class="footer">Data: NASA POWER, GPM IMERG, SMAP, MODIS, GRACE, SRDI 2010<br/>Field Shift — NASA Space Apps 2026 | Team Orion (AIUB) | field-shift-tan.vercel.app</div>
      </body></html>`);
      win.document.close();
      setTimeout(() => { win.print(); setExporting(false); }, 500);
    } else { setExporting(false); }
  };

  return (
    <button onClick={handleExport} disabled={exporting}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-50">
      {exporting ? "⏳" : "📄"}{" "}
      {lang === "ta"
        ? "அறிவுரை அச்சிட"
        : lang === "bn"
        ? "পরামর্শপত্র প্রিন্ট"
        : "Print Advisory"}
    </button>
  );
}
