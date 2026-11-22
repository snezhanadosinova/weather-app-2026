// Local SVG icons work offline and inherit the existing text color.
// The adjacent weather description supplies the accessible text.
export default function WeatherIcon({ condition = "", className = "h-8 w-8" }) {
  const value = condition.toLowerCase();
  let shape;
  const cloud = <path d="M7 17h10a4 4 0 0 0 .5-8 6 6 0 0 0-11-1A4.5 4.5 0 0 0 7 17Z" />;
  if (value.includes("clear")) {
    shape = <><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5" /></>;
  } else if (value.includes("thunder")) {
    shape = <>{cloud}<path d="m12 13-3 5h4l-2 4 6-7h-4l2-2" /></>;
  } else if (value.includes("rain") || value.includes("drizzle")) {
    shape = <>{cloud}<path d="m8 19-1 2m5-2-1 2m5-2-1 2" /></>;
  } else if (value.includes("snow")) {
    shape = <><path d="M12 2v20M3.3 7l17.4 10M3.3 17 20.7 7M9 4l3 3 3-3M9 20l3-3 3 3M4 10l4-1-1-4m10 14-1-4 4-1M4 14l4 1-1 4M17 5l-1 4 4 1" /></>;
  } else if (value.includes("cloud")) {
    shape = cloud;
  } else if (["mist", "fog", "haze", "smoke", "dust", "sand", "ash"].some(name => value.includes(name))) {
    shape = <><path d="M4 8h16M2 12h17M5 16h17M4 20h12" /></>;
  } else if (value.includes("squall") || value.includes("tornado")) {
    shape = <><path d="M3 8h13a3 3 0 1 0-3-3M2 12h17a3 3 0 1 1-3 3M4 16h6a3 3 0 1 1-3 3" /></>;
  } else {
    shape = <><circle cx="12" cy="12" r="9" /><path d="M9.5 9a2.5 2.5 0 1 1 4 2c-1 .5-1.5 1-1.5 2M12 17h.01" /></>;
  }
  return <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
    className={className}>{shape}</svg>;
}
