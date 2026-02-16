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
        popupTitle.textContent = `Select Size for ${cookieName}`;
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
  const yearSpan = document.getElementById("year");
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }
 
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
 