// Simple iCal parser (DTSTART, DTEND only)
function parseICal(text) {
  const events = [];
  const lines = text.split(/\r?\n/);

  let current = {};

  lines.forEach(line => {
    if (line.startsWith("BEGIN:VEVENT")) {
      current = {};
    }
    if (line.startsWith("DTSTART")) {
      current.start = line.split(":")[1];
    }
    if (line.startsWith("DTEND")) {
      current.end = line.split(":")[1];
    }
    if (line.startsWith("SUMMARY")) {
  current.summary = line.split(":")[1];
}
    if (line.startsWith("END:VEVENT")) {
      events.push(current);
    }
  });

  return events;
}
