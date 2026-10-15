# 01. Slay the Spire, Slay the Spire 2 and deckbuilder balance

Sources are pages actually fetched or returned by search on Oct 15, 2026. Quotes are short and verbatim from those pages; everything else is my paraphrase.

## Sources
- Game Developer, "How Slay the Spire's devs use data to balance their roguelike deck-builder": https://www.gamedeveloper.com/design/how-i-slay-the-spire-i-s-devs-use-data-to-balance-their-roguelike-deck-builder
- PCGamesN, "Streamers helped balance Slay the Spire": https://www.pcgamesn.com/slay-the-spire/slay-the-spire-balance
- Game Developer, "Road to the IGF: Mega Crit Games' Slay the Spire": https://www.gamedeveloper.com/game-platforms/road-to-the-igf-mega-crit-games-i-slay-the-spire-i-
- Rock Paper Shotgun, "How Slay The Spire saved digital card games from stagnation": https://www.rockpapershotgun.com/how-slay-the-spire-saved-digital-card-games-from-stagnation
- Ars Technica, interview video on Slay the Spire's design: https://arstechnica.com/gaming/2019/05/video-slay-the-spire-is-a-friendly-game-of-death-but-it-was-hard-to-get-it-right/
- r/Games, IGN StS2 Early Access review thread: https://www.reddit.com/r/Games/comments/1rmwd1o/slay_the_spire_2_early_access_review_so_far_ign/
- r/slaythespire, "Early Access feedback so far": https://www.reddit.com/r/slaythespire/comments/1rqssqa/early_access_feedback_so_far/
- r/SlayTheSpire2, "Question About Current State of StS2": https://www.reddit.com/r/SlayTheSpire2/comments/1smhp84/question_about_current_state_of_sts2/
- IGN, "Slay the Spire 2 Update Triggers Review-Bombing": https://www.ign.com/articles/slay-the-spire-2-review-bombing

## What they say
- Pick rate and "presence in winning decks" are the two metrics Mega Crit watched. Giovannetti: pick rate too low and a card is "basically not a card in our game at that point". Too high in winners means overpowered. The same article warns the data can mislead: Madness looked overpowered only because it tends to show up late, after weaker decks are already dead (PCGamesN).
- "It was important to us that there would not just be a single dominant strategy that the player could always do, but that when building a deck, the player would want to keep multiple things in mind." A wide gamut of enemies that challenge different strategies is how they got there (Game Developer, IGF interview).
- Map choice was inspired by FTL: "navigating the map adds an extra element of risk/reward and planning".
- Enemy intents were added because early testers were confused when players had very little information about enemies. Ars Technica: the team "originally planned to give players very little information about their enemies" and fixed it with the intents system, which "required serious iteration to get right".
- Constrained drafting is on purpose. Giovannetti on players who want to "just pick the cards I want": "you would always do the same thing... You'd play the game once and then you'd be bored of it" (RPS).
- StS2 Early Access feedback (Reddit, Mar-Oct 2026): praise for more content and builds; complaints about balance, "some hallway fights are harder than elites", and in high ascensions a run can hinge on early card rewards ("when card rewards don't go well off the bat the chip damage... becomes absurd"). Another player wants a choice of starter decks because "the first few battles always feel a bit same-y". A patch that nerfed cheese strategies triggered review bombing. Lesson: people forgive rough balance in a roguelike, but not feeling that a run was decided by a card pick on floor 4.

## Takeaways for Free Nassau
1. Our own sim shows what Mega Crit warns against: a bot that skips every card wins 23% vs 29% with picks, and the ship tier dominates. We need pick-rate and winner-presence tables in sim.js and should tune toward "every card is picked sometimes, none is in >60% of winning decks".
2. Enemy intents must tell the whole story, but at the right level (verb + number + target). Full pattern visibility (which StS does not give) is OK for a phone game because it cuts mental load; we show the next 2-3 intents.
3. Dominant strategies: give each act enemies that punish a single plan (armoured hull punishes chip damage, crew-heavy boats punish grapeshot-less decks, fast cutters punish slow broadsides).
4. Offer two starter-deck "doctrines" per captain (e.g. Gunnery vs Boarding) so the first fights differ, answering the StS2 "same-y" complaint.
5. Avoid early-run chip damage spirals: Act I is a tutorial of risk, not a tax. Rest and repair nodes must appear before the first elite.
