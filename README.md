# Weather App 2026

A weather app built with React, Vite, and Tailwind CSS.

## Features

- Search for a city or use your current location.
- View the current temperature, weather conditions, and weather icons.
- See up to five upcoming days with minimum and maximum temperatures.
- Switch between Celsius and Fahrenheit.
- Use the app on mobile, tablet, and desktop.

## Setup

Copy `example.env` to `.env` and add your activated [OpenWeatherMap API key](https://openweathermap.org/api):

```env
VITE_WEATHER_API_KEY=YOUR_KEY
```

Location access requires browser permission and HTTPS or localhost.

## Run with Docker

Install and start Docker Desktop, then run:

```bash
docker compose -f compose.dev.yaml up --build -d
```

Open [http://localhost:8080](http://localhost:8080). Changes to the app update automatically. Restart the container after changing `.env`:

```bash
docker compose -f compose.dev.yaml restart weather-app
```

To stop:

```bash
docker compose -f compose.dev.yaml down
```

## Run locally

Requires Node.js 24 and npm.

```bash
npm ci
npm run dev
```

Open the address printed in the terminal, normally [http://localhost:5173](http://localhost:5173).

## Production

With Docker, stop the development container first, then run:

```bash
docker compose -f compose.dev.yaml down
docker compose up --build -d
```

Open [http://localhost:8080](http://localhost:8080). Rebuild after changing the source or API key.

For a local production preview:

```bash
npm run build
npm run preview
```

## Checks

```bash
npm test
npm run lint
npm run build
```

## Notes

Weather data comes from OpenWeatherMap. Daily minimum and maximum temperatures summarize the available forecast intervals; the last day may be incomplete.

The API key is included in the browser app. Do not use a key that must remain private.
