# Masterslav D-vippa · 1 Hz

Static interactive teaching simulator for a NAND-based master–slave D flip-flop.

- D toggles the data input; CLK advances one half-period manually.
- Automatic clock: 1 Hz, 50% duty cycle (500 ms per phase).
- Single cycle: two half-periods, 1 second total.
- Master follows D while CLK is high; slave receives the held master value when CLK falls.
- History displays the latest 24 events for D, CLK, Qm and Qs. It is an event axis, not elapsed time.
- Complementary signals remain internal to the latch feedback; they are not displayed as outputs.
- Reset loads the demonstration start state. It is not a physical reset input.

The original layout, CSS and SVG circuit geometry are retained. Only the ampersand text inside the eight NAND gates is removed.

## Hosting and checks

GitHub Pages serves the repository root with `.nojekyll`. No dependencies or build step are required.

Run `node test-model.mjs` for gate equations, latch behavior and clock timing checks. To view locally, serve this directory with a static HTTP server (for example `python -m http.server 8000`), since the app uses JavaScript modules.

The model assumes ideal settled logic and does not simulate propagation delay, contact bounce or analog metastability.
