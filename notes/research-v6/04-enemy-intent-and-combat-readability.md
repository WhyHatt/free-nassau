# 04. Enemy intents, readability and combat clarity

## Sources
- Ars Technica, Slay the Spire interview (intents were added because testers were confused): https://arstechnica.com/gaming/2019/05/video-slay-the-spire-is-a-friendly-game-of-death-but-it-was-hard-to-get-it-right/
- Game Design Lab, StS onboarding page (Cultist as a worked example of intent): https://teemo.dev/game-design/slay-the-spire/systems/onboarding-and-first-session/
- Wildfrost Wiki, Getting Started (counters, order of play): https://wildfrostwiki.com/Getting_Started
- MCV/DEVELOP, Wildfrost interview: https://mcvuk.com/business-news/when-we-made-wildfrost/
- Game Developer, Cobalt Core interview (every enemy is a question): https://www.gamedeveloper.com/design/how-cobalt-core-makes-movement-as-exciting-as-fighting-in-its-roguelike-deckbuilder-combat
- tann, Slice & Dice history (Event Horizon lessons): https://tann.fun/article/slice-dice-published
- Game Developer, Inscryption GDC 2022 summary (symbols over text, in-game rulebook): https://www.gamedeveloper.com/marketing/-i-inscryption-s-i-journey-from-game-jam-joint-to-cult-classic
- Thumbsticks, Inscryption GDC art talk: https://www.thumbsticks.com/magic-myst-pokemon-inspire-inscryption/

## What they say
- StS: players could not plan without intents. A fixed-damage intent on the first fight is the "worked example" that teaches block-or-attack.
- Wildfrost: every unit shows a visible counter, so the whole enemy turn is a countdown you can read; rules are simple and consistent.
- Cobalt Core designers: "each enemy is kind of a question to the player", and they varied fights to ask different questions (one hard attack vs many small ones, enemies that dodge, seeker missiles you can't dodge).
- Slice & Dice's author on his earlier ship-vs-ship card game Event Horizon: "The UI was very complicated, enemy turns were confusing." He also removed combo abilities because they were "too complicated... unclear exactly how to get them".
- Inscryption used symbols (sigils) instead of text because card text was hard to read at low resolution, and added an in-game rule book you click for the meaning.

## Takeaways for Free Nassau
1. Every enemy ship gets a visible intent rail of the next 3 moves (icon + number + target icon), a fixed readable pattern, and 1 "tell" tag (Armoured, Fast, Boarder, Gunner). We already hide the pattern strip since v3; v6 brings back a compact one.
2. Tapping an intent explains it in words ("14 hull damage; Block absorbs it; 2 crew die per 4 hull lost"). This is the "why 14 damage?" tooltip, and the same tap-through works on our own cards: show base + modifiers (Guns +2, Wind +2, Weak -25%).
3. Design enemies as questions: Hunter Sloop (fast, many small hits: needs Block), Galleon (huge hull, big brace: needs Fireship/chain shot), Fireship (suicide boarder: sink it early), Merchant (rich, weak: tempts you), Navy Cutter (rakes crew: grape), Guarda Capitana (calls reinforcements). Each is countered by a different deck plan, so no single strategy wins everything.
4. Keep the card text short; use icons and consistent keyword chips (Block, Burn, Weak, Powder). A "rules" screen (rulebook) lists them.
