import { useState } from "react";
import { getForecastByCity, getForecastByCoords } from "../services/weatherApi";


export const useForecast = () => {
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchForecastByCity = async (city, units) => {
    try {
      setLoading(true);
      setError("");

      const data = await getForecastByCity(city, units);
      setForecast(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchForecastByCoords = async (lat, lon, units) => {
    try {
      setLoading(true);
      setError("");

      const data = await getForecastByCoords(lat, lon, units);
      setForecast(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    forecast,
    loading,
    error,
    setForecast,
    fetchForecastByCity,
    fetchForecastByCoords,
  };
};