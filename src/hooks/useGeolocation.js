import { useState } from "react";
import { getWeatherByCoords, getForecastByCoords } from "../services/weatherApi";

export const useGeolocation = () => {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const getLocationWeather = async (units, setWeather, setForecast, setCity) => {
    if (!navigator.geolocation) {
      setError("Geolocation not supported");
      return;
    }

    setLoading(true);
    setError("");

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;

          setLocation({ latitude, longitude });

          // 🌤 CURRENT WEATHER
          const weather = await getWeatherByCoords(latitude, longitude, units);

          // 🌤 FORECAST (FIXED)
          const forecast = await getForecastByCoords(latitude, longitude, units);

          setWeather(weather);
          setForecast(forecast);

          // 🏙️ FIX: sync city input
          if (setCity && weather?.name) {
            setCity(weather.name);
          }

        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      },
      () => {
        setError("Location permission denied");
        setLoading(false);
      }
    );
  };

  return {
    location,
    loading,
    error,
    getLocationWeather,
  };
};