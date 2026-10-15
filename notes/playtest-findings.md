# v3 designer playtest notes (Oct 14, 2026)

Sources: 8 UI-driven runs (`playtest.js`: taps the real DOM at 390x844, captains Blackbeard, Bellamy, Vane, Bonny & Read, Rackham at Notoriety 0-5; JSON in this folder) plus about 2,800 headless bot runs (`sim.js`).

## Before / after (bot, Notoriety 0)
| captain | v2.5 (240 runs) | v3 (400 runs) |
|---|---|---|
| Blackbeard | 33% | 24% |
| Bellamy | 10% | 33% |
| Vane | 17% | 32% |
| Bonny & Read | 40% | 34% |
| all four | 25% | 31% |
| Rackham (unlock, 120 runs) | not measured | 21% |
Deaths (v2.5 → v3): Act I 8% → 4%, Act II 6% → 6%, Act III 61% → 60% of all runs. Notoriety (bot): N1 33%, N3 16%, N5 3%.

## What the playtests found
1. **Removing morale alone made the game trivial (84-95% bot wins).** The v2.5 "25%" was mostly morale and starvation spirals, not enemies. Normal fights cost about 0 hull and 0.2 captain HP, and the bot reached every boss at 96-99% HP and hull. Resource attrition, the core of the genre, was not there. Fix: enemy damage dial now ~1.9x effective (flat across acts), per-act boss dials.
2. **Act III damage spiked.** The act scale (1.55) stacked on the new dial gave 28-damage broadsides against a 45-hull sloop: 3.7 ship losses per run and a death spiral (abandon → 60%-hull periagua → abandon again). Fixed by making the dial per act so damage stays flat, abandoning now leaves a full-hull periagua, and ports got a Carpenter. Ship losses per run: 3.7 → 1.2.
3. **Ports could not repair the hull** (only the 4%-weight shipwright, the cove, or a Bosun card). Added Carpenter (15 hull for 20 silver, once per visit).
4. **Treasure Galleon was a slog** (brace-heavy, 90+ hull) and the top source of Act II ship losses. Lowered its damage and brace values.
5. **Dominated or dead cards.** Parry (any phase, 7 Block, 1 energy) beat Tack Hard and Hold the Rail outright: removed from reward pool (still Bonny & Read's starter). Command (draw 2) was strictly worse than Ship's Articles / Iron Resolve: cut. Boarding Axes (13 for 2) equalled two Cutlasses: now 16. Take the Weather Gauge (lift -15): 3 → 5 Block. Defiance (lift -14, one buff): now also gives 5 Block. Still weak: Raking Fire, Crowd Sail, Fireship (lift -5 to -9). Twelve cards remain that are "gain N Block" with small variations: flagged for Ren.
6. **Captains.** Bellamy (10%): his passive was economy only and his cards restored morale. Now starts with Jennings aboard, 66 HP, restore-crew cards. Vane (17%): died at the Act II Stockade because he had few crew cards; gets Pistol Volley instead of Crowd Sail, Defiance gives Block. Blackbeard lost a ship card in the merge and was weak at the Act I boss: deck swaps Hold the Rail for a second Swivel, 78 HP. Bonny & Read: Twin Blades (+17pp) and Captain's Pistol (+22pp) lift is the +2 captain-card bonus; trimmed by changes elsewhere, now 34%.
7. **Officers are balanced** (27-39% win rate with each; Jennings, Hatch, Shea best, Purser, Hands, Pruitt lowest). No officer is a must-pick or a dead pick.
8. **Final boss cliff.** 60% of all runs end at Hornigold (88 ship phase, 16 boarding, 129 duel, out of 233 deaths there). Smooth in the early game, steep at the end. Open question for Ren.
9. **Tedium.** Select-then-confirm costs 2 taps per card: normal fights 40-70 taps, bosses 100-200 (Hornigold ran 17-22 turns in some runs), about 1,000 taps per full run. Bosses are the long part. Open question: optional one-tap play for experienced players, shorter boss fights.
10. **Layout (no scrolling).** Playtest caught three overflows the old test missed: the Board row plus a two-line log (+15px), the Hornigold duel portrait (+24px), and the old "grey cards" hint line. Fixed: compact Board row, smaller duel portrait, shorter hand cards, hint folded into the detail panel. All screens now fit at 390x844 (test.js checks 12 screens).
11. **Events:** 12 now (was 7), tagged by act, no repeats within a run until the act's pool is used up. Bot picks options at random, so event balance was not measured.
12. **Rations:** with +3 for 12 silver at ports and a 12 cap, the bot never starved. Rations pressure is low; consider a lower cap or fewer legs per ration. Open.
