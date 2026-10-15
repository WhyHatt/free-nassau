# v3 designer audit: does each thing earn its place?

Method: listed every resource, stat, keyword, status, node, screen element and event in v2.5, then asked four questions. Does it change a decision at least once per run? Is it a distinct verb from something else? Can a new player read it on a phone without a tooltip? Does the sim show it matters?

## Resources (v2.5: 11 things → v3: 4)
| v2.5 | verdict | why |
|---|---|---|
| Coin + Silver cargo | **merged: Silver** | Two currencies with a Fence node to convert them. Silver was only ever a slower coin. One number now buys everything and is also what you bank. |
| Gunpowder | keep | Distinct verb: fuels cannons. |
| Food + Water | **merged: Rations** | Always bought together, always eaten together; two icons for one decision. |
| Timber + Rope | **merged: Repair kits** | Only ever used as a pair at the cove; sold and tracked as two items. |
| Rum | **cut** | Existed only to refill morale. |
| Charts (maps) | **cut** | Only opened the Wreck node, which paid out like a small treasure. |
| Hold capacity | **cut** | A cap on a stockpile nobody could stockpile; each supply now has its own small cap (14/12/6). |
| Crew morale (0-100) | **cut (Ren)** | See below. |
| Crew number, Hull, Captain HP | keep | The three health tracks are the locked core. |

## Morale (removed) and what touched it
Morale fed: mutiny screen, rum, hold limit (rum), fence (+5), victory (+8/+3), shortages (-8 each), retreat (-15), abandon (-20), low-morale boarding penalty, 3 cards (Rally the Crew, Prince's Share, Fair Shares), Jennings and Bellamy passives, the Tavern building, an event, and a HUD gauge. Rebalance:
- Cards that gave morale now **restore crew** (Rally 3 + 4 Block, Prince's Share 6 + draw, Fair Shares 5 + 6 Block). Crew is the number that actually dies, so these are real value.
- Shortage: no rations → 4 crew starve per leg (was -8 morale and -3 crew per missing item).
- Retreat from boarding: lose 20% of crew, no loot (was -15 morale).
- Abandon ship: loses half supplies and silver and 40% crew as before; no morale hit.
- Jennings: +15% silver (was "morale losses halved"). Bellamy: +30% silver and cheaper hires (dropped morale clause).
- Tavern building → "Harbour Tavern": +crew and +rations at the start of a run.
- Mutiny, rum, the tavern node, dice and morale HUD all removed.

## Keywords and statuses (v2.5: 8 → v3: 5)
Evasion, Guard, Block meant the same thing ("absorbs damage this turn") with different icons. → **Block**. Strength (one card, one captain) → plain text "All your damage +2". Weak, Burn (renamed from Burns), Advantage and Exhaust stay. Enemy "Double-load guns" intent (a hidden buff that stacked forever) removed; those slots are now ordinary attacks.

## Nodes (10 → 8)
Fence (convert silver), Tavern (heal, rum, crew, dice) and Wreck (needs a chart) removed. Healing moved to a **Surgeon** button in ports and a choose-one at the cove; crew hiring stays at Recruit nodes.

## Screen elements removed
HUD: morale gauge, hold counter, rum button, 2 of 6 cargo icons. Combat: enemy-pattern strip, own-ship picture, Evasion/Guard distinction, loaded-guns tag. Weather: Calm and Fog (small numbers on already busy states) removed, 4 weather states left.

## Added back for depth where content was thin
Acts II and III had 3-4 enemy types and 6 events. Added: Wrecker Cutter, Treasure Galleon (rich, tanky, low damage), Navy Revenue Cutter, Guarda Costa Capitana (Act II elite), Royal Navy Warship (Act III elite); 12 events tagged by act (was 7). Deterministic ship reward (no random roll). Notoriety ladder N1-N5, unlocked by winning.
