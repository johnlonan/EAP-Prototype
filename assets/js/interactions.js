/**
 * Horizon Prototype — Shared Interactions
 * Provides lightweight utilities for common prototype interactions.
 */

const Horizon = (() => {

  // --- Modal ---
  function openModal(id) {
    const modal = document.getElementById(id);
    if (!modal) return;
    modal.setAttribute('aria-hidden', 'false');
    modal.classList.add('is-open');
    document.body.classList.add('modal-open');
  }

  function closeModal(id) {
    const modal = document.getElementById(id);
    if (!modal) return;
    modal.setAttribute('aria-hidden', 'true');
    modal.classList.remove('is-open');
    document.body.classList.remove('modal-open');
  }

  // Close modal on backdrop click
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-backdrop')) {
      e.target.closest('[role="dialog"]')?.id && closeModal(e.target.closest('[role="dialog"]').id);
    }
  });

  // Close modal on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('[role="dialog"].is-open').forEach(modal => closeModal(modal.id));
    }
  });

  // --- Tabs ---
  function initTabs(containerSelector = '[data-tabs]') {
    document.querySelectorAll(containerSelector).forEach(container => {
      const tabs = container.querySelectorAll('[data-tab]');
      const panels = container.querySelectorAll('[data-panel]');

      tabs.forEach(tab => {
        tab.addEventListener('click', () => {
          const target = tab.dataset.tab;

          tabs.forEach(t => t.classList.remove('is-active'));
          panels.forEach(p => p.classList.remove('is-active'));

          tab.classList.add('is-active');
          container.querySelector(`[data-panel="${target}"]`)?.classList.add('is-active');
        });
      });

      // Activate first tab by default
      if (tabs.length) tabs[0].click();
    });
  }

  // --- Accordion ---
  function initAccordion(containerSelector = '[data-accordion]') {
    document.querySelectorAll(containerSelector).forEach(container => {
      container.querySelectorAll('[data-accordion-trigger]').forEach(trigger => {
        trigger.addEventListener('click', () => {
          const item = trigger.closest('[data-accordion-item]');
          const isOpen = item.classList.contains('is-open');

          // Close all items in this accordion
          container.querySelectorAll('[data-accordion-item]').forEach(i => i.classList.remove('is-open'));

          if (!isOpen) item.classList.add('is-open');
        });
      });
    });
  }

  // --- Toast notifications ---
  function toast(message, type = 'info', duration = 3000) {
    let container = document.getElementById('horizon-toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'horizon-toast-container';
      container.style.cssText = 'position:fixed;bottom:1.5rem;right:1.5rem;display:flex;flex-direction:column;gap:0.5rem;z-index:9999;';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `horizon-toast horizon-toast--${type}`;
    toast.style.cssText = 'padding:0.75rem 1rem;border-radius:0.375rem;color:#fff;font-size:0.875rem;box-shadow:0 4px 6px rgba(0,0,0,0.1);opacity:0;transition:opacity 200ms ease;max-width:320px;';
    toast.style.background = { info: '#2563eb', success: '#16a34a', warning: '#d97706', error: '#dc2626' }[type] || '#2563eb';
    toast.textContent = message;

    container.appendChild(toast);
    requestAnimationFrame(() => { toast.style.opacity = '1'; });

    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 200);
    }, duration);
  }

  // --- Load JSON data into the page ---
  async function loadData(jsonPath, callback) {
    try {
      const res = await fetch(jsonPath);
      const data = await res.json();
      callback(data);
    } catch (err) {
      console.error(`[Horizon] Failed to load data from ${jsonPath}:`, err);
    }
  }

  // --- Toggle visibility ---
  function toggle(selector) {
    document.querySelectorAll(selector).forEach(el => el.classList.toggle('is-hidden'));
  }

  // --- Icons ---
  // Inlines SVGs from the HorizonIcons registry (assets/js/icons.js).
  // Works on file:// with no server needed.
  // Usage in HTML: <span class="btn-icon" data-icon="chevron-left"></span>
  function initIcons(root = document) {
    const registry = window.HorizonIcons || {};
    root.querySelectorAll('[data-icon]').forEach(el => {
      const svg = registry[el.dataset.icon];
      if (svg) el.innerHTML = svg;
      else console.warn(`[Horizon] Icon "${el.dataset.icon}" not found in HorizonIcons registry.`);
    });
  }

  // Auto-init on DOM ready
  document.addEventListener('DOMContentLoaded', () => {
    initTabs();
    initAccordion();
    initIcons();
  });

  return { openModal, closeModal, initTabs, initAccordion, toast, loadData, toggle, initIcons };

})();
