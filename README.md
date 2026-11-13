# MyWebsite / Moonbound

This static Firebase site now includes **Moonbound**, a low gravity platformer at [`public/game.html`](public/game.html), powered by [`public/scripts/moonbound.js`](public/scripts/moonbound.js). The earlier collectible demo and separate movement test page have been replaced. The home page links to the game.

## Game

Moonbound has 15 individually laid out main rooms and six optional secret rooms. Routes include vertical wall-jump shafts, climbs that double back, upper-level goals, controlled drops, and dash crossings. Main rooms get harder through wall jumps, carrying momentum after a dash, and timing wall slides. Each secret room has a chest opened with **E**, rewarding an outfit or dash trail. Completing a secret moves the player to the next main room. The end screen reports how many secrets remain and lets players keep playing through the map. The Pause menu has a map for visited main rooms, an inventory with outfit and dash trail selectors, and a disabled Settings button.

Controls: **A/D** or **←/→** to move; **Space/Z** to jump; **Shift/X** to dash (aim with direction keys); hold **C** at a wall and use **W/S** to climb; **E** to open a nearby chest; **Esc** to pause; **R** to restart the current room.

The first room displays translucent controls. The opening asks for a player name for possible future dialogue. An empty name shakes the name field. The setting is space themed, with Moon-like platforms and drifting dust. Dash speed eases down near the end of each dash.

## Progress

Progress is saved after completing a main room, opening a secret chest, or changing an equipped cosmetic. The game stores a local browser copy and also saves to Firestore when served from Firebase Hosting. Same-browser refresh resumes at the latest saved main room; anonymous Firebase sign-in does not link progress across devices. A successful cloud save shows a small icon for two seconds. If cloud saving fails, the game keeps local progress, shows an error, and offers Retry.

Firestore rules are in [`firestore.rules`](firestore.rules). The earlier run-score functions remain in [`public/scripts/game-database.js`](public/scripts/game-database.js) for the database test page.

## Run locally

From this directory:

```sh
python3 -m http.server 8765 --directory public
```

Open `http://localhost:8765/game.html`. The Firebase Hosting configuration URL is unavailable on this plain Python server, so local browser saves work but cloud saving shows the retry state. Use Firebase Hosting or its emulator to test cloud saving. See [`FLOW.md`](FLOW.md) for the agreed player flow.
