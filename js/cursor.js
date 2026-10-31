/**
 * Custom Cursor disabled per UI requirements
 * Ensures clean native browser cursor across all elements
 */
(function () {
  'use strict';
  // Remove any legacy custom cursor elements if present in DOM
  const selectors = [
    '#custom-cursor-dot',
    '#custom-cursor-ring',
    '#custom-cursor-canvas',
    '#custom-cursor-styles',
    '.custom-cursor-dot',
    '.custom-cursor-ring',
    '.cur-dot',
    '.cur-ring',
    '.samarthya-cursor'
  ];
  selectors.forEach(sel => {
    document.querySelectorAll(sel).forEach(el => el.remove());
  });
})();
