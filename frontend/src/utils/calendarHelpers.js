/**
 * Calendar helpers for Google Calendar link & iCal (.ics) download
 */

export function generateGoogleCalendarUrl(event) {
  if (!event || !event.startDate) return "#";

  const start = new Date(event.startDate);
  // If no endDate provided, default to 2 hours after startDate
  const end = event.endDate ? new Date(event.endDate) : new Date(start.getTime() + 2 * 60 * 60 * 1000);

  const formatGCalDate = (d) =>
    d.toISOString().replace(/-|:|\.\d+/g, "");

  const title = encodeURIComponent(event.title || "ICTG Event");
  const details = encodeURIComponent(event.description || "");
  const location = encodeURIComponent(event.location || "Winners Chapel ICTG");
  const dates = `${formatGCalDate(start)}/${formatGCalDate(end)}`;

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}&location=${location}`;
}

export function downloadIcsFile(event) {
  if (!event || !event.startDate) return;

  const start = new Date(event.startDate);
  const end = event.endDate ? new Date(event.endDate) : new Date(start.getTime() + 2 * 60 * 60 * 1000);

  const formatIcsDate = (d) =>
    d.toISOString().replace(/-|:|\.\d+/g, "");

  const icsContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Winners Chapel ICTG//Portal Event//EN",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${event._id || Date.now()}@ictg.portal`,
    `DTSTAMP:${formatIcsDate(new Date())}`,
    `DTSTART:${formatIcsDate(start)}`,
    `DTEND:${formatIcsDate(end)}`,
    `SUMMARY:${event.title.replace(/\n/g, "\\n")}`,
    `DESCRIPTION:${(event.description || "").replace(/\n/g, "\\n")}`,
    `LOCATION:${(event.location || "Winners Chapel").replace(/\n/g, "\\n")}`,
    "STATUS:CONFIRMED",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  const link = document.createElement("a");
  link.href = window.URL.createObjectURL(blob);
  link.setAttribute("download", `${(event.title || "event").toLowerCase().replace(/[^a-z0-9]/g, "-")}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function getTimeRemaining(targetDate) {
  const total = Date.parse(targetDate) - Date.now();
  if (total <= 0) {
    return { total: 0, days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true };
  }

  const seconds = Math.floor((total / 1000) % 60);
  const minutes = Math.floor((total / 1000 / 60) % 60);
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
  const days = Math.floor(total / (1000 * 60 * 60 * 24));

  return { total, days, hours, minutes, seconds, isPast: false };
}
