let allData = [];
let columns = [];

/* =========================
   Formateo de fechas
   ========================= */
function formatDate(value) {
  if (!value) return "";

  // Si ya está en DD/MM/AAAA → no tocar
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
    return value;
  }

  // Si viene en YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [y, m, d] = value.split("-");
    return `${d}/${m}/${y}`;
  }

  return value; // fallback
}

const modelSelect = document.getElementById("modelSelect");
const tableContainer = document.getElementById("tableContainer");

/* =========================
   Cargar modelos en selector
   ========================= */
Object.keys(VEHICLE_MODELS).forEach(model => {
  const option = document.createElement("option");
  option.value = model;
  option.textContent = model;
  modelSelect.appendChild(option);
});

/* =========================
   Cambio de modelo
   ========================= */
modelSelect.addEventListener("change", loadModel);

/* =========================
   Cargar CSV (ANTES Excel)
   ========================= */
async function loadModel() {
  const model = modelSelect.value;
  if (!model) return;

  tableContainer.innerHTML = "Cargando...";

  try {
    // ✅ CSV → se lee como TEXTO, no como ArrayBuffer
    const response = await fetch(VEHICLE_MODELS[model]);
    const csvText = await response.text();

    // ✅ Parsear CSV correctamente
    Papa.parse(csvText, {
      header: true,          // usa la primera fila como cabecera
      skipEmptyLines: true,  // ignora líneas vacías
      delimiter: ";",        // ⚠️ típico en CSV exportado desde Excel ES

      complete: (results) => {
        allData = results.data;

        // Si el CSV está vacío
        if (!allData.length) {
          tableContainer.innerHTML = "⚠️ El CSV no tiene filas";
          return;
        }

        // ✅ Limpieza básica (muy importante en CSV)
        allData = allData.map(row => {
          const cleanRow = {};
          Object.keys(row).forEach(key => {
            cleanRow[key.trim()] = row[key]?.trim() || "";
          });
          return cleanRow;
        });

        // ✅ Detectar columnas automáticamente
        columns = Object.keys(allData[0]);

        renderTable();
      },

      error: (error) => {
        tableContainer.innerHTML = "❌ Error leyendo el CSV";
        console.error(error);
      }
    });

  } catch (error) {
    tableContainer.innerHTML = "❌ Error cargando el CSV";
    console.error(error);
  }
}

/* =========================
   Renderizar tabla
   ========================= */
function renderTable() {
  tableContainer.innerHTML = "";

  if (!allData.length) {
    tableContainer.innerHTML = "⚠️ El CSV no tiene filas";
    return;
  }

  const table = document.createElement("table");
  table.border = "1";
  table.cellPadding = "4";

  /* ---- Cabecera ---- */
  const thead = document.createElement("thead");
  const headerRow = document.createElement("tr");

  columns.forEach(col => {
    const th = document.createElement("th");
    th.textContent = col;
    headerRow.appendChild(th);
  });

  thead.appendChild(headerRow);
  table.appendChild(thead);

  /* ---- Cuerpo ---- */
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
