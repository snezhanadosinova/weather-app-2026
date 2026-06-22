import ForecastCard from "./ForecastCard";

export default function ForecastGrid({ forecast }) {
  const daily = forecast.list.filter((_, i) => i % 8 === 0).slice(0, 5);

  return (
    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mt-6">
      {daily.map((day, i) => (
        <ForecastCard key={i} day={day} />
      ))}
    </div>
  );
}