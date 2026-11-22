import WeatherIcon from "./WeatherIcon.jsx";
import { formatForecastDate } from "../../utils/forecast.js";

export default function ForecastCard({ day, units }) {
  const date = formatForecastDate(day.date);
  const unit = units === "imperial" ? "Fahrenheit" : "Celsius";
  const condition = day.condition || day.description;
  return <div className="h-full rounded-xl border border-white/10 bg-white/5 p-3 text-left sm:px-2 sm:text-center"
    title={`Lowest ${Math.round(day.min)}°, highest ${Math.round(day.max)}° ${unit}`}>
    <h4 className="mb-3 text-xs text-gray-400"><time dateTime={day.date} aria-label={date}>{date.split(",")[0]}</time></h4>
    <div className="flex items-center justify-between gap-3 sm:flex-col sm:gap-2">
      <div className="flex min-w-0 items-center gap-2 sm:flex-col">
        <WeatherIcon condition={condition} className="h-7 w-7 shrink-0 text-gray-300" />
        <p className="text-xs text-gray-300 capitalize break-words">{condition}</p>
      </div>
      <p className="shrink-0 text-base font-semibold whitespace-nowrap text-right sm:text-center">
        <span aria-hidden="true">{Math.round(day.min)}°/{Math.round(day.max)}°</span>
        <span className="sr-only">Low {Math.round(day.min)}, high {Math.round(day.max)} degrees {unit}.</span>
      </p>
    </div>
  </div>;
}
