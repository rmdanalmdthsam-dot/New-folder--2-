/**
 * Engineer Hossam Ramadan — Company Orders (B2B) Page Logic
 * Bulk ordering, purchase orders, order tracking
 */
(function () {
  "use strict";

  let bulkItems = [{ productId: "", qty: 1 }];
  let currentTier = BULK_TIERS[0];

  document.addEventListener("DOMContentLoaded", init);

  function init() {
    renderOrdersTable();
    renderPricingTiers();
    renderBulkForm();
    bindEvents();
    updateSummary();
  }

  /* ===== Orders Table ===== */
  function renderOrdersTable() {
    const tbody = document.getElementById("orders-tbody");
    if (!tbody) return;

    tbody.innerHTML = SAMPLE_ORDERS.map((order) => {
      const statusClass = {
        Delivered: "delivered",
        "In Transit": "transit",
        Processing: "processing",
        Cancelled: "cancelled",
      }[order.status] || "processing";

      return `
        <tr>
          <td><strong>${order.id}</strong></td>
          <td>${order.company}</td>
          <td>${order.contact}</td>
          <td>${formatDate(order.date)}</td>
          <td>${order.items}</td>
          <td>${STORE_CONFIG.currencySymbol}${order.total.toLocaleString("en-US", { minimumFractionDigits: 2 })}</td>
          <td><span class="status-badge status-badge--${statusClass}">${order.status}</span></td>
          <td><a href="#" data-order="${order.id}">View</a></td>
        </tr>`;
    }).join("");
  }

  /* ===== Pricing Tiers ===== */
  function renderPricingTiers() {
    const container = document.getElementById("pricing-tiers");
    if (!container) return;

    container.innerHTML = BULK_TIERS.map((tier, i) => {
      const maxLabel = tier.max === Infinity ? "+" : `–${tier.max}`;
      return `
        <div class="tier-card${i === 0 ? " active" : ""}" data-tier="${i}">
          <div class="tier-card__qty">${tier.min}${maxLabel} units</div>
          <div class="tier-card__label">${tier.label}</div>
          <div class="tier-card__discount">${tier.discount ? (tier.discount * 100) + "%" : "—"}</div>
        </div>`;
    }).join("");
  }

  /* ===== Bulk Order Form ===== */
  function renderBulkForm() {
    const container = document.getElementById("bulk-items");
    if (!container) return;

    container.innerHTML = bulkItems
      .map((item, i) => {
        const options = PRODUCTS.map(
          (p) => `<option value="${p.id}"${p.id === item.productId ? " selected" : ""}>${p.name} — ${STORE_CONFIG.currencySymbol}${p.price.toFixed(2)}</option>`
        ).join("");

        return `
          <div class="bulk-product-row" data-row="${i}">
            <select class="bulk-product-select" data-row="${i}">
              <option value="">Select product...</option>
              ${options}
            </select>
            <input type="number" class="bulk-qty" data-row="${i}" value="${item.qty}" min="1" max="9999" placeholder="Qty">
            <span class="bulk-line-total" data-row="${i}">${STORE_CONFIG.currencySymbol}0.00</span>
            ${bulkItems.length > 1 ? `<button type="button" class="btn-remove-row" data-row="${i}">&times;</button>` : "<span></span>"}
          </div>`;
      })
      .join("");
  }

  function getTotalQty() {
    return bulkItems.reduce((sum, item) => sum + (item.qty || 0), 0);
  }

  function getActiveTier() {
    const qty = getTotalQty();
    return BULK_TIERS.find((t) => qty >= t.min && qty <= t.max) || BULK_TIERS[0];
  }

  function updateSummary() {
    currentTier = getActiveTier();

    document.querySelectorAll(".tier-card").forEach((card, i) => {
      card.classList.toggle("active", BULK_TIERS[i] === currentTier);
    });

    let subtotal = 0;
    bulkItems.forEach((item, i) => {
      const product = PRODUCTS.find((p) => p.id === item.productId);
      const lineTotal = product ? product.price * item.qty : 0;
      subtotal += lineTotal;

      const el = document.querySelector(`.bulk-line-total[data-row="${i}"]`);
      if (el) el.textContent = STORE_CONFIG.currencySymbol + lineTotal.toFixed(2);
    });

    const discount = subtotal * currentTier.discount;
    const total = subtotal - discount;

    document.getElementById("summary-subtotal").textContent = STORE_CONFIG.currencySymbol + subtotal.toFixed(2);
    document.getElementById("summary-discount").textContent = currentTier.discount
      ? `-${STORE_CONFIG.currencySymbol}${discount.toFixed(2)} (${currentTier.label})`
      : STORE_CONFIG.currencySymbol + "0.00";
    document.getElementById("summary-total").textContent = STORE_CONFIG.currencySymbol + total.toFixed(2);
    document.getElementById("summary-tier").textContent = currentTier.label;
  }

  /* ===== Submit Order ===== */
  function submitOrder(e) {
    e.preventDefault();

    const company = document.getElementById("company-name").value.trim();
    const contact = document.getElementById("contact-name").value.trim();
    const email = document.getElementById("contact-email").value.trim();
    const po = document.getElementById("po-number").value.trim();

    if (!company || !contact || !email) {
      showToast("Please fill in all required fields", true);
      return;
    }

    const validItems = bulkItems.filter((item) => item.productId && item.qty > 0);
    if (validItems.length === 0) {
      showToast("Please add at least one product", true);
      return;
    }

    const orderId = "PO-2026-" + String(Math.floor(Math.random() * 90000) + 10000);
    let subtotal = 0;
    validItems.forEach((item) => {
      const p = PRODUCTS.find((x) => x.id === item.productId);
      if (p) subtotal += p.price * item.qty;
    });
    const total = subtotal * (1 - currentTier.discount);

    SAMPLE_ORDERS.unshift({
      id: orderId,
      company,
      date: new Date().toISOString().split("T")[0],
      status: "Processing",
      items: validItems.reduce((s, i) => s + i.qty, 0),
      total,
      contact,
    });

    renderOrdersTable();
    showToast(`Order ${orderId} submitted successfully!`);
    e.target.reset();
    bulkItems = [{ productId: "", qty: 1 }];
    renderBulkForm();
    updateSummary();

    document.getElementById("stat-orders").textContent = SAMPLE_ORDERS.length;
  }

  /* ===== Events ===== */
  function bindEvents() {
    document.getElementById("bulk-order-form")?.addEventListener("submit", submitOrder);

    document.getElementById("add-item-btn")?.addEventListener("click", () => {
      bulkItems.push({ productId: "", qty: 1 });
      renderBulkForm();
      bindBulkRowEvents();
    });

    bindBulkRowEvents();

    document.getElementById("orders-tbody")?.addEventListener("click", (e) => {
      e.preventDefault();
      const link = e.target.closest("[data-order]");
      if (link) showToast(`Order ${link.dataset.order} details — contact ${STORE_CONFIG.companyEmail}`);
    });
  }

  function bindBulkRowEvents() {
    document.querySelectorAll(".bulk-product-select").forEach((sel) => {
      sel.addEventListener("change", (e) => {
        bulkItems[+e.target.dataset.row].productId = e.target.value;
        updateSummary();
      });
    });

    document.querySelectorAll(".bulk-qty").forEach((input) => {
      input.addEventListener("input", (e) => {
        bulkItems[+e.target.dataset.row].qty = Math.max(1, parseInt(e.target.value) || 1);
        updateSummary();
      });
    });

    document.querySelectorAll(".btn-remove-row").forEach((btn) => {
      btn.addEventListener("click", () => {
        bulkItems.splice(+btn.dataset.row, 1);
        renderBulkForm();
        bindBulkRowEvents();
        updateSummary();
      });
    });
  }

  function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  }

  function showToast(msg, isError) {
    document.querySelector(".toast")?.remove();
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.style.background = isError ? "#991b1b" : "var(--amz-navy)";
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }
})();
