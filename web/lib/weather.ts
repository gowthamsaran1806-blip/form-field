import { OpenMeteoForecastSchema, type OpenMeteoForecast } from "./schemas";

const BASE_URL = "https://api.open-meteo.com/v1/forecast";

export interface WeatherForecast {
  dates: string[];
  maxTemp: (number | null)[];
  minTemp: (number | null)[];
  precipitation: (number | null)[];
  precipProbability: (number | null)[];
  heatStressDays: number;
  drySpellDays: number;
}

export async function fetchWeatherForecast(lat: number, lon: number): Promise<WeatherForecast> {
  const params = new URLSearchParams({
    latitude: lat.toFixed(4),
    longitude: lon.toFixed(4),
    daily: "temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max",
    timezone: "Asia/Dhaka",
    forecast_days: "7",
  });

  const response = await fetch(`${BASE_URL}?${params}`);
  if (!response.ok) throw new Error(`Open-Meteo API error: ${response.status}`);

  const raw = await response.json();
  const parsed: OpenMeteoForecast = OpenMeteoForecastSchema.parse(raw);
  const { daily } = parsed;

  return {
    dates: daily.time,
    maxTemp: daily.temperature_2m_max,
    minTemp: daily.temperature_2m_min,
    precipitation: daily.precipitation_sum,
    precipProbability: daily.precipitation_probability_max ?? daily.time.map(() => null),
    heatStressDays: daily.temperature_2m_max.filter((t) => t !== null && t > 35).length,
    drySpellDays: daily.precipitation_sum.filter((p) => p !== null && p < 1).length,
  };
}

export function getWeatherAlerts(forecast: WeatherForecast): string[] {
  const alerts: string[] = [];
  if (forecast.heatStressDays >= 3) alerts.push(`Heat stress: ${forecast.heatStressDays} days above 35°C forecast`);
  if (forecast.drySpellDays >= 5) alerts.push(`Dry spell: ${forecast.drySpellDays} days with less than 1mm rain`);
  return alerts;
}
