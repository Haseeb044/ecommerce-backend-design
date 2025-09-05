/**
 * script.js — Robust dropdown manager and small UI fixes
 * - Uses .bp-dropdown.bp-open instead of display:block for smooth animations
 * - Buttons reference dropdowns via data-dropdown-target (selector)
 * - Ensures only one dropdown is open at a time
 * - Closes on click-outside and Escape
 * - Keyboard accessible: Enter/Space/ArrowDown to open, ArrowUp/ArrowDown/Home/End to navigate inside
 * - If dropdown would overflow right edge, adds bp-right-align to flip position
 *
 * Namespaces: all classes/ids start with "bp-" to avoid collisions.
 */

(function () {
  const openMenus = new Set();

  function getMenuForButton(btn) {
    const targetSelector = btn.getAttribute('data-dropdown-target');
    if (targetSelector) return document.querySelector(targetSelector);
    // fallback: nearest .bp-dropdown sibling
    return btn.parentElement?.querySelector('.bp-dropdown') || btn.nextElementSibling && btn.nextElementSibling.classList?.contains('bp-dropdown') ? btn.nextElementSibling : null;
  }

  function openMenu(btn, menu) {
    if (!menu || !btn) return;
    // close other menus first
    closeAllMenus();

    btn.setAttribute('aria-expanded', 'true');
    menu.classList.add('bp-open');
    menu.classList.remove('bp-right-align'); // reset
    menu.setAttribute('aria-hidden', 'false');
    openMenus.add({ btn, menu });

    // position check: if menu overflows right, add right-align class
    const rect = menu.getBoundingClientRect();
    if (rect.right > window.innerWidth - 12) {
      menu.classList.add('bp-right-align');
      // when right aligned we ensure CSS has .bp-right-align to set right:0
      menu.style.left = 'auto';
      menu.style.right = '0';
    } else {
      menu.style.left = '';
      menu.style.right = '';
    }

    // focus first interactive item
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
    // remove from openMenus set (search by menu)
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

  // Attach click handlers to all controller buttons
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
      // open on Enter, Space or ArrowDown
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

  // Dropdown keyboard navigation (within each dropdown)
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
        // find owner button and return focus
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

    // Clicking an item inside dropdown: close the dropdown (and update any visible label for select-like dropdowns)
    menu.addEventListener('click', (e) => {
      const clicked = e.target.closest('button, a');
      if (!clicked) return;
      const ownerId = menu.getAttribute('data-owner');
      if (ownerId) {
        const ownerBtn = document.getElementById(ownerId);
        // If this is the search category menu, update the button label to chosen text while preserving caret
        if (ownerBtn && menu.id === 'bp-cat-menu') {
          const caret = ownerBtn.querySelector('.bp-caret');
          ownerBtn.textContent = clicked.textContent.trim();
          if (caret) ownerBtn.appendChild(caret);
        }
        // close and return focus to owner button
        const ownerBtnElem = ownerBtn || menu.parentElement.querySelector('[aria-haspopup="true"]');
        if (ownerBtnElem) {
          closeMenu(ownerBtnElem, menu);
          ownerBtnElem.focus();
        }
      } else {
        // generic: close all menus
        closeAllMenus();
      }
    });
  });

  // Click outside closes open menus
  document.addEventListener('click', (e) => {
    if (openMenus.size === 0) return;
    // if click is inside any open menu or its owner, ignore
    let clickedInside = false;
    openMenus.forEach(item => {
      if (item.menu.contains(e.target) || item.btn.contains(e.target)) clickedInside = true;
    });
    if (!clickedInside) closeAllMenus();
  });

  // Escape closes everything
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeAllMenus();
  });

  // Make dropdowns reposition on resize (clear inline styles)
  window.addEventListener('resize', () => {
    document.querySelectorAll('.bp-dropdown').forEach(menu => {
      menu.style.left = '';
      menu.style.right = '';
    });
  });

  // Left category activation
  document.querySelectorAll('.bp-cat-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.bp-cat-item').forEach(li => li.classList.remove('bp-active'));
      btn.closest('.bp-cat-item').classList.add('bp-active');
    });
  });

})();