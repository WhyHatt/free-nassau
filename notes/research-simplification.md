# Research notes: keeping resources and statuses low and readable (Oct 14, 2026)

Sources are linked; each note is the takeaway I used for pruning.

- **Slay the Spire** (teemo.dev Game Design Lab, "Combat: Energy, Block & Enemy Intent" and "Systems Architecture"): a tiny status vocabulary (Vulnerable x1.5, Weak x0.75, Strength, Dexterity, a few stacks), each one a stack count plus one damage-pipeline hook, named so direction is obvious. One defensive word (Block) that resets every turn. Takeaway: one word per job, never two words for the same thing. We had Evasion, Guard and Block; they now are all Block.
- **Slay the Spire intents** (Rock Paper Shotgun, Ars Technica War Stories): the first "next move" display "turned the game into a game of maths"; MegaCrit cut it to one icon per enemy. Takeaway: show the current intent only, plus at most one thing ahead. We dropped the full-pattern strip.
- **FTL** (ftl.fandom.com Stores and resources; RPS interview with Justin Ma): four resources total (scrap, fuel, missiles, drone parts), scrap is the one currency for everything, and "we love complex gameplay mechanics but we hate how they lead to a cumbersome interface"; power and health share one meter. Takeaway: ONE currency, a small number of consumables that each gate a different verb, and combine meters that tell one story. Free Nassau now has one currency (Silver) and three consumables (powder, rations, repair kits).
- **Monster Train 2** (Shiny Shoe talk; Secret 6 mobile port): they cut covenants from 25 to 10 to make progression chunkier and kept mobile screens concise rather than bigger. Takeaway: fewer, chunkier options beat many small ones; trim the node list.
- **Inscryption** (GDC 2022 postmortem via gamedeveloper.com): symbols with a rulebook instead of text, and the world carries the state (teeth on a scale, candles). Takeaway: icons + one-line rules; keep the keyword list short enough to fit a rulebook page.
- **Balatro** (teemo.dev Game Feel & Juice): a tiny set of resources (hands, discards, money) and all the depth comes from combinations of content, not from more resources. Takeaway: depth should come from cards and officers, not extra meters.
- **Hades** (teemo.dev UX/UI): icon-first boons, no dense HUD; criticism that small HUD text is hard to read. Takeaway: fewer HUD items, bigger.

## Pruning rules we adopted
1. One word per job (Block replaces Evasion, Guard and Block).
2. One currency (Silver). One consumable per distinct verb: fuel (powder), upkeep (rations), repair (repair kits).
3. A resource or meter must change a decision the player makes at least once per run; morale, rum, charts and hold space did not.
4. Nodes must not duplicate each other (Fence, Tavern and Wreck were folded into Port, Cove and Events).
5. Enemy patterns: attack, crew attack, aimed shot, brace. No buff intent.

## Result
Resources 11 → 4 (silver, powder, rations, repair kits). Keywords 8 → 5. Nodes 10 → 8 (Fence, Tavern, Wreck cut). See v3-audit.md and playtest-findings.md.
