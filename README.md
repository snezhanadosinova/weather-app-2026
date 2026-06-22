# Weather App 2026

A responsive React weather application built with Vite, Tailwind CSS, and modern hooks.

## Features

- Search weather by city name
- Get weather for the current location using browser geolocation
- Switch between metric (°C) and imperial (°F) units
- Display current weather details and a forecast grid
- Error handling and loading states

## Tech Stack

- React 19
- Vite
- Tailwind CSS 4
- ESLint

## Getting Started

### Install dependencies

```bash
npm install
```

### Create `.env` file with your API key

```bash
 VITE_WEATHER_API_KEY=YOUR_KEY
```

### Run development server

```bash
npm run dev
```

Open the URL shown in the terminal to view the app locally.

### Build for production

```bash
npm run build
```

### Preview production build

```bash
npm run preview
```

### Lint the project

```bash
npm run lint
```

## Project Structure

- `src/App.jsx` — main app layout and state management
- `src/hooks/useWeather.js` — fetches weather and forecast data
- `src/hooks/useGeolocation.js` — retrieves browser geolocation
- `src/components/ui/` — reusable UI components
- `src/components/weather/` — weather and forecast display components
- `src/services/weatherApi.js` — weather API integration
- `src/utils/` — helper utilities for form data, icons, and theming

## Notes

- This project uses the browser geolocation API for the “My Location” feature.
- Ensure location permissions are enabled in your browser to use that button.
- For this app is used `openweathermap.org`