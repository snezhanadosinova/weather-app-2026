// Group UTC timestamps by the city's local date, independent of browser timezone.
// Ranges cover the available forecast intervals, not complete observed days.
export function buildDailyForecast(forecast, now = Date.now()) {
  const offset = forecast.city.timezone;
  const today = new Date(now + offset * 1000).toISOString().slice(0, 10);
  const days = new Map();
  for (const slot of forecast.list) {
    const local = new Date((slot.dt + offset) * 1000);
    const date = local.toISOString().slice(0, 10);
    if (date <= today) continue;
    const distanceFromNoon = Math.abs(local.getUTCHours() + local.getUTCMinutes() / 60 - 12);
    const existing = days.get(date);
    if (!existing) {
      days.set(date, {
        date, min: slot.main.temp_min, max: slot.main.temp_max,
        description: slot.weather[0].description, condition: slot.weather[0].main, distanceFromNoon,
      });
    } else {
      existing.min = Math.min(existing.min, slot.main.temp_min);
      existing.max = Math.max(existing.max, slot.main.temp_max);
      if (distanceFromNoon < existing.distanceFromNoon) {
        existing.description = slot.weather[0].description;
        existing.condition = slot.weather[0].main;
        existing.distanceFromNoon = distanceFromNoon;
      }
    }
  }
  return [...days.values()].sort((a, b) => a.date.localeCompare(b.date)).slice(0, 5);
}
export function formatForecastDate(date) {
  return new Intl.DateTimeFormat("en", { weekday: "short", month: "short", day: "numeric", timeZone: "UTC" })
    .format(new Date(date + "T12:00:00Z"));
}
