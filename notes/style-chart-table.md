# Free Nassau - Chart Table style guide (approved by Ren, Oct 14 2026)
Concept: a top-down view of a captain's chart table at night. The sea is the board.
Surface: aged cracked-parchment Caribbean chart (sepia, faded teal water, ink coastlines) on dark worn leather and walnut.
Light: single warm candle, top-left; deep vignette to near-black edges; soft shadows under objects.
Palette: parchment cream, sepia, walnut, aged brass, faded Caribbean teal, oxblood red for danger/blood/wax seals.
Pieces: carved wooden ship miniatures; ink-drawn dotted routes; black ink sweeping "threat arcs" for enemy intent; red ink slashes for boarding; small crew tokens.
Cards: parchment cards with sepia etched vignettes, small brass-ringed cost numeral top-left, small pip icons along the bottom, held in a leather tray along the bottom edge; selected card lifts with a gold glow and a wax-sealed detail card sits at right.
HUD: slim dark leather plates at top - skull-and-cutlass crest + hearts, silver coin, anchor/day marker, scroll + pouch supplies. Tiny numerals only.
Props at edges: brass compass (bottom-left), brass dividers (left), lit candle (top-left), leather logbook with compass rose + quill (right), coins, rope, timber, surgeon's kit.
Portraits: framed in brass-edged ornate oval medallions; selected one glows.
Avoid: bright flat colors, cartoon outlines, neon, large text.
Reference image: concept-chart-table.jpg

## Implementation notes (v4, built Oct 14 2026)
- chart.css (loaded last) + ui5.js (render layer) restyle the v3 game without touching rules. index.html keeps the legacy styles underneath.
- Textures are procedural: tools/gen-chart-assets.py writes img/chart/{table,chart,paper,leather}.webp (about 120 KB total). Props are inline SVG (candle, compass, dividers, coins, wax seal, logbook), icons are an SVG sprite (ui5.js ICP). Emoji in text are swapped for the engraved icons by emo().
- Portrait adaptation of the landscape concepts: HUD is one slim leather plate (captain medallion, HP/hull/crew bars, silver, 3 supplies, 4 officer badges); the logbook book-icon top right opens the drawer; reference info lives there (Crew and Officers, Supplies, Deck, Legend, Settings).
- Combat: board on the chart (painted enemy plate pinned to the chart with a nameplate, intent wax plate, ink threat arcs toward your carved ship miniature), then detail note, energy pips + Block, leather card tray, log line, and End Turn flanked by Draw / Discard piles.
- Optional generated upgrades are listed in art-tests/prompts-chart-assets.txt.
