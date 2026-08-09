// Global cart module for Mokie's Munchies
window.Cart = (function () {
  'use strict';
  const KEY = 'guiltlessCart';

  // --- Persistence ---
  function load() {
    try { return JSON.parse(localStorage.getItem(KEY)) || []; }
    catch (e) { return []; }
  }
  function save(items) {
    localStorage.setItem(KEY, JSON.stringify(items));
  }

  // --- Public API ---
  function getItems() { return load(); }

  function getCount() {
    return load().reduce(function (sum, item) {
      return sum + parseInt(item.qty || 1);
    }, 0);
  }

  function add(product) {
    var items = load();
    var found = items.find(function (i) {
      return i.name === product.name &&
        i.size === product.size &&
        i.blend === product.blend &&
        i.binder === product.binder;
    });
    if (found) {
      found.qty = parseInt(found.qty) + parseInt(product.qty || 1);
    } else {
      items.push(Object.assign({}, product, { qty: parseInt(product.qty || 1) }));
    }
    save(items);
    refreshBadge();
  }

  function remove(idx) {
    var items = load();
    items.splice(idx, 1);
    save(items);
    refreshBadge();
    renderModalItems();
  }

  function updateQty(idx, delta) {
    var items = load();
    if (!items[idx]) return;
    items[idx].qty = Math.max(1, parseInt(items[idx].qty) + delta);
    save(items);
    refreshBadge();
    renderModalItems();
  }

  function clear() {
    localStorage.removeItem(KEY);
    refreshBadge();
    renderModalItems();
  }

  // --- Badge ---
  function refreshBadge() {
    var count = getCount();
    document.querySelectorAll('.cart-count-badge').forEach(function (badge) {
      badge.textContent = count;
      badge.style.display = count > 0 ? 'inline-flex' : 'none';
    });
  }

  // --- Modal ---
  function injectModal() {
    if (document.getElementById('cart-modal')) return;
    var modal = document.createElement('div');
    modal.id = 'cart-modal';
    modal.className = 'cart-modal';
    modal.style.display = 'none';
    modal.innerHTML =
      '<div class="cart-modal-content">' +
        '<span class="cart-modal-close" id="cart-modal-close">&times;</span>' +
        '<h2>Your Cart</h2>' +
        '<div id="cart-items"></div>' +
        '<div class="cart-modal-actions">' +
          '<a href="order.html" class="btn primary" id="cart-checkout-btn">Proceed to Checkout</a>' +
          '<button class="btn tertiary" id="cart-clear-btn">Clear Cart</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(modal);
    document.getElementById('cart-modal-close').addEventListener('click', closeModal);
    document.getElementById('cart-clear-btn').addEventListener('click', clear);
    modal.addEventListener('click', function (e) {
      if (e.target === modal) closeModal();
    });
  }

  function fixCheckoutLink() {
    var btn = document.getElementById('cart-checkout-btn');
    if (btn) {
      btn.href = window.ORDER_PATH || 'order.html';
    }
  }

  function openModal() {
    injectModal();
    fixCheckoutLink();
    renderModalItems();
    document.getElementById('cart-modal').style.display = 'flex';
  }

  function closeModal() {
    var modal = document.getElementById('cart-modal');
    if (modal) modal.style.display = 'none';
  }

  function renderModalItems() {
    var cartItemsEl = document.getElementById('cart-items');
    if (!cartItemsEl) return;
    var items = load();
    if (items.length === 0) {
      cartItemsEl.innerHTML = '<p class="cart-empty">Your cart is empty.</p>';
      return;
    }
    var subtotal = 0;
    var html = items.map(function (item, idx) {
      var lineTotal = (item.price || 0) * (item.qty || 1);
      subtotal += lineTotal;
      return '<div class="cart-item">' +
        '<div class="cart-item-info">' +
          '<strong>' + item.name + '</strong>' +
          '<span class="cart-item-meta">Size: ' + item.size + ' &bull; Blend: ' + item.blend + ' &bull; Binder: ' + item.binder + '</span>' +
        '</div>' +
        '<div class="cart-item-controls">' +
          '<button class="qty-btn" onclick="Cart.updateQty(' + idx + ', -1)">&#8722;</button>' +
          '<span class="qty-value">' + item.qty + '</span>' +
          '<button class="qty-btn" onclick="Cart.updateQty(' + idx + ', 1)">+</button>' +
          '<button class="remove-btn" title="Remove" onclick="Cart.remove(' + idx + ')">&#128465;</button>' +
        '</div>' +
      '</div>';
    }).join('');
    html += '<div class="cart-subtotal">' +
      (subtotal > 0
        ? '<strong>Subtotal:</strong> $' + subtotal.toFixed(2)
        : '<strong>Pricing confirmed at order review</strong>') +
    '</div>';
    cartItemsEl.innerHTML = html;
  }

  // --- Wire nav cart links ---
  function wireNavLinks() {
    document.querySelectorAll('.cart-link').forEach(function (link) {
      link.addEventListener('click', function (e) {
        e.preventDefault();
        openModal();
      });
    });
  }

  // --- Init ---
  document.addEventListener('DOMContentLoaded', function () {
    injectModal();
    wireNavLinks();
    refreshBadge();
  });

  return {
    getItems: getItems,
    getCount: getCount,
    add: add,
    remove: remove,
    updateQty: updateQty,
    clear: clear,
    openModal: openModal,
    closeModal: closeModal,
    refreshBadge: refreshBadge,
    renderModalItems: renderModalItems
  };
})();
