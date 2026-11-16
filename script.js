// AlarmLock NZ — Navigation, Product Filtering, Security Checklist & Booking Form

document.addEventListener("DOMContentLoaded", () => {
  // 1. Mobile Navigation Toggle
  const mobileToggle = document.getElementById("mobileToggle");
  const navMenu = document.getElementById("navMenu");

  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener("click", () => {
      navMenu.classList.toggle("open");
      const expanded = navMenu.classList.contains("open");
      mobileToggle.setAttribute("aria-expanded", expanded);
    });
  }

  // 2. Products Page: Category Filtering & Search
  const filterBtns = document.querySelectorAll(".filter-btn");
  const productCards = document.querySelectorAll(".product-item");
  const searchInput = document.getElementById("productSearch");
  const noResultsMsg = document.getElementById("noProductsFound");

  let activeCategory = "all";

  function filterProducts() {
    if (!productCards.length) return;
    const query = searchInput ? searchInput.value.trim().toLowerCase() : "";
    let visibleCount = 0;

    productCards.forEach((card) => {
      const category = card.getAttribute("data-category");
      const text = card.textContent.toLowerCase();
      const matchesCategory = activeCategory === "all" || category === activeCategory;
      const matchesSearch = !query || text.includes(query);

      if (matchesCategory && matchesSearch) {
        card.style.display = "flex";
        visibleCount++;
      } else {
        card.style.display = "none";
      }
    });

    if (noResultsMsg) {
      noResultsMsg.style.display = visibleCount === 0 ? "block" : "none";
    }
  }

  if (filterBtns.length) {
    filterBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        filterBtns.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        activeCategory = btn.getAttribute("data-filter");
        filterProducts();
      });
    });
  }

  if (searchInput) {
    searchInput.addEventListener("input", filterProducts);
  }

  // 3. About Page: Interactive Security Checklist Score
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

  // 4. Contact Page: Pre-fill Service/Product from URL query parameter
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

  // 5. Contact Form Submission Handler (Static-host friendly)
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
      const body = encodeURIComponent(`Name: ${name}
Phone: ${phone}
Service: ${service}

Details:
${msg}`);
      const mailtoLink = document.getElementById("mailtoFallback");
      if (mailtoLink) {
        mailtoLink.href = `mailto:info@alarmlock.co.nz?subject=${subject}&body=${body}`;
      }
    });
  }
});
