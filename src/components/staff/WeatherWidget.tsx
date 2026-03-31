import { useState, useEffect } from "react";
import { Cloud, Sun, CloudRain, CloudSnow, CloudLightning, CloudDrizzle, Wind, Droplets, Eye } from "lucide-react";

interface WeatherData {
  temp: number;
  description: string;
  humidity: number;
  windSpeed: number;
  icon: string;
}

const CACHE_KEY = "cagd_weather";
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

function getWeatherIcon(code: number) {
  if (code === 0) return <Sun className="w-8 h-8 text-yellow-400" />;
  if (code <= 3) return <Cloud className="w-8 h-8 text-gray-400" />;
  if (code <= 48) return <Eye className="w-8 h-8 text-gray-300" />; // fog
  if (code <= 57) return <CloudDrizzle className="w-8 h-8 text-blue-300" />;
  if (code <= 67) return <CloudRain className="w-8 h-8 text-blue-400" />;
  if (code <= 77) return <CloudSnow className="w-8 h-8 text-blue-200" />;
  if (code <= 82) return <CloudRain className="w-8 h-8 text-blue-500" />;
  if (code <= 99) return <CloudLightning className="w-8 h-8 text-yellow-500" />;
  return <Sun className="w-8 h-8 text-yellow-400" />;
}

function getDescription(code: number): string {
  if (code === 0) return "Clear sky";
  if (code <= 3) return "Partly cloudy";
  if (code <= 48) return "Foggy";
  if (code <= 57) return "Drizzle";
  if (code <= 67) return "Rainy";
  if (code <= 77) return "Snow";
  if (code <= 82) return "Rain showers";
  if (code <= 99) return "Thunderstorm";
  return "Clear";
}

export default function WeatherWidget() {
  const [weather, setWeather] = useState<{ temp: number; code: number; humidity: number; wind: number } | null>(null);

  useEffect(() => {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_DURATION) {
        setWeather(data);
        return;
      }
    }

    // Open-Meteo free API — Accra coordinates
    fetch("https://api.open-meteo.com/v1/forecast?latitude=5.56&longitude=-0.19&current=temperature_2m,weather_code,relative_humidity_2m,wind_speed_10m&timezone=Africa/Accra")
      .then((r) => r.json())
      .then((d) => {
        const data = {
          temp: Math.round(d.current.temperature_2m),
          code: d.current.weather_code,
          humidity: d.current.relative_humidity_2m,
          wind: Math.round(d.current.wind_speed_10m),
        };
        setWeather(data);
        localStorage.setItem(CACHE_KEY, JSON.stringify({ data, timestamp: Date.now() }));
      })
      .catch(() => {});
  }, []);

  if (!weather) return null;

  return (
    <div className="flex items-center gap-3">
      {getWeatherIcon(weather.code)}
      <div>
        <p className="text-2xl font-bold text-white">{weather.temp}°C</p>
        <p className="text-xs text-white/70">{getDescription(weather.code)}</p>
      </div>
      <div className="hidden sm:flex gap-3 ml-3 text-xs text-white/60">
        <span className="flex items-center gap-1"><Droplets className="w-3 h-3" />{weather.humidity}%</span>
        <span className="flex items-center gap-1"><Wind className="w-3 h-3" />{weather.wind} km/h</span>
      </div>
    </div>
  );
}
