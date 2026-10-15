# 11. Audio: procedural music and effects

## Sources
- web.dev, "A tale of two clocks" (scheduling Web Audio precisely): https://web.dev/articles/audio-scheduling
- MDN, Web Audio API advanced techniques: https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Advanced_techniques
- American Musicological Society, "What is a 'sea shanty'?" by James Revell Carr: https://musicsofamerica.org/what-is-a-sea-shanty/
- Game Design Lab, Balatro game feel (pitched audio ladder, haptics beats): https://teemo.dev/game-design/balatro/systems/game-feel-and-juice/
- Game Accessibility Guidelines (separate volume for effects and music; no essential info by sound alone): https://gameaccessibilityguidelines.com/full-list/
- tann, Slice & Dice page comments (iOS audio glitches with Bluetooth headphones when other audio plays): https://tann.fun/article/slice-dice-published (user comments; anecdotal)

## What they say
- Web Audio best practice: use AudioContext.currentTime as the clock and a short setTimeout/setInterval look-ahead scheduler (e.g. 25 ms timer, 100 ms lookahead) so notes land precisely; generative music changes the sequence before each scheduling pass.
- Shanties: work songs with call-and-response; hauling shanties use short calls and a repeated refrain with accented pulls; heaving shanties have longer refrains and a steady marching rhythm (AMS). "Rousing", "driving rhythm".
- Balatro: pitch climbs with each consecutive trigger so the ear tracks cascade length.
- Anecdote: iOS users reported audio glitching in a mobile game when Bluetooth headphones and other audio play together; so keep audio simple, resume the AudioContext on user gesture, and pause when the page is hidden.

## Takeaways for Free Nassau
1. Generative music engine in sfx.js: a scheduler with 25 ms interval / 120 ms lookahead; modal (Dorian-flavoured minor) call-and-response phrases generated from a seeded pattern: a "shantyman" lead (triangle/pulse) answers a "crew" chorus (stacked detuned saws, soft), over a drone (fifth) and a steady 6/8 hand-drum/stomp. Four moods: Harbour (calm/Nassau, slow), Sailing (map, medium), Battle (faster, more percussion), Boss (minor, low brass-like pads, drum hits), plus stingers (victory, defeat, boarding horn).
2. Volume controls: Music, Effects, mute; saved; defaults music 40%. Pause on visibilitychange, resume on touch.
3. SFX: layered cannon (noise burst + low sine thump + crackle), splintering (filtered noise + clicks), cutlass clang (two detuned square pings), crew shout (formant sweeps), sea wash (pink noise), creaking (filtered saw LFO), coin ladder (pitch stepping up), sinking (descending glug).
4. Every cue also has a visual (number pop, shake) so the game works muted.
