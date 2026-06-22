export const formatTemp = (temp) => {
  if (!temp && temp !== 0) return "";
  return Math.round(temp);
};

export const formatDate = (dt) => {
  return new Date(dt).toLocaleDateString(undefined, {
    weekday: "short",
  });
};

export const formatDescription = (text) => {
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1);
};