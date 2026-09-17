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

## Interface and keyboard shortcuts

Pinned controls and signal history follow the JK-vippa interface. Drag either panel's separator to adjust its height, or focus the separator and use the up/down arrow keys. HIGH circuit paths and timeline segments are red; cyan remains the interface accent.

| Key | Action |
| --- | --- |
| D | Toggle data |
| C | Toggle CLK by one half-period |
| S | Run one complete 1 Hz cycle |
| A | Start/pause automatic 1 Hz clock |
| R | Reload the starting state and clear history |
| F | Toggle fullscreen |
| T | Show/hide top controls |
| B | Show/hide bottom timeline |

Shortcuts ignore key repeat, text entry, and Ctrl/Alt/Command combinations. Manual clock actions remain disabled while clocking. Panel changes do not affect circuit state. The logic, 500 ms half-period, circuit geometry, and four history signals (D, CLK, Qm, Qs) are unchanged.

## Lab tabs

Tab 1 is a four-NAND gated D-latch with D/E/Q history and a live truth table. D toggles data; E toggles enable. No inverter or automatic clock is shown. Tab 2 retains the master–slave circuit (C toggles CLK, S runs one cycle, A toggles automatic clocking). Keys 1/2 select tabs. Each tab keeps its own state and history; switching tabs stops the clock. Reset affects the active tab. Direct links: #d-latch and #master-slave.

N (Nästa steg) appends the current signals to history without changing circuit state. Available in both tabs; disabled during automatic clocking and a single cycle. It advances an event step, not elapsed seconds.
