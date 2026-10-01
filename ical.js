// Clean iCal parser for Airbnb, Vrbo, OwnerRez, Booking.com
// Extracts: DTSTART, DTEND, SUMMARY

function parseICal(text) {
  const events = [];
  const lines = text.split(/\r?\n/);

  let current = null;

  lines.forEach(line => {
    line = line.trim();
    if (!line) return;

    // Start of an event
    if (line.startsWith("BEGIN:VEVENT")) {
      current = {};
      return;
    }

    // End of an event
    if (line.startsWith("END:VEVENT")) {
      if (current) events.push(current);
      current = null;
      return;
    }

    if (!current) return;

    // DTSTART (handles both date-only and date-time)
    if (line.startsWith("DTSTART")) {
      const parts = line.split(":");
      current.start = parts[1].replace(/T.*$/, ""); // strip time if present
      return;
    }

    // DTEND (handles both date-only and date-time)
    if (line.startsWith("DTEND")) {
      const parts = line.split(":");
      current.end = parts[1].replace(/T.*$/, ""); // strip time if present
      return;
    }

    // SUMMARY (booking vs availability)
    if (line.startsWith("SUMMARY")) {
      const parts = line.split(":");
      current.summary = parts.slice(1).join(":"); // handles colons inside summary
      return;
    }

    // Handle folded lines (continuation lines starting with space)
    if (line.startsWith(" ") && current && current.summary) {
      current.summary += line.trim();
    }
  });

  return events;
}
