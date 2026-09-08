# ZACH: Open World Life Simulator

A living city in the browser. You arrive in **New Aurora** with a studio key, $750, and a name. Work. Drive. Buy. Belong.

This is a playable 3D life-sim of the ZACH design: exploration, careers, businesses, housing, vehicles, NPCs with schedules, weather, and a day/night sky — running on the web with no install.

> The city never sleeps. Neither does opportunity.

## Play

No build step.

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

Or deploy the folder as a static site (Vercel / Netlify / GitHub Pages).

## Controls

| Key | Action |
|---|---|
| WASD / Arrows | Walk (camera-relative) |
| Shift | Sprint · helicopter up |
| Space | Jump · vehicle handbrake |
| Mouse | Look (click the world or hold RMB) |
| E | Talk, enter, harvest, deliver, use furniture |
| F | Enter / exit a vehicle you own |
| H | Horn |
| Tab | Phone |
| Esc | Pause / close panels |
| M | Mute |

**Mobile:** drag left half to move, right half to look. E / F buttons in the corner.

## The city

**New Aurora** is a connected open world:

- **Downtown** — Aurora Tower, Central Plaza, First National, Nexus Mall, Meridian Corp, The Lantern, Apex Motors, Afterlight, City Hall, Grand Hotel
- **Oakwood** — starter studio, bungalows, Corner Cafe, Aurora High, Maple Park
- **Eastbrook** — houses and the community center
- **Greenfield** — farm plots, barn, farmhouse
- **Pinewood** — forest and a cabin
- **Ironworks** — factory and Harbor Logistics warehouse
- **Airfield** — terminal, runway, Skyhook hangar
- **North Harbor** — pier, fish market, cargo ship

Citizens commute, shop, and go home on the clock. Traffic rolls the grid. Windows light up after dark. Rain and storms roll in on their own.

## Systems

- **Needs** — hunger, energy, fun, social, hygiene
- **Career** — 10 jobs with hours, wages, and life-level gates
- **Gigs** — deliveries from Harbor Logistics (gold marker)
- **Bank** — savings, business account, loans, credit rating, weekly rent
- **Property** — rent or buy; sleep / fridge / shower / TV / wardrobe inside
- **Business** — seven buyable companies that pay at midnight
- **Vehicles** — bikes, cars, truck, boat, helicopter; fuel, wear, headlights
- **People** — named NPCs with jobs, personalities, and relationships
- **Story** — ten missions from first sunrise to $50k net worth
- **Phone** — map, bank, career, estate, business, people, missions, bag, garage
- **Studio tools** — time, weather, economy, citizen ledger (from the main menu)

Progress saves automatically to `localStorage`.

## Character

Create a face, a wardrobe, and a trait:

- **Hustler** — better job pay
- **Charismatic** — relationships climb faster
- **Early Bird** — energy lasts
- **Home Cook** — food restores more

## Stack

Plain HTML + CSS + ES modules. [Three.js](https://threejs.org) (Sky, bloom) from a CDN. Procedural audio. No bundler, no accounts required.

The original ZACH brief called for Unreal Engine 5, dedicated multiplayer, and Firebase. Those remain the production path. This repository is the living prototype you can run today.

## Folder

```
index.html        — screens, HUD, phone, dialogue
css/style.css     — glass HUD, phone, creator
js/main.js        — boot
js/game.js        — sim loop, player, NPCs, vehicles, economy
js/world.js       — city, interiors, people meshes
js/data.js        — jobs, property, missions, dialogue
js/ui.js          — menus and phone apps
js/audio.js       — procedural city audio
js/bus.js         — events
vendor/three/     — Three.js (offline, no CDN)
assets/           — key art
```
