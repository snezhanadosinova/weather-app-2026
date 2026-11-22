// One request owner for search, geolocation, unit changes, and cancellation.
export function createWeatherStore(api, locate, now = Date.now) {
  let state = {
    weather: null, forecast: null, units: "metric", loading: false,
    error: "", forecastError: "", location: null,
  };
  let active;
  let lastQuery;
  let updatedAt = null;
  const listeners = new Set();
  const update = patch => {
    state = { ...state, ...patch };
    listeners.forEach(listener => listener());
  };

  async function search(query, units = state.units, background = false) {
    active?.abort();
    const controller = new AbortController();
    active = controller;
    const current = () => active === controller && !controller.signal.aborted;
    const city = query.type === "city" ? query.city.trim() : "";
    if (query.type === "city" && !city) {
      lastQuery = undefined;
      update({ loading: false, error: "Enter a city name.", forecastError: "", weather: null, forecast: null, location: null });
      return;
    }
    lastQuery = query.type === "city" ? { type: "city", city } : query;
    update({ units, loading: true, error: "", forecastError: "",
      ...(background ? {} : { weather: null, forecast: null, location: null }) });
    try {
      const location = query.type === "location" ? await locate(controller.signal) : query.coords;
      if (!current()) return;
      const weather = query.type === "city"
        ? await api.weatherByCity(city, units, controller.signal)
        : await api.weatherByCoords(location, units, controller.signal);
      if (!current()) return;
      const coords = { latitude: weather.coord.lat, longitude: weather.coord.lon };
      lastQuery = { type: "coords", coords };
      updatedAt = now();
      update({ weather, location: coords });
      try {
        const forecast = await api.forecastByCoords(coords, units, controller.signal);
        if (current()) update({ forecast });
      } catch (error) {
        if (current()) update({ forecastError: error.message });
      }
    } catch (error) {
      if (current()) update({ error: error.message });
    } finally {
      if (current()) update({ loading: false });
    }
  }

  return {
    getSnapshot: () => state,
    subscribe: listener => { listeners.add(listener); return () => listeners.delete(listener); },
    searchCity: city => search({ type: "city", city }),
    searchLocation: () => search({ type: "location" }),
    changeUnits: units => {
      if (units === state.units) return;
      if (lastQuery) return search(lastQuery, units);
      update({ units });
    },
    refresh: () => {
      if (!lastQuery || !state.weather || state.loading || updatedAt === null) return;
      const timestamp = now();
      const offset = state.forecast?.city.timezone ?? state.weather.timezone ?? 0;
      const localDate = time => new Date(time + offset * 1000).toISOString().slice(0, 10);
      if (timestamp - updatedAt >= 10 * 60 * 1000 || localDate(timestamp) !== localDate(updatedAt)) {
        return search(lastQuery, state.units, true);
      }
    },
    cancel: () => { active?.abort(); active = null; },
  };
}
