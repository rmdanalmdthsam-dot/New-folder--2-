/**
 * Engineer Hossam Ramadan — Store Homepage Logic
 * Search, filter, cart, product modal, hero carousel
 */
(function () {
  "use strict";

  let cart = JSON.parse(localStorage.getItem("hrm-cart") || "[]");
  let currentCategory = "all";
  let currentSort = "featured";
  let heroIndex = 0;
  let heroTimer;

  const HERO_SLIDES = [
    {
      title: "Precision Engineering Supplies",
      subtitle: "Industrial-grade tools, sensors & lab equipment — trusted by engineers worldwide",
      cta: "Shop Now",
    },
    {
      title: "HRM Prime — Free Fast Delivery",
      subtitle: "Free shipping on orders over $49. Same-day dispatch on in-stock items.",
      cta: "Explore Prime Deals",
    },
    {
      title: "B2B Bulk Orders — Save Up to 22%",
      subtitle: "Volume pricing for companies. Submit purchase orders online.",
      cta: "Company Orders",
      link: "company-orders.html",
    },
  ];

  const PRODUCT_ICONS = {
    multimeter: "📟",
    rpi: "🖥️",
    caliper: "📏",
    plc: "🔲",
    dmm: "⚡",
    pipette: "🧪",
    carbon: "🧱",
    goggles: "🥽",
    matlab: "📊",
    probe: "📡",
    solder: "🔥",
    arduino: "🔌",
  };

  const CAT_ICONS = {
    electronics: "🔌",
    tools: "🔧",
    lab: "🔬",
    automation: "🤖",
    materials: "⚗️",
    safety: "🦺",
    software: "💻",
  };

  document.addEventListener("DOMContentLoaded", init);

  function init() {
    renderHero();
    renderCategoryPanels();
    renderProducts(getFilteredProducts());
    updateCartCount();
    bindEvents();
    startHeroAuto();
  }

  /* ===== Hero Carousel ===== */
  function renderHero() {
    const container = document.getElementById("hero-slides");
    const dots = document.getElementById("hero-dots");
    if (!container) return;

    container.innerHTML = HERO_SLIDES.map(
      (slide, i) => `
      <div class="hero__slide hero__slide--${i + 1}${i === 0 ? " active" : ""}" data-index="${i}">
        <div class="hero__content">
          <h2>${slide.title}</h2>
          <p>${slide.subtitle}</p>
          <a href="${slide.link || "#products"}" class="hero__btn">${slide.cta}</a>
        </div>
      </div>`
    ).join("");

    dots.innerHTML = HERO_SLIDES.map(
      (_, i) => `<button class="hero__dot${i === 0 ? " active" : ""}" data-index="${i}" aria-label="Slide ${i + 1}"></button>`
    ).join("");
  }

  function goToSlide(index) {
    heroIndex = index;
    document.querySelectorAll(".hero__slide").forEach((s, i) => s.classList.toggle("active", i === index));
    document.querySelectorAll(".hero__dot").forEach((d, i) => d.classList.toggle("active", i === index));
  }

  function startHeroAuto() {
    heroTimer = setInterval(() => goToSlide((heroIndex + 1) % HERO_SLIDES.length), 5000);
  }

  /* ===== Category Panels ===== */
  function renderCategoryPanels() {
    const grid = document.getElementById("category-panels");
    if (!grid) return;

    const topCats = CATEGORIES.filter((c) => c.id !== "all").slice(0, 4);
    grid.innerHTML = topCats
      .map(
        (cat) => `
      <div class="panel">
        <h3 class="panel__title">${cat.name}</h3>
        <div class="cat-grid">
          ${PRODUCTS.filter((p) => p.category === cat.id)
            .slice(0, 4)
            .map(
              (p) => `
            <div class="cat-card" data-category="${cat.id}" data-product="${p.id}">
              <div class="cat-card__img product-img product-img--${p.image}">${PRODUCT_ICONS[p.image] || "📦"}</div>
              <div class="cat-card__name">${truncate(p.name, 40)}</div>
            </div>`
            )
            .join("")}
        </div>
        <a href="#" class="panel__link" data-category="${cat.id}">See more</a>
      </div>`
      )
      .join("");
  }

  /* ===== Products Grid ===== */
  function getFilteredProducts() {
    let list = [...PRODUCTS];

    if (currentCategory !== "all") {
      list = list.filter((p) => p.category === currentCategory);
    }

    const query = (document.getElementById("search-input")?.value || "").toLowerCase().trim();
    if (query) {
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query) ||
          Object.values(p.specs).some((v) => v.toLowerCase().includes(query))
      );
    }

    switch (currentSort) {
      case "price-low":
        list.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        list.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        list.sort((a, b) => b.rating - a.rating);
        break;
      case "reviews":
        list.sort((a, b) => b.reviews - a.reviews);
        break;
    }

    return list;
  }

  function renderProducts(products) {
    const grid = document.getElementById("products-grid");
    const count = document.getElementById("product-count");
    if (!grid) return;

    count.textContent = `${products.length} results`;

    if (products.length === 0) {
      grid.innerHTML = `<div class="panel" style="grid-column:1/-1;text-align:center;padding:40px;">
        <p style="font-size:18px;margin-bottom:8px;">No products found</p>
        <p style="color:var(--amz-text-muted);">Try adjusting your search or filters</p>
      </div>`;
      return;
    }

    grid.innerHTML = products.map((p) => renderProductCard(p)).join("");
  }

  function renderProductCard(p) {
    const [dollars, cents] = p.price.toFixed(2).split(".");
    const stars = renderStars(p.rating);

    return `
      <article class="product-card" data-id="${p.id}">
        ${p.badge ? `<span class="product-card__badge">${p.badge}</span>` : ""}
        <div class="product-card__image-wrap" data-action="view" data-id="${p.id}">
          <div class="product-img product-img--${p.image}">${PRODUCT_ICONS[p.image] || "📦"}</div>
        </div>
        <h3 class="product-card__title" data-action="view" data-id="${p.id}">${p.name}</h3>
        <div class="product-card__rating">
          <span class="stars">${stars}</span>
          <a href="#" class="product-card__reviews">${p.reviews.toLocaleString()}</a>
        </div>
        <div class="product-card__price">
          <span class="product-card__price-current">${STORE_CONFIG.currencySymbol}${dollars}<sup>${cents}</sup></span>
          ${p.originalPrice ? `<span class="product-card__price-original">${STORE_CONFIG.currencySymbol}${p.originalPrice.toFixed(2)}</span>` : ""}
        </div>
        ${p.prime ? `<div class="product-card__prime"><span class="product-card__prime-icon">Prime</span> FREE delivery</div>` : ""}
        <p class="product-card__delivery">Get it by ${getDeliveryDate()}</p>
        <button class="btn-add-cart" data-action="cart" data-id="${p.id}">Add to Cart</button>
      </article>`;
  }

  function renderStars(rating) {
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5;
    let html = "";
    for (let i = 0; i < 5; i++) {
      html += i < full ? "★" : i === full && half ? "★" : "☆";
    }
    return html;
  }

  function getDeliveryDate() {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  }

  /* ===== Product Modal ===== */
  function openProductModal(id) {
    const p = PRODUCTS.find((x) => x.id === id);
    if (!p) return;

    const [dollars, cents] = p.price.toFixed(2).split(".");
    const specsRows = Object.entries(p.specs)
      .map(([k, v]) => `<tr><td>${k}</td><td>${v}</td></tr>`)
      .join("");

    const overlay = document.createElement("div");
    overlay.className = "modal-overlay";
    overlay.id = "product-modal";
    overlay.innerHTML = `
      <div class="modal">
        <button class="modal__close" aria-label="Close">&times;</button>
        <div class="modal__body">
          <div class="modal__image">
            <div class="product-img product-img--${p.image}" style="height:100%;font-size:120px;">${PRODUCT_ICONS[p.image] || "📦"}</div>
          </div>
          <div class="modal__info">
            <h2>${p.name}</h2>
            <div class="product-card__rating" style="margin-bottom:12px;">
              <span class="stars">${renderStars(p.rating)}</span>
              <span class="product-card__reviews">${p.reviews.toLocaleString()} ratings</span>
            </div>
            <div class="modal__price">${STORE_CONFIG.currencySymbol}${dollars}<sup style="font-size:14px;">${cents}</sup></div>
            <p style="color:var(--amz-text-muted);margin-bottom:12px;">${p.description}</p>
            ${p.prime ? `<div class="product-card__prime"><span class="product-card__prime-icon">Prime</span> FREE delivery — Get it by ${getDeliveryDate()}</div>` : ""}
            <div class="modal__specs">
              <h3>Technical Specifications</h3>
              <table class="specs-table">${specsRows}</table>
            </div>
            <div class="modal__actions">
              <button class="btn-primary" data-action="cart" data-id="${p.id}">Add to Cart</button>
              <button class="btn-secondary modal__close-btn">Close</button>
            </div>
          </div>
        </div>
      </div>`;

    document.body.appendChild(overlay);
    document.body.style.overflow = "hidden";

    overlay.querySelector(".modal__close").addEventListener("click", closeModal);
    overlay.querySelector(".modal__close-btn").addEventListener("click", closeModal);
    overlay.addEventListener("click", (e) => { if (e.target === overlay) closeModal(); });
    overlay.querySelector('[data-action="cart"]').addEventListener("click", () => {
      addToCart(p.id);
      closeModal();
    });
  }

  function closeModal() {
    document.getElementById("product-modal")?.remove();
    document.body.style.overflow = "";
  }

  /* ===== Cart ===== */
  function addToCart(id) {
    const existing = cart.find((c) => c.id === id);
    if (existing) existing.qty++;
    else cart.push({ id, qty: 1 });
    localStorage.setItem("hrm-cart", JSON.stringify(cart));
    updateCartCount();
    showToast("Added to cart ✓");
  }

  function updateCartCount() {
    const el = document.getElementById("cart-count");
    if (el) el.textContent = cart.reduce((s, c) => s + c.qty, 0);
  }

  function showToast(msg) {
    document.querySelector(".toast")?.remove();
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2500);
  }

  /* ===== Events ===== */
  function bindEvents() {
    document.getElementById("search-input")?.addEventListener("input", debounce(() => {
      renderProducts(getFilteredProducts());
    }, 300));

    document.getElementById("search-btn")?.addEventListener("click", () => {
      renderProducts(getFilteredProducts());
    });

    document.getElementById("sort-select")?.addEventListener("change", (e) => {
      currentSort = e.target.value;
      renderProducts(getFilteredProducts());
    });

    document.getElementById("category-select")?.addEventListener("change", (e) => {
      currentCategory = e.target.value;
      renderProducts(getFilteredProducts());
    });

    document.querySelectorAll(".subnav__link[data-category]").forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        currentCategory = link.dataset.category;
        document.getElementById("category-select").value = currentCategory;
        document.querySelectorAll(".subnav__link").forEach((l) => l.classList.remove("active"));
        link.classList.add("active");
        renderProducts(getFilteredProducts());
        document.getElementById("products")?.scrollIntoView({ behavior: "smooth" });
      });
    });

    document.getElementById("hero-dots")?.addEventListener("click", (e) => {
      const dot = e.target.closest(".hero__dot");
      if (dot) {
        clearInterval(heroTimer);
        goToSlide(+dot.dataset.index);
        startHeroAuto();
      }
    });

    document.getElementById("products-grid")?.addEventListener("click", (e) => {
      const el = e.target.closest("[data-action]");
      if (!el) return;
      e.preventDefault();
      if (el.dataset.action === "view") openProductModal(el.dataset.id);
      if (el.dataset.action === "cart") addToCart(el.dataset.id);
    });

    document.getElementById("category-panels")?.addEventListener("click", (e) => {
      const card = e.target.closest(".cat-card");
      const link = e.target.closest(".panel__link");
      if (card?.dataset.product) {
        openProductModal(card.dataset.product);
      } else if (card?.dataset.category || link?.dataset.category) {
        currentCategory = (card || link).dataset.category;
        document.getElementById("category-select").value = currentCategory;
        renderProducts(getFilteredProducts());
        document.getElementById("products")?.scrollIntoView({ behavior: "smooth" });
      }
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeModal();
    });
  }

  function truncate(str, len) {
    return str.length > len ? str.slice(0, len) + "…" : str;
  }

  function debounce(fn, delay) {
    let t;
    return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), delay); };
  }
})();
