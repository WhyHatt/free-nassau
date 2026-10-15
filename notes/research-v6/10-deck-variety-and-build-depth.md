# 10. Deck variety, build depth and avoiding dominant strategies

## Sources
- Game Developer, StS data article: https://www.gamedeveloper.com/design/how-i-slay-the-spire-i-s-devs-use-data-to-balance-their-roguelike-deck-builder
- PCGamesN, StS streamers and metrics: https://www.pcgamesn.com/slay-the-spire/slay-the-spire-balance
- Game Developer, StS IGF interview: https://www.gamedeveloper.com/game-platforms/road-to-the-igf-mega-crit-games-i-slay-the-spire-i-
- RPS, Monster Train clan combos: https://www.rockpapershotgun.com/every-roguelike-can-learn-from-monster-trains-clan-combos
- Game Developer / RPS, Monster Train balance passes: https://www.rockpapershotgun.com/monster-trains-wild-mutations-update-just-nerfed-your-favourite-cards
- Terry Cavanagh, Dicey Dungeons Jester diary: https://distractionware.com/blog/2019/02/design-diary-the-jester/
- Wildfrost wiki Getting Started (Companions swap, Crowns): https://wildfrostwiki.com/Getting_Started
- Luck be a Landlord blog (search summaries): https://blog.trampolinetales.com/questions-and-danswers/ , https://blog.trampolinetales.com/the-big-buffs-update-preview/
- Cobalt Core press kit (crew-specific cards, 3 crew per run, hundreds of char+ship combos): https://braceyourselfgames.com/press/cobalt-core/

## What they say
- StS: avoid a single dominant strategy; a variety of enemies counter different plans. Constrained drafting forces creativity. Measure pick rate and presence in winning decks, but remember late-appearing cards inflate "win presence".
- Monster Train: two clans + champion variants mean "20 possible ways to start each run"; some clan pairs were OP and later nerfed.
- Dicey Dungeons: each class varies a fundamental rule; if picking up stuff is pure cost the best play is to pick up nothing, so add trash cards and conditional cards (order-dependent cards) to make deck choices interesting. "Too many different cards is overwhelming" at the start.
- Cobalt Core: each of 3 crew brings their own deck and playstyle; mixing is the replayability.
- Luck be a Landlord (summary): multiple viable strategies per run, escape routes, avoid tunnel vision.

## Takeaways for Free Nassau (answers R2-2, R2-3)
1. Our sim: bot that skips all cards wins 23% vs 29% with picks; ship tier correlates strongly. So make cards matter: (a) 60+ cards in 6 archetypes; (b) each archetype has a payoff and an enabler (e.g. Burn: Fireship + Hot Shot payoff; Boarding: Grenades + Axes; Powder: Broadside + Double Shot; Captain's Grit; Seamanship Block-and-draw; Cunning/Plunder economy); (c) upgrades at ports/coves (Upgrade a card +) so each card has two states; (d) card removal ("Dismiss a hand") at ports to enable thinning, priced so thinning has a cost.
2. Phase-lock fix: make every card playable in both phases but with different effects ("Cutlasses: at sea, deal 3 damage to the enemy deck crew via a boarding party prepare; in boarding, kill 6"). Simplest: a card has a ship effect and/or a boarding effect, and the phase tag controls which one fires. No grey cards.
3. Start each run with a Doctrine choice (2 of 4 doctrines at Nassau) which swaps 2-3 cards and sets the first reward bias.
4. Add trash/curse-ish cards as plunder costs: "Heavy Plunder" (a clutter card that costs 0 and weighs your deck) that you accept for extra silver; thinning matters.
5. Balance telemetry in sim.js: pick rate (when offered) and win-presence tables per card; goal bands: every card in 10-60% of winning decks.
