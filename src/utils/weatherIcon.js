export const getWeatherIcon = (weather) => {
  if (!weather) return "🌍";

  const condition = weather.weather[0].main.toLowerCase();

  if (condition.includes("rain")) return "🌧️";
  if (condition.includes("cloud")) return "☁️";
  if (condition.includes("clear")) return "☀️";
  if (condition.includes("snow")) return "❄️";
  if (condition.includes("thunder")) return "⛈️";
  if (condition.includes("drizzle")) return "🌦️";
  if (condition.includes("mist")) return "🌫️";

  return "🌡️";
};