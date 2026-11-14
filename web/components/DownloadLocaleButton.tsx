"use client";
import React, { useState } from "react";
import { Check, Download, FileJson } from "lucide-react";

export function DownloadTamilButton({ className }: { className?: string }) {
  const [downloaded, setDownloaded] = useState(false);

  const handleDownload = () => {
    const a = document.createElement("a");
    a.href = "/api/download/tamil";
    a.download = "field-shift-tamil-locale.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 3000);
  };

  return (
    <button
      type="button"
      onClick={handleDownload}
      className={
        className ??
        "inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface px-3 py-1.5 text-xs font-semibold text-ink-hi hover:border-lime hover:text-lime transition-all"
      }
      title="Download Tamil translation file (JSON) / தமிழ் மொழிபெயர்ப்பு கோப்பை பதிவிறக்குங்கள்"
    >
      <FileJson className="h-3.5 w-3.5 text-lime" />
      <span>
        {downloaded
          ? "பதிவிறக்கம் செய்யப்பட்டது! (Downloaded)"
          : "தமிழ் கோப்பு பதிவிறக்கம் (Download Tamil JSON)"}
      </span>
      {downloaded ? (
        <Check className="h-3 w-3 text-lime" />
      ) : (
        <Download className="h-3 w-3 text-ink-low" />
      )}
    </button>
  );
}
