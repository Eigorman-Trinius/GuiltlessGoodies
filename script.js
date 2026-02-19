// Simple JS for year + smooth scrolling
 
document.addEventListener("DOMContentLoaded", () => {
    // Cookie size pop-up logic
    const popup = document.getElementById("cookie-popup");
    const popupClose = document.getElementById("cookie-popup-close");
    const popupTitle = document.getElementById("popup-cookie-title");
    const selectSizeBtns = document.querySelectorAll(".select-size-btn");

    selectSizeBtns.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const card = btn.closest(".product-card");
        const cookieName = card.querySelector("h4").textContent;
        popupTitle.textContent = `Customize Your ${cookieName}`;
        popup.style.display = "block";
      });
    });

    if (popupClose) {
      popupClose.addEventListener("click", () => {
        popup.style.display = "none";
      });
    }

    // Optional: close popup when clicking outside content
    if (popup) {
      popup.addEventListener("click", (e) => {
        if (e.target === popup) {
          popup.style.display = "none";
        }
      });
    }

    const cartSection = document.getElementById("cart");
    const cartLink = document.getElementById("cart-link");
    const cartItems = document.getElementById("cart-items");
    const cartCloseBtn = document.getElementById("cart-close-btn");
    const cartModal = document.getElementById("cart-modal");
    const cartModalClose = document.getElementById("cart-modal-close");
    let cart = [];


    // Cart modal open/close
    if (cartLink) {
      cartLink.addEventListener("click", (e) => {
        e.preventDefault();
        if (cartModal) cartModal.style.display = "flex";
      });
    }
    if (cartCloseBtn) {
      cartCloseBtn.addEventListener("click", () => {
        if (cartSection) cartSection.style.display = "none";
      });
    }
    if (cartModalClose) {
      cartModalClose.addEventListener("click", () => {
        if (cartModal) cartModal.style.display = "none";
      });
    }

    // Professional cart logic
    function addToCart(product) {
      // Check if product already in cart (by name and options)
      const found = cart.find(item => item.name === product.name && item.size === product.size && item.blend === product.blend && item.binder === product.binder);
      if (found) {
        found.qty = parseInt(found.qty) + parseInt(product.qty);
      } else {
        cart.push({ ...product });
      }
      updateCartDisplay();
      localStorage.setItem("guiltlessOrder", JSON.stringify(cart));
    }

    function removeFromCart(idx) {
      cart.splice(idx, 1);
      updateCartDisplay();
      localStorage.setItem("guiltlessOrder", JSON.stringify(cart));
    }

    function changeQuantity(idx, delta) {
      cart[idx].qty = Math.max(1, parseInt(cart[idx].qty) + delta);
      updateCartDisplay();
      localStorage.setItem("guiltlessOrder", JSON.stringify(cart));
    }

    // Binder dynamic callout
    const binderSelect = document.getElementById("binder-type");
    const binderInfo = document.getElementById("binder-info");
    const binderDescriptions = {
      "vegan": "<strong>Vegan: Aquafaba Powder &amp; Refined Coconut Oil</strong><br>We swap two ingredients: aquafaba powder replaces eggs and refined coconut oil replaces butter. Fully plant-based, egg-free, and dairy-free with the same great texture.",
      "non-vegan": "<strong>Classic: Eggs &amp; Butter</strong><br>We use whole eggs and real butter for a rich, classic bakery structure with golden lift, that familiar chew, and the texture you know and love from a proper homemade cookie."
    };
    function updateBinderInfo() {
      if (binderInfo && binderSelect) {
        binderInfo.innerHTML = binderDescriptions[binderSelect.value] || "";
      }
    }
    if (binderSelect) {
      binderSelect.addEventListener("change", updateBinderInfo);
      updateBinderInfo(); // show on load
    }

    // Handle cookie options form submission
    const cookieOptionsForm = document.getElementById("cookie-options-form");
    if (cookieOptionsForm) {
      cookieOptionsForm.addEventListener("submit", function(e) {
        e.preventDefault();
        const size = document.getElementById("cookie-size").value;
        const blend = document.getElementById("flour-blend").value;
        const binder = document.getElementById("binder-type").value;
        const qty = document.getElementById("cookie-qty").value;
        const cookieName = popupTitle.textContent.replace("Customize Your ", "");
        addToCart({ name: cookieName, size, blend, binder, qty });
        popup.style.display = "none";
        window.location.href = window.ORDER_PATH || "order.html";
      });
    }

    function updateCartDisplay() {
      if (!cartItems) return;
      if (cart.length === 0) {
        cartItems.innerHTML = '<p>Your cart is empty.</p>';
        const featured = document.getElementById('cart-featured-jammie');
        if (featured) featured.style.display = 'none';
        return;
      }
      // Show featured Jammie if present
      const jammie = cart.find(item => item.name.includes('Chocolate Chip Jammies'));
      const featured = document.getElementById('cart-featured-jammie');
      if (jammie && featured) {
        featured.style.display = 'block';
        document.getElementById('cart-jammie-options').innerHTML =
          `<p><strong>Selected Options:</strong><br>
          Size: ${jammie.size}<br>
          Blend: ${jammie.blend}<br>
          Binder: ${jammie.binder}<br>
          Qty: ${jammie.qty}</p>`;
      } else if (featured) {
        featured.style.display = 'none';
      }
      // Professional cart display
      let subtotal = 0;
      cartItems.innerHTML = cart.map((item, idx) => {
        subtotal += (item.price ? item.price : 0) * (item.qty ? item.qty : 1);
        return `
          <div class="cart-item">
            <strong>${item.name}</strong><br>
            Size: ${item.size}, Blend: ${item.blend}, Binder: ${item.binder}<br>
            Qty: <button onclick="changeQuantity(${idx}, -1)">-</button> ${item.qty} <button onclick="changeQuantity(${idx}, 1)">+</button>
            <button onclick="removeFromCart(${idx})">Remove</button>
          </div>
        `;
      }).join("");
      // Subtotal display
      cartItems.innerHTML += `<div class="cart-subtotal"><strong>Subtotal:</strong> $${subtotal.toFixed(2)}</div>`;
    }

    const yearSpan = document.getElementById("year");
    if (yearSpan) {
      yearSpan.textContent = new Date().getFullYear();
    }

    // Nav dropdown click toggle
    document.querySelectorAll(".nav-dropdown-toggle").forEach(toggle => {
      toggle.addEventListener("click", function(e) {
        e.preventDefault();
        const dropdown = this.closest(".nav-dropdown");
        const isOpen = dropdown.classList.contains("open");
        document.querySelectorAll(".nav-dropdown").forEach(d => d.classList.remove("open"));
        if (!isOpen) dropdown.classList.add("open");
      });
    });
    document.addEventListener("click", function(e) {
      if (!e.target.closest(".nav-dropdown")) {
        document.querySelectorAll(".nav-dropdown").forEach(d => d.classList.remove("open"));
      }
    });
 
    // Smooth scroll for internal links
    const links = document.querySelectorAll('a[href^="#"]');
    links.forEach((link) => {
      link.addEventListener("click", (e) => {
        const targetId = link.getAttribute("href");
        if (!targetId || targetId === "#") return;
        const targetEl = document.querySelector(targetId);
        if (!targetEl) return;
 
        e.preventDefault();
        window.scrollTo({
          top: targetEl.offsetTop - 70,
          behavior: "smooth",
        });
      });
    });
});
