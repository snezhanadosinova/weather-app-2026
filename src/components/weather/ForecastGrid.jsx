import ForecastCard from "./ForecastCard.jsx";
import { buildDailyForecast } from "../../utils/forecast.js";

export default function ForecastGrid({ forecast, units }) {
  const daily = buildDailyForecast(forecast);
  return <section aria-labelledby="forecast-heading">
    <h3 id="forecast-heading" className="mb-3 text-sm font-semibold text-gray-300">Next days</h3>
    <p className="sr-only">Temperature and conditions near local noon. Ranges cover available intervals; boundary days may be partial.</p>
    <ul className="grid grid-cols-1 sm:grid-cols-5 gap-2">
      {daily.map(day => <li key={day.date}><ForecastCard day={day} units={units} /></li>)}
    </ul>
  </section>;
}
