// Controller discovery and selection on top of the Gamepad API.
// Browsers only expose a controller after it sends input.

let padIndex = null;

export const supported = () => "getGamepads" in navigator;

export function pads() {
  return [...(navigator.getGamepads?.() || [])].filter(Boolean);
}

// A fresh snapshot of the selected controller; call once per frame.
export function currentPad() {
  if (padIndex === null) return null;
  return (navigator.getGamepads?.() || [])[padIndex] || null;
}

export function isDualSense(p) {
  // Sony vendor 054c; DualSense 0ce6, DualSense Edge 0df2.
  return /054c/i.test(p.id) && /0ce6|0df2/i.test(p.id) || /dualsense/i.test(p.id);
}

export function shortName(p) {
  if (!p) return "";
  if (isDualSense(p)) return /0df2/i.test(p.id) ? "DualSense Edge" : "DualSense";
  return p.id.replace(/\s*\(.*?\)\s*/g, " ").trim() || `Controller ${p.index + 1}`;
}

export const selectedIndex = () => padIndex;

// Make sure a connected controller is selected, preferring a DualSense.
// Returns true when the selection changed.
export function ensureSelection() {
  const list = pads();
  if (!list.length) { const changed = padIndex !== null; padIndex = null; return changed; }
  if (padIndex !== null && list.some((p) => p.index === padIndex)) return false;
  padIndex = (list.find(isDualSense) || list[0]).index;
  return true;
}

export function select(index) {
  padIndex = index;
}

export function onConnectionChange(fn) {
  window.addEventListener("gamepadconnected", fn);
  window.addEventListener("gamepaddisconnected", () => { padIndex = null; fn(); });
}
