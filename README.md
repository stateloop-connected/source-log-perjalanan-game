# Log Perjalanan Hidup — the game

A narrative, combat-free top-down RPG that turns the **"Log Perjalanan Hidup"** (*Life Journey Log*) essay series by Zain Bagus on Medium into something you can walk through. One essay, one playable chapter.

Built with **Phaser 3 + TypeScript + Vite**. Art from Kenney's RPG Urban Pack (CC0), music from OpenGameArt (CC0).

> In-game text is in Indonesian, because it is the story itself. Everything around the code is in English.

## Getting started

```bash
npm install
npm run dev      # http://localhost:5174
npm test         # writing-style check, map integrity, full Chapter 1 playthrough simulation
npm run build    # typecheck + production build to dist/
npm run assets   # regenerate sprites from assets-src/ (requires Python + Pillow)
```

## Controls

| Action | Keyboard | Touch |
|---|---|---|
| Move | Arrow keys / WASD | Hold the screen toward where you want to go |
| Talk, advance dialogue | E / Space / Enter | Tap |
| Pick an answer | Up / Down, then E | Tap the answer |
| Skip prologue | Esc | Tap "lewati >>" |
| Toggle sound | M | |

## What's in v0.3 — Chapter 1 (about 10 minutes)

1. **Opening.** PRESS START title over a live map, a terminal-style prologue (`cat 001-masa-kecil.log`), and a chapter card.
2. **Bandung.** A noisy home, and Siti, the childhood friend whose house was always open.
3. **The internet café.** A CRT monitor showing an "online game": farm items, sell them to a regular, level up someone's account.
4. **The bus stop** to a holiday in Malang.
5. **Malang.** The grandparents' house, with Javanese etiquette lessons as choice-based quests. Wrong answers get a gentle scolding and the question comes back.
6. **Ending.** Closing narration taken from the essay, then "Bersambung" (*to be continued*).

Progress is saved in the browser. The title menu offers **Continue** or **Start over**.

## Architecture

The story is data, not code. Each map declares its layout, NPCs and interaction scripts built from a small set of actions:

| Action | Effect |
|---|---|
| `say` | Dialogue lines with typewriter effect |
| `choose` | Multiple-choice question, repeated until the correct answer is picked |
| `set` | Set a progress flag |
| `walk` | Move an NPC along a path (non-blocking) |
| `narrate` | Fade to black, play lines, fade back |
| `teleport` | Move the player |
| `goto` | Switch scene (internet café, travel card) |
| `end` | Closing narration and end of chapter |

A new chapter means a new map file and a new story file. The engine (`WorldScene`) does not change.

```
src/story/      story text, action types, tests
src/maps/       one file per location: layout + NPCs + scripts
src/scenes/     Title, Story (prologue/cards), World (engine), Warnet (café minigame)
src/systems/    GridMap, renderGridMap, DialogueBox, Flags, Music, Sfx
src/data/       config, Kenney tile indices, music tracks
assets-src/     source art (Kenney, CC0)
tools/          pack_assets.py
```

## Editing the story

| To change | Edit |
|---|---|
| Narration, prologue, ending, café chat | `src/story/chapter1.ts` |
| NPC dialogue, quests, choices, objectives | `src/maps/bandung.ts`, `src/maps/malang.ts` |
| Map layout | `buildBandung` / `buildMalang` in the same files |
| Background music per location | `src/data/tracks.ts` |

The test suite enforces the series' writing style (no colons or em dashes in story text) and simulates Chapter 1 from start to finish, so a broken quest chain fails the build instead of shipping.

## Credits

See [CREDITS.md](CREDITS.md). All third-party assets are CC0 or OFL.

## License

Code is MIT licensed (see [LICENSE](LICENSE)). The story text is © Zain Bagus, all rights reserved.
