import { useEffect, useState, useSyncExternalStore } from "react";
import { createWeatherApi } from "../services/weatherApi.js";
import { getCurrentLocation } from "../services/geolocation.js";
import { createWeatherStore } from "../services/weatherStore.js";

export function useWeather() {
  const [store] = useState(() => createWeatherStore(createWeatherApi(), getCurrentLocation));
  const state = useSyncExternalStore(store.subscribe, store.getSnapshot);
  useEffect(() => {
    const refresh = () => {
      if (document.visibilityState === "visible") store.refresh();
    };
    const timer = setInterval(refresh, 30 * 1000);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", refresh);
      store.cancel();
    };
  }, [store]);
  return { ...state, searchCity: store.searchCity, searchLocation: store.searchLocation, changeUnits: store.changeUnits };
}
