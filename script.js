// Helper: check if date is today or in the future
function isFuture(dateString) {
  const year = dateString.slice(0, 4);
  const month = dateString.slice(4, 6);
  const day = dateString.slice(0, 8).slice(6, 8);

  const eventDate = new Date(`${year}-${month}-${day}`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return eventDate >= today;
}

// Helper: format YYYYMMDD → YYYY-MM-DD
function formatDate(dateString) {
  return `${dateString.slice(0, 4)}-${dateString.slice(4, 6)}-${dateString.slice(6, 8)}`;
}

document.getElementById("compareBtn").addEventListener("click", async () => {
  const airbnbFile = document.getElementById("airbnbFile")?.files[0];
  const vrboFile = document.getElementById("vrboFile")?.files[0];

  if (!airbnbFile || !vrboFile) {
    alert("Please upload both Airbnb and Vrbo iCal files.");
    return;
  }

  const resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = "<h2>Results</h2><p>Analyzing future bookings only…</p>";

  // Read file contents
  const airbnbText = await airbnbFile.text();
  const vrboText = await vrboFile.text();

  // Parse events
  let airbnbEvents = parseICal(airbnbText);
  let vrboEvents = parseICal(vrboText);

  // Keep only real bookings (not availability blocks) and future dates
  airbnbEvents = airbnbEvents
    .filter(e => e.start && e.end)
    .filter(e => !e.summary || e.summary.toLowerCase().includes("reservation"))
    .filter(e => isFuture(e.start.slice(0, 8)));

  vrboEvents = vrboEvents
    .filter(e => e.start && e.end)
    .filter(e => !e.summary || e.summary.toLowerCase().includes("reservation"))
    .filter(e => isFuture(e.start.slice(0, 8)));

  // Sort by start date for readability
  airbnbEvents.sort((a, b) => a.start.localeCompare(b.start));
  vrboEvents.sort((a, b) => a.start.localeCompare(b.start));

  const mismatches = [];
  const risks = [];

  // Airbnb → Vrbo mismatches
  airbnbEvents.forEach(a => {
    const aStartRaw = a.start.slice(0, 8);
    const aEndRaw = a.end.slice(0, 8);

    const match = vrboEvents.find(v =>
      v.start.slice(0, 8) === aStartRaw &&
      v.end.slice(0, 8) === aEndRaw
    );

    if (!match) {
      mismatches.push(
        `Airbnb booking <strong>${formatDate(aStartRaw)} → ${formatDate(aEndRaw)}</strong> not found on Vrbo`
      );
    }
  });

  // Vrbo → Airbnb mismatches
  vrboEvents.forEach(v => {
    const vStartRaw = v.start.slice(0, 8);
    const vEndRaw = v.end.slice(0, 8);

    const match = airbnbEvents.find(a =>
      a.start.slice(0, 8) === vStartRaw &&
      a.end.slice(0, 8) === vEndRaw
    );

    if (!match) {
      mismatches.push(
        `Vrbo booking <strong>${formatDate(vStartRaw)} → ${formatDate(vEndRaw)}</strong> not found on Airbnb`
      );
    }
  });

  // Double-booking risks (same start, different end)
  airbnbEvents.forEach(a => {
    vrboEvents.forEach(v => {
      const aStartRaw = a.start.slice(0, 8);
      const vStartRaw = v.start.slice(0, 8);

      if (aStartRaw === vStartRaw && a.end !== v.end) {
        risks.push(
          `<strong>Risk:</strong> Overlap detected starting <strong>${formatDate(aStartRaw)}</strong> (different checkout dates)`
        );
      }
    });
  });

  // Build output
  resultsDiv.innerHTML = "<h2>Results (Future Bookings Only)</h2>";

// Identify matched bookings
const matches = [];

airbnbEvents.forEach(a => {
  const aStart = a.start.slice(0, 8);
  const aEnd = a.end.slice(0, 8);

  const match = vrboEvents.find(v =>
    v.start.slice(0, 8) === aStart &&
    v.end.slice(0, 8) === aEnd
  );

  if (match) {
    matches.push(`✔ ${formatDate(aStart)} → ${formatDate(aEnd)}`);
  }
});

// Build output
resultsDiv.innerHTML = "<h2>Results (Future Bookings Only)</h2>";

if (matches.length > 0) {
  resultsDiv.innerHTML += "<h3>Matched Bookings</h3><ul>" +
    matches.map(m => `<li>${m}</li>`).join("") +
    "</ul>";
}

if (mismatches.length > 0) {
  resultsDiv.innerHTML += "<h3>Mismatches</h3><ul>" +
    mismatches.map(m => `<li>${m}</li>`).join("") +
    "</ul>";
}

if (risks.length > 0) {
  resultsDiv.innerHTML += "<h3>Double‑Booking Risks</h3><ul>" +
    risks.map(r => `<li>${r}</li>`).join("") +
    "</ul>";
}

// If everything matches
if (matches.length > 0 && mismatches.length === 0 && risks.length === 0) {
  resultsDiv.innerHTML += "<p>✔ Calendars match perfectly for all future bookings.</p>";
}


  if (mismatches.length > 0) {
    resultsDiv.innerHTML += "<h3>Mismatches</h3><ul>" +
      mismatches.map(m => `<li>${m}</li>`).join("") +
      "</ul>";
  }

  if (risks.length > 0) {
    resultsDiv.innerHTML += "<h3>Double‑Booking Risks</h3><ul>" +
      risks.map(r => `<li>${r}</li>`).join("") +
      "</ul>";
  }
});
