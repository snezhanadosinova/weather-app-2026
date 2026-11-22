import test from "node:test";
import assert from "node:assert/strict";
import { createWeatherApi } from "../src/services/weatherApi.js";
import { createWeatherStore } from "../src/services/weatherStore.js";
import { getCurrentLocation } from "../src/services/geolocation.js";
import { buildDailyForecast, formatForecastDate } from "../src/utils/forecast.js";

const weather = (name = "Sofia", temp = 15) => ({
  name, main: { temp }, coord: { lat: 42.7, lon: 23.3 },
  weather: [{ description: "clear sky" }], sys: { country: "BG" },
});
const forecast = { city: { timezone: 7200 }, list: [] };
const deferred = () => {
  let resolve, reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
};
const createStore = (overrides = {}, locate = async () => ({ latitude: 42.7, longitude: 23.3 })) =>
  createWeatherStore({
    weatherByCity: async city => weather(city),
    weatherByCoords: async () => weather(),
    forecastByCoords: async () => forecast,
    ...overrides,
  }, locate);

test("newer search wins even when the previous transport ignores cancellation", async () => {
  const slow = deferred();
  let oldSignal;
  const store = createStore({ weatherByCity: (city, units, signal) => {
    if (city === "Old") { oldSignal = signal; return slow.promise; }
    return Promise.resolve(weather(city));
  } });
  const first = store.searchCity("Old");
  await store.searchCity("New");
  slow.resolve(weather("Old"));
  await first;
  assert.equal(oldSignal.aborted, true);
  assert.equal(store.getSnapshot().weather.name, "New");
  assert.equal(store.getSnapshot().loading, false);
});

test("a city search supersedes a pending geolocation request", async () => {
  const location = deferred();
  const store = createStore({}, () => location.promise);
  const first = store.searchLocation();
  await store.searchCity("Varna");
  location.resolve({ latitude: 1, longitude: 2 });
  await first;
  assert.equal(store.getSnapshot().weather.name, "Varna");
});

test("forecast failure retains current weather and clears previous forecast", async () => {
  let fail = false;
  const store = createStore({ forecastByCoords: async () => {
    if (fail) throw new Error("Service unavailable");
    return forecast;
  } });
  await store.searchCity("Sofia");
  fail = true;
  await store.searchCity("Varna");
  assert.equal(store.getSnapshot().weather.name, "Varna");
  assert.equal(store.getSnapshot().forecast, null);
  assert.equal(store.getSnapshot().error, "");
  assert.match(store.getSnapshot().forecastError, /unavailable/);
});

test("changing units refetches the resolved location and never relabels old temperatures", async () => {
  const next = deferred();
  const store = createStore({ weatherByCoords: (coords, units) => {
    assert.deepEqual(coords, { latitude: 42.7, longitude: 23.3 });
    assert.equal(units, "imperial");
    return next.promise;
  } });
  await store.searchCity("Sofia");
  const pending = store.changeUnits("imperial");
  assert.equal(store.getSnapshot().weather, null);
  assert.equal(store.getSnapshot().units, "imperial");
  next.resolve(weather("Sofia", 59));
  await pending;
  assert.equal(store.getSnapshot().weather.main.temp, 59);
});

test("an older forecast cannot overwrite a new city's forecast", async () => {
  const old = deferred();
  let count = 0;
  const store = createStore({ forecastByCoords: () => ++count === 1 ? old.promise : Promise.resolve(forecast) });
  const first = store.searchCity("Old");
  await new Promise(resolve => setImmediate(resolve));
  await store.searchCity("New");
  old.resolve({ city: { timezone: 0 }, list: ["old"] });
  await first;
  assert.equal(store.getSnapshot().forecast, forecast);
});

test("successful location lookup clears a failed search and uses result coordinates", async () => {
  const store = createStore({ weatherByCity: async () => { throw new Error("Not found"); } });
  await store.searchCity("Unknown");
  assert.equal(store.getSnapshot().error, "Not found");
  await store.searchLocation();
  assert.equal(store.getSnapshot().error, "");
  assert.deepEqual(store.getSnapshot().location, { latitude: 42.7, longitude: 23.3 });
});

test("whitespace-only searches make no API request", async () => {
  const store = createStore({ weatherByCity: () => { assert.fail("Unexpected API call"); } });
  await store.searchCity("  ");
  assert.equal(store.getSnapshot().error, "Enter a city name.");
  assert.equal(store.getSnapshot().loading, false);
});

test("city search trims input and resolves forecast coordinates from weather", async () => {
  const store = createStore({
    weatherByCity: async city => { assert.equal(city, "Sofia,BG"); return weather(); },
    forecastByCoords: async coords => {
      assert.deepEqual(coords, { latitude: 42.7, longitude: 23.3 });
      return forecast;
    },
  });
  await store.searchCity(" Sofia,BG ");
});

test("cancelled stores ignore responses after unmount", async () => {
  const pending = deferred();
  const store = createStore({ weatherByCity: () => pending.promise });
  const request = store.searchCity("Sofia");
  store.cancel();
  pending.resolve(weather());
  await request;
  assert.equal(store.getSnapshot().weather, null);
});

test("API query parameters preserve ampersands, hashes, spaces and Unicode", async () => {
  const api = createWeatherApi({ apiKey: "test", fetchImpl: async url => {
    assert.equal(url.searchParams.get("q"), "A&B #София");
    assert.equal(url.searchParams.get("units"), "metric");
    assert.equal(url.searchParams.get("appid"), "test");
    return Response.json(weather());
  } });
  await api.weatherByCity("A&B #София", "metric");
});

for (const [status, message] of [[401, /key/], [404, /not found/], [429, /Too many/], [503, /unavailable/]]) {
  test("API handles HTTP " + status, async () => {
    const api = createWeatherApi({ apiKey: "test", fetchImpl: async () => Response.json({}, { status }) });
    await assert.rejects(api.weatherByCity("Sofia", "metric"), message);
  });
}

test("API handles missing key, invalid JSON and incomplete data", async () => {
  await assert.rejects(createWeatherApi({ apiKey: "" }).weatherByCity("Sofia", "metric"), /Configure/);
  const invalid = createWeatherApi({ apiKey: "test", fetchImpl: async () => new Response("not json") });
  await assert.rejects(invalid.weatherByCity("Sofia", "metric"), /invalid response/);
  const incomplete = createWeatherApi({ apiKey: "test", fetchImpl: async () => Response.json({}) });
  await assert.rejects(incomplete.weatherByCity("Sofia", "metric"), /incomplete/);
});

test("API times out stalled requests", async () => {
  const api = createWeatherApi({ apiKey: "test", timeoutMs: 5,
    fetchImpl: (url, { signal }) => new Promise((resolve, reject) => {
      signal.addEventListener("abort", () => reject(signal.reason), { once: true });
    }),
  });
  await assert.rejects(api.weatherByCity("Sofia", "metric"), /timed out/);
});

test("API propagates explicit cancellation", async () => {
  const controller = new AbortController();
  const api = createWeatherApi({ apiKey: "test", fetchImpl: (url, { signal }) => new Promise((resolve, reject) => {
    signal.addEventListener("abort", () => reject(signal.reason), { once: true });
  }) });
  const pending = api.weatherByCity("Sofia", "metric", controller.signal);
  controller.abort();
  await assert.rejects(pending, { name: "AbortError" });
});

for (const [code, expected] of [[1, /permission/], [2, /unavailable/], [3, /timed out/]]) {
  test("geolocation distinguishes error code " + code, async () => {
    const mock = { getCurrentPosition: (success, fail, options) => {
      assert.equal(options.timeout, 10000);
      fail({ code });
    } };
    await assert.rejects(getCurrentLocation(undefined, mock), expected);
  });
}

test("geolocation handles unsupported browsers and cancellation", async () => {
  await assert.rejects(getCurrentLocation(undefined, null), /unavailable/);
  const controller = new AbortController();
  let success;
  const pending = getCurrentLocation(controller.signal, { getCurrentPosition: callback => { success = callback; } });
  controller.abort();
  success({ coords: { latitude: 1, longitude: 2 } });
  await assert.rejects(pending, { name: "AbortError" });
});

test("forecast groups across local midnight and calculates ranges", () => {
  const slot = (date, min, max, description) => ({
    dt: Date.parse(date) / 1000, main: { temp_min: min, temp_max: max }, weather: [{ description }],
  });
  const days = buildDailyForecast({ city: { timezone: 7200 }, list: [
    slot("2026-11-22T21:00:00Z", 1, 4, "night"),
    slot("2026-11-23T00:00:00Z", 2, 5, "night"),
    slot("2026-11-23T09:00:00Z", 3, 8, "cloudy"),
    slot("2026-11-23T12:00:00Z", 4, 9, "clear"),
  ] }, Date.parse("2026-11-21T00:00:00Z"));
  assert.equal(days.length, 2);
  assert.equal(days[0].date, "2026-11-22");
  assert.equal(days[1].date, "2026-11-23");
  assert.equal(days[1].min, 2);
  assert.equal(days[1].max, 9);
  assert.equal(days[1].description, "cloudy");
  assert.equal(formatForecastDate("2026-11-23"), "Mon, Nov 23");
});

test("forecast groups negative timezone offsets correctly", () => {
  const days = buildDailyForecast({ city: { timezone: -18000 }, list: [{
    dt: Date.parse("2026-11-23T02:00:00Z") / 1000,
    main: { temp_min: 0, temp_max: 2 }, weather: [{ description: "clear" }],
  }] }, Date.parse("2026-11-21T00:00:00Z"));
  assert.equal(days[0].date, "2026-11-22");
});

test("a superseded request failure cannot replace a newer success", async () => {
  const old = deferred();
  const store = createStore({ weatherByCity: city => city === "Old" ? old.promise : Promise.resolve(weather(city)) });
  const first = store.searchCity("Old");
  await store.searchCity("New");
  old.reject(new Error("Old failure"));
  await first;
  assert.equal(store.getSnapshot().error, "");
  assert.equal(store.getSnapshot().weather.name, "New");
});

test("unit changes during a pending search use the latest requested units", async () => {
  const old = deferred();
  const store = createStore({ weatherByCity: (city, units) => units === "metric" ? old.promise : Promise.resolve(weather(city, 59)) });
  const first = store.searchCity("Sofia");
  await store.changeUnits("imperial");
  old.resolve(weather("Sofia", 15));
  await first;
  assert.equal(store.getSnapshot().units, "imperial");
  assert.equal(store.getSnapshot().weather.main.temp, 59);
});

test("an empty search clears previous results and stops pending loading", async () => {
  const store = createStore();
  await store.searchCity("Sofia");
  await store.searchCity(" ");
  assert.equal(store.getSnapshot().weather, null);
  assert.equal(store.getSnapshot().forecast, null);
  assert.equal(store.getSnapshot().location, null);
});

test("API rejects malformed forecast slots instead of passing them to rendering", async () => {
  const api = createWeatherApi({ apiKey: "test", fetchImpl: async () => Response.json({ city: { timezone: 0 }, list: [null] }) });
  await assert.rejects(api.forecastByCoords({ latitude: 1, longitude: 2 }, "metric"), /incomplete forecast/);
});

test("forecast excludes today in the city's timezone and keeps five future days", () => {
  const now = Date.parse("2026-11-22T23:00:00Z");
  for (const [timezone, firstDay] of [[7200, "2026-11-24"], [-18000, "2026-11-23"]]) {
    const list = Array.from({ length: 7 }, (_, index) => ({
      dt: Date.parse(`2026-11-${22 + index}T12:00:00Z`) / 1000,
      main: { temp_min: 0, temp_max: 5 }, weather: [{ description: "clear" }],
    }));
    const days = buildDailyForecast({ city: { timezone }, list }, now);
    assert.equal(days.length, 5);
    assert.equal(days[0].date, firstDay);
  }
});

for (const [name, start, elapsed] of [
  ["ten minutes", "2026-11-22T10:00:00Z", 600000],
  ["local midnight", "2026-11-22T21:59:50Z", 30000],
]) {
  test(`background refresh after ${name} preserves results while loading`, async () => {
    let clock = Date.parse(start);
    let requests = 0;
    const pending = deferred();
    const store = createWeatherStore({
      weatherByCity: async () => weather(),
      weatherByCoords: () => { requests++; return pending.promise; },
      forecastByCoords: async () => forecast,
    }, async () => assert.fail("Unexpected geolocation"), () => clock);
    await store.searchCity("Sofia");
    await store.refresh();
    assert.equal(requests, 0);
    clock += elapsed;
    const refreshing = store.refresh();
    assert.equal(requests, 1);
    assert.equal(store.getSnapshot().weather.name, "Sofia");
    assert.equal(store.getSnapshot().forecast, forecast);
    await store.refresh();
    assert.equal(requests, 1);
    pending.resolve(weather("Sofia", 16));
    await refreshing;
    assert.equal(store.getSnapshot().weather.main.temp, 16);
    assert.equal(store.getSnapshot().loading, false);
    await store.searchCity(" ");
    clock += 600000;
    await store.refresh();
    assert.equal(requests, 1);
  });
}
