/* Story, acts, waves & cutscenes — ZACH: SHADOW PROTOCOL */
function heroName() { try { return localStorage.getItem('zach_star_name') || 'ZACH'; } catch (e) { return 'ZACH'; } }

const STORY = {
  intro: () => [
    { titleCard: true, act: 'PRAYERDOME PICTURES', name: 'PRESENTS' },
    { name: 'NARRATOR', text: `Lusaka. 2026. A city of lights, music… and secrets. By day it shines. By night, it belongs to the RED FALCON syndicate.` },
    { name: 'NARRATOR', text: `They took the streets. They took the markets. Last night… they took the wrong man's brother.` },
    { name: heroName(), hero: true, text: `My name is ${heroName()}. Ex-special forces. They say I retired. They were wrong.` },
    { name: heroName(), hero: true, text: `Tonight the Falcon learns one lesson: you don't touch my family. You don't touch my city.` },
    { name: 'NARRATOR', text: `Cairo Road. Midnight. The hunt begins…` },
  ],
  acts: [
    {
      id: 0, act: 'ACT I', name: 'STREET SIEGE',
      briefing: () => [
        { titleCard: true, act: 'ACT I', name: 'STREET SIEGE' },
        { name: 'COMMANDER MWILA', text: `Listen up! Falcon thugs are swarming Cairo Road. Civilians trapped in the shops. You're our only shot, ${heroName()}.` },
        { name: heroName(), hero: true, text: `Give me a gun and stay out of my way, Commander. This ends tonight.` },
        { name: 'NARRATOR', text: `TIP: WASD to move, MOUSE to aim, CLICK to shoot. SHIFT to dash through danger. Survive all waves!` },
      ],
      waves: [
        { thug: 5, gunman: 2 },
        { thug: 6, gunman: 4, runner: 2 },
        { thug: 5, gunman: 5, runner: 4 },
      ],
      boss: 'brutus',
      outro: () => [
        { name: 'BRUTUS', villain: true, text: `You… you're the ghost they warned us about… The Falcon will crush—` },
        { name: heroName(), hero: true, text: `Tell your boss I'm coming up the stairs. One step at a time. Starting with the rooftops.` },
      ],
      theme: { ground: '#1b2230', road: '#11151d', accent: '#f5c518', night: 0.25 },
    },
    {
      id: 1, act: 'ACT II', name: 'ROOFTOP HUNT',
      briefing: () => [
        { titleCard: true, act: 'ACT II', name: 'ROOFTOP HUNT' },
        { name: 'NARRATOR', text: `The rooftops of Lusaka. Rain. Neon. Snipers on every ledge. VIPER — the Falcon's deadliest assassin — waits above.` },
        { name: 'VIPER', villain: true, text: `Little soldier… come up and dance. My scope is already on your heart.` },
        { name: heroName(), hero: true, text: `Then you'd better not blink, Viper. I only need one heartbeat.` },
        { name: 'NARRATOR', text: `TIP: Snipers telegraph with a RED LASER — DASH (shift) to dodge! Grab new weapons from glowing crates.` },
      ],
      waves: [
        { gunman: 5, runner: 3, sniper: 1 },
        { thug: 4, gunman: 5, runner: 4, sniper: 2 },
        { gunman: 6, runner: 4, sniper: 2, thug: 4 },
      ],
      boss: 'viper',
      outro: () => [
        { name: 'VIPER', villain: true, text: `Impossible… no one dodges my shot…` },
        { name: heroName(), hero: true, text: `You aimed at my heart. Mistake. It stopped beating slow a long time ago.` },
        { name: 'COMMANDER MWILA', text: `${heroName()}! We traced the Falcon's signal — the old warehouse, Industrial Area. It's HIM. RED FALCON himself. Finish this!` },
      ],
      theme: { ground: '#141b2e', road: '#0d1220', accent: '#7cc4ff', night: 0.45, rain: true },
    },
    {
      id: 2, act: 'ACT III', name: 'SHADOW PROTOCOL',
      briefing: () => [
        { titleCard: true, act: 'ACT III', name: 'SHADOW PROTOCOL' },
        { name: 'RED FALCON', villain: true, text: `So. The ghost of Lusaka walks into MY house. I burned this city to build my empire… and you think ONE MAN stops me?` },
        { name: heroName(), hero: true, text: `Not one man. Every shopkeeper. Every driver. Every kid you ever scared. I'm just the one pulling the trigger.` },
        { name: 'RED FALCON', villain: true, text: `Initiate… SHADOW PROTOCOL! KILL HIM!!!` },
        { name: 'NARRATOR', text: `FINAL STAND. Everything you've got — grenades (E), Z-TIME (space), dash. Good luck, hero.` },
      ],
      waves: [
        { thug: 5, gunman: 5, runner: 4, sniper: 2 },
        { thug: 6, gunman: 6, runner: 6, sniper: 2 },
      ],
      boss: 'falcon',
      outro: () => [
        { name: 'RED FALCON', villain: true, text: `No… my empire… my city…` },
        { name: 'COMMANDER MWILA', text: `All units — stand down! The Falcon is finished. ${heroName()}… you beautiful madman. Lusaka owes you everything.` },
        { name: heroName(), hero: true, text: `No, Commander. Lusaka owes itself. I just reminded it how to fight.` },
        { name: 'NARRATOR', text: `And as the sun rose over the city… one man walked home. A brother. A hero. A legend.` },
      ],
      theme: { ground: '#241a1a', road: '#160f0f', accent: '#ff6b6b', night: 0.5 },
    },
  ],
};

const WEAPONS = {
  PISTOL:  { dmg: 22, rate: 0.22, mag: 12, reserve: Infinity, spread: 0.03, speed: 900, auto: false, kick: 60,  sound: 'PISTOL', color: '#ffd166' },
  SMG:     { dmg: 13, rate: 0.09, mag: 32, reserve: 160, spread: 0.09, speed: 850, auto: true,  kick: 40,  sound: 'SMG', color: '#7cc4ff' },
  RIFLE:   { dmg: 30, rate: 0.16, mag: 24, reserve: 120, spread: 0.04, speed: 1100, auto: true, kick: 90,  sound: 'RIFLE', color: '#9dff6e' },
  SHOTGUN: { dmg: 12, rate: 0.75, mag: 6,  reserve: 36, spread: 0.24, speed: 750, auto: false, kick: 320, sound: 'SHOTGUN', color: '#ff9a3d', pellets: 7 },
};

const ENEMIES = {
  thug:   { hp: 45,  speed: 130, dmg: 12, score: 100, r: 15, color: '#e0705a', behavior: 'chase',  name: 'THUG' },
  runner: { hp: 25,  speed: 230, dmg: 8,  score: 150, r: 12, color: '#ffd166', behavior: 'dart',   name: 'RUNNER' },
  gunman: { hp: 55,  speed: 105, dmg: 10, score: 200, r: 15, color: '#9d7cff', behavior: 'strafe', name: 'GUNMAN' },
  sniper: { hp: 40,  speed: 80,  dmg: 25, score: 300, r: 14, color: '#5ad1e0', behavior: 'snipe',  name: 'SNIPER' },
  brutus: { hp: 900, speed: 95,  dmg: 22, score: 1500, r: 30, color: '#ff5252', behavior: 'brute', name: 'BRUTUS, THE WALL', boss: true },
  viper:  { hp: 1100,speed: 150, dmg: 18, score: 2500, r: 24, color: '#7cff9e', behavior: 'viper', name: 'VIPER', boss: true },
  falcon: { hp: 1800,speed: 130, dmg: 24, score: 5000, r: 28, color: '#ff2a2a', behavior: 'falcon', name: 'RED FALCON', boss: true },
};
