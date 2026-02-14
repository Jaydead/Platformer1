# Pixel Quest

A retro pixel art platformer built entirely with vanilla JavaScript and HTML5 Canvas. No libraries, no build tools, no external assets — everything is generated programmatically.

## How to Play

Open `index.html` in any modern browser. No server required.

- **Arrow keys / WASD** — Move
- **Space** — Jump (hold for higher jump)
- **Enter** — Select menu options
- **Escape** — Pause

## Features

- 3 levels with increasing difficulty: Grasslands, Dark Cave, Castle
- Pixel art sprites defined as 2D color arrays, cached to offscreen canvases
- Enemies: Slimes (patrol), Bats (sine-wave flight), Boss (chase + jump attack)
- Collectibles: Coins, Hearts, Keys
- One-way platforms, variable-height jumping, coyote time, input buffering
- Procedural sound effects and music via Web Audio API
- Particles, screen shake, animated menus
- 480x270 internal resolution scaled up with `image-rendering: pixelated`

## Goal

Collect coins, find the key, and reach the exit door in each level. Defeat or avoid enemies along the way. Level 3 ends with a boss fight.
