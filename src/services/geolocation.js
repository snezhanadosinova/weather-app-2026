export function getCurrentLocation(signal, geolocation = globalThis.navigator?.geolocation) {
  return new Promise((resolve, reject) => {
    if (!geolocation) {
      reject(new Error("Geolocation is unavailable. Use a supported browser over HTTPS or localhost."));
      return;
    }
    const abort = () => reject(signal.reason);
    if (signal?.aborted) { abort(); return; }
    signal?.addEventListener("abort", abort, { once: true });
    const finish = (callback, value) => {
      signal?.removeEventListener("abort", abort);
      if (!signal?.aborted) callback(value);
    };
    geolocation.getCurrentPosition(
      ({ coords }) => finish(resolve, { latitude: coords.latitude, longitude: coords.longitude }),
      ({ code }) => finish(reject, new Error({
        1: "Location permission was denied. Allow access in your browser or search by city.",
        2: "Your location is unavailable. Please search by city.",
        3: "Finding your location timed out. Please try again or search by city.",
      }[code] || "Unable to find your location. Please search by city.")),
      { timeout: 10000, maximumAge: 60000, enableHighAccuracy: false },
    );
  });
}
