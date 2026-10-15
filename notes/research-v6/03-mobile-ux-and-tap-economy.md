# 03. Mobile card-game UX, tap economy, run length

## Sources
- Hardcore Droid, Slay the Spire (Android) review: https://www.hardcoredroid.com/slay-the-spire-review/
- AppUnwrapper, Slay the Spire iOS review: https://www.appunwrapper.com/2020/06/13/slay-the-spire-ios-review/
- TheSixthAxis, Slay the Spire mobile review: https://www.thesixthaxis.com/2021/03/03/slay-the-spire-mobile-review/
- IGN India, "Should You Buy Slay the Spire (iOS)": https://in.ign.com/slay-the-spire/148359/feature/should-you-buy-slay-the-spire-ios
- App Store ratings page for Slay the Spire (user reviews): https://apps.apple.com/us/app/slay-the-spire/id1491530147?platform=iphone&see-all=reviews
- Game Design Lab, Balatro game feel page (Play/Discard Button Position, Game Speed): https://teemo.dev/game-design/balatro/systems/game-feel-and-juice/
- MCV/DEVELOP, "When We Made... Wildfrost" (skip-turn button decision): https://mcvuk.com/business-news/when-we-made-wildfrost/
- Game Design Lab, StS onboarding page (run length 45-90 minutes): https://teemo.dev/game-design/slay-the-spire/systems/onboarding-and-first-session/
- r/slaythespire Fast Mode threads (search result list): https://www.reddit.com/r/slaythespire/comments/u06z9b/psa_for_new_players_enable_fast_mode/ , https://steamcommunity.com/app/646570/discussions/0/2549465882935485677/
- r/roguelites short-run threads (search result list, Reddit blocks direct fetch): https://www.reddit.com/r/roguelites/comments/1933aeb/roguelites_with_short_runs/ , https://www.reddit.com/r/roguelites/comments/1j7u7ik/any_roguelites_that_have_fast_runs/
- Nintendo Japan, Vampire Survivors developer interview (why a run is 30 minutes): https://www.nintendo.com/jp/topics/article/3f3d9c44-6cc5-4197-a31b-1397f229c03b (search-result summary only; I did not read the Japanese page myself)

## What they say
- The StS phone port is loved but its touch UX is the top complaint across four independent reviewers: dragging cards is fiddly, reading a card can play it by accident ("I was in constant fear that I would accidentally use a card I didn't want to just by trying to move them around", Hardcore Droid), text is too small ("a scaled-down version of the normal text", TheSixthAxis), buttons are small (IGN), and an App Store reviewer says "I've played more wrong cards in this game in 5 plays than in every other deckbuilder combined". IGN notes that nearly every choice needs a second tap to confirm, which limits misclicks.
- So there is a real tension: confirm-taps prevent misplays on a phone, but double the taps. The fix others use is a persistent setting, not a dialogue: Balatro's play/discard button order is "a settings toggle rather than a confirmation dialogue, so the fast path stays one click for everyone who never opens Options".
- Wildfrost's team refused a skip-turn button as UI clutter ("a nice to have feature... would just clutter the UI") but prioritised "simplicity and consistency" of rules.
- Run length: StS runs are about 45-90 minutes (Game Design Lab). Search summaries of r/roguelites threads put mobile-friendly roguelites at about 15-30 minutes (Balatro 15-30, Wildfrost 15-20, Meteorfall 20-30, Vampire Survivors 15-30). Vampire Survivors chose a 30-minute run because players got bored around 20 minutes (per the Nintendo interview summary).
- StS players commonly turn on Fast Mode; some find it too fast, and ask for tiers. Balatro ships 0.5x/1x/2x/4x.

## Takeaways for Free Nassau
1. Keep a safety step for card play but make it a setting. Default for new players: tap to inspect (shows the math), second tap to play. A "One-tap play" setting plays on first tap; long-press / the small "i" inspects. Nobody should have to open Settings to get a safe default.
2. "Play all affordable" or "auto-play obvious" is a convenience, not a requirement: add an End Turn that auto-plays nothing, but make End Turn the glowing default when no card is playable, and skip the enemy-phase pauses.
3. Target 20-30 minutes real play and a tap budget well under the current ~820 taps median (v3 playtests). Cut taps by: one-tap play (-1 per card), auto end turn on empty hand (-1 per fight), shorter bosses, fewer trivial node screens (auto-collect treasure and merge reward+map), "Collect all" on rewards.
4. Fast-forward is a first-class control (1x, 2x, skip), saved between runs, and a persistent on-screen button during enemy turns.
5. Larger default text and a text-size setting; do not disable pinch zoom.
