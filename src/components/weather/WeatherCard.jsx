import WeatherIcon from "./WeatherIcon.jsx";

export default function WeatherCard({ weather, units }) {
  const unit = units === "imperial" ? "Fahrenheit" : "Celsius";
  return <section className="text-center space-y-3" aria-labelledby="city-heading">
    <h3 id="city-heading" className="text-xl font-semibold">{weather.name}</h3>
    <p className="text-6xl font-light tracking-tight">{Math.round(weather.main.temp)}<span aria-hidden="true">°</span><span className="sr-only"> degrees {unit}</span></p>
    <WeatherIcon condition={weather.weather[0].main || weather.weather[0].description} className="mx-auto h-10 w-10 text-gray-300" />
    <p className="text-slate-300 capitalize">{weather.weather[0].description}</p>
  </section>;
}
