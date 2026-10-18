// Small DOM and formatting helpers.

export const $ = (id) => document.getElementById(id);

export function escapeHtml(s) {
  return s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
}

// Signed fixed-point number, e.g. +0.042.
export const fmt = (v) => (v >= 0 ? "+" : "") + v.toFixed(3);
