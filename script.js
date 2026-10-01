function isFuture(dateString) {
  const year = dateString.slice(0, 4);
  const month = dateString.slice(4, 6);
  const day = dateString.slice(6, 8);

  const eventDate = new Date(`${year}-${month}-${day}`);
  const today = new Date();

  // Remove time portion for accurate comparison
  today.setHours(0, 0, 0, 0);

  return eventDate >= today;
}
document.getElementById("compareBtn").addEventListener("click", async () => {
  const airbnbFile = document.getElementById("airbnbFile").files[0];
  const vrboFile = document.getElementById("vrboFile").files[0];

  if (!airbnbFile || !vrboFile) {
    alert("Please upload both iCal files.");
    return;
  }

  const airbnbText = await airbnbFile.text();
  const vrboText = await vrboFile.text();

const airbnbEvents = parseICal(airbnbText)
  .filter(e => e.summary && e.summary.toLowerCase().includes("reservation"))
  .filter(e => isFuture(e.start.slice(0, 8)));

const vrboEvents = parseICal(vrboText)
  .filter(e => e.summary && e.summary.toLowerCase().includes("reservation"))
  .filter(e => isFuture(e.start.slice(0, 8)));


  const resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = "<h2>Results</h2>";

  const mismatches = [];
  const risks = [];

  airbnbEvents.forEach(a => {
    const aStart = a.start.slice(0, 8);
    const aEnd = a.end.slice(0, 8);

    const match = vrboEvents.find(v => 
      v.start.slice(0, 8) === aStart &&
      v.end.slice(0, 8) === aEnd
    );

    if (!match) {
      mismatches.push(`Airbnb booking ${aStart} → ${aEnd} not found on Vrbo`);
    }
  });

  vrboEvents.forEach(v => {
    const vStart = v.start.slice(0, 8);
    const vEnd = v.end.slice(0, 8);

    const match = airbnbEvents.find(a => 
      a.start.slice(0, 8) === vStart &&
      a.end.slice(0, 8) === vEnd
    );

    if (!match) {
      mismatches.push(`Vrbo booking ${vStart} → ${vEnd} not found on Airbnb`);
    }
  });

  // Detect double-booking risk
  airbnbEvents.forEach(a => {
    vrboEvents.forEach(v => {
      if (a.start === v.start && a.end !== v.end) {
        risks.push(`Potential double-booking risk on ${a.start.slice(0, 8)}`);
      }
    });
  });

  if (mismatches.length === 0 && risks.length === 0) {
    resultsDiv.innerHTML += "<p>✔ Calendars match perfectly.</p>";
    return;
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
