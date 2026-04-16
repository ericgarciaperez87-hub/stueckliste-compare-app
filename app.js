let allData = [];
let columns = [];

function formatDate(value) {
  if (!value) return "";

  // Si ya está en DD/MM/AAAA → no tocar
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
    return value;
  }

  // Si viene en YYYY-MM-DD (a veces pasa)
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [y, m, d] = value.split("-");
    return `${d}/${m}/${y}`;
  }

  return value; // fallback
}

const modelSelect = document.getElementById("modelSelect");
const tableContainer = document.getElementById("tableContainer");

// Cargar modelos en el selector
Object.keys(VEHICLE_MODELS).forEach(model => {
  const option = document.createElement("option");
  option.value = model;
  option.textContent = model;
  modelSelect.appendChild(option);
});

// Al cambiar de modelo → cargar Excel
modelSelect.addEventListener("change", loadModel);

async function loadModel() {
  const model = modelSelect.value;
  if (!model) return;

  tableContainer.innerHTML = "Cargando...";

  try {
    const response = await fetch(VEHICLE_MODELS[model]);
    const arrayBuffer = await response.arrayBuffer();

    const workbook = XLSX.read(arrayBuffer, { type: "array" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];

    // ✅ TODAS las filas
    allData = XLSX.utils.sheet_to_json(sheet, {defval: "", raw: false });

    // ✅ Columnas detectadas automáticamente
    columns = Object.keys(allData[0] || {});

    renderTable();
  } catch (error) {
    tableContainer.innerHTML = "❌ Error cargando el Excel";
    console.error(error);
  }
}

function renderTable() {
  tableContainer.innerHTML = "";

  if (!allData.length) {
    tableContainer.innerHTML = "⚠️ El Excel no tiene filas";
    return;
  }

  const table = document.createElement("table");
  table.border = "1";
  table.cellPadding = "4";

  // Cabecera
  const thead = document.createElement("thead");
  const headerRow = document.createElement("tr");

  columns.forEach(col => {
    const th = document.createElement("th");
    th.textContent = col;
    headerRow.appendChild(th);
  });

  thead.appendChild(headerRow);
  table.appendChild(thead);

  // Cuerpo
  const tbody = document.createElement("tbody");

  allData.forEach(row => {
    const tr = document.createElement("tr");

    columns.forEach(col => {
      const td = document.createElement("td");
      td.textContent = formatDate(row[col]);
      tr.appendChild(td);
    });

    tbody.appendChild(tr);
  });

  table.appendChild(tbody);
  tableContainer.appendChild(table);
}
