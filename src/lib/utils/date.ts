/**
 * Date and Time utilities for Asia/Jakarta (WIB) timezone.
 * Ensures consistent date strings on Vercel (UTC) and local server.
 */

export function getWibDateString(date: Date = new Date()): string {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return formatter.format(date); // Formats as YYYY-MM-DD in Asia/Jakarta
}

export function getWibTimeString(date: Date = new Date()): string {
  const formatter = new Intl.DateTimeFormat("id-ID", {
    timeZone: "Asia/Jakarta",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  return formatter.format(date).replace(".", ":"); // Formats as HH:mm in Asia/Jakarta
}
