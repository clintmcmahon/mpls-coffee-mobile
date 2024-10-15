export const formatTime = (isoDuration) => {
  const minutes = parseISODuration(isoDuration);
  let hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const ampm = hours >= 12 ? "PM" : "AM";

  hours = hours % 12;
  hours = hours ? hours : 12;
  return `${hours}:${mins.toString().padStart(2, "0")} ${ampm}`;
};

export const isOpenNow = (shop) => {
  const now = new Date();
  const currentDay = now.getDay();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const todayHours = shop.hours.find((h) => h.dayOfWeek === currentDay);
  if (!todayHours) return false;

  const openMinutes = parseISODuration(todayHours.openTime);
  const closeMinutes = parseISODuration(todayHours.closeTime);

  if (closeMinutes < openMinutes) {
    // Open past midnight
    return currentMinutes >= openMinutes || currentMinutes < closeMinutes;
  }

  return currentMinutes >= openMinutes && currentMinutes < closeMinutes;
};

export const parseISODuration = (duration) => {
  const matches = duration.match(/PT(\d+)H(?:(\d+)M)?/);

  if (matches) {
    const hours = parseInt(matches[1], 10);
    const minutes = matches[2] ? parseInt(matches[2], 10) : 0;
    return hours * 60 + minutes;
  }
  return 0;
};

export const getCurrentDayHours = (shop) => {
  const currentDay = new Date().getDay();
  const todayHours = shop.hours.find((h) => h.dayOfWeek === currentDay);
  if (todayHours) {
    const openTime = formatTime(todayHours.openTime);
    const closeTime = formatTime(todayHours.closeTime);

    return `${openTime} - ${closeTime}`;
  }
  return "Closed";
};
