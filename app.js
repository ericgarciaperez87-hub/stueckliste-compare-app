
let allData = [];
let columns = [];

const modelSelect = document.getElementById("modelSelect");
const columnSelect = document.getElementById("columnSelect");
const filterInput = document.getElementById("filterValue");
const tableContainer = document.getElementById("tableContainer");

Object.keys(VEHICLE_MODELS).forEach(model => {
  const opt = document.createElement("option");
  opt.value = model;
  opt.textContent = model;
  modelSelect.appendChild(opt);
});

modelSelect.addEventListener("change", loadModel);
columnSelect.addEventListener("change", renderTable);
filterInput.addEventListener("input", renderTable);

async function loadModel() {
  const model = modelSelect.value;
  if (!model) return;

  const response = await fetch(VEHICLE_MODELS[model]);
  const arrayBuffer = await response.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: "array" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];

  allData = XLSX.utils.sheet_to_json(sheet);
  columns = Object.keys(allData[0] || {});

  loadColumns();
  renderTable();
}

function loadColumns() {
  columnSelect.innerHTML = "<option value=''>-- Seleccionar --</option>";
  columns.forEach(col => {
    const opt = document.createElement("option");
    opt.value = col;
    opt.textContent = col;
    columnSelect.appendChild(opt);
  });
}

function renderTable() {
  tableContainer.innerHTML = "";
  if (!allData.length) return;

  const selectedColumn = columnSelect.value;
  const filterValue = filterInput.value;

  const table = document.createElement("table");
  const thead = document.createElement("thead");
  const trh = document.createElement("tr");

  columns.forEach(col => {
    const th = document.createElement("th");
    th.textContent = col;
    trh.appendChild(th);
  });

  thead.appendChild(trh);
  table.appendChild(thead);

  const tbody = document.createElement("tbody");

  allData.forEach(row => {
    const tr = document.createElement("tr");
    columns.forEach(col => {
      const td = document.createElement("td");
      td.textContent = row[col] ?? "";
      if (selectedColumn) {
        td.className = String(row[col]) === filterValue ? "match" : "no-match";
      }
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });

  table.appendChild(tbody);
  tableContainer.appendChild(table);
}
