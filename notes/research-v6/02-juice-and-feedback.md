# 02. Juice, game feel and pacing of feedback

## Sources
- Jan Willem Nijman (Vlambeer), "The Art of Screenshake", INDIGO Classes 2013: https://www.youtube.com/watch?v=AJdEqssNZ-U (summary at https://www.gamedeveloper.com/design/vlambeer-co-founder-shares-advice-on-building-better-action-games and https://gamedesign.gg/watch/art-of-screenshake/)
- Game Design Lab, "Game Feel & Juice: Balatro systems": https://teemo.dev/game-design/balatro/systems/game-feel-and-juice/
- GamesRadar+, Balatro flame effect: https://www.gamesradar.com/games/roguelike/after-winning-big-at-the-game-awards-and-taking-hours-of-our-time-in-2024-balatro-creator-reveals-their-most-productive-night-resulted-in-one-of-the-games-most-satisfying-features/
- LocalThunk, "The Balatro Timeline": https://localthunk.com/blog/balatro-timeline-3aarh
- Washington Post, Balatro developer interview: https://www.washingtonpost.com/entertainment/video-games/2024/09/26/balatro-mobile-release-localthunk-interview/

## What they say
- Nijman's talk: a deliberately dull shooter becomes exciting through about 30 small, cumulative changes (bigger bullets, muzzle flash, hit-stop, camera kick, screenshake, sound). Shaking opposite to the gunfire is one example. He also notes shake can overdo it, which is why a slider matters.
- Balatro "spends its entire feel budget on the output side": input is instant, the machine's response is "a long, loud, sequential performance". Scoring is serialised one effect at a time (card pops, number appears in the role colour, pitched audio step up the ladder, particle burst, accumulator updates after, the cause bounces) so players can read what happened.
- Balatro ships three player-authored feel controls: Game Speed 0.5x/1x/2x/4x, Reduced Motion (also forces screenshake off), and a Screenshake slider (default 30% desktop, 50% mobile). The Game Design Lab author calls the speed option "the least-copied decision": the juice that sells run 1 "becomes a tax by run 400".
- The signature flame on a won hand was a friend's suggestion and took one night.
- Cascades escalate once only: the flame fires once per hand at most. Escalation is reserved.
- Mobile build adds haptics on the same beats.

## Takeaways for Free Nassau
1. Build combat feedback as a serialised queue: windup, projectile, impact, number, bar drains, then reaction. Never simultaneous. One effect per beat, ordered cause-then-effect.
2. Ship FX speed (1x/2x/skip) as a first-class setting from run 1; default 1x, with an on-screen fast-forward button during enemy turns.
3. Screenshake amount slider plus Reduce motion that zeros shake, particles and ambient motion (we already have an RM flag).
4. Escalation: normal hit < crit < killing blow < sinking, each with one extra layer (bigger shake, flash, sound layer), but a killing blow on a boss gets the biggest moment, once.
5. Haptics through navigator.vibrate on Android for broadside/hit (optional toggle, no-op on iOS Safari).
6. Colour discipline for numbers (hull damage, crew casualties, captain wounds, Block) so numbers carry meaning without reading.
