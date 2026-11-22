import { useState } from "react";
import { useWeather } from "./hooks/useWeather.js";
import Input from "./components/ui/Input.jsx";
import Button from "./components/ui/Button.jsx";
import Loader from "./components/ui/Loader.jsx";
import ErrorBox from "./components/ui/ErrorBox.jsx";
import WeatherCard from "./components/weather/WeatherCard.jsx";
import ForecastGrid from "./components/weather/ForecastGrid.jsx";

export default function App() {
  const [city, setCity] = useState("");
  const { weather, forecast, loading, units, error, forecastError,
    searchCity, searchLocation, changeUnits } = useWeather();
  return (
    <main className="min-h-screen flex items-center justify-center weather-background text-white text-base px-4 py-6">
      <div className="w-full max-w-xl space-y-4">
        <h1 className="text-3xl font-bold text-center">Weather App</h1>
        <form className="space-y-4" onSubmit={event => { event.preventDefault(); searchCity(city); }}>
          <div>
            <label className="sr-only" htmlFor="city">City</label>
            <Input id="city" name="city" type="search" autoComplete="off"
              placeholder="Enter city..." value={city}
              onChange={event => setCity(event.target.value)}
              aria-invalid={error === "Enter a city name." || undefined}
              aria-describedby={error === "Enter a city name." ? "city-hint search-error" : "city-hint"} />
            <span id="city-hint" className="sr-only">Add a country code to distinguish cities with the same name, for example Sofia,BG.</span>
          </div>
          <fieldset>
            <legend className="sr-only">Temperature units</legend>
            <div className="flex justify-between text-sm">
              {[["metric", "°C", "Celsius"], ["imperial", "°F", "Fahrenheit"]].map(([value, label, name]) => (
                <label key={value}>
                  <input className="accent-indigo-400" type="radio" name="units" value={value}
                    checked={units === value} onChange={() => changeUnits(value)} />{" "}
                  <span aria-hidden="true">{label}</span><span className="sr-only">{name} ({label})</span>
                </label>
              ))}
            </div>
          </fieldset>
          <div className="grid grid-cols-2 gap-2">
            <Button type="submit">Search</Button>
            <Button type="button" variant="secondary" onClick={searchLocation}>My Location</Button>
          </div>
        </form>
        <Loader loading={loading} message={weather ? "Weather loaded. Loading forecast…" : "Loading weather…"}
          completedMessage={weather && !error ? `Weather loaded for ${weather.name} in ${units === "metric" ? "Celsius" : "Fahrenheit"}.` : ""} />
        <ErrorBox id="search-error" message={error} />
        <section aria-labelledby="weather-results" aria-busy={loading} className="space-y-4">
          <h2 id="weather-results" className="sr-only">Weather results</h2>
          {weather && <WeatherCard weather={weather} units={units} />}
          {forecastError && <ErrorBox message={"Forecast: " + forecastError} />}
          {forecast && <ForecastGrid forecast={forecast} units={units} />}
        </section>
      </div>
    </main>
  );
}
