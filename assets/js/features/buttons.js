// Button grid and analog trigger bars. Buttons stay highlighted once pressed
// so you can check every one works.

import { BUTTONS, TRIGGERS } from "../config.js";
import { $ } from "../core/dom.js";

export function createButtonPanel(grid) {
  grid.innerHTML = BUTTONS.map(([i, name]) => `<div class="btn" id="b${i}">${name}</div>`).join("");

  function update(p) {
    for (const [i] of BUTTONS) {
      const el = $("b" + i), b = p.buttons[i];
      if (!b) { el.hidden = true; continue; }
      el.hidden = false;
      const on = b.pressed || b.value > 0.5;
      el.classList.toggle("on", on);
      if (on) el.classList.add("seen");
    }
    for (const [i, k] of TRIGGERS) {
      const v = p.buttons[i] ? p.buttons[i].value : 0;
      $("bar" + k).style.width = (v * 100).toFixed(1) + "%";
      $("val" + k).textContent = Math.round(v * 100) + "%";
    }
  }

  function reset() {
    grid.querySelectorAll(".btn.seen").forEach((el) => el.classList.remove("seen"));
  }

  return { update, reset };
}
