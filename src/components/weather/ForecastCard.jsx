import { formatDate } from "../../utils/formData";

export default function ForecastCard({ day }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
      <p className="text-xs text-gray-400">
        {formatDate(day.dt_txt)}
      </p>

      <p className="text-lg font-medium">
        {Math.round(day.main.temp)}°
      </p>

      <p className="text-xs text-gray-300 capitalize">
        {day.weather[0].main}
      </p>
    </div>
  );
}