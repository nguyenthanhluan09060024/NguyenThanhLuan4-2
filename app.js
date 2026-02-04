const API = "https://api.escuelajs.co/api/v1/products";

let products = [];
let filtered = [];
let page = 1;
let pageSize = 10;
let sortKey = "";
let sortAsc = true;

async function fetchData() {
  const res = await fetch(API);
  products = await res.json();
  filtered = products;
  render();
}

function render() {
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const view = filtered.slice(start, end);

  const body = document.getElementById("tableBody");
  body.innerHTML = "";

  view.forEach(p => {
    const tr = document.createElement("tr");
    tr.title = p.description;
    tr.onclick = () => showDetail(p);

    tr.innerHTML = `
      <td>${p.id}</td>
      <td>${p.title}</td>
      <td>$${p.price}</td>
      <td>${p.category?.name}</td>
      <td><img src="${p.images[0]}" width="50"/></td>
    `;
    body.appendChild(tr);
  });

  renderPagination();
}

function renderPagination() {
  const total = Math.ceil(filtered.length / pageSize);
  const pag = document.getElementById("pagination");
  pag.innerHTML = "";

  for (let i = 1; i <= total; i++) {
    pag.innerHTML += `
      <li class="page-item ${i === page ? "active" : ""}">
        <button class="page-link" onclick="page=${i};render()">${i}</button>
      </li>`;
  }
}

document.getElementById("searchInput").oninput = e => {
  const key = e.target.value.toLowerCase();
  filtered = products.filter(p => p.title.toLowerCase().includes(key));
  page = 1;
  render();
};

document.getElementById("pageSize").onchange = e => {
  pageSize = +e.target.value;
  page = 1;
  render();
};

function sortData(key) {
  sortAsc = sortKey === key ? !sortAsc : true;
  sortKey = key;

  filtered.sort((a, b) =>
    sortAsc ? a[key] > b[key] ? 1 : -1 : a[key] < b[key] ? 1 : -1
  );
  render();
}

function exportCSV() {
  const rows = filtered.map(p =>
    `${p.id},${p.title},${p.price},${p.category?.name}`
  );
  const blob = new Blob([`id,title,price,category\n${rows.join("\n")}`]);
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "products.csv";
  a.click();
}

function showDetail(p) {
  document.getElementById("detailId").value = p.id;
  document.getElementById("detailTitle").value = p.title;
  document.getElementById("detailPrice").value = p.price;
  document.getElementById("detailDesc").value = p.description;
  new bootstrap.Modal(detailModal).show();
}

async function updateProduct() {
  const id = detailId.value;
  await fetch(`${API}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: detailTitle.value,
      price: detailPrice.value,
      description: detailDesc.value
    })
  });
  fetchData();
}

async function createProduct() {
  await fetch(API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: createTitle.value,
      price: createPrice.value,
      description: createDesc.value,
      categoryId: 1,
      images: ["https://placeimg.com/640/480/any"]
    })
  });
  fetchData();
}

fetchData();
