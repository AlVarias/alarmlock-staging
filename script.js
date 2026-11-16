document.addEventListener("DOMContentLoaded", () => {
  const mobileToggle = document.getElementById("mobileToggle");
  const navMenu = document.getElementById("navMenu");
  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener("click", () => {
      navMenu.classList.toggle("open");
      mobileToggle.setAttribute("aria-expanded", navMenu.classList.contains("open"));
    });
  }

  const CART_KEY = "alarmlock_nz_cart_v1";
  let cart = [];
  try { cart = JSON.parse(localStorage.getItem(CART_KEY)) || []; } catch (e) { cart = []; }

  function saveCart() {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    renderCartUI();
  }

  function formatNZD(amount) {
    return "$" + Number(amount).toFixed(2);
  }

  function addToCart(productId, optionLabel, unitPrice) {
    if (typeof ALARMLOCK_PRODUCTS === "undefined") return;
    const product = ALARMLOCK_PRODUCTS.find((p) => p.id === productId);
    if (!product) return;

    const cartKey = `${productId}::${optionLabel}`;
    const existing = cart.find((item) => item.key === cartKey);
    if (existing) {
      existing.qty += 1;
    } else {
      cart.push({
        key: cartKey,
        id: product.id,
        name: product.name,
        image: product.image,
        option: optionLabel,
        price: Number(unitPrice),
        qty: 1
      });
    }
    saveCart();
    openCartDrawer();
  }

  function updateCartQty(cartKey, delta) {
    const item = cart.find((i) => i.key === cartKey);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) cart = cart.filter((i) => i.key !== cartKey);
    saveCart();
  }

  function removeCartItem(cartKey) {
    cart = cart.filter((i) => i.key !== cartKey);
    saveCart();
  }

  const drawerHTML = `
    <div class="drawer-backdrop" id="cartBackdrop"></div>
    <aside class="cart-drawer" id="cartDrawer" aria-label="Shopping Cart">
      <div class="cart-header">
        <h3>Your Order Cart</h3>
        <button class="close-btn" id="closeCartBtn" aria-label="Close Cart">&times;</button>
      </div>
      <div class="cart-body" id="cartBody"></div>
      <div class="cart-footer" id="cartFooter">
        <div class="cart-total-row">
          <span>Estimated Total (NZD):</span>
          <span id="cartTotalAmount">$0.00</span>
        </div>
        <button class="btn btn-primary" id="proceedCheckoutBtn" style="width:100%;">Proceed to Order / Checkout</button>
      </div>
    </aside>
  `;
  document.body.insertAdjacentHTML("beforeend", drawerHTML);

  const cartDrawer = document.getElementById("cartDrawer");
  const cartBackdrop = document.getElementById("cartBackdrop");
  const openCartBtn = document.getElementById("openCartBtn");
  const closeCartBtn = document.getElementById("closeCartBtn");
  const cartBody = document.getElementById("cartBody");
  const cartFooter = document.getElementById("cartFooter");
  const cartTotalAmount = document.getElementById("cartTotalAmount");
  const proceedCheckoutBtn = document.getElementById("proceedCheckoutBtn");

  let checkoutMode = false;

  function openCartDrawer() {
    checkoutMode = false;
    renderCartUI();
    cartDrawer.classList.add("open");
    cartBackdrop.classList.add("open");
  }

  function closeCartDrawer() {
    cartDrawer.classList.remove("open");
    cartBackdrop.classList.remove("open");
  }

  if (openCartBtn) openCartBtn.addEventListener("click", openCartDrawer);
  if (closeCartBtn) closeCartBtn.addEventListener("click", closeCartDrawer);
  if (cartBackdrop) cartBackdrop.addEventListener("click", closeCartDrawer);

  if (proceedCheckoutBtn) {
    proceedCheckoutBtn.addEventListener("click", () => {
      checkoutMode = true;
      renderCartUI();
    });
  }

  function renderCartUI() {
    const totalCount = cart.reduce((sum, item) => sum + item.qty, 0);
    const totalPrice = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    document.querySelectorAll(".cart-badge").forEach((badge) => { badge.textContent = totalCount; });
    if (!cartBody) return;

    if (cart.length === 0) {
      cartBody.innerHTML = `
        <div style="text-align:center; padding:48px 16px;">
          <p style="font-weight:700; color:var(--gray-900); font-size:1.05rem; margin-bottom:8px;">Your cart is currently empty</p>
          <p style="color:var(--gray-600); font-size:0.9rem; margin-bottom:20px;">Browse our digital locks, deadbolts, transponder keys, and gate remotes.</p>
          <a href="products.html" class="btn btn-primary btn-sm">Shop Security Products</a>
        </div>
      `;
      if (cartFooter) cartFooter.style.display = "none";
      return;
    }

    if (checkoutMode) {
      if (cartFooter) cartFooter.style.display = "none";
      const itemsSummary = cart
        .map((i) => `- ${i.qty}x ${i.name} (${i.option}) @ ${formatNZD(i.price)} = ${formatNZD(i.price * i.qty)}`)
        .join("\n");

      cartBody.innerHTML = `
        <div style="margin-bottom:14px;">
          <button type="button" id="backToCartBtn" style="background:none; border:none; color:var(--red-primary); font-weight:700; cursor:pointer;">&larr; Back to Cart Items</button>
        </div>
        <h4 style="font-size:1.1rem; color:var(--gray-900); margin-bottom:6px;">Complete Your Order Request</h4>
        <p style="font-size:0.86rem; color:var(--gray-600); margin-bottom:16px;">No upfront card charge — our East Tamaki team will confirm stock, installation time, and payment/invoice details.</p>
        <form id="drawerCheckoutForm">
          <div class="form-group"><label>Full Name *</label><input type="text" id="chkName" class="form-control" required placeholder="Your full name" /></div>
          <div class="form-group"><label>Phone Number *</label><input type="tel" id="chkPhone" class="form-control" required placeholder="e.g. 021 123 4567" /></div>
          <div class="form-group"><label>Email Address *</label><input type="email" id="chkEmail" class="form-control" required placeholder="you@example.co.nz" /></div>
          <div class="form-group">
            <label>Fulfillment Method *</label>
            <select id="chkMethod" class="form-control">
              <option value="East Tamaki Workshop Pickup (19 Ormiston Rd)">East Tamaki Workshop Pickup (Free)</option>
              <option value="Auckland / NZ Courier Delivery">Auckland / NZ Courier Delivery</option>
              <option value="Onsite Mobile Locksmith Installation (Auckland)">Onsite Mobile Locksmith Installation (Auckland)</option>
            </select>
          </div>
          <div class="form-group"><label>Suburb / Vehicle / Key Notes</label><textarea id="chkNotes" rows="2" class="form-control" placeholder="e.g. Suburb, door type, or car make/model..."></textarea></div>
          <div style="background:var(--off-white); padding:10px 12px; border-radius:8px; border:1px solid var(--gray-200); margin-bottom:14px; font-size:0.88rem;">
            <strong>Order Total (${totalCount} item${totalCount > 1 ? "s" : ""}):</strong> <span style="color:var(--red-primary); font-weight:800;">${formatNZD(totalPrice)} NZD</span>
          </div>
          <button type="submit" class="btn btn-primary" style="width:100%;">Submit Order &amp; Generate Summary</button>
        </form>
        <div id="checkoutResultBox" style="margin-top:14px;"></div>
      `;

      document.getElementById("backToCartBtn").addEventListener("click", () => {
        checkoutMode = false;
        renderCartUI();
      });

      document.getElementById("drawerCheckoutForm").addEventListener("submit", (e) => {
        e.preventDefault();
        const cName = document.getElementById("chkName").value.trim();
        const cPhone = document.getElementById("chkPhone").value.trim();
        const cEmail = document.getElementById("chkEmail").value.trim();
        const cMethod = document.getElementById("chkMethod").value;
        const cNotes = document.getElementById("chkNotes").value.trim();
        const orderRef = "AL-" + Math.floor(100000 + Math.random() * 900000);

        const fullOrderText =
          `AlarmLock NZ Order #${orderRef}\nCustomer: ${cName}\nPhone: ${cPhone}\nEmail: ${cEmail}\nFulfillment: ${cMethod}\nNotes: ${cNotes || "None"}\n\nItems:\n${itemsSummary}\n\nEstimated Total: ${formatNZD(totalPrice)} NZD`;

        const mailtoHref = `mailto:info@alarmlock.co.nz?subject=${encodeURIComponent(`New Website Order #${orderRef} - ${cName}`)}&body=${encodeURIComponent(fullOrderText)}`;

        document.getElementById("checkoutResultBox").innerHTML = `
          <div style="background:#ECFDF5; border:1px solid #10B981; color:#065F46; padding:14px; border-radius:8px; font-size:0.88rem;">
            <strong>Order Ready! Reference #${orderRef}</strong>
            <p style="margin:6px 0 10px;">Click below to send your order directly to AlarmLock or copy it to message our locksmith mobile (<strong>021 946 115</strong>).</p>
            <div style="display:flex; flex-direction:column; gap:8px;">
              <a href="${mailtoHref}" class="btn btn-primary btn-sm" style="text-align:center;">Send Order via Email App</a>
              <button type="button" id="copyOrderBtn" class="btn btn-outline btn-sm">Copy Order Summary</button>
            </div>
          </div>
        `;
        document.getElementById("copyOrderBtn").addEventListener("click", () => {
          navigator.clipboard.writeText(fullOrderText);
          document.getElementById("copyOrderBtn").textContent = "Copied to Clipboard ✓";
        });
        cart = [];
        localStorage.removeItem(CART_KEY);
        document.querySelectorAll(".cart-badge").forEach((b) => (b.textContent = "0"));
      });
      return;
    }

    if (cartFooter) cartFooter.style.display = "block";
    if (cartTotalAmount) cartTotalAmount.textContent = formatNZD(totalPrice) + " NZD";

    cartBody.innerHTML = cart
      .map((item) => `
        <div class="cart-item">
          <img src="${item.image}" alt="${item.name}" />
          <div class="cart-item-info">
            <div class="cart-item-title">${item.name}</div>
            <div class="cart-item-opt">${item.option} &bull; ${formatNZD(item.price)} each</div>
            <div class="cart-item-controls">
              <div class="qty-box">
                <button type="button" class="qty-btn" data-action="dec" data-key="${item.key}">-</button>
                <span class="qty-val">${item.qty}</span>
                <button type="button" class="qty-btn" data-action="inc" data-key="${item.key}">+</button>
              </div>
              <button type="button" class="remove-item-btn" data-action="rem" data-key="${item.key}">Remove</button>
            </div>
          </div>
        </div>
      `)
      .join("");

    cartBody.querySelectorAll("[data-action]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const key = btn.getAttribute("data-key");
        const act = btn.getAttribute("data-action");
        if (act === "inc") updateCartQty(key, 1);
        if (act === "dec") updateCartQty(key, -1);
        if (act === "rem") removeCartItem(key);
      });
    });
  }

  renderCartUI();

  const homeSpotlightAddBtn = document.getElementById("homeSpotlightAddBtn");
  if (homeSpotlightAddBtn) {
    homeSpotlightAddBtn.addEventListener("click", () => {
      addToCart("yale-3109", "Supply Only", 549.00);
    });
  }

  const productsGrid = document.getElementById("productsGrid");
  const filterBtns = document.querySelectorAll(".filter-btn");
  const searchInput = document.getElementById("productSearch");
  const noResultsMsg = document.getElementById("noProductsFound");
  let activeCategory = "all";

  if (productsGrid && typeof ALARMLOCK_PRODUCTS !== "undefined") {
    const modalHTML = `
      <div class="modal-backdrop" id="productModalBackdrop"></div>
      <div class="product-modal" id="productModal" role="dialog" aria-modal="true">
        <div id="productModalContent"></div>
      </div>
    `;
    document.body.insertAdjacentHTML("beforeend", modalHTML);

    const productModal = document.getElementById("productModal");
    const productModalBackdrop = document.getElementById("productModalBackdrop");
    const productModalContent = document.getElementById("productModalContent");

    function closeProductModal() {
      productModal.classList.remove("open");
      productModalBackdrop.classList.remove("open");
    }
    productModalBackdrop.addEventListener("click", closeProductModal);

    function openProductModal(product) {
      const hasInstall = product.installPrice && product.installPrice > 0;
      const specsList = product.specs.map((s) => `<li>${s}</li>`).join("");
      productModalContent.innerHTML = `
        <div class="modal-grid">
          <div style="background:var(--off-white); border:1px solid var(--gray-200); border-radius:12px; overflow:hidden; display:flex; align-items:center; justify-content:center;">
            <img src="${product.image}" alt="${product.name}" style="width:100%; height:auto; object-fit:cover;" />
          </div>
          <div>
            <div style="display:flex; justify-content:space-between; align-items:start; gap:10px;">
              <span class="product-tag">${product.categoryLabel}</span>
              <button type="button" id="closeModalX" style="background:var(--gray-100); border:none; width:32px; height:32px; border-radius:8px; font-size:1.2rem; cursor:pointer;">&times;</button>
            </div>
            <h2 style="font-size:1.45rem; color:var(--gray-900); margin:10px 0 8px;">${product.name}</h2>
            <p style="color:var(--gray-600); font-size:0.94rem; margin-bottom:14px;">${product.shortDesc}</p>
            <ul class="feature-list" style="grid-template-columns:1fr; margin:12px 0 18px;">${specsList}</ul>
            ${
              hasInstall
                ? `<div class="form-group">
                    <label>Purchase Option</label>
                    <select id="modalOptionSelect" class="form-control">
                      <option value="Supply Only|${product.price}">Supply Only — ${formatNZD(product.price)} NZD</option>
                      <option value="Supply + Auckland Install|${product.price + product.installPrice}">Supply + Auckland Install — ${formatNZD(product.price + product.installPrice)} NZD</option>
                    </select>
                  </div>`
                : `<p style="font-size:1.35rem; font-weight:800; color:var(--gray-900); margin-bottom:14px;">${formatNZD(product.price)} <small style="font-size:0.8rem; color:var(--gray-600);">NZD</small></p>`
            }
            <button type="button" id="modalAddCartBtn" class="btn btn-primary" style="width:100%;">Add to Order Cart</button>
          </div>
        </div>
      `;
      document.getElementById("closeModalX").addEventListener("click", closeProductModal);
      document.getElementById("modalAddCartBtn").addEventListener("click", () => {
        if (hasInstall) {
          const [optLabel, optPrice] = document.getElementById("modalOptionSelect").value.split("|");
          addToCart(product.id, optLabel, Number(optPrice));
        } else {
          addToCart(product.id, "Standard Supply", product.price);
        }
        closeProductModal();
      });
      productModal.classList.add("open");
      productModalBackdrop.classList.add("open");
    }

    function renderProductsGrid() {
      const query = searchInput ? searchInput.value.trim().toLowerCase() : "";
      const filtered = ALARMLOCK_PRODUCTS.filter((p) => {
        const matchCat = activeCategory === "all" || p.category === activeCategory;
        const matchText = !query || p.name.toLowerCase().includes(query) || p.shortDesc.toLowerCase().includes(query) || p.categoryLabel.toLowerCase().includes(query);
        return matchCat && matchText;
      });
      if (noResultsMsg) noResultsMsg.style.display = filtered.length === 0 ? "block" : "none";

      productsGrid.innerHTML = filtered
        .map((product) => {
          const hasInstall = product.installPrice && product.installPrice > 0;
          return `
            <article class="shop-card">
              <div class="shop-img-wrap" data-qv="${product.id}">
                <span class="shop-badge">${product.badge}</span>
                <img src="${product.image}" alt="${product.name}" loading="lazy" />
                <span class="quick-view-pill">Quick View &amp; Specs</span>
              </div>
              <div class="shop-body">
                <div class="shop-cat">${product.categoryLabel}</div>
                <h3 class="shop-title" data-qv="${product.id}">${product.name}</h3>
                <p class="shop-desc">${product.shortDesc}</p>
                ${
                  hasInstall
                    ? `<div class="shop-option-row">
                        <select class="shop-option-select" id="opt-${product.id}" aria-label="Select purchase option">
                          <option value="Supply Only|${product.price}">Supply Only — ${formatNZD(product.price)}</option>
                          <option value="Supply + Auckland Install|${product.price + product.installPrice}">Supply + Install — ${formatNZD(product.price + product.installPrice)}</option>
                        </select>
                      </div>`
                    : ""
                }
                <div class="shop-footer">
                  <div class="shop-price" id="price-display-${product.id}">
                    ${formatNZD(product.price)}
                    <small>NZD incl. GST</small>
                  </div>
                  <button type="button" class="btn btn-primary btn-sm add-cart-trigger" data-id="${product.id}">+ Add to Cart</button>
                </div>
              </div>
            </article>
          `;
        })
        .join("");

      filtered.forEach((product) => {
        if (product.installPrice && product.installPrice > 0) {
          const sel = document.getElementById(`opt-${product.id}`);
          const priceDisp = document.getElementById(`price-display-${product.id}`);
          if (sel && priceDisp) {
            sel.addEventListener("change", () => {
              const [, newPrice] = sel.value.split("|");
              priceDisp.innerHTML = `${formatNZD(newPrice)}<small>NZD incl. GST</small>`;
            });
          }
        }
      });

      productsGrid.querySelectorAll("[data-qv]").forEach((el) => {
        el.addEventListener("click", () => {
          const prod = ALARMLOCK_PRODUCTS.find((p) => p.id === el.getAttribute("data-qv"));
          if (prod) openProductModal(prod);
        });
      });

      productsGrid.querySelectorAll(".add-cart-trigger").forEach((btn) => {
        btn.addEventListener("click", () => {
          const id = btn.getAttribute("data-id");
          const prod = ALARMLOCK_PRODUCTS.find((p) => p.id === id);
          if (!prod) return;
          const sel = document.getElementById(`opt-${id}`);
          if (sel) {
            const [optLabel, optPrice] = sel.value.split("|");
            addToCart(id, optLabel, Number(optPrice));
          } else {
            addToCart(id, "Standard Supply", prod.price);
          }
          const origText = btn.textContent;
          btn.textContent = "Added ✓";
          setTimeout(() => { btn.textContent = origText; }, 900);
        });
      });
    }

    renderProductsGrid();
    if (filterBtns.length) {
      filterBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
          filterBtns.forEach((b) => b.classList.remove("active"));
          btn.classList.add("active");
          activeCategory = btn.getAttribute("data-filter");
          renderProductsGrid();
        });
      });
    }
    if (searchInput) searchInput.addEventListener("input", renderProductsGrid);
  }

  const checklistBoxes = document.querySelectorAll(".sec-check");
  const scoreDisplay = document.getElementById("securityScore");
  if (checklistBoxes.length && scoreDisplay) {
    const updateScore = () => {
      const checked = document.querySelectorAll(".sec-check:checked").length;
      scoreDisplay.textContent = `${checked} of ${checklistBoxes.length} Completed`;
    };
    checklistBoxes.forEach((cb) => cb.addEventListener("change", updateScore));
    updateScore();
  }

  const params = new URLSearchParams(window.location.search);
  const serviceParam = params.get("service");
  const serviceSelect = document.getElementById("serviceSelect");
  const messageField = document.getElementById("message");
  if (serviceParam && messageField) {
    messageField.value = `Hi AlarmLock team, I would like a quote / booking regarding: ${serviceParam}.`;
    if (serviceSelect) {
      for (const opt of serviceSelect.options) {
        if (serviceParam.toLowerCase().includes(opt.value.toLowerCase())) {
          serviceSelect.value = opt.value;
          break;
        }
      }
    }
  }

  const bookingForm = document.getElementById("bookingForm");
  const formSuccess = document.getElementById("formSuccess");
  if (bookingForm && formSuccess) {
    bookingForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = document.getElementById("fullName").value.trim();
      const phone = document.getElementById("phone").value.trim();
      const service = document.getElementById("serviceSelect").value;
      const msg = document.getElementById("message").value.trim();
      formSuccess.style.display = "block";
      formSuccess.innerHTML = `Thank you, <strong>${name}</strong>! Your enquiry for <strong>${service}</strong> is ready. For urgent locksmith assistance, call us immediately on <a href="tel:0800420420" style="text-decoration:underline;">0800 420 420</a> or <a href="tel:021946115" style="text-decoration:underline;">021 946 115</a>.`;
      const subject = encodeURIComponent(`AlarmLock Website Enquiry: ${service} - ${name}`);
      const body = encodeURIComponent(`Name: ${name}\nPhone: ${phone}\nService: ${service}\n\nDetails:\n${msg}`);
      const mailtoLink = document.getElementById("mailtoFallback");
      if (mailtoLink) mailtoLink.href = `mailto:info@alarmlock.co.nz?subject=${subject}&body=${body}`;
    });
  }
});
