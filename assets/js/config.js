// Tunables and controller layout shared across the tester.

export const TRAIL_LEN = 60;   // stick trail length in frames (~1 s at 60 fps)
export const CIRC_BINS = 72;   // circularity resolution: 5° per bin
export const DRIFT_MS = 3000;  // how long the drift test samples the sticks at rest

// Canvas colours; keep in sync with the tokens in assets/css/base.css.
export const COLORS = {
  line: "#1e1e1e",
  muted: "#6e6e6e",
  accent: "#ffffff",
  good: "#7ad9a6",
};

// Standard-mapping button indices, labelled for DualSense.
export const BUTTONS = [
  [0, "Cross ✕"], [1, "Circle ○"], [2, "Square □"], [3, "Triangle △"],
  [4, "L1"], [5, "R1"], [6, "L2"], [7, "R2"],
  [8, "Create"], [9, "Options"], [10, "L3"], [11, "R3"],
  [12, "D-Up"], [13, "D-Down"], [14, "D-Left"], [15, "D-Right"],
  [16, "PS"], [17, "Touchpad"], [18, "Mute"],
];

export const TRIGGERS = [[6, "L2"], [7, "R2"]];
