const BASE_URL = "https://api.openweathermap.org/data/2.5/";

export function createWeatherApi({
  apiKey = import.meta.env?.VITE_WEATHER_API_KEY,
  fetchImpl = globalThis.fetch,
  timeoutMs = 12000,
} = {}) {
  async function request(endpoint, params, signal) {
    if (!apiKey || ["YOUR_API_KEY", "YOUR_KEY"].includes(apiKey)) {
      throw new Error("Configure a valid OpenWeatherMap API key in .env and restart the app.");
    }
    const url = new URL(endpoint, BASE_URL);
    url.search = new URLSearchParams({ ...params, appid: apiKey }).toString();
    const controller = new AbortController();
    const abort = () => controller.abort(signal.reason);
    signal?.throwIfAborted();
    signal?.addEventListener("abort", abort, { once: true });
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetchImpl(url, { signal: controller.signal });
      let data;
      try {
        data = await response.json();
      } catch (error) {
        if (controller.signal.aborted) throw error;
        throw new Error("The weather service returned an invalid response. Please try again.", { cause: error });
      }
      if (!response.ok) {
        const messages = {
          401: "The weather API key is invalid or not activated yet.",
          404: "City not found. Try adding a country code, for example Sofia,BG.",
          429: "Too many requests. Please try again later.",
        };
        throw new Error(messages[response.status] || "The weather service is unavailable. Please try again.");
      }
      if (endpoint === "weather" && (
        typeof data?.name !== "string" || !Number.isFinite(data?.main?.temp) || !data?.weather?.[0]?.description ||
        !Number.isFinite(data?.coord?.lat) || !Number.isFinite(data?.coord?.lon)
      )) throw new Error("The weather service returned incomplete weather data.");
      if (endpoint === "forecast" && (
        !Array.isArray(data?.list) || data.list.length === 0 ||
        !Number.isFinite(data?.city?.timezone) ||
        !data.list.every(item => Number.isFinite(item?.dt) &&
          Number.isFinite(item?.main?.temp_min) && Number.isFinite(item?.main?.temp_max) &&
          typeof item?.weather?.[0]?.description === "string")
      )) throw new Error("The weather service returned incomplete forecast data.");
      return data;
    } catch (error) {
      if (signal?.aborted) throw signal.reason;
      if (controller.signal.aborted) throw new Error("The weather request timed out. Please try again.", { cause: error });
      if (error instanceof TypeError) throw new Error("Unable to connect. Check your internet connection and try again.", { cause: error });
      throw error;
    } finally {
      clearTimeout(timer);
      signal?.removeEventListener("abort", abort);
    }
  }
  return {
    weatherByCity: (city, units, signal) => request("weather", { q: city, units }, signal),
    weatherByCoords: ({ latitude, longitude }, units, signal) =>
      request("weather", { lat: latitude, lon: longitude, units }, signal),
    forecastByCoords: ({ latitude, longitude }, units, signal) =>
      request("forecast", { lat: latitude, lon: longitude, units }, signal),
  };
}
