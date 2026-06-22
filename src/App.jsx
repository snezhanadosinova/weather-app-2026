import { useState } from "react";
import { useWeather } from "./hooks/useWeather";
import { useGeolocation } from "./hooks/useGeolocation";
import Input from "./components/ui/Input";
import Button from "./components/ui/Button";
import Loader from "./components/ui/Loader";
import ErrorBox from "./components/ui/ErrorBox";
import WeatherCard from "./components/weather/WeatherCard";
import ForecastGrid from "./components/weather/ForecastGrid";

function App() {
  const [city, setCity] = useState("");
  const [units, setUnits] = useState("metric");

  const {
    weather,
    forecast,
    loading,
    error,
    fetchWeather,
    setWeather,
    setForecast,
  } = useWeather();

  const geo = useGeolocation();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-900 via-indigo-900 to-black text-white px-4">
      <div className="w-full max-w-md space-y-4">
        <h1 className="text-3xl font-bold text-center">Weather App</h1>

        <Input
          placeholder="Enter city..."
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />

        {/* UNITS */}
        <div className="flex justify-between text-sm">
          <label>
            <input
              type="radio"
              checked={units === "metric"}
              onChange={() => setUnits("metric")}
            />{" "}
            °C
          </label>

          <label>
            <input
              type="radio"
              checked={units === "imperial"}
              onChange={() => setUnits("imperial")}
            />{" "}
            °F
          </label>
        </div>

        {/* BUTTONS */}
        <div className="grid grid-cols-2 gap-2">
          <Button onClick={() => fetchWeather(city, units)}>Search</Button>

          <Button
            variant="secondary"
            onClick={() =>
              geo.getLocationWeather(
                units,
                setWeather,
                setForecast,
                setCity, // ✅ IMPORTANT FIX
              )
            }
          >
            My Location
          </Button>
        </div>

        {/* STATES */}
        {(loading || geo.loading) && <Loader />}
        {error && <ErrorBox message={error} />}
        {geo.error && <ErrorBox message={geo.error} />}

        {/* RESULTS */}
        {weather && <WeatherCard weather={weather} />}
        {forecast && <ForecastGrid forecast={forecast} />}

        {/* LOCATION INFO */}
        {geo.location && (
          <p className="text-xs text-gray-400 text-center">
            {geo.location.latitude.toFixed(3)},{" "}
            {geo.location.longitude.toFixed(3)}
          </p>
        )}
      </div>
    </div>
  );
}

export default App;
