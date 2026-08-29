const state = { products: [], category: "All" };

const grid = document.getElementById("productGrid");
const filters = document.getElementById("filters");
const modal = document.getElementById("productModal");
const pageLimit = Number(document.body.dataset.productLimit || 12);
const fallbackImage = "/assets/food-fallback.svg";

function money(n) { return `₹${Number(n).toLocaleString("en-IN")}`; }
function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[c]));}
function escapeAttr(s){return escapeHtml(s);}

function safeImage(img, label) {
  return `<img src="${escapeAttr(img || fallbackImage)}" alt="${escapeAttr(label)}" loading="lazy" decoding="async" onerror="this.onerror=null;this.src='${fallbackImage}'">`;
}

async function loadProducts() {
  if (!grid) return;
  try {
    const res = await fetch("/api/products", { headers: { Accept: "application/json" } });
    const data = await res.json();
    if (!res.ok || !data.ok) throw new Error(data.message || "Unable to load menu");
    state.products = Array.isArray(data.products) ? data.products : [];
    renderFilters();
    renderProducts();
  } catch (err) {
    console.error(err);
    grid.innerHTML = `<div class="loading-state"><strong>Menu is temporarily unavailable.</strong><span>Please call Gokul Sweets & Restaurant for today's availability.</span></div>`;
  }
}

function renderFilters() {
  if (!filters) return;
  const cats = ["All", ...new Set(state.products.map(p => p.category).filter(Boolean))];
  filters.innerHTML = cats.map(c => `<button class="filter ${c===state.category?"active":""}" type="button" data-cat="${escapeAttr(c)}">${escapeHtml(c)}</button>`).join("");
  filters.querySelectorAll(".filter").forEach(btn => btn.addEventListener("click", () => {
    state.category = btn.dataset.cat;
    renderFilters();
    renderProducts();
  }));
}

function renderProducts() {
  if (!grid) return;
  const filtered = state.products.filter(p => state.category === "All" || p.category === state.category);
  const items = filtered.slice(0, pageLimit);
  if (!items.length) {
    grid.innerHTML = `<div class="loading-state"><strong>No products in this category yet.</strong><span>Please check another category.</span></div>`;
    return;
  }

  grid.innerHTML = items.map(p => `
    <article class="product-card reveal" tabindex="0" role="button" data-id="${escapeAttr(p.id)}" aria-label="View details for ${escapeAttr(p.name)}">
      <div class="product-image-wrap">
        ${safeImage(p.image, p.name)}
        ${p.featured ? '<span class="badge">Featured</span>' : ''}
        ${Number(p.stockQuantity) <= 0 ? '<span class="stock-badge">Out of stock</span>' : ''}
      </div>
      <div class="product-body">
        <div class="eyebrow">${escapeHtml(p.category)}</div>
        <h3>${escapeHtml(p.name)}</h3>
        <p>${escapeHtml(p.description)}</p>
        <div class="product-bottom"><span class="price">${money(p.price)}${p.originalPrice ? `<span class="old">${money(p.originalPrice)}</span>` : ""}</span><span class="unit">${escapeHtml(p.unit)}</span></div>
      </div>
    </article>`).join("");

  grid.querySelectorAll(".product-card").forEach(card => {
    const open = () => openProduct(card.dataset.id);
    card.addEventListener("click", open);
    card.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); }});
  });
}

function openProduct(id) {
  const p = state.products.find(x => x.id === id);
  if (!p || !modal) return;
  const modalImage = document.getElementById("modalImage");
  modalImage.src = p.image || fallbackImage;
  modalImage.onerror = () => { modalImage.onerror = null; modalImage.src = fallbackImage; };
  modalImage.alt = p.name;
  document.getElementById("modalCategory").textContent = p.category;
  document.getElementById("modalName").textContent = p.name;
  document.getElementById("modalDescription").textContent = p.description;
  document.getElementById("modalPrice").innerHTML = `${money(p.price)}${p.originalPrice ? `<span class="old">${money(p.originalPrice)}</span>` : ""}`;
  document.getElementById("modalMeta").textContent = `${p.unit} • ${p.stockQuantity > 0 ? "Available today" : "Currently unavailable"}`;
  modal.classList.add("open");
  modal.setAttribute("aria-hidden","false");
  document.body.classList.add("modal-open");
}

function closeModal(){
  if (!modal) return;
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden","true");
  document.body.classList.remove("modal-open");
}

document.querySelectorAll("[data-close-modal]").forEach(x => x.addEventListener("click", closeModal));
document.addEventListener("keydown", e => { if (e.key === "Escape") closeModal(); });

const menuToggle = document.getElementById("menuToggle");
const mobileNav = document.getElementById("mobileNav");
if (menuToggle && mobileNav) {
  menuToggle.addEventListener("click", () => {
    const open = mobileNav.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(open));
  });
  mobileNav.querySelectorAll("a").forEach(a => a.addEventListener("click", () => {
    mobileNav.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
  }));
}

function updateThemeButton() {
  const btn = document.getElementById("themeToggle");
  if (!btn) return;
  const dark = document.documentElement.classList.contains("dark");
  btn.innerHTML = dark
    ? '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.6 15.3A8.5 8.5 0 0 1 8.7 3.4 8.5 8.5 0 1 0 20.6 15.3Z"/></svg>'
    : '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>';
  btn.setAttribute("aria-label", dark ? "Switch to light theme" : "Switch to dark theme");
  btn.setAttribute("title", dark ? "Light theme" : "Dark theme");
  btn.setAttribute("aria-pressed", String(dark));
}

const savedTheme = localStorage.getItem("gokul-theme");
if (savedTheme === "dark") document.documentElement.classList.add("dark");
updateThemeButton();
const themeToggle = document.getElementById("themeToggle");
if (themeToggle) themeToggle.addEventListener("click", () => {
  const dark = document.documentElement.classList.toggle("dark");
  localStorage.setItem("gokul-theme", dark ? "dark" : "light");
  updateThemeButton();
});

loadProducts();
