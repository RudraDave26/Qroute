import { WeatherCondition } from '../types';

export async function fetchWeather(lat: number, lng: number): Promise<WeatherCondition> {
  const isEnabled = process.env.OPEN_METEO_ENABLED !== 'false';
  if (!isEnabled) {
    return getDefaultWeather();
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m`;
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!res.ok) return getDefaultWeather();

    const data = await res.json();
    const current = data.current || {};
    const code = current.weather_code ?? 0;
    const precip = current.precipitation ?? 0;
    const wind = current.wind_speed_10m ?? 8;

    const { desc, impact } = parseWmoCode(code, precip);

    return {
      temperatureC: current.temperature_2m ?? 26,
      weatherCode: code,
      description: desc,
      windSpeedKmh: wind,
      precipitationMm: precip,
      humidityPercent: current.relative_humidity_2m ?? 55,
      visibilityKm: precip > 2 ? 4.5 : 10.0,
      impactOnTraffic: impact,
      isLive: true,
    };
  } catch (err) {
    return getDefaultWeather();
  }
}

function parseWmoCode(code: number, precip: number): { desc: string; impact: WeatherCondition['impactOnTraffic'] } {
  if (code === 0) return { desc: 'Clear sky', impact: 'none' };
  if (code === 1 || code === 2) return { desc: 'Partly cloudy', impact: 'none' };
  if (code === 3) return { desc: 'Overcast', impact: 'none' };
  if (code >= 45 && code <= 48) return { desc: 'Foggy / Reduced visibility', impact: 'moderate' };
  if (code >= 51 && code <= 55) return { desc: 'Light drizzle', impact: 'low' };
  if (code >= 61 && code <= 65) return { desc: precip > 5 ? 'Heavy rain' : 'Moderate rain', impact: 'moderate' };
  if (code >= 80 && code <= 82) return { desc: 'Rain showers', impact: 'moderate' };
  if (code >= 95) return { desc: 'Thunderstorm with heavy showers', impact: 'high' };
  return { desc: 'Typical seasonal conditions', impact: 'none' };
}

function getDefaultWeather(): WeatherCondition {
  return {
    temperatureC: 27,
    weatherCode: 1,
    description: 'Clear with light breeze',
    windSpeedKmh: 12,
    precipitationMm: 0,
    humidityPercent: 50,
    visibilityKm: 10,
    impactOnTraffic: 'none',
    isLive: false,
  };
}
