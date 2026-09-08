# ZACH: SHADOW PROTOCOL 🎬🔫

**A cinematic action movie-game — starring YOU (default star: Zach).**

> ONE MAN. ONE CITY. NO MERCY.

Lusaka, 2026. The RED FALCON syndicate has taken the city — and the wrong man's brother.
You are **Zach**, ex-special forces. Three acts. Endless bullets. One legend.

## ▶ Play

No build step — just serve the folder and open it:

```bash
# any static server works
python3 -m http.server 8000
# open http://localhost:8000
```

Or deploy as-is to Vercel / Netlify / GitHub Pages.

## 🎮 Controls

| Key | Action |
|---|---|
| WASD / Arrows | Move |
| Mouse | Aim — Click to shoot |
| Shift | Dash (invincible) |
| Space | Z-TIME slow motion |
| E / Q | Grenade |
| R | Reload |
| 1–4 | Pistol / SMG / Rifle / Shotgun |
| P / Esc | Pause |
| M | Mute |

📱 **Mobile:** left stick = move, right stick = aim & fire, plus DASH / 💣 / Z-TIME buttons.

## ✨ Features

- 🎬 Movie-style cutscenes, letterbox bars, title cards, kill feed, credits roll
- 📸 **Use your photo as the star** — button on the main menu (saved locally)
- ✏️ Click the star name to rename the hero
- 3 acts across Lusaka: Street Siege → Rooftop Hunt (rain + snipers) → Shadow Protocol
- 4 weapons, grenades, dash i-frames, slow-mo, combos + style ranks (C/B/A/S)
- 4 enemy types + 3 multi-phase bosses (Brutus, Viper, Red Falcon)
- Procedural WebAudio SFX + adaptive music — zero audio files
- Screen shake, hit-stop, particles, shell casings, damage numbers, minimap
- High score + act progress saved in localStorage

## 📁 Structure

```
index.html        — screens, HUD, menus
css/style.css     — cinematic styling
js/audio.js       — procedural sound engine
js/story.js       — acts, waves, dialogue, weapons
js/game.js        — game engine
assets/hero.png   — default star portrait
assets/poster.jpg — menu poster art
```

Built with plain HTML + Canvas + JS. No dependencies.
