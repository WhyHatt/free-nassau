# v5 polish pass (interaction, playability, look and feel)

Layers: `polish.css` (after `chart.css`) and `ui6.js` (last script). Mechanics are untouched.

## What changed
- **Detail panel** is one component (`dbody`), always in the layout flow. Combat: Play / Swap / "No energy" button (44px) + wax-seal close. Reward / port / remove / prize cards dock above the footer (the footer hides while a card is open), so nothing is ever covered.
- **Hand**: single overlapped row up to 5 cards, tidy centred 2-row grid from 6 (compact cards, text lives in the detail panel).
- **Feedback**: press states everywhere, End Turn "ready" pulse when nothing is playable, red cost ring / red price when you cannot afford it, turn banner, "Turn N · phase · your move" chip, draw-from-pile and discard-to-pile card flights, card fly to enemy (attacks) or to your Block (others), hit burst, red edge flash, gauge shake, bigger damage numbers.
- **Guards**: 450ms lock on transitional actions (End Turn, Board, Flee, Retreat, take / buy / remove card, events, sail on...), 240ms carry-over tap guard after a screen change, Escape closes the logbook / deselects.
- **Settings**: Sound and Reduce motion switches (persisted, also follows the OS setting).
- **Sound**: master 0.7 -> 0.5, soft tick on select, thud on invalid, page on logbook, quiet turn chime.
- **Art**: wax seal redrawn (scalloped wax, pressed disc, embossed skull, highlight), ships redrawn (planking, wale, gun ports, stern lights, seamed billowed sails, rigging, bow wave), fort redrawn as a painted scene.
- **Screens**: shipwright (tiles, pips, ship rows), cove, events (lettered options with consequence line), reward (rows), consistent top-aligned titles, short-phone (<=780px) mode.
- **Tap targets**: invisible 44px hit areas for the officer badges, seal and flee/retreat; 44px+ buttons elsewhere.

## Tools
`node tools/audit.js <w> <h> <outdir> [filter]` walks ~60 states and reports scroll / tiny tap / clipped / tiny font / overlap. `CLEAN=1` turns animations off for report screenshots. `tools/asheet.py` makes side-by-side sheets. `tools/livefeel.js` plays real-timing taps against the live URL.
