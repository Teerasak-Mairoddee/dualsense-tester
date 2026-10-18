// Drift test: sample both sticks at rest and report how far they sit from centre.

import { DRIFT_MS } from "../config.js";
import { fmt } from "../core/dom.js";

export function createDriftTest({ button, status, result }) {
  let run = null; // { start, samples: { L: [], R: [] } }

  button.addEventListener("click", () => {
    run = { start: performance.now(), samples: { L: [], R: [] } };
    button.disabled = true;
    result.innerHTML = "";
  });

  function sample(axes) {
    if (!run) return;
    const t = performance.now() - run.start;
    run.samples.L.push([axes[0] || 0, axes[1] || 0]);
    run.samples.R.push([axes[2] || 0, axes[3] || 0]);
    status.textContent = `Sampling… ${Math.max(0, (DRIFT_MS - t) / 1000).toFixed(1)}s`;
    if (t >= DRIFT_MS) finish();
  }

  function finish() {
    result.innerHTML = ["L", "R"].map((k) => report(k, run.samples[k])).join("");
    status.textContent = "";
    button.disabled = false;
    button.textContent = "Run again";
    run = null;
  }

  function reset() {
    run = null;
    button.disabled = false;
    status.textContent = "";
    result.innerHTML = "";
  }

  return { sample, reset };
}

function report(k, pts) {
  const n = pts.length || 1;
  const mx = pts.reduce((a, p) => a + p[0], 0) / n;
  const my = pts.reduce((a, p) => a + p[1], 0) / n;
  const maxMag = Math.max(0, ...pts.map((p) => Math.hypot(p[0], p[1])));
  const jitter = Math.max(0, ...pts.map((p) => Math.hypot(p[0] - mx, p[1] - my)));
  const [cls, word] = maxMag <= 0.05 ? ["good", "No drift"] : maxMag <= 0.12 ? ["warn", "Slight drift"] : ["bad", "Drift"];
  // Smallest deadzone that would hide the resting offset, with a little margin.
  const suggest = Math.min(0.3, Math.ceil((maxMag + 0.02) * 100) / 100);
  return `<div><b>${k === "L" ? "Left" : "Right"} stick</b> &nbsp;<span class="tag ${cls}">${word}</span><br>
    <span class="muted">Resting offset</span> ${Math.hypot(mx, my).toFixed(3)} (X ${fmt(mx)}, Y ${fmt(my)}) &nbsp;
    <span class="muted">Peak</span> ${maxMag.toFixed(3)} &nbsp;
    <span class="muted">Jitter</span> ${jitter.toFixed(3)} &nbsp;
    <span class="muted">Suggested deadzone</span> ${suggest.toFixed(2)}</div>`;
}
