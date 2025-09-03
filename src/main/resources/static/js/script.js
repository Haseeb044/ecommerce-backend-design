/**
 * script.js — Robust dropdown manager and small UI fixes with product detail enhancements
 * - Uses .bp-dropdown.bp-open instead of display:block for smooth animations
 * - Buttons reference dropdowns via data-dropdown-target (selector)
 * - Ensures only one dropdown is open at a time
 * - Closes on click-outside and Escape
 * - Keyboard accessible: Enter/Space/ArrowDown to open, ArrowUp/ArrowDown/Home/End to navigate inside
 * - If dropdown would overflow right edge, adds bp-right-align to flip position
 * - Added product thumbnail switching and favorite toggle functionality
 *
 * Namespaces: all classes/ids start with "bp-" to avoid collisions.
 */

(function () {
  const openMenus = new Set();

  function getMenuForButton(btn) {
    const targetSelector = btn.getAttribute('data-dropdown-target');
    if (targetSelector) return document.querySelector(targetSelector);
    return btn.parentElement?.querySelector('.bp-dropdown') || btn.nextElementSibling && btn.nextElementSibling.classList?.contains('bp-dropdown') ? btn.nextElementSibling : null;
  }

  function openMenu(btn, menu) {
    if (!menu || !btn) return;
    closeAllMenus();

    btn.setAttribute('aria-expanded', 'true');
    menu.classList.add('bp-open');
    menu.classList.remove('bp-right-align');
    menu.setAttribute('aria-hidden', 'false');
    openMenus.add({ btn, menu });

    const rect = menu.getBoundingClientRect();
    if (rect.right > window.innerWidth - 12) {
      menu.classList.add('bp-right-align');
      menu.style.left = 'auto';
      menu.style.right = '0';
    } else {
      menu.style.left = '';
      menu.style.right = '';
    }

    const firstFocus = menu.querySelector('button, a');
    if (firstFocus) firstFocus.focus();
  }

  function closeMenu(btn, menu) {
    if (!menu || !btn) return;
    btn.setAttribute('aria-expanded', 'false');
    menu.classList.remove('bp-open');
    menu.setAttribute('aria-hidden', 'true');
    menu.style.left = '';
    menu.style.right = '';
    openMenus.forEach(item => {
      if (item.menu === menu) openMenus.delete(item);
    });
  }

  function closeAllMenus() {
    openMenus.forEach(item => {
      item.btn.setAttribute('aria-expanded', 'false');
      item.menu.classList.remove('bp-open');
      item.menu.setAttribute('aria-hidden', 'true');
      item.menu.style.left = '';
      item.menu.style.right = '';
    });
    openMenus.clear();
  }

  document.querySelectorAll('[data-dropdown-target]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const menu = getMenuForButton(btn);
      if (!menu) return;
      const expanded = btn.getAttribute('aria-expanded') === 'true';
      if (expanded) {
        closeMenu(btn, menu);
      } else {
        openMenu(btn, menu);
      }
    });

    btn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        const menu = getMenuForButton(btn);
        if (menu) openMenu(btn, menu);
      } else if (e.key === 'Escape') {
        const menu = getMenuForButton(btn);
        if (menu) closeMenu(btn, menu);
      }
    });
  });

  document.querySelectorAll('.bp-dropdown').forEach(menu => {
    menu.addEventListener('keydown', (e) => {
      const items = Array.from(menu.querySelectorAll('button, a')).filter(Boolean);
      if (!items.length) return;
      let idx = items.indexOf(document.activeElement);
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        idx = (idx + 1) % items.length;
        items[idx].focus();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        idx = (idx - 1 + items.length) % items.length;
        items[idx].focus();
      } else if (e.key === 'Home') {
        e.preventDefault();
        items[0].focus();
      } else if (e.key === 'End') {
        e.preventDefault();
        items[items.length - 1].focus();
      } else if (e.key === 'Escape') {
        const ownerId = menu.getAttribute('data-owner');
        const ownerBtn = ownerId ? document.getElementById(ownerId) : menu.parentElement?.querySelector('[aria-haspopup="true"]');
        if (ownerBtn) {
          closeMenu(ownerBtn, menu);
          ownerBtn.focus();
        } else {
          closeAllMenus();
        }
      }
    });

    menu.addEventListener('click', (e) => {
      const clicked = e.target.closest('button, a');
      if (!clicked) return;
      const ownerId = menu.getAttribute('data-owner');
      if (ownerId) {
        const ownerBtn = document.getElementById(ownerId);
        if (ownerBtn && menu.id === 'bp-cat-menu') {
          const caret = ownerBtn.querySelector('.bp-caret');
          ownerBtn.textContent = clicked.textContent.trim();
          if (caret) ownerBtn.appendChild(caret);
        }
        const ownerBtnElem = ownerBtn || menu.parentElement.querySelector('[aria-haspopup="true"]');
        if (ownerBtnElem) {
          closeMenu(ownerBtnElem, menu);
          ownerBtnElem.focus();
        }
      } else {
        closeAllMenus();
      }
    });
  });

  document.addEventListener('click', (e) => {
    if (openMenus.size === 0) return;
    let clickedInside = false;
    openMenus.forEach(item => {
      if (item.menu.contains(e.target) || item.btn.contains(e.target)) clickedInside = true;
    });
    if (!clickedInside) closeAllMenus();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeAllMenus();
  });

  window.addEventListener('resize', () => {
    document.querySelectorAll('.bp-dropdown').forEach(menu => {
      menu.style.left = '';
      menu.style.right = '';
    });
  });

  // Thumbnail image switching
  window.changeMainImage = function(thumbnail) {
    const mainImage = document.getElementById('main-product-image');
    const thumbnails = document.querySelectorAll('.thumbnail');
    const currentImageSpan = document.querySelector('.current-image');

    mainImage.src = thumbnail.src;
    thumbnails.forEach(t => t.classList.remove('active'));
    thumbnail.classList.add('active');

    // Update image counter
    const index = Array.from(thumbnails).indexOf(thumbnail) + 1;
    currentImageSpan.textContent = index;
  };

  // Favorite toggle functionality
  window.toggleFavorite = function(productId) {
    const favoriteBtn = document.querySelector(`.favorite-btn[onclick="toggleFavorite(${productId})"]`);
    if (favoriteBtn) {
      favoriteBtn.classList.toggle('favorited');
      const heartIcon = favoriteBtn.querySelector('i');
      if (heartIcon) {
        heartIcon.classList.toggle('far', !favoriteBtn.classList.contains('favorited'));
        heartIcon.classList.toggle('fas', favoriteBtn.classList.contains('favorited'));
      }
      // Here you can add AJAX call to update favorite status on server
      console.log(`Toggled favorite for product ID: ${productId}`);
    }
  };

  // Read more button functionality
  document.querySelectorAll('.read-more-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const description = btn.previousElementSibling;
      if (description) {
        description.classList.toggle('expanded');
        btn.textContent = description.classList.contains('expanded') ? 'Read less' : 'Read more';
      }
    });
  });

  // Ensure first thumbnail is active on page load
  document.addEventListener('DOMContentLoaded', () => {
    const firstThumbnail = document.querySelector('.thumbnail');
    if (firstThumbnail) {
      firstThumbnail.classList.add('active');
    }
  });
})();