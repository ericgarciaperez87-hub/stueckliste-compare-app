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
