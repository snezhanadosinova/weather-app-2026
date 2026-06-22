const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;

export const getWeatherByCity = async (city, units) => {
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=${units}&appid=${API_KEY}`;

  const res = await fetch(url);
  const data = await res.json();

  if (!res.ok) throw new Error(data.message);
  return data;
};

export const getForecastByCity = async (city, units) => {
  const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=${units}&appid=${API_KEY}`;

  const res = await fetch(url);
  const data = await res.json();

  if (!res.ok) throw new Error(data.message);
  return data;
};

export const getForecastByCoords = async (lat, lon, units) => {
  const res = await fetch(
    `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=${units}&appid=${API_KEY}`,
  );

  const data = await res.json();
  if (!res.ok) throw new Error(data.message);

  return data;
};

export const getWeatherByCoords = async (lat, lon, units) => {
  const res = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=${units}&appid=${API_KEY}`,
  );

  const data = await res.json();
  if (!res.ok) throw new Error(data.message);

  return data;
};
