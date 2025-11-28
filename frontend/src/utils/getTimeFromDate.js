export function getTimeFromDate(dateString) {
  const date = new Date(dateString);

  const options = {
    hour: "numeric",
    minute: "2-digit",
  };

  return date.toLocaleTimeString("en-US", options);
}
