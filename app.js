// ===== Mock Data =====
const MOCK_PRODUCTS = [
  {
    id: 1,
    name: "Wireless Mouse",
    sku: "WM-001",
    category: "Electronics",
    price: 29.99,
    quantity: 45,
    description: "Ergonomic wireless mouse with USB receiver.",
    image: null,
  },
  {
    id: 2,
    name: "Cotton T-Shirt",
    sku: "CT-010",
    category: "Clothing",
    price: 15.0,
    quantity: 120,
    description: "100% cotton, available in multiple colors.",
    image: null,
  },
  {
    id: 3,
    name: "Organic Coffee Beans",
    sku: "OC-200",
    category: "Food",
    price: 12.49,
    quantity: 0,
    description: "Fair-trade organic whole beans, 1 lb bag.",
    image: null,
  },
  {
    id: 4,
    name: "Yoga Mat",
    sku: "YM-055",
    category: "Sports",
    price: 34.99,
    quantity: 3,
    description: "Non-slip, 6mm thick, eco-friendly material.",
    image: null,
  },
  {
    id: 5,
    name: "Desk Lamp",
    sku: "DL-300",
    category: "Home",
    price: 42.0,
    quantity: 18,
    description: "LED desk lamp with adjustable brightness.",
    image: null,
  },
];

// ===== State =====
let products = [];
let nextId = 100;
let editingId = null;
let currentImageData = null;

// ===== DOM References =====
const $ = (id) => document.getElementById(id);
const loginSection   = $("loginSection");
const appSection     = $("appSection");
const loginForm      = $("loginForm");
const emailInput     = $("email");
const passwordInput  = $("password");
const loginError     = $("loginError");
const logoutBtn      = $("logoutBtn");
const productForm    = $("productForm");
const productIdField = $("productId");
const nameInput      = $("name");
const skuInput       = $("sku");
const categoryInput  = $("category");
const priceInput     = $("price");
const quantityInput  = $("quantity");
const descInput      = $("description");
const imageFileInput = $("imageFile");
const searchInput    = $("searchInput");
const tableBody      = $("productsTableBody");
const cardsContainer = $("productsCards");
const saveBtn        = $("saveBtn");
const cancelEditBtn  = $("cancelEditBtn");
const statusMessage  = $("statusMessage");
const formTitle      = $("formTitle");
const loadingState   = $("loadingState");
const emptyState     = $("emptyState");
const imagePreview   = $("imagePreview");
const previewImg     = $("previewImg");
const removeImageBtn = $("removeImage");
const productsTable  = $("productsTable");

// ===== Utility =====
function showStatus(msg, type = "success") {
  statusMessage.textContent = msg;
  statusMessage.className = "status-message " + type;
  statusMessage.hidden = false;
  setTimeout(() => {
    statusMessage.hidden = true;
  }, 3000);
}

function qtyBadge(qty) {
  if (qty === 0) return "qty-out";
  if (qty <= 5) return "qty-low";
  return "qty-ok";
}

function placeholderImg() {
  return "data:image/svg+xml," + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" fill="#d1d5db" viewBox="0 0 24 24">' +
    '<rect width="24" height="24" rx="4" fill="#f3f4f6"/>' +
    '<path d="M4 16l4-4 3 3 4-5 5 6H4z" fill="#d1d5db"/>' +
    '<circle cx="8" cy="8" r="2" fill="#d1d5db"/></svg>'
  );
}

// ===== Login =====
loginForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const email = emailInput.value.trim();
  const pass = passwordInput.value;

  if (!email || !pass) {
    loginError.textContent = "Please fill in both fields.";
    loginError.hidden = false;
    return;
  }

  // Mock validation: accept any email/password with basic format
  if (!email.includes("@")) {
    loginError.textContent = "Please enter a valid email.";
    loginError.hidden = false;
    return;
  }

  loginError.hidden = true;
  loginSection.hidden = true;
  appSection.hidden = false;
  loadProducts();
});

logoutBtn.addEventListener("click", () => {
  appSection.hidden = true;
  loginSection.hidden = false;
  loginForm.reset();
  loginError.hidden = true;
});

// ===== Load Products (simulated async) =====
function loadProducts() {
  loadingState.hidden = false;
  emptyState.hidden = true;
  productsTable.style.display = "none";
  cardsContainer.style.display = "none";

  setTimeout(() => {
    products = JSON.parse(JSON.stringify(MOCK_PRODUCTS));
    nextId = Math.max(...products.map((p) => p.id)) + 1;
    loadingState.hidden = true;
    renderProducts(products);
  }, 800);
}

// ===== Render =====
function renderProducts(list) {
  // Table body
  tableBody.innerHTML = "";
  cardsContainer.innerHTML = "";

  if (list.length === 0) {
    emptyState.hidden = false;
    productsTable.style.display = "none";
    cardsContainer.style.display = "none";
    return;
  }

  emptyState.hidden = true;

  // Re-show correct view based on viewport
  const isDesktop = window.matchMedia("(min-width: 900px)").matches;
  productsTable.style.display = isDesktop ? "table" : "none";
  cardsContainer.style.display = isDesktop ? "none" : "flex";

  list.forEach((p) => {
    const imgSrc = p.image || placeholderImg();

    // Table row
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><img class="product-thumb" src="${imgSrc}" alt="${esc(p.name)}"></td>
      <td><strong>${esc(p.name)}</strong></td>
      <td>${esc(p.sku)}</td>
      <td>${esc(p.category)}</td>
      <td>$${p.price.toFixed(2)}</td>
      <td><span class="qty-badge ${qtyBadge(p.quantity)}">${p.quantity}</span></td>
      <td>
        <div class="actions-cell">
          <button class="btn btn-sm btn-outline btn-icon" title="Edit" onclick="editProduct(${p.id})">✏️</button>
          <button class="btn btn-sm btn-danger btn-icon" title="Delete" onclick="deleteProduct(${p.id})">🗑️</button>
          <button class="btn btn-sm btn-outline btn-icon" title="+1 Stock" onclick="adjustStock(${p.id}, 1)">➕</button>
          <button class="btn btn-sm btn-outline btn-icon" title="-1 Stock" onclick="adjustStock(${p.id}, -1)">➖</button>
        </div>
      </td>`;
    tableBody.appendChild(tr);

    // Card
    const card = document.createElement("div");
    card.className = "product-card";
    card.innerHTML = `
      <img class="card-thumb" src="${imgSrc}" alt="${esc(p.name)}">
      <div class="card-info">
        <h3>${esc(p.name)}</h3>
        <div class="card-meta">${esc(p.sku)} · ${esc(p.category)} · $${p.price.toFixed(2)}</div>
        <span class="qty-badge ${qtyBadge(p.quantity)}">Qty: ${p.quantity}</span>
        <div class="card-actions">
          <button class="btn btn-sm btn-outline" onclick="editProduct(${p.id})">Edit</button>
          <button class="btn btn-sm btn-danger" onclick="deleteProduct(${p.id})">Delete</button>
          <button class="btn btn-sm btn-outline btn-icon" onclick="adjustStock(${p.id}, 1)">➕</button>
          <button class="btn btn-sm btn-outline btn-icon" onclick="adjustStock(${p.id}, -1)">➖</button>
        </div>
      </div>`;
    cardsContainer.appendChild(card);
  });
}

function esc(str) {
  const d = document.createElement("div");
  d.textContent = str;
  return d.innerHTML;
}

// ===== Fill / Clear Form =====
function fillForm(product) {
  editingId = product.id;
  productIdField.value = product.id;
  nameInput.value = product.name;
  skuInput.value = product.sku;
  categoryInput.value = product.category;
  priceInput.value = product.price;
  quantityInput.value = product.quantity;
  descInput.value = product.description || "";
  currentImageData = product.image || null;

  if (currentImageData) {
    previewImg.src = currentImageData;
    imagePreview.hidden = false;
  } else {
    imagePreview.hidden = true;
  }

  formTitle.textContent = "Edit Product";
  saveBtn.textContent = "Update Product";
  cancelEditBtn.hidden = false;
  nameInput.focus();
}

function clearForm() {
  editingId = null;
  productForm.reset();
  productIdField.value = "";
  currentImageData = null;
  imagePreview.hidden = true;
  formTitle.textContent = "Add Product";
  saveBtn.textContent = "Save Product";
  cancelEditBtn.hidden = true;
}

// ===== Image Preview =====
imageFileInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  if (!file.type.startsWith("image/")) {
    showStatus("Please select an image file.", "error");
    imageFileInput.value = "";
    return;
  }

  const reader = new FileReader();
  reader.onload = (ev) => {
    currentImageData = ev.target.result;
    previewImg.src = currentImageData;
    imagePreview.hidden = false;
  };
  reader.readAsDataURL(file);
});

removeImageBtn.addEventListener("click", () => {
  currentImageData = null;
  imageFileInput.value = "";
  imagePreview.hidden = true;
});

// ===== Save Product =====
productForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const name = nameInput.value.trim();
  const sku = skuInput.value.trim();
  const category = categoryInput.value;
  const price = parseFloat(priceInput.value);
  const quantity = parseInt(quantityInput.value, 10);
  const description = descInput.value.trim();

  if (!name || !sku || !category || isNaN(price) || isNaN(quantity)) {
    showStatus("Please fill in all required fields.", "error");
    return;
  }

  if (editingId !== null) {
    // Update existing
    const idx = products.findIndex((p) => p.id === editingId);
    if (idx !== -1) {
      products[idx] = {
        ...products[idx],
        name,
        sku,
        category,
        price,
        quantity,
        description,
        image: currentImageData,
      };
      showStatus(`"${name}" updated successfully.`, "success");
    }
  } else {
    // Add new
    products.push({
      id: nextId++,
      name,
      sku,
      category,
      price,
      quantity,
      description,
      image: currentImageData,
    });
    showStatus(`"${name}" added successfully.`, "success");
  }

  clearForm();
  renderFiltered();
});

cancelEditBtn.addEventListener("click", clearForm);

// ===== Edit / Delete / Stock =====
function editProduct(id) {
  const product = products.find((p) => p.id === id);
  if (product) fillForm(product);
}

function deleteProduct(id) {
  const product = products.find((p) => p.id === id);
  if (!product) return;
  if (!confirm(`Delete "${product.name}"?`)) return;

  products = products.filter((p) => p.id !== id);
  if (editingId === id) clearForm();
  showStatus(`"${product.name}" deleted.`, "info");
  renderFiltered();
}

function adjustStock(id, delta) {
  const product = products.find((p) => p.id === id);
  if (!product) return;

  const newQty = product.quantity + delta;
  if (newQty < 0) {
    showStatus("Stock cannot be negative.", "error");
    return;
  }

  product.quantity = newQty;
  showStatus(`"${product.name}" stock → ${newQty}`, "success");
  renderFiltered();
}

// ===== Search =====
searchInput.addEventListener("input", renderFiltered);

function renderFiltered() {
  const q = searchInput.value.trim().toLowerCase();
  if (!q) {
    renderProducts(products);
    return;
  }
  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
  );
  renderProducts(filtered);
}

// ===== Responsive: re-render on resize =====
window.addEventListener("resize", () => {
  renderFiltered();
});
