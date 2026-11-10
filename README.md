# Astral — The Sleeping Observatory

A dependency-free pixel platformer prototype. Three main rooms and one secret challenge room, six persistent cosmetic collectibles, directional dash, wall jumps, spring plants, dash crystals and fading platforms.

## Run locally

From this directory:

```sh
python3 -m http.server 8000 --bind 127.0.0.1 --directory public
```

Open http://localhost:8000. Stop the server with Ctrl+C.

## Controls

- Arrows or A/D: move. Up/down or W/S aim the dash.
- Space or Z: jump; hold for height. Jump against walls to wall jump.
- X or Shift: dash. Landing or touching a crystal restores it.
- E: enter doors, return from an area's left edge, activate the telescope.
- R: respawn at the room entrance. Collectibles survive death.
- C: wardrobe. Escape: pause.

Cosmetics and completion save in browser localStorage (`astral-v1`). Cosmetic selection does not affect physics. Touch buttons support basic play; a keyboard is recommended.

## Files

`public/index.html`, `public/observatory.css`, and `public/scripts/observatory.js` contain the prototype. Older learning/demo files remain in place. No deployment has been made.

## Validation

JavaScript syntax and a mocked runtime smoke check passed. Interactive browser QA and gameplay balancing remain to be done; the authoring session could not bind a localhost port or access a browser.
