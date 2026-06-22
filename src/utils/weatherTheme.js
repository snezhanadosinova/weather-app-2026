export const getWeatherTheme = (weather) => {
  if (!weather) return "from-sky-900 via-indigo-900 to-black";

  const condition = weather.weather[0].main.toLowerCase();

  if (condition.includes("rain")) {
    return "from-gray-800 via-blue-900 to-black";
  }

  if (condition.includes("cloud")) {
    return "from-gray-700 via-gray-900 to-black";
  }

  if (condition.includes("clear")) {
    return "from-blue-600 via-sky-800 to-black";
  }

  if (condition.includes("snow")) {
    return "from-blue-200 via-blue-400 to-gray-900";
  }

  if (condition.includes("thunder")) {
    return "from-purple-900 via-black to-gray-900";
  }

  return "from-sky-900 via-indigo-900 to-black";
};