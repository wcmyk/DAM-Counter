document.getElementById("fileInput").addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const text = await file.text();
  const lines = text.split(/\r?\n/);

  // Parse header
  const header = lines[0].split(/,|\t/);
  const colIndex = header.indexOf("TargetFilename");

  if (colIndex === -1) {
    alert("Column 'TargetFilename' not found.");
    return;
  }

  const counts = {};

  for (let i = 1; i < lines.length; i++) {
    const row = lines[i].split(/,|\t/);
    const filename = (row[colIndex] || "").trim();
    if (filename) counts[filename] = (counts[filename] || 0) + 1;
  }

  // Populate table
  const tbody = document.querySelector("#resultTable tbody");
  tbody.innerHTML = "";

  for (const key in counts) {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${key}</td><td>${counts[key]}</td>`;
    tbody.appendChild(tr);
  }

  // Enable export button
  const exportBtn = document.getElementById("exportBtn");
  exportBtn.disabled = false;
  exportBtn.onclick = () => downloadCSV(counts);
});


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
