export default function WeatherCard({ weather }) {
  return (
    <div className="text-center space-y-3">
      <h2 className="text-xl font-semibold">{weather.name}</h2>

      <div className="text-6xl font-thin">
        {Math.round(weather.main.temp)}°
      </div>

      <p className="text-gray-300 capitalize">
        {weather.weather[0].description}
      </p>
    </div>
  );
}