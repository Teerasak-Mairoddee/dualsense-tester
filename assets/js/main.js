// Entry point: wires the controller selector and the test features together
// and runs the per-frame loop.

import { $, escapeHtml } from "./core/dom.js";
import * as pad from "./core/gamepad.js";
import { createStick, resetStick, drawStick, bindDeadzone } from "./features/sticks.js";
import { createDriftTest } from "./features/drift.js";
import { createCircularityTest } from "./features/circularity.js";
import { createButtonPanel } from "./features/buttons.js";

const sticks = {
  L: createStick($("stickL"), $("readL")),
  R: createStick($("stickR"), $("readR")),
};
const deadzone = bindDeadzone($("deadzone"), $("deadzoneVal"));
const drift = createDriftTest({ button: $("driftBtn"), status: $("driftStatus"), result: $("driftResult") });
const circ = createCircularityTest({ sticks, button: $("circBtn"), resetButton: $("circReset"), result: $("circResult") });
const buttons = createButtonPanel($("buttons"));

function resetTests() {
  resetStick(sticks.L); resetStick(sticks.R);
  drift.reset(); circ.reset(); buttons.reset();
}

// Show the empty state or the tester, and the controller picker when there are several.
function render() {
  if (pad.ensureSelection()) resetTests();
  const list = pad.pads();
  const sel = $("padSelect");
  $("empty").hidden = list.length > 0;
  $("app").hidden = list.length === 0;
  sel.hidden = list.length < 2;
  sel.innerHTML = list.map((p) =>
    `<option value="${p.index}" ${p.index === pad.selectedIndex() ? "selected" : ""}>${escapeHtml(pad.shortName(p))}</option>`
  ).join("");
  $("padInfo").textContent = list.length === 1 ? pad.shortName(list[0]) : "";
}

function frame() {
  const p = pad.currentPad();
  if (!p && pad.pads().length) render();
  if (p) {
    const ax = p.axes;
    const lx = ax[0] || 0, ly = ax[1] || 0, rx = ax[2] || 0, ry = ax[3] || 0;
    circ.sample(sticks.L, lx, ly); circ.sample(sticks.R, rx, ry);
    drawStick(sticks.L, lx, ly, deadzone.value); drawStick(sticks.R, rx, ry, deadzone.value);
    drift.sample(ax);
    buttons.update(p);
  }
  requestAnimationFrame(frame);
}

if (!pad.supported()) {
  $("empty").innerHTML = '<div class="big">This browser doesn’t support controllers.</div><div>Try Chrome, Edge, Firefox or Safari.</div>';
} else {
  pad.onConnectionChange(render);
  $("padSelect").addEventListener("change", (e) => { pad.select(+e.target.value); resetTests(); render(); });
  render();
  requestAnimationFrame(frame);
}
