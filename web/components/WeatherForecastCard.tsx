"use client";
import { useEffect, useState } from "react";
import type { WeatherForecast } from "@/lib/weather";
import { fetchWeatherForecast, getWeatherAlerts } from "@/lib/weather";

interface Props { lat: number; lon: number; lang?: "en" | "bn" | "ta"; }

export function WeatherForecastCard({ lat, lon, lang = "en" }: Props) {
  const [forecast, setForecast] = useState<WeatherForecast | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetchWeatherForecast(lat, lon)
      .then(setForecast)
      .catch((e: unknown) => setError(String(e)))
      .finally(() => setLoading(false));
  }, [lat, lon]);

  if (loading) return (
    <div className="rounded-xl border border-emerald-200 bg-white p-4 shadow-sm animate-pulse">
      <p className="text-sm text-gray-400">
        {lang === "ta"
          ? "வானிலை முன்னறிவிப்பு ஏற்றப்படுகிறது…"
          : lang === "bn"
          ? "আবহাওয়া লোড হচ্ছে…"
          : "Loading 7-day forecast…"}
      </p>
    </div>
  );

  if (error || !forecast) return (
    <div className="rounded-xl border border-orange-200 bg-orange-50 p-4 text-sm text-orange-700">
      {lang === "ta"
        ? "வானிலை தகவல் கிடைக்கவில்லை"
        : lang === "bn"
        ? "আবহাওয়া পূর্বাভাস পাওয়া যাচ্ছে না"
        : "Weather forecast unavailable"}
    </div>
  );

  const alerts = getWeatherAlerts(forecast);
  const days = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

  return (
    <div className="rounded-xl border border-emerald-200 bg-white shadow-sm overflow-hidden">
      <div className="bg-emerald-700 px-4 py-2.5 flex items-center justify-between">
        <h3 className="text-white font-semibold text-sm">
          {lang === "ta"
            ? "7 நாள் வானிலை முன்னறிவிப்பு"
            : lang === "bn"
            ? "৭ দিনের আবহাওয়া পূর্বাভাস"
            : "7-Day Weather Forecast"}
        </h3>
        <span className="text-emerald-200 text-xs">Open-Meteo</span>
      </div>
      {alerts.length > 0 && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2">
          {alerts.map((a, i) => <p key={i} className="text-amber-800 text-xs font-medium">⚠️ {a}</p>)}
        </div>
      )}
      <div className="grid grid-cols-7 divide-x divide-gray-100">
        {forecast.dates.map((date, i) => {
          const max = forecast.maxTemp[i]; const min = forecast.minTemp[i]; const rain = forecast.precipitation[i];
          return (
            <div key={date} className="flex flex-col items-center px-1 py-3 text-center">
              <span className="text-xs text-gray-400">
                {i === 0
                  ? lang === "ta"
                    ? "இன்று"
                    : lang === "bn"
                    ? "আজ"
                    : "Today"
                  : days[new Date(date).getDay()]}
              </span>
              <div className="mt-1 text-base">{max && max > 35 ? "🌡️" : rain && rain > 5 ? "🌧️" : "☀️"}</div>
              <span className={`text-xs font-bold ${max && max > 35 ? "text-red-600" : "text-gray-800"}`}>{max != null ? `${Math.round(max)}°` : "—"}</span>
              <span className="text-xs text-gray-400">{min != null ? `${Math.round(min)}°` : "—"}</span>
              <span className="text-xs text-blue-500 mt-0.5">{rain != null ? `${rain.toFixed(1)}mm` : "—"}</span>
            </div>
          );
        })}
      </div>
      <div className="border-t px-4 py-2 flex gap-4 text-xs text-gray-500">
        <span>
          🌡️ {lang === "ta" ? "வெப்ப அலை" : "Heat"}:{" "}
          <strong className={forecast.heatStressDays >= 3 ? "text-red-600" : ""}>
            {forecast.heatStressDays}{lang === "ta" ? " நாட்கள்" : "d"}
          </strong>
        </span>
        <span>
          🏜️ {lang === "ta" ? "வறட்சி நாட்கள்" : "Dry"}:{" "}
          <strong className={forecast.drySpellDays >= 5 ? "text-orange-600" : ""}>
            {forecast.drySpellDays}{lang === "ta" ? " நாட்கள்" : "d"}
          </strong>
        </span>
      </div>
    </div>
  );
}
