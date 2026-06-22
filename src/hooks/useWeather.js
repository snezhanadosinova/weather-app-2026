import { useState } from "react";
import {
  getWeatherByCity,
  getForecastByCity,
} from "../services/weatherApi";

export const useWeather = () => {
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchWeather = async (city, units) => {
    try {
      setLoading(true);
      setError("");

      const w = await getWeatherByCity(city, units);
      const f = await getForecastByCity(city, units);

      setWeather(w);
      setForecast(f);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    weather,
    forecast,
    loading,
    error,
    fetchWeather,
    setWeather,
    setForecast,
    setLoading,
    setError,
  };
};