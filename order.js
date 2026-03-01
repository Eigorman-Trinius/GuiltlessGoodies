// Order / Cart Review page logic for Guiltless Goodies
var EMAILJS_SERVICE_ID  = "service_9zqw75g";
var EMAILJS_TEMPLATE_ID = "template_1lhg7iy";
var EMAILJS_PUBLIC_KEY  = "lJD-okYpWeZr86zCf";

document.addEventListener("DOMContentLoaded", function () {
  var yearSpan = document.getElementById("year");
  if (yearSpan) yearSpan.textContent = new Date().getFullYear();

  var reviewSection     = document.getElementById("order-review");
  var confirmSection    = document.getElementById("order-confirmation");
  var reviewItemsEl     = document.getElementById("review-items");
  var reviewTotalEl     = document.getElementById("review-total");
  var placeOrderBtn     = document.getElementById("place-order-btn");
  var clearCartBtn      = document.getElementById("clear-cart-btn");
  var orderNumberEl     = document.getElementById("order-number");
  var confirmEmailEl    = document.getElementById("confirm-email");
  var orderErrorEl      = document.getElementById("order-error");

  function renderReview() {
    var items = Cart.getItems();
    if (!reviewItemsEl) return;

    if (items.length === 0) {
      reviewItemsEl.innerHTML =
        '<p class="cart-empty">Your cart is empty. ' +
        '<a href="cookies.html">Continue shopping &rarr;</a></p>';
      if (reviewTotalEl) reviewTotalEl.textContent = "";
      if (placeOrderBtn) placeOrderBtn.disabled = true;
      return;
    }

    if (placeOrderBtn) placeOrderBtn.disabled = false;
    var subtotal = 0;

    reviewItemsEl.innerHTML = items.map(function (item, idx) {
      var lineTotal = (item.price || 0) * (item.qty || 1);
      subtotal += lineTotal;
      return '<div class="order-review-item">' +
        '<div class="order-review-info">' +
          '<strong>' + item.name + '</strong>' +
          '<span class="order-review-meta">' +
            'Size: ' + item.size + ' &bull; ' +
            'Blend: ' + item.blend + ' &bull; ' +
            'Binder: ' + item.binder +
          '</span>' +
        '</div>' +
        '<div class="order-review-controls">' +
          '<button class="qty-btn" onclick="Cart.updateQty(' + idx + ', -1); renderOrderReview();">&#8722;</button>' +
          '<span class="qty-value">' + item.qty + '</span>' +
          '<button class="qty-btn" onclick="Cart.updateQty(' + idx + ', 1); renderOrderReview();">+</button>' +
          '<button class="remove-btn" title="Remove" onclick="Cart.remove(' + idx + '); renderOrderReview();">&#128465;</button>' +
        '</div>' +
      '</div>';
    }).join('');

    if (reviewTotalEl) {
      reviewTotalEl.innerHTML = subtotal > 0
        ? '<strong>Total:</strong> $' + subtotal.toFixed(2)
        : '<strong>Pricing will be confirmed when we receive your order.</strong>';
    }
  }

  // Expose globally so onclick attributes can call it
  window.renderOrderReview = renderReview;

  // Place order — send via EmailJS
  if (placeOrderBtn) {
    placeOrderBtn.addEventListener("click", function () {
      var items = Cart.getItems();
      if (items.length === 0) return;

      // Validate contact fields
      var nameEl  = document.getElementById("customer-name");
      var emailEl = document.getElementById("customer-email");
      var phoneEl = document.getElementById("customer-phone");
      var notesEl = document.getElementById("customer-notes");

      var name  = nameEl  ? nameEl.value.trim()  : "";
      var email = emailEl ? emailEl.value.trim()  : "";
      var phone = phoneEl ? phoneEl.value.trim()  : "";
      var notes = notesEl ? notesEl.value.trim()  : "";

      if (!name || !email) {
        if (orderErrorEl) {
          orderErrorEl.textContent = "Please enter your name and email before placing your order.";
          orderErrorEl.style.display = "block";
          orderErrorEl.scrollIntoView({ behavior: "smooth", block: "center" });
        }
        return;
      }
      if (orderErrorEl) orderErrorEl.style.display = "none";

      // Build order reference
      var now = new Date();
      var datePart = now.getFullYear().toString() +
        String(now.getMonth() + 1).padStart(2, "0") +
        String(now.getDate()).padStart(2, "0");
      var randPart = Math.random().toString(36).substring(2, 6).toUpperCase();
      var orderRef = "GG-" + datePart + "-" + randPart;

      // Build order items as HTML table rows for the email template
      var itemRows = items.map(function (item) {
        return '<tr style="border-bottom:1px solid #e0d6cd;">' +
          '<td style="padding:10px 8px;font-weight:600;">' + item.name + '</td>' +
          '<td style="padding:10px 8px;">' + item.size + '</td>' +
          '<td style="padding:10px 8px;">' + item.blend + '</td>' +
          '<td style="padding:10px 8px;">' + item.binder + '</td>' +
          '<td style="padding:10px 8px;text-align:center;">' + item.qty + '</td>' +
          '</tr>';
      }).join("");

      // Disable button and show loading state
      placeOrderBtn.disabled = true;
      placeOrderBtn.textContent = "Sending\u2026";

      emailjs.init(EMAILJS_PUBLIC_KEY);
      emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
        order_ref:      orderRef,
        order_date:     now.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
        customer_name:  name,
        customer_email: email,
        customer_phone: phone || "Not provided",
        customer_notes: notes || "None",
        order_items:    itemRows
      })
      .then(function () {
        if (orderNumberEl) orderNumberEl.textContent = orderRef;
        if (confirmEmailEl) confirmEmailEl.textContent = email;
        Cart.clear();
        if (reviewSection) reviewSection.style.display = "none";
        if (confirmSection) confirmSection.style.display = "block";
        window.scrollTo({ top: 0, behavior: "smooth" });
      })
      .catch(function (err) {
        placeOrderBtn.disabled = false;
        placeOrderBtn.textContent = "Place Order";
        if (orderErrorEl) {
          orderErrorEl.textContent = "Something went wrong sending your order. Please try again or contact us directly.";
          orderErrorEl.style.display = "block";
        }
        console.error("EmailJS error:", err);
      });
    });
  }

  // Clear cart
  if (clearCartBtn) {
    clearCartBtn.addEventListener("click", function () {
      if (confirm("Clear all items from your cart?")) {
        Cart.clear();
        renderReview();
      }
    });
  }

  renderReview();
});
