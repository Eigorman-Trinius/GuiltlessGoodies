// Order page logic for Guiltless Goodies

document.addEventListener("DOMContentLoaded", () => {
  // Load order details from localStorage or query params
  const orderDetails = document.getElementById("order-details");
  let order = [];
  try {
    order = JSON.parse(localStorage.getItem("guiltlessOrder")) || [];
  } catch (e) {
    order = [];
  }
  if (!orderDetails) return;
  if (order.length === 0) {
    orderDetails.innerHTML = '<p>Your order is empty.</p>';
    return;
  }
  orderDetails.innerHTML = order.map(item =>
    `<div class="cart-item">
      <strong>${item.name}</strong><br>
      Size: ${item.size}, Blend: ${item.blend}, Binder: ${item.binder}, Qty: ${item.qty}
    </div>`
  ).join("");
});
