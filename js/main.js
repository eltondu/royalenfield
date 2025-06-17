const UFs = ["AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"];
const productModelId = 2;
let allRowsData = [];

async function fetchStoresByUF(uf) {
  const url = `https://reservaroyal-site-sale-api.aatb.com.br/Store/${uf}`;
  try {
    const res = await fetch(url);
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

async function fetchProductTypes(storeId) {
  const url = `https://reservaroyal-site-sale-api.aatb.com.br/Product/model/${productModelId}/types?storeId=${storeId}`;
  try {
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    return data.filter(p => p.available === true);
  } catch {
    return [];
  }
}

function populateSelectOptions(id, values) {
  const select = document.getElementById(id);
  while (select.options.length > 1) {
    select.remove(1);
  }
  [...new Set(values.sort())].forEach(value => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    select.appendChild(option);
  });
}

function filterTable() {
  const ufFilter = document.getElementById("filterUf").value;
  const cityFilter = document.getElementById("filterCity").value;
  const storeFilter = document.getElementById("filterStore").value;
  const modelFilter = document.getElementById("filterModel").value;
  const tbody = document.querySelector("#productTable tbody");
  tbody.innerHTML = "";

  const filteredRows = allRowsData.filter(row => {
    return (!ufFilter || row.uf === ufFilter)
      && (!cityFilter || row.city === cityFilter)
      && (!storeFilter || row.storeName === storeFilter)
      && (!modelFilter || row.modelName === modelFilter);
  });

  for (const row of filteredRows) {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${row.uf}</td>
      <td>${row.city}</td>
      <td>${row.storeName}</td>
      <td>${row.modelName}</td>
      <td>${row.price}</td>
      <td><span class="badge bg-success p-2 w-100">Disponível</span></td>
      <td><img class="thumb-img" src="${row.thumbUrl}" alt="${row.modelName}" loading="lazy"></td>
    `;
    tbody.appendChild(tr);
  }

  if (filteredRows.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">Nenhum resultado encontrado</td></tr>';
  }
}

async function main() {
  const allStores = [];

  for (const uf of UFs) {
    const stores = await fetchStoresByUF(uf);
    allStores.push(...stores);
  }

  for (const store of allStores) {
    const products = await fetchProductTypes(store.storeId);
    for (const product of products) {
      allRowsData.push({
        uf: store.uf,
        city: store.city,
        storeName: store.name,
        modelName: product.name,
        price: product.price,
        thumbUrl: product.thumbUrl
      });
    }
  }

  populateSelectOptions("filterUf", allRowsData.map(r => r.uf));
  populateSelectOptions("filterModel", allRowsData.map(r => r.modelName));

  document.getElementById("loadingOverlay").style.display = "none";
  document.getElementById("filters").style.display = "flex";
  document.getElementById("tableContainer").style.display = "block";

  document.getElementById("filterUf").addEventListener("change", () => {
    const uf = document.getElementById("filterUf").value;
    const cities = allRowsData.filter(r => r.uf === uf).map(r => r.city);
    populateSelectOptions("filterCity", cities);
    populateSelectOptions("filterStore", []);
    filterTable();
  });

  document.getElementById("filterCity").addEventListener("change", () => {
    const uf = document.getElementById("filterUf").value;
    const city = document.getElementById("filterCity").value;
    const stores = allRowsData.filter(r => r.uf === uf && r.city === city).map(r => r.storeName);
    populateSelectOptions("filterStore", stores);
    filterTable();
  });

  document.getElementById("filterStore").addEventListener("change", filterTable);
  document.getElementById("filterModel").addEventListener("change", filterTable);

  filterTable();
}

main();
