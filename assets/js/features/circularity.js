// Circularity test: record the furthest reach per angle while the sticks are
// rolled around their edge, then score against a perfect circle.

import { CIRC_BINS } from "../config.js";

const START = "Start · roll sticks";

export function createCircularityTest({ sticks, button, resetButton, result }) {
  let active = false;

  button.addEventListener("click", () => {
    active = !active;
    button.textContent = active ? "Stop · score" : START;
    if (active) { clear(); } else { score(); }
  });
  resetButton.addEventListener("click", reset);

  function clear() {
    for (const s of Object.values(sticks)) s.circ.fill(0);
    result.innerHTML = "";
  }

  function reset() {
    active = false;
    button.textContent = START;
    clear();
  }

  function sample(s, x, y) {
    if (!active) return;
    const r = Math.hypot(x, y);
    if (r < 0.5) return; // only count samples near the edge
    const a = (Math.atan2(y, x) + Math.PI * 2) % (Math.PI * 2);
    const bin = Math.floor(a / (Math.PI * 2) * CIRC_BINS) % CIRC_BINS;
    if (r > s.circ[bin]) s.circ[bin] = r;
  }

  function score() {
    result.innerHTML = Object.entries(sticks).map(([k, s]) => report(k === "L" ? "Left" : "Right", s.circ)).join("");
  }

  return { sample, reset };
}

function report(name, circ) {
  const bins = circ.filter((v) => v > 0);
  const coverage = bins.length / CIRC_BINS;
  if (coverage < 0.9) {
    return `<div><b>${name} stick</b> &nbsp;<span class="muted">Only ${(coverage * 100).toFixed(0)}% of the circle covered. Roll it all the way round and try again.</span></div>`;
  }
  // Root-mean-square distance from a perfect unit circle, as a percentage.
  const err = Math.sqrt(bins.reduce((a, r) => a + (r - 1) ** 2, 0) / bins.length) * 100;
  const [cls, word] = err <= 8 ? ["good", "Good"] : err <= 15 ? ["warn", "Fair"] : ["bad", "Poor"];
  return `<div><b>${name} stick</b> &nbsp;<span class="tag ${cls}">${word}</span> &nbsp;
    <span class="muted">Average error</span> ${err.toFixed(1)}% &nbsp;
    <span class="muted">Min reach</span> ${Math.min(...bins).toFixed(2)} &nbsp;
    <span class="muted">Max reach</span> ${Math.max(...bins).toFixed(2)}</div>`;
}
