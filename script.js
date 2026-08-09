// Mokie's Munchies — main UI logic (cart state managed by cart.js)

document.addEventListener("DOMContentLoaded", function () {

  // --- Year footer ---
  var yearSpan = document.getElementById("year");
  if (yearSpan) yearSpan.textContent = new Date().getFullYear();

  // --- Hamburger menu ---
  var hamburger = document.querySelector(".nav-hamburger");
  var navEl = document.querySelector(".nav");
  if (hamburger && navEl) {
    hamburger.addEventListener("click", function (e) {
      e.stopPropagation();
      navEl.classList.toggle("open");
    });
  }
  document.addEventListener("click", function (e) {
    if (navEl && !e.target.closest(".nav") && !e.target.closest(".nav-hamburger")) {
      navEl.classList.remove("open");
    }
  });

  // --- Nav dropdown toggle ---
  document.querySelectorAll(".nav-dropdown-toggle").forEach(function (toggle) {
    toggle.addEventListener("click", function (e) {
      e.preventDefault();
      var dropdown = this.closest(".nav-dropdown");
      var isOpen = dropdown.classList.contains("open");
      document.querySelectorAll(".nav-dropdown").forEach(function (d) { d.classList.remove("open"); });
      if (!isOpen) dropdown.classList.add("open");
    });
  });

  // --- Smooth scroll for internal anchor links ---
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener("click", function (e) {
      var targetId = link.getAttribute("href");
      if (!targetId || targetId === "#") return;
      var targetEl = document.querySelector(targetId);
      if (!targetEl) return;
      e.preventDefault();
      window.scrollTo({ top: targetEl.offsetTop - 70, behavior: "smooth" });
    });
  });

  // --- Cookie size pop-up (legacy popup on pages that use it) ---
  var popup = document.getElementById("cookie-popup");
  var popupClose = document.getElementById("cookie-popup-close");
  var popupTitle = document.getElementById("popup-cookie-title");

  document.querySelectorAll(".select-size-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var card = btn.closest(".product-card");
      if (!card || !popup || !popupTitle) return;
      var cookieName = card.querySelector("h4") ? card.querySelector("h4").textContent : "";
      popupTitle.textContent = "Customize Your " + cookieName;
      popup.style.display = "block";
    });
  });
  if (popupClose) {
    popupClose.addEventListener("click", function () { popup.style.display = "none"; });
  }
  if (popup) {
    popup.addEventListener("click", function (e) {
      if (e.target === popup) popup.style.display = "none";
    });
  }

  // --- Binder dynamic callout ---
  var binderSelect = document.getElementById("binder-type");
  var binderInfo = document.getElementById("binder-info");
  var binderDescriptions = {
    "aquafaba": "<strong>Aquafaba Powder (Vegan)</strong><br>Concentrated dried chickpea water replaces eggs — binds beautifully, neutral flavor, seamless texture. Paired with refined coconut oil in place of butter. Fully plant-based, egg-free, and dairy-free.",
    "flax-egg": "<strong>Flax Egg (Vegan)</strong><br>Ground flaxseed mixed with water replaces eggs — adds a subtle nuttiness and a hearty, wholesome chew. Paired with refined coconut oil in place of butter. Fully plant-based, egg-free, and dairy-free.",
    "non-vegan": "<strong>Classic: Eggs &amp; Butter</strong><br>We use whole eggs and real butter for a rich, classic bakery structure with golden lift, that familiar chew, and the texture you know and love from a proper homemade cookie."
  };
  function updateBinderInfo() {
    if (binderInfo && binderSelect) {
      binderInfo.innerHTML = binderDescriptions[binderSelect.value] || "";
    }
  }
  if (binderSelect) {
    binderSelect.addEventListener("change", updateBinderInfo);
    updateBinderInfo();
  }

  // --- Product page: customize & add-to-cart form ---
  var cookieOptionsForm = document.getElementById("cookie-options-form");
  if (cookieOptionsForm) {
    cookieOptionsForm.addEventListener("submit", function (e) {
      e.preventDefault();

      // Get readable labels from select elements
      var sizeEl   = document.getElementById("cookie-size");
      var blendEl  = document.getElementById("flour-blend");
      var binderEl = document.getElementById("binder-type");
      var qtyEl    = document.getElementById("cookie-qty");

      var size   = sizeEl   ? sizeEl.options[sizeEl.selectedIndex].text   : "";
      var blend  = blendEl  ? blendEl.options[blendEl.selectedIndex].text  : "";
      var binder = binderEl ? binderEl.options[binderEl.selectedIndex].text : "";
      var qty    = qtyEl    ? parseInt(qtyEl.value) || 1                   : 1;

      // Get product name from the page h1 (product pages) or popup title (legacy)
      var nameEl = document.querySelector("h1") || popupTitle;
      var cookieName = nameEl ? nameEl.textContent.replace("Customize Your ", "").trim() : "Cookie";

      if (window.Cart) {
        Cart.add({ name: cookieName, size: size, blend: blend, binder: binder, qty: qty });
      }

      // Close popup if open
      if (popup) popup.style.display = "none";

      // Show inline "added" confirmation — do NOT auto-redirect
      var confirmEl = document.getElementById("cart-added-confirmation");
      if (!confirmEl) {
        confirmEl = document.createElement("div");
        confirmEl.id = "cart-added-confirmation";
        confirmEl.className = "cart-added-msg";
        cookieOptionsForm.parentNode.insertBefore(confirmEl, cookieOptionsForm.nextSibling);
      }
      var orderPath = window.ORDER_PATH || "order.html";
      confirmEl.innerHTML =
        "<span>&#10003; Added to cart!</span>" +
        "<div class=\"cart-added-actions\">" +
          "<button class=\"btn secondary\" id=\"cart-keep-shopping\">Keep Shopping</button>" +
          "<a href=\"" + orderPath + "\" class=\"btn primary\">Go to Checkout &rarr;</a>" +
        "</div>";
      confirmEl.style.display = "flex";
      document.getElementById("cart-keep-shopping").addEventListener("click", function () {
        confirmEl.style.display = "none";
      });
    });
  }

  // --- Contact form ---
  var EMAILJS_CONTACT_SERVICE_ID  = "service_9zqw75g";
  var EMAILJS_CONTACT_TEMPLATE_ID = "template_kv6x42r";
  var EMAILJS_CONTACT_PUBLIC_KEY  = "lJD-okYpWeZr86zCf";

  var contactForm = document.getElementById("contact-form");
  if (contactForm) {
    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();

      var submitBtn = contactForm.querySelector(".contact-submit-btn");
      var errorEl  = document.getElementById("contact-form-error");
      var sentEl   = document.getElementById("contact-form-sent");
      var subjects = {
        "order": "Order question",
        "custom": "Custom / bulk order request",
        "wholesale": "Wholesale inquiry",
        "allergy": "Allergy or ingredient question",
        "feedback": "Feedback",
        "other": "Other",
        "": "General"
      };

      var name    = document.getElementById("contact-name").value.trim();
      var email   = document.getElementById("contact-email").value.trim();
      var subject = document.getElementById("contact-subject").value;
      var message = document.getElementById("contact-message").value.trim();

      submitBtn.disabled = true;
      submitBtn.textContent = "Sending\u2026";
      if (errorEl) errorEl.style.display = "none";

      emailjs.init(EMAILJS_CONTACT_PUBLIC_KEY);
      emailjs.send(EMAILJS_CONTACT_SERVICE_ID, EMAILJS_CONTACT_TEMPLATE_ID, {
        contact_name:    name,
        contact_email:   email,
        contact_subject: subjects[subject] || subject,
        contact_message: message,
        contact_date:    new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
      })
      .then(function () {
        contactForm.reset();
        submitBtn.disabled = true;
        submitBtn.textContent = "Sent";
        if (sentEl) sentEl.style.display = "block";
      })
      .catch(function (err) {
        submitBtn.disabled = false;
        submitBtn.textContent = "Send Message";
        if (errorEl) {
          errorEl.textContent = "Something went wrong. Please email us directly at orders@shopguiltlessgoodies.com.";
          errorEl.style.display = "block";
        }
        console.error("EmailJS contact error:", err);
      });
    });
  }

});
