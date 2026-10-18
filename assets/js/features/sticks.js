// Stick view: outline, deadzone ring, circularity trace, trail and readout.

import { TRAIL_LEN, CIRC_BINS, COLORS } from "../config.js";
import { fmt } from "../core/dom.js";

export function createStick(canvas, readout) {
  return { canvas, readout, trail: [], circ: new Array(CIRC_BINS).fill(0) };
}

export function resetStick(s) {
  s.trail = [];
  s.circ.fill(0);
}

export function drawStick(s, x, y, deadzone) {
  const c = s.canvas;
  const dpr = window.devicePixelRatio || 1;
  const size = c.clientWidth || 240;
  if (c.width !== Math.round(size * dpr)) { c.width = c.height = Math.round(size * dpr); }
  const g = c.getContext("2d");
  const W = c.width, cx = W / 2, R = W / 2 - 10 * dpr;
  g.clearRect(0, 0, W, W);

  // Outer circle and crosshair.
  g.strokeStyle = COLORS.line; g.lineWidth = 1 * dpr;
  g.beginPath(); g.arc(cx, cx, R, 0, Math.PI * 2); g.stroke();
  g.beginPath(); g.moveTo(cx - R, cx); g.lineTo(cx + R, cx); g.moveTo(cx, cx - R); g.lineTo(cx, cx + R); g.stroke();

  // Deadzone ring.
  if (deadzone > 0) {
    g.setLineDash([2 * dpr, 3 * dpr]); g.strokeStyle = COLORS.muted;
    g.beginPath(); g.arc(cx, cx, R * deadzone, 0, Math.PI * 2); g.stroke();
    g.setLineDash([]);
  }

  // Circularity outline recorded so far.
  if (s.circ.some((v) => v > 0)) {
    g.strokeStyle = COLORS.good; g.lineWidth = 1 * dpr; g.beginPath();
    let started = false;
    for (let i = 0; i <= CIRC_BINS; i++) {
      const r = s.circ[i % CIRC_BINS];
      if (!r) { started = false; continue; }
      const a = ((i % CIRC_BINS) + 0.5) / CIRC_BINS * Math.PI * 2;
      const px = cx + Math.cos(a) * r * R, py = cx + Math.sin(a) * r * R;
      started ? g.lineTo(px, py) : g.moveTo(px, py);
      started = true;
    }
    g.stroke();
  }

  // Trail.
  s.trail.push([x, y]);
  if (s.trail.length > TRAIL_LEN) s.trail.shift();
  for (let i = 0; i < s.trail.length; i++) {
    const [tx, ty] = s.trail[i];
    g.fillStyle = `rgba(255,255,255,${(i / s.trail.length) * 0.35})`;
    g.beginPath(); g.arc(cx + tx * R, cx + ty * R, 1.5 * dpr, 0, Math.PI * 2); g.fill();
  }

  // Current position.
  const mag = Math.hypot(x, y);
  g.fillStyle = mag > deadzone ? COLORS.accent : COLORS.muted;
  g.beginPath(); g.arc(cx + x * R, cx + y * R, 5 * dpr, 0, Math.PI * 2); g.fill();

  const ang = (Math.atan2(-y, x) * 180 / Math.PI + 360) % 360;
  s.readout.innerHTML =
    `X <b>${fmt(x)}</b> &nbsp; Y <b>${fmt(y)}</b> &nbsp; |r| <b>${mag.toFixed(3)}</b> &nbsp; ${mag > 0.1 ? ang.toFixed(0) + "°" : "–"}`;
}

// Deadzone slider (0–0.30). Only drawn on the sticks, never applied to values.
export function bindDeadzone(slider, label) {
  const state = { value: slider.value / 100 };
  slider.addEventListener("input", () => {
    state.value = slider.value / 100;
    label.textContent = state.value.toFixed(2);
  });
  return state;
}
