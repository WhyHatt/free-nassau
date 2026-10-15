# 08. Accessibility (text, targets, colour, one-handed play, motion)

## Sources
- Game Accessibility Guidelines, full list: https://gameaccessibilityguidelines.com/full-list/
- W3C WAI, Target Size (Minimum) 2.5.8 and (Enhanced) 2.5.5: https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum , https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced
- W3C WAI, Use of Color 1.4.1: https://www.w3.org/WAI/WCAG21/Understanding/use-of-color.html
- BBC accessibility for products, content resizing: https://www.bbc.co.uk/accessibility/forproducts/guides/mobile/content-resizing
- Okabe-Ito palette (siegal lab page and others): https://siegal.bio.nyu.edu/color-palette/
- TheSixthAxis StS mobile review (text too small, essential tremor, mis-taps): https://www.thesixthaxis.com/2021/03/03/slay-the-spire-mobile-review/
- Balatro settings (Reduced Motion, Game Speed, Screenshake slider, Play/Discard position): https://teemo.dev/game-design/balatro/systems/game-feel-and-juice/
- MDN / caniuse for the Vibration API (not in iOS Safari): https://caniuse.com/mdn-api_navigator_vibrate

## What they say
- Game Accessibility Guidelines (basic tier): adjustable game speed; a haptics toggle; large, well-spaced interactive elements on touch screens; simple controls or a simpler alternative; high contrast; an easily readable default font size; "no essential information is conveyed by a fixed colour alone"; separate volume controls for effects and music; save settings; offer a wide choice of difficulty. Intermediate: allow interfaces to be resized, avoid held buttons, an option to turn off background movement, autosave, "bypass gameplay elements that aren't part of the core mechanic".
- WCAG 2.2: targets at least 24x24 CSS px at AA, 44x44 recommended at AAA; do not use user-scalable=no / maximum-scale=1 (BBC guidance: let users resize).
- Okabe-Ito palette (colour-blind safe): #E69F00, #56B4E9, #009E73, #F0E442, #0072B2, #D55E00, #CC79A7, black.
- StS mobile: text scaled down is an "accessibility red flag"; fiddly selection can cause mis-plays for people with tremor.
- Balatro: Reduced Motion, Game Speed and Screenshake are three independent controls.

## Takeaways for Free Nassau
1. Remove user-scalable=no / maximum-scale=1; add Text size (S / M / L / XL, scales the root rem and all card text, never below 12 px default) and High-contrast and Large-print card modes.
2. Never rely on colour alone: damage tracks get icons (hull = ship, crew = heads, captain = heart) and shape-coded intent badges; Block uses shield shapes. Ink-arc tiers also encode with arc count. Ship a "Colour-blind safe" palette (Okabe-Ito based) toggle for HP bars and the intent threat colours.
3. Hit areas at least 44 px for primary controls, 32 px minimum for secondary, spaced; one-handed layout: all primary controls (hand, End Turn, Fast-forward, Play) in the lower 55% of the screen; a Left-/right-handed toggle moves the side menu button to the lower corner.
4. Motion: Reduce motion (zeros shake, particles, ambient), Screenshake slider, FX speed 1x/2x/Skip, haptics toggle (Android only because iOS Safari lacks vibrate).
5. Audio: master, music and effects volumes saved; visual mirror for every audio cue (the number pops, the shake).
