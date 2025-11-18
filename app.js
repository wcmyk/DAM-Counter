document.getElementById("fileInput").addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const text = await file.text();
  const rows = parseCSV(text);

  if (rows.length < 1) {
    alert("File appears empty.");
    return;
  }

  // Find TargetFilename column
  const header = rows[0];
  const colIndex = header.indexOf("TargetFilename");

  if (colIndex === -1) {
    alert("Column 'TargetFilename' not found.");
    return;
  }

  // Count occurrences
  const counts = {};

  for (let i = 1; i < rows.length; i++) {
    const filename = (rows[i][colIndex] || "").trim();
    if (filename) counts[filename] = (counts[filename] || 0) + 1;
  }

  // Display results
  const tbody = document.querySelector("#resultTable tbody");
  tbody.innerHTML = "";

  for (const key in counts) {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${key}</td><td>${counts[key]}</td>`;
    tbody.appendChild(tr);
  }

  // Export CSV button
  const exportBtn = document.getElementById("exportBtn");
  exportBtn.disabled = false;
  exportBtn.onclick = () => downloadCSV(counts);
});


// --- CSV / TSV Parser --- //
function parseCSV(str) {
  const rows = [];
  let row = [];
  let cur = "";
  let insideQuote = false;

  for (let i = 0; i < str.length; i++) {
    const c = str[i];
    const next = str[i + 1];

    if (insideQuote) {
      if (c === '"' && next === '"') {
        cur += '"';
        i++;
      } else if (c === '"') {
        insideQuote = false;
      } else {
        cur += c;
      }
    } else {
      if (c === '"') {
        insideQuote = true;
      } else if (c === "," || c === "\t") {
        row.push(cur);
        cur = "";
      } else if (c === "\n" || c === "\r") {
        if (cur.length > 0 || row.length > 0) {
          row.push(cur);
          rows.push(row);
          row = [];
          cur = "";
        }
      } else {
        cur += c;
      }
    }
  }

  if (cur.length > 0) row.push(cur);
  if (row.length > 0) rows.push(row);

  return rows;
}


// --- Export results as CSV --- //
function downloadCSV(counts) {
  let csv = "Filename,Count\n";
  for (const key in counts) {
    csv += `"${key}",${counts[key]}\n`;
  }

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "file_usage_report.csv";
  a.click();
}
