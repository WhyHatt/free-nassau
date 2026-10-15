# 05. Route choice and map depth

## Sources
- Game Developer, Slay the Spire "Road to the IGF" interview (map inspired by FTL): https://www.gamedeveloper.com/game-platforms/road-to-the-igf-mega-crit-games-i-slay-the-spire-i-
- Slay the Spire wiki, Map Locations: https://slaythespire.wiki.gg/wiki/Map_Locations
- r/slaythespire pathing threads: https://www.reddit.com/r/slaythespire/comments/1lugqnh/are_there_best_practices_or_guidelines_in_pathing/ , https://www.reddit.com/r/slaythespire/comments/18808xz/what_paths_to_generally_choose/
- Episodic Content, "Anything But Sports: The Making of FTL" chapters 2 and 4: https://episodiccontentmag.com/2015/06/10/anything-but-sports-the-making-of-ftl-chapter-2-of-4/ , https://episodiccontentmag.com/2015/08/10/anything-but-sports-the-making-of-ftl-chapter-4-of-4/
- Game Design Lab, Loop Hero retreat vs death rules; IGN Loop Hero risk vs reward: https://teemo.dev/game-design/loop-hero/systems/retreat-vs-death-loot/ , https://www.ign.com/wikis/loop-hero/Risk_Vs._Reward
- Game Design Lab, StS onboarding page (the whole map is drawn up front so route planning is legible): https://teemo.dev/game-design/slay-the-spire/systems/onboarding-and-first-session/

## What they say
- Mega Crit: choosing a path "adds an extra element of risk/reward and planning"; they credit FTL.
- StS pathing advice from players (search summary of the Reddit threads and wiki): elites are the highest-value nodes but only when your deck can take them, avoid chained elites with no recovery, rest before an elite, shops are only worth it with gold. This means the decisions are real because nodes have different price/value and are visible in advance.
- FTL: random events at each beacon; the drive recharge creates pressure to fight, flee or continue, and balance came from weighing enemy difficulty against upgrades gained so far.
- Loop Hero: resources kept at 100% when you retreat at the camp, 60% mid-loop, 30% on death (IGN/Game Design Lab summary). This is the same shape as our extraction rules, so we should present "sail home or push on" as the core risk/reward gamble at every extraction point.
- Our own data (240 bot runs): always taking the middle lane cost only about 5 points of win rate. The map was shallow because all nodes were mostly the same fight.

## Takeaways for Free Nassau
1. Widen to 4 lanes, 3 nodes of visible choice per step; show node types and a threat icon. Put a hard fork every 2-3 rows: safe fight vs elite for relic/officer vs port vs event.
2. New nodes: Mystery (hidden: event or ambush), Smuggler's cove (trade: sell a card, buy rations), Storm (a modifier node with free plunder but hull damage), Wreck (salvage, risk), Fort Raid (optional mini-boss for officers), Prize ship (boarding-only fight, easy, crew risk).
3. Resource pressure: rations per leg stays but at 1 per 2 legs, because the bot never starved. Add a pursuit clock (Notoriety/"Navy heat") that rises each leg and spawns hunters, so skipping fights isn't free.
4. Keep guaranteed beats: a port or cove before the first elite; one guaranteed elite per act so "no elite" is a visible choice.
