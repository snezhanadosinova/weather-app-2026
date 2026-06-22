export default function WeatherHeader({ city }) {
  return (
    <div className="text-center space-y-1">
      <h1 className="text-2xl font-semibold">Weather</h1>
      <p className="text-gray-400 text-sm">
        {city ? `Location: ${city}` : "Search for a city or use location"}
      </p>
    </div>
  );
}