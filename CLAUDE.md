# CLAUDE.md

## Project Overview

Pixel Quest — a single-file HTML5 Canvas platformer. Two files: `index.html` (canvas + CSS) and `game.js` (~2000 lines, all game code). `validate.js` is a Node.js script for checking level data.

## Architecture

- `game.js` is organized into numbered sections (1-15): constants, palette, sprites, audio, input, camera, particles, tile collision, entities, level data, game state, renderer, game loop
- Sprites are 2D arrays of palette color indices, rendered once to offscreen canvases at startup
- Levels are string arrays (60 chars wide, 17 rows) where each character is a tile type
- Internal resolution 480x270, scaled to 960x540 via CSS `image-rendering: pixelated`

## Tile Types

- `0` = air, `1` = grass/ground, `2` = dirt, `3` = stone, `4` = spikes, `5` = one-way platform, `6` = door top, `7` = door bottom, `8` = castle wall

## Key Lessons Learned

### Jump System
- Jump MUST be Space-only — do NOT couple jump to ArrowUp/W (movement keys), or jump height becomes inconsistent
- Use `jumpHeld` boolean + `jumpReleasedSinceLastJump` flag for clean state management
- Variable jump height via `jumpHoldTimer` (12 frames) — holding Space extends the jump
- Coyote time (6 frames) and jump buffering (8 frames) are essential for good feel

### Spike Collision
- Spike hitbox must be smaller than the full 16x16 tile: use `{x: col*16+2, y: row*16+8, w: 12, h: 8}` (bottom 8px only, 2px horizontal inset)
- Full-tile spike collision feels unfair — player gets hurt when visually clear of the spike
- NEVER place spike tiles directly above ground tiles — the player's 24px height means their top overlaps with the reduced spike hitbox when walking on ground below

### Level Design
- Max jump height is ~53px (~3.3 tiles) with full hold
- One-way platforms (`555`) every 2 rows create reliable climbing sections
- End sections use a solid tower column (e.g. `1112`) with one-way platforms adjacent for vertical climbing
- Always validate entity placements: no entities inside solid tiles, ground-based entities need solid tile below
- Spike runs should be max 1-2 tiles wide — 3+ tiles is too wide to jump over

### Entity Placement
- Entity coordinates are tile positions, converted to pixels in `loadLevel()` via `x * TILE, y * TILE`
- Run `validate.js` after any level map changes to catch placement errors
- Common issues: entities inside walls, slimes/player without ground below, coins in solid tiles

## Validation

Run `node validate.js` to check all levels for:
- Row lengths (must be 60)
- Spike widths (max 2)
- Entity placement conflicts (inside solid, in spikes, no ground)
- Floating spikes above ground tiles

Update validate.js data to match game.js before running.

## Naming Pitfall

Do not reuse constant names that match sprite array names (e.g. `PLAYER_JUMP` was both a velocity constant and sprite name — renamed constant to `JUMP_FORCE`).
