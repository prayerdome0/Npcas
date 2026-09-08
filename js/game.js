/* ZACH: SHADOW PROTOCOL — cinematic top-down action engine */
(() => {
'use strict';
const $ = id => document.getElementById(id);
const canvas = $('game'), ctx = canvas.getContext('2d');
const mmCanvas = $('minimap'), mm = mmCanvas.getContext('2d');
let W = 0, H = 0, DPR = 1;
function resize() {
  DPR = Math.min(2, window.devicePixelRatio || 1);
  W = window.innerWidth; H = window.innerHeight;
  canvas.width = W * DPR; canvas.height = H * DPR;
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
}
window.addEventListener('resize', resize); resize();

// ---------- utils ----------
const TAU = Math.PI * 2;
const rand = (a, b) => a + Math.random() * (b - a);
const randi = (a, b) => Math.floor(rand(a, b + 1));
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const angTo = (a, b) => Math.atan2(b.y - a.y, b.x - a.x);
const lerp = (a, b, t) => a + (b - a) * t;

// ---------- photo / star name ----------
function getPhoto() { try { return localStorage.getItem('zach_photo') || 'assets/hero.png'; } catch (e) { return 'assets/hero.png'; } }
function applyPhoto() {
  const p = getPhoto();
  $('hud-face').src = p; $('menu-face').src = p;
  const nm = heroName();
  $('star-name').textContent = nm;
  document.querySelectorAll('.star-name-v').forEach(e => e.textContent = nm);
}
$('star-name').parentElement.style.cursor = 'pointer';
$('star-name').parentElement.title = 'Click to change star name';
$('star-name').parentElement.addEventListener('click', (e) => {
  if (e.target.closest('button')) return;
  const v = prompt('Star name (the hero):', heroName());
  if (v && v.trim()) { try { localStorage.setItem('zach_star_name', v.trim().toUpperCase().slice(0, 14)); } catch (err) {} applyPhoto(); }
});

// villain portrait: procedural menacing face
function villainPortrait(name) {
  const c = document.createElement('canvas'); c.width = 180; c.height = 240;
  const g = c.getContext('2d');
  const grad = g.createLinearGradient(0, 0, 0, 240);
  grad.addColorStop(0, '#1a0d0d'); grad.addColorStop(1, '#000');
  g.fillStyle = grad; g.fillRect(0, 0, 180, 240);
  // silhouette head
  g.fillStyle = '#2a2a32';
  g.beginPath(); g.ellipse(90, 110, 52, 62, 0, 0, TAU); g.fill();
  g.fillStyle = '#17171c';
  g.beginPath(); g.ellipse(90, 210, 75, 70, 0, 0, TAU); g.fill();
  // glowing eyes
  g.fillStyle = '#ff2222'; g.shadowColor = '#ff0000'; g.shadowBlur = 18;
  g.fillRect(55, 100, 26, 9); g.fillRect(99, 100, 26, 9);
  g.shadowBlur = 0;
  // scar / grin
  g.strokeStyle = '#ff2222'; g.lineWidth = 2;
  g.beginPath(); g.moveTo(105, 82); g.lineTo(95, 128); g.stroke();
  g.strokeStyle = '#881111'; g.beginPath(); g.moveTo(65, 148); g.quadraticCurveTo(90, 158, 115, 146); g.stroke();
  g.fillStyle = 'rgba(255,42,42,.9)'; g.font = 'bold 20px Anton, sans-serif'; g.textAlign = 'center';
  g.fillText((name || '???').slice(0, 10), 90, 226);
  return c.toDataURL();
}
const villainCache = {};
function portraitFor(line) {
  if (line.hero) return getPhoto();
  if (line.villain) {
    if (!villainCache[line.name]) villainCache[line.name] = villainPortrait(line.name);
    return villainCache[line.name];
  }
  if (line.name === 'NARRATOR') {
    if (!villainCache.N) { const c = document.createElement('canvas'); c.width = 180; c.height = 240; const g = c.getContext('2d');
      const gr = g.createLinearGradient(0,0,0,240); gr.addColorStop(0,'#0d1626'); gr.addColorStop(1,'#000'); g.fillStyle = gr; g.fillRect(0,0,180,240);
      g.fillStyle = '#f5c518'; g.font = '90px serif'; g.textAlign='center'; g.fillText('🎬', 90, 140);
      g.fillStyle='#fff'; g.font='bold 16px Inter'; g.fillText('NARRATOR', 90, 200);
      villainCache.N = c.toDataURL(); }
    return villainCache.N;
  }
  // commander etc — badge portrait
  if (!villainCache[line.name]) { const c = document.createElement('canvas'); c.width=180; c.height=240; const g=c.getContext('2d');
    const gr=g.createLinearGradient(0,0,0,240); gr.addColorStop(0,'#12241a'); gr.addColorStop(1,'#000'); g.fillStyle=gr; g.fillRect(0,0,180,240);
    g.fillStyle='#37d67a'; g.font='80px serif'; g.textAlign='center'; g.fillText('🎖',90,140);
    g.fillStyle='#fff'; g.font='bold 13px Inter'; g.fillText(line.name.slice(0,14),90,200);
    villainCache[line.name]=c.toDataURL(); }
  return villainCache[line.name];
}

// ---------- audio unlock ----------
function unlockAudio() { ZAudio.init(); }
window.addEventListener('pointerdown', unlockAudio, { passive: true });
window.addEventListener('keydown', unlockAudio);

// ---------- input ----------
const keys = {};
let mouse = { x: W / 2, y: H / 2, down: false, rdown: false };
window.addEventListener('keydown', e => {
  keys[e.code] = true;
  if (['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)) e.preventDefault();
  if (e.code === 'KeyM') toggleMute();
  if (e.code === 'KeyP' || e.code === 'Escape') togglePause();
  if (state === 'cutscene' && (e.code === 'Space' || e.code === 'Enter')) advanceCutscene();
});
window.addEventListener('keyup', e => keys[e.code] = false);
canvas.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
canvas.addEventListener('mousedown', e => { if (e.button === 0) mouse.down = true; if (e.button === 2) mouse.rdown = true; });
window.addEventListener('mouseup', e => { if (e.button === 0) mouse.down = false; if (e.button === 2) mouse.rdown = false; });
window.addEventListener('contextmenu', e => e.preventDefault());

// touch
const isTouch = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
const sticks = { left: { x: 0, y: 0, id: null }, right: { x: 0, y: 0, id: null } };
function setupStick(el, s, isRight) {
  const nub = el.querySelector('.nub');
  const setNub = (dx, dy) => nub.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
  el.addEventListener('touchstart', e => { e.preventDefault(); const t = e.changedTouches[0]; s.id = t.identifier; s.cx = el.getBoundingClientRect().left + 60; s.cy = el.getBoundingClientRect().top + 60; }, { passive: false });
  el.addEventListener('touchmove', e => {
    e.preventDefault();
    for (const t of e.changedTouches) if (t.identifier === s.id) {
      let dx = t.clientX - s.cx, dy = t.clientY - s.cy;
      const m = Math.hypot(dx, dy), max = 48;
      if (m > max) { dx = dx / m * max; dy = dy / m * max; }
      setNub(dx, dy); s.x = dx / max; s.y = dy / max;
      if (isRight && m > 14) mouse.down = true;
    }
  }, { passive: false });
  const end = e => { for (const t of e.changedTouches) if (t.identifier === s.id) { s.id = null; s.x = 0; s.y = 0; setNub(0, 0); if (isRight) mouse.down = false; } };
  el.addEventListener('touchend', end); el.addEventListener('touchcancel', end);
}
if (isTouch) {
  setupStick($('stick-left'), sticks.left, false);
  setupStick($('stick-right'), sticks.right, true);
  $('btn-dash').addEventListener('touchstart', e => { e.preventDefault(); tryDash(); }, { passive: false });
  $('btn-grenade').addEventListener('touchstart', e => { e.preventDefault(); throwGrenade(); }, { passive: false });
  $('btn-slowmo').addEventListener('touchstart', e => { e.preventDefault(); toggleSlowmo(); }, { passive: false });
}

// ---------- game state ----------
let state = 'menu'; // menu, cutscene, play, pause, gameover, victory
let actIndex = 0, waveIndex = -1, waveState = 'idle', waveTimer = 0, spawnQueue = [];
let boss = null, bossActive = false;
let score = 0, kills = 0, combo = 1, comboTimer = 0, style = 0; // style points -> rank
let runTime = 0, shake = 0, hitStop = 0, timeScale = 1, slowmoActive = false, slowmoMeter = 100, slowmoDrain = 0;
let flashA = 0, centerMsgTimer = 0;
let obstacles = [], pickups = [], grenades = [];
let bullets = [], ebullets = [], enemies = [], parts = [], casings = [], dmgNums = [], floaters = [];
let rain = [];
let camera = { x: 0, y: 0 };
const WORLD = { w: 2400, h: 2400 };

const player = {
  x: 0, y: 0, r: 16, hp: 100, maxHp: 100, armor: 0, maxArmor: 75,
  speed: 300, aim: 0, fireCd: 0, reloadT: 0, dashCd: 0, dashT: 0, dashDx: 0, dashDy: 0, iframes: 0,
  weapons: { PISTOL: { mag: 12, reserve: Infinity, unlocked: true }, SMG: { mag: 0, reserve: 0, unlocked: false }, RIFLE: { mag: 0, reserve: 0, unlocked: false }, SHOTGUN: { mag: 0, reserve: 0, unlocked: false } },
  cur: 'PISTOL', grenades: 3, dead: false,
};

function best() { try { return parseInt(localStorage.getItem('zach_best') || '0', 10); } catch (e) { return 0; } }
function setBest(v) { try { localStorage.setItem('zach_best', String(v)); } catch (e) {} }
function savedAct() { try { return parseInt(localStorage.getItem('zach_act') || '0', 10); } catch (e) { return 0; } }

// ---------- screens ----------
function show(id) { $(id).classList.remove('hidden'); }
function hide(id) { $(id).classList.add('hidden'); }
function setCinema(on) { document.body.classList.toggle('cinema', on); }

// ---------- cutscene engine ----------
let csLines = [], csIdx = 0, csChar = 0, csTimer = null, csDone = null, csTyping = false;
function playCutscene(lines, done) {
  state = 'cutscene'; csLines = lines; csIdx = 0; csDone = done;
  setCinema(true); hide('hud'); hide('menu'); show('cutscene');
  ZAudio.stopMusic();
  showLine();
}
function showLine() {
  const line = csLines[csIdx];
  if (!line) { endCutscene(); return; }
  if (line.titleCard) {
    $('cs-title-card').classList.remove('hidden');
    $('cs-act').textContent = line.act; $('cs-act-name').textContent = line.name;
    $('cs-box').style.visibility = 'hidden'; $('cs-portrait-wrap').style.visibility = 'hidden';
    ZAudio.boss();
    csTyping = false;
    clearTimeout(csTimer);
    csTimer = setTimeout(() => { // auto-advance title cards
      if (state === 'cutscene' && csLines[csIdx] && csLines[csIdx].titleCard) advanceCutscene();
    }, 2200);
    return;
  }
  $('cs-title-card').classList.add('hidden');
  $('cs-box').style.visibility = 'visible'; $('cs-portrait-wrap').style.visibility = 'visible';
  $('cs-name').textContent = line.name;
  $('cs-name').style.color = line.villain ? '#ff6b6b' : line.hero ? '#f5c518' : '#7cc4ff';
  $('cs-portrait-wrap').classList.toggle('villain', !!line.villain);
  $('cs-portrait').src = portraitFor(line);
  // typewriter
  const full = line.text; csChar = 0; csTyping = true;
  $('cs-text').textContent = '';
  clearInterval(csTimer);
  csTimer = setInterval(() => {
    csChar += 2;
    $('cs-text').textContent = full.slice(0, csChar);
    if (csChar >= full.length) { clearInterval(csTimer); csTyping = false; }
  }, 18);
}
function advanceCutscene() {
  if (state !== 'cutscene') return;
  const line = csLines[csIdx];
  if (line && !line.titleCard && csTyping) { // complete line
    clearInterval(csTimer); $('cs-text').textContent = line.text; csTyping = false; return;
  }
  clearInterval(csTimer); clearTimeout(csTimer);
  csIdx++;
  if (csIdx >= csLines.length) endCutscene(); else showLine();
}
function endCutscene() {
  clearInterval(csTimer); clearTimeout(csTimer);
  hide('cutscene'); setCinema(false);
  const d = csDone; csDone = null;
  if (d) d();
}
$('cutscene').addEventListener('click', e => { if (e.target.id !== 'cs-skip') advanceCutscene(); });
$('cs-skip').addEventListener('click', e => { e.stopPropagation(); endCutscene(); });

// ---------- HUD ----------
function centerMessage(txt, dur = 1.6) {
  const el = $('center-message');
  el.textContent = txt; el.classList.remove('hidden');
  el.style.animation = 'none'; void el.offsetWidth; el.style.animation = '';
  centerMsgTimer = dur;
}
function feed(txt) {
  const d = document.createElement('div'); d.className = 'feed'; d.textContent = txt;
  const kf = $('killfeed'); kf.prepend(d);
  while (kf.children.length > 5) kf.lastChild.remove();
  setTimeout(() => d.remove(), 3200);
}
function subtitle(txt, dur = 3) {
  $('subtitle').textContent = txt;
  clearTimeout(subtitle._t);
  subtitle._t = setTimeout(() => $('subtitle').textContent = '', dur * 1000);
}
function styleRank() {
  const r = style >= 900 ? 'S' : style >= 500 ? 'A' : style >= 220 ? 'B' : 'C';
  const el = $('style-rank');
  el.textContent = r;
  el.style.color = r === 'S' ? '#f5c518' : r === 'A' ? '#ff6b6b' : r === 'B' ? '#7cc4ff' : '#fff';
  return r;
}
function updateHUD() {
  const hpPct = clamp(player.hp / player.maxHp * 100, 0, 100);
  $('hp-fill').style.width = hpPct + '%';
  $('hp-text').textContent = Math.ceil(player.hp);
  document.querySelector('.hp-bar').classList.toggle('low', hpPct < 30);
  $('armor-fill').style.width = clamp(player.armor / player.maxArmor * 100, 0, 100) + '%';
  $('slowmo-fill').style.width = clamp(slowmoMeter, 0, 100) + '%';
  $('score').textContent = score.toLocaleString();
  const cb = $('combo');
  if (combo > 1) { cb.classList.remove('hidden'); cb.textContent = `x${combo} COMBO`; } else cb.classList.add('hidden');
  styleRank();
  $('weapon-name').textContent = player.cur;
  const w = player.weapons[player.cur];
  $('ammo').textContent = `${w.mag} / ${w.reserve === Infinity ? '∞' : w.reserve}`;
  $('grenades').textContent = player.grenades;
  const act = STORY.acts[actIndex];
  $('act-label').textContent = act.act;
  $('objective-text').textContent = bossActive ? `DEFEAT ${boss ? boss.name : ''}` : waveState === 'fight' ? `WAVE ${waveIndex + 1}/${act.waves.length} — ${enemies.length + spawnQueue.length} LEFT` : 'GET READY';
  if (bossActive && boss) { $('boss-bar-wrap').classList.remove('hidden'); $('boss-name').textContent = `☠ ${boss.name}`; $('boss-fill').style.width = clamp(boss.hp / boss.maxHp * 100, 0, 100) + '%'; }
  else $('boss-bar-wrap').classList.add('hidden');
  $('damage-vignette').style.opacity = hpPct < 35 ? (0.5 + Math.sin(runTime * 6) * 0.2) : 0;
  $('slowmo-vignette').style.opacity = slowmoActive ? 1 : 0;
}

// ---------- map / obstacles ----------
function buildMap(actId) {
  obstacles = [];
  const theme = STORY.acts[actId].theme;
  // border walls
  const m = 60, t = 40;
  obstacles.push({ x: 0, y: 0, w: WORLD.w, h: t, wall: true });
  obstacles.push({ x: 0, y: WORLD.h - t, w: WORLD.w, h: t, wall: true });
  obstacles.push({ x: 0, y: 0, w: t, h: WORLD.h, wall: true });
  obstacles.push({ x: WORLD.w - t, y: 0, w: t, h: WORLD.h, wall: true });
  // city blocks / crates
  const cx = WORLD.w / 2, cy = WORLD.h / 2;
  const blocks = actId === 1 ? 10 : 14;
  for (let i = 0; i < blocks; i++) {
    for (let tries = 0; tries < 12; tries++) {
      const w = rand(90, 260), h = rand(90, 220);
      const x = rand(160, WORLD.w - 160 - w), y = rand(160, WORLD.h - 160 - h);
      // keep center spawn clear
      if (Math.abs(x + w / 2 - cx) < 260 && Math.abs(y + h / 2 - cy) < 260) continue;
      if (obstacles.some(o => x < o.x + o.w + 90 && x + w + 90 > o.x && y < o.y + o.h + 90 && y + h + 90 > o.y && !o.wall)) continue;
      obstacles.push({ x, y, w, h, hue: theme.accent, crates: Math.random() < 0.45 });
      break;
    }
  }
  // scattered crates
  for (let i = 0; i < 16; i++) {
    const s = rand(34, 52);
    obstacles.push({ x: rand(120, WORLD.w - 120), y: rand(120, WORLD.h - 120), w: s, h: s, crate: true });
  }
  // rain
  rain = [];
  if (theme.rain) for (let i = 0; i < 130; i++) rain.push({ x: rand(0, W), y: rand(0, H), s: rand(700, 1200) });
}
function collideCircle(x, y, r) {
  // returns corrected position after pushing out of obstacles + walls
  for (const o of obstacles) {
    const nx = clamp(x, o.x, o.x + o.w), ny = clamp(y, o.y, o.y + o.h);
    const dx = x - nx, dy = y - ny, d = Math.hypot(dx, dy);
    if (d < r) {
      if (d < 0.001) { x += r; continue; }
      const push = r - d;
      x += dx / d * push; y += dy / d * push;
    }
  }
  x = clamp(x, 50, WORLD.w - 50); y = clamp(y, 50, WORLD.h - 50);
  return { x, y };
}
function bulletHitsWall(x, y) {
  for (const o of obstacles) if (x > o.x && x < o.x + o.w && y > o.y && y < o.y + o.h) return true;
  return x < 0 || y < 0 || x > WORLD.w || y > WORLD.h;
}
function lineOfSight(a, b) {
  const steps = Math.ceil(dist(a, b) / 26);
  for (let i = 1; i < steps; i++) {
    const x = lerp(a.x, b.x, i / steps), y = lerp(a.y, b.y, i / steps);
    if (bulletHitsWall(x, y)) return false;
  }
  return true;
}

// ---------- spawning ----------
function spawnEnemy(type, x, y) {
  const base = ENEMIES[type];
  const scale = 1 + actIndex * 0.18;
  const e = {
    type, name: base.name, x, y, r: base.r,
    hp: base.hp * (base.boss ? 1 : scale), maxHp: base.hp * (base.boss ? 1 : scale),
    speed: base.speed * rand(0.9, 1.1), dmg: Math.round(base.dmg * (1 + actIndex * 0.15)),
    score: base.score, color: base.color, behavior: base.behavior, boss: !!base.boss,
    fireCd: rand(0.5, 1.5), stateT: 0, vx: 0, vy: 0, flash: 0, aimA: 0,
    strafeDir: Math.random() < 0.5 ? 1 : -1, dartT: 0, chargeT: 0, spawnT: 0.4,
    phase: 1, summonCd: 4, spreadN: 0,
  };
  enemies.push(e);
  burst(x, y, '#fff', 8, 200);
  return e;
}
function spawnPos() {
  for (let i = 0; i < 20; i++) {
    const a = rand(0, TAU), d = rand(520, 800);
    const x = clamp(player.x + Math.cos(a) * d, 90, WORLD.w - 90);
    const y = clamp(player.y + Math.sin(a) * d, 90, WORLD.h - 90);
    if (dist({ x, y }, player) > 460 && !bulletHitsWall(x, y)) return { x, y };
  }
  return { x: rand(200, WORLD.w - 200), y: 140 };
}
function startWave(i) {
  const act = STORY.acts[actIndex];
  waveIndex = i; waveState = 'fight';
  spawnQueue = [];
  const comp = act.waves[i];
  for (const [t, n] of Object.entries(comp)) for (let k = 0; k < n; k++) spawnQueue.push(t);
  // shuffle
  spawnQueue.sort(() => Math.random() - 0.5);
  waveTimer = 0;
  centerMessage(`WAVE ${i + 1}`, 1.4);
  subtitle(`${act.act} — ${act.name}: hostile wave ${i + 1} of ${act.waves.length}. They never learn.`);
  ZAudio.wave(); ZAudio.startMusic(1 + actIndex * 0.4 + (bossActive ? 0.6 : 0));
  // weapon crate drops to keep it fresh
  if (i === 1) dropPickup(player.x + rand(-160, 160), player.y + rand(-160, 160), actIndex >= 1 ? 'RIFLE' : 'SMG');
}
function dropPickup(x, y, kind) {
  x = clamp(x, 80, WORLD.w - 80); y = clamp(y, 80, WORLD.h - 80);
  pickups.push({ x, y, kind, t: 0, life: 25, bob: rand(0, TAU) });
}
function maybeDrop(x, y) {
  const r = Math.random();
  if (r < 0.10) dropPickup(x, y, 'MEDKIT');
  else if (r < 0.17) dropPickup(x, y, 'ARMOR');
  else if (r < 0.26) dropPickup(x, y, 'AMMO');
  else if (r < 0.30) dropPickup(x, y, 'GRENADE');
  else if (r < 0.335) dropPickup(x, y, ['SMG', 'RIFLE', 'SHOTGUN'][randi(0, 2)]);
}
function spawnBoss() {
  const type = STORY.acts[actIndex].boss;
  const p = spawnPos();
  boss = spawnEnemy(type, p.x, p.y);
  bossActive = true;
  centerMessage(`☠ ${boss.name} ☠`, 2.2);
  subtitle(boss.name === 'BRUTUS, THE WALL' ? 'He flips cars for fun. Keep moving. Shoot the big guy!' : boss.name === 'VIPER' ? 'She never misses. Make her miss.' : 'The Falcon himself. End this. NOW.');
  ZAudio.boss(); ZAudio.startMusic(2);
  feed(`⚠ BOSS: ${boss.name}`);
}

// ---------- combat helpers ----------
function burst(x, y, color, n, spd, life = 0.6, size = 4) {
  for (let i = 0; i < n; i++) {
    const a = rand(0, TAU), s = rand(spd * 0.3, spd);
    parts.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: rand(life * 0.4, life), maxLife: life, color, size: rand(size * 0.4, size), drag: 4 });
  }
}
function blood(x, y, n = 10) { burst(x, y, '#c1121f', n, 320, 0.5, 4); burst(x, y, '#ff6b6b', Math.floor(n / 2), 200, 0.4, 3); }
function sparks(x, y, n = 8) { burst(x, y, '#ffd166', n, 420, 0.35, 3); }
function smoke(x, y, n = 8) { for (let i = 0; i < n; i++) parts.push({ x: x + rand(-8, 8), y: y + rand(-8, 8), vx: rand(-40, 40), vy: rand(-90, -30), life: rand(0.6, 1.3), maxLife: 1.3, color: 'rgba(120,120,130,0.5)', size: rand(8, 18), drag: 1, grow: true }); }
function dmgNum(x, y, txt, color = '#fff', big = false) { dmgNums.push({ x: x + rand(-10, 10), y: y - 18, txt: String(txt), color, life: 0.9, big }); }
function addShake(v) { shake = Math.min(26, shake + v); }
function flash(v = 0.5) { flashA = Math.max(flashA, v); }
function addScore(base, x, y) {
  const pts = base * combo;
  score += pts;
  style += Math.floor(base / 20);
  dmgNum(x, y, '+' + pts, combo > 1 ? '#f5c518' : '#fff', combo >= 4);
}
function bumpCombo() {
  combo = Math.min(9, combo + 1); comboTimer = 3.2;
  if (combo >= 3) { slowmoMeter = Math.min(100, slowmoMeter + 6); }
}

function fireBullet(x, y, angle, def, friendly, dmgMul = 1) {
  const spread = def.spread || 0;
  const n = def.pellets || 1;
  for (let i = 0; i < n; i++) {
    const a = angle + rand(-spread, spread) + (n > 1 ? (i / (n - 1) - 0.5) * 0.35 : 0);
    const b = { x, y, vx: Math.cos(a) * def.speed, vy: Math.sin(a) * def.speed, dmg: Math.round(def.dmg * dmgMul), life: 1.4, color: def.color || '#fff', r: n > 1 ? 3 : 4, friendly };
    (friendly ? bullets : ebullets).push(b);
  }
  // muzzle + casing
  burst(x, y, '#ffe66d', 4, 260, 0.15, 5);
  if (friendly) casings.push({ x, y, vx: Math.cos(angle + Math.PI / 2) * rand(80, 160), vy: Math.sin(angle + Math.PI / 2) * rand(80, 160) - 60, rot: rand(0, TAU), vr: rand(-12, 12), life: 1.1 });
}

function explode(x, y, radius, dmg, friendly) {
  ZAudio.explosion();
  addShake(friendly ? 10 : 14); flash(0.35);
  burst(x, y, '#ff9a3d', 26, 520, 0.7, 7);
  burst(x, y, '#ff2a2a', 18, 380, 0.6, 6);
  burst(x, y, '#fff', 10, 300, 0.3, 4);
  smoke(x, y, 10);
  // shockwave ring
  parts.push({ x, y, ring: true, r0: 10, r1: radius + 30, life: 0.35, maxLife: 0.35, color: '#ffd166' });
  if (friendly) {
    for (const e of enemies) {
      const d = Math.hypot(e.x - x, e.y - y);
      if (d < radius + e.r) hurtEnemy(e, Math.round(dmg * (1 - d / (radius * 1.4))), x, y);
    }
  } else {
    const d = Math.hypot(player.x - x, player.y - y);
    if (d < radius && player.iframes <= 0 && player.dashT <= 0) hurtPlayer(Math.round(dmg * (1 - d / (radius * 1.5))));
  }
}

function hurtEnemy(e, dmg, fromX, fromY) {
  if (e.spawnT > 0) return;
  e.hp -= dmg; e.flash = 0.12;
  ZAudio.hit();
  // knockback
  const a = Math.atan2(e.y - fromY, e.x - fromX);
  const kb = e.boss ? 20 : 130;
  e.vx += Math.cos(a) * kb; e.vy += Math.sin(a) * kb;
  blood(e.x, e.y, e.boss ? 4 : 8);
  dmgNum(e.x, e.y, dmg, '#ffd166');
  if (e.hp <= 0) killEnemy(e);
}
function killEnemy(e) {
  e.dead = true;
  kills++; bumpCombo();
  addScore(e.score, e.x, e.y);
  ZAudio.kill();
  blood(e.x, e.y, e.boss ? 40 : 18);
  smoke(e.x, e.y, 4);
  addShake(e.boss ? 16 : 3);
  hitStop = Math.max(hitStop, e.boss ? 0.35 : 0.05);
  slowmoMeter = Math.min(100, slowmoMeter + (e.boss ? 50 : 4));
  maybeDrop(e.x, e.y);
  feed(`${e.name} ELIMINATED  +${(e.score * combo).toLocaleString()}`);
  if (e.boss) {
    explode(e.x, e.y, 160, 0, true);
    bossActive = false; boss = null;
    flash(0.6);
    centerMessage('TARGET DOWN', 2);
    // heal + reward
    player.hp = Math.min(player.maxHp, player.hp + 35);
    dropPickup(e.x + 40, e.y, 'MEDKIT'); dropPickup(e.x - 40, e.y, 'AMMO');
    slowmoMeter = 100;
    ZAudio.sting(true);
  }
}
function hurtPlayer(dmg) {
  if (player.iframes > 0 || player.dashT > 0 || player.dead || state !== 'play') return;
  if (player.armor > 0) {
    const absorbed = Math.min(player.armor, Math.round(dmg * 0.6));
    player.armor -= absorbed; dmg -= absorbed;
    sparks(player.x, player.y, 6);
  }
  player.hp -= dmg;
  player.iframes = 0.35;
  ZAudio.hurt();
  addShake(8); flash(0.15);
  blood(player.x, player.y, 8);
  dmgNum(player.x, player.y, '-' + dmg, '#ff6b6b', true);
  combo = 1; style = Math.max(0, style - 30);
  if (player.hp <= 0) { player.hp = 0; die(); }
}
function die() {
  if (player.dead) return;
  player.dead = true;
  ZAudio.sting(false); ZAudio.stopMusic();
  slowmoActive = false; timeScale = 0.25;
  blood(player.x, player.y, 40);
  addShake(20);
  setTimeout(() => {
    if (state !== 'play') return;
    state = 'gameover'; timeScale = 1;
    hide('hud'); setCinema(true);
    $('go-stats').innerHTML = `${STORY.acts[actIndex].act} — ${STORY.acts[actIndex].name} &nbsp;•&nbsp; SCORE <b>${score.toLocaleString()}</b> &nbsp;•&nbsp; KILLS <b>${kills}</b>`;
    show('gameover');
    if (score > best()) setBest(score);
  }, 1400);
}

// ---------- player actions ----------
function tryDash() {
  if (state !== 'play' || player.dead || player.dashCd > 0) return;
  let dx = 0, dy = 0;
  if (keys.KeyW || keys.ArrowUp) dy -= 1;
  if (keys.KeyS || keys.ArrowDown) dy += 1;
  if (keys.KeyA || keys.ArrowLeft) dx -= 1;
  if (keys.KeyD || keys.ArrowRight) dx += 1;
  dx += sticks.left.x; dy += sticks.left.y;
  if (dx === 0 && dy === 0) { dx = Math.cos(player.aim); dy = Math.sin(player.aim); }
  const m = Math.hypot(dx, dy); dx /= m; dy /= m;
  player.dashT = 0.22; player.dashCd = 1.1;
  player.dashDx = dx; player.dashDy = dy;
  player.iframes = Math.max(player.iframes, 0.28);
  ZAudio.dash();
  burst(player.x, player.y, '#7cc4ff', 10, 300, 0.4, 4);
}
function toggleSlowmo(force) {
  if (state !== 'play' || player.dead) return;
  const want = force !== undefined ? force : !slowmoActive;
  if (want && slowmoMeter < 20) { subtitle('Z-TIME recharging… get kills to charge it!'); return; }
  slowmoActive = want;
  ZAudio.slowmo(want);
  if (want) { flash(0.12); feed('⏳ Z-TIME ENGAGED'); }
}
function throwGrenade() {
  if (state !== 'play' || player.dead || player.grenades <= 0) return;
  player.grenades--;
  ZAudio.grenade();
  const range = 420;
  const gx = player.x + Math.cos(player.aim) * Math.min(range, 260 + Math.random() * 120);
  const gy = player.y + Math.sin(player.aim) * Math.min(range, 260 + Math.random() * 120);
  grenades.push({ x: player.x, y: player.y, sx: player.x, sy: player.y, tx: gx, ty: gy, t: 0, dur: 0.55, fuse: 0.9 });
  feed('💣 GRENADE OUT');
}
function reload() {
  const w = player.weapons[player.cur], def = WEAPONS[player.cur];
  if (player.reloadT > 0 || w.mag >= def.mag || w.reserve <= 0) return;
  player.reloadT = player.cur === 'SHOTGUN' ? 1.3 : 0.85;
  ZAudio.reload();
}
function switchWeapon(name) {
  if (!player.weapons[name].unlocked || player.cur === name) return;
  player.cur = name; player.reloadT = 0; player.fireCd = 0.15;
  ZAudio.ui();
}

// ---------- act flow ----------
function startAct(i, skipBriefing = false) {
  actIndex = i; waveIndex = -1; waveState = 'between'; waveTimer = 1.2;
  enemies = []; bullets = []; ebullets = []; pickups = []; grenades = []; parts = []; casings = []; dmgNums = [];
  boss = null; bossActive = false;
  player.x = WORLD.w / 2; player.y = WORLD.h / 2;
  player.hp = player.maxHp; player.dead = false;
  player.grenades = Math.max(player.grenades, 3);
  slowmoActive = false; slowmoMeter = Math.max(slowmoMeter, 60); combo = 1;
  buildMap(i);
  // guarantee starter crates
  dropPickup(player.x - 140, player.y - 100, 'SMG');
  if (i >= 1) dropPickup(player.x + 140, player.y - 100, 'RIFLE');
  if (i >= 2) dropPickup(player.x, player.y + 160, 'SHOTGUN');
  dropPickup(player.x - 120, player.y + 140, 'ARMOR');
  const begin = () => {
    state = 'play';
    hide('menu'); hide('pause'); hide('gameover'); hide('victory'); hide('cutscene');
    show('hud');
    if (isTouch) $('touch-ui').classList.remove('hidden');
    setCinema(false);
    updateHUD();
    try { localStorage.setItem('zach_act', String(i)); } catch (e) {}
  };
  if (skipBriefing) { begin(); return; }
  playCutscene(STORY.acts[i].briefing(), begin);
}
function actComplete() {
  ZAudio.stopMusic();
  playCutscene(STORY.acts[actIndex].outro(), () => {
    if (actIndex >= 2) { victory(); return; }
    startAct(actIndex + 1);
  });
}
function victory() {
  state = 'victory'; ZAudio.sting(true);
  hide('hud'); $('touch-ui').classList.add('hidden'); setCinema(true);
  const t = Math.floor(runTime), mmT = Math.floor(t / 60), ss = String(t % 60).padStart(2, '0');
  $('final-score').textContent = score.toLocaleString();
  $('final-kills').textContent = kills;
  $('final-time').textContent = `${mmT}:${ss}`;
  const b = Math.max(best(), score);
  setBest(b); $('final-best').textContent = b.toLocaleString();
  try { localStorage.setItem('zach_act', '0'); } catch (e) {}
  show('victory');
}

// ---------- update ----------
let lastT = performance.now();
function loop(t) {
  requestAnimationFrame(loop);
  let dt = Math.min(0.05, (t - lastT) / 1000);
  lastT = t;
  if (state === 'play') {
    // Z-time
    if (slowmoActive) {
      slowmoMeter -= dt * 30;
      if (slowmoMeter <= 0) { slowmoMeter = 0; toggleSlowmo(false); }
      timeScale = lerp(timeScale, 0.28, 0.2);
    } else {
      timeScale = lerp(timeScale, hitStop > 0 ? 0.05 : 1, 0.25);
      slowmoMeter = Math.min(100, slowmoMeter + dt * 3.5);
    }
    hitStop = Math.max(0, hitStop - dt);
    const gdt = dt * timeScale;
    runTime += dt;
    updatePlayer(dt, gdt);
    updateWaves(dt);
    updateEnemies(gdt, dt);
    updateBullets(gdt);
    updateGrenades(gdt);
    updatePickups(gdt);
    updateFx(dt, gdt);
    updateCamera(dt);
    updateHUD();
    drawMinimap();
  } else if (state === 'menu' || state === 'cutscene') {
    updateFx(dt, dt);
  }
  render();
  // flash decay
  if (flashA > 0) { flashA = Math.max(0, flashA - dt * 2.2); $('flash').style.opacity = flashA; }
  if (centerMsgTimer > 0) { centerMsgTimer -= dt; if (centerMsgTimer <= 0) $('center-message').classList.add('hidden'); }
  if (comboTimer > 0) { comboTimer -= dt; if (comboTimer <= 0) combo = 1; }
}

function updatePlayer(dt, gdt) {
  if (player.dead) return;
  // aim
  if (isTouch && (Math.abs(sticks.right.x) > 0.2 || Math.abs(sticks.right.y) > 0.2)) {
    player.aim = Math.atan2(sticks.right.y, sticks.right.x);
  } else {
    player.aim = Math.atan2(mouse.y + camera.y - player.y, mouse.x + camera.x - player.x);
  }
  // move
  let dx = 0, dy = 0;
  if (keys.KeyW || keys.ArrowUp) dy -= 1;
  if (keys.KeyS || keys.ArrowDown) dy += 1;
  if (keys.KeyA || keys.ArrowLeft) dx -= 1;
  if (keys.KeyD || keys.ArrowRight) dx += 1;
  dx += sticks.left.x; dy += sticks.left.y;
  const m = Math.hypot(dx, dy);
  if (m > 1) { dx /= m; dy /= m; }
  player.dashCd = Math.max(0, player.dashCd - dt);
  player.iframes = Math.max(0, player.iframes - dt);
  player.fireCd = Math.max(0, player.fireCd - dt);
  if (keys.ShiftLeft || keys.ShiftRight) { tryDash(); keys.ShiftLeft = keys.ShiftRight = false; }
  if (player.dashT > 0) {
    player.dashT -= dt;
    const sp = 950;
    const p = collideCircle(player.x + player.dashDx * sp * gdt, player.y + player.dashDy * sp * gdt, player.r);
    player.x = p.x; player.y = p.y;
    parts.push({ x: player.x, y: player.y, vx: 0, vy: 0, life: 0.3, maxLife: 0.3, color: 'rgba(124,196,255,.6)', size: 16, drag: 0, ghost: true });
  } else {
    const sp = player.speed;
    const p = collideCircle(player.x + dx * sp * gdt, player.y + dy * sp * gdt, player.r);
    player.x = p.x; player.y = p.y;
  }
  // keys: 1-4 weapons, R reload, E grenade, Space slowmo
  if (keys.Digit1) switchWeapon('PISTOL');
  if (keys.Digit2) switchWeapon('SMG');
  if (keys.Digit3) switchWeapon('RIFLE');
  if (keys.Digit4) switchWeapon('SHOTGUN');
  if (keys.KeyR) { reload(); keys.KeyR = false; }
  if (keys.KeyE || keys.KeyQ) { throwGrenade(); keys.KeyE = keys.KeyQ = false; }
  if (keys.Space) { toggleSlowmo(); keys.Space = false; }
  // reload timer
  if (player.reloadT > 0) {
    player.reloadT -= dt;
    if (player.reloadT <= 0) {
      const w = player.weapons[player.cur], def = WEAPONS[player.cur];
      const need = def.mag - w.mag;
      const take = w.reserve === Infinity ? need : Math.min(need, w.reserve);
      w.mag += take;
      if (w.reserve !== Infinity) w.reserve -= take;
    }
  }
  // fire
  const wdat = player.weapons[player.cur], def = WEAPONS[player.cur];
  const wantFire = mouse.down || (isTouch && Math.hypot(sticks.right.x, sticks.right.y) > 0.55);
  if (wantFire && player.fireCd <= 0 && player.reloadT <= 0 && player.dashT <= 0) {
    if (!def.auto && !mouse._clicked && !isTouch) { /* semi */ }
    if (wdat.mag > 0) {
      wdat.mag--;
      player.fireCd = def.rate;
      const gx = player.x + Math.cos(player.aim) * 26, gy = player.y + Math.sin(player.aim) * 26;
      fireBullet(gx, gy, player.aim, def, true);
      ZAudio.shoot(player.cur);
      addShake(def.kick / 90);
      // recoil
      const p = collideCircle(player.x - Math.cos(player.aim) * def.kick * gdt * 0.4, player.y - Math.sin(player.aim) * def.kick * gdt * 0.4, player.r);
      player.x = p.x; player.y = p.y;
      if (wdat.mag === 0) reload();
    } else { reload(); player.fireCd = 0.25; }
  }
  mouse._clicked = false;
}
canvas.addEventListener('mousedown', () => mouse._clicked = true);

function updateWaves(dt) {
  if (bossActive) {
    if (!boss || boss.dead) { /* handled in killEnemy */ }
    else return;
    if (!bossActive && enemies.length === 0) { waveState = 'done'; waveTimer = 1.5; bossActive = false; }
    return;
  }
  const act = STORY.acts[actIndex];
  if (waveState === 'between') {
    waveTimer -= dt;
    if (waveTimer <= 0) {
      if (waveIndex + 1 < act.waves.length) startWave(waveIndex + 1);
      else { spawnBoss(); waveState = 'boss'; }
    }
  } else if (waveState === 'fight') {
    // trickle spawns
    waveTimer += dt;
    if (spawnQueue.length && waveTimer > 0.35 && enemies.length < 14) {
      waveTimer = 0;
      const n = Math.min(spawnQueue.length, randi(1, 3));
      for (let i = 0; i < n; i++) { const p = spawnPos(); spawnEnemy(spawnQueue.pop(), p.x, p.y); }
    }
    if (!spawnQueue.length && enemies.length === 0) {
      if (waveIndex + 1 < act.waves.length) {
        waveState = 'between'; waveTimer = 2.2;
        centerMessage('WAVE CLEAR', 1.2);
        player.hp = Math.min(player.maxHp, player.hp + 12);
        ZAudio.pickup();
      } else { spawnBoss(); waveState = 'boss'; }
    }
  } else if (waveState === 'boss') {
    if (!bossActive && enemies.length === 0) {
      waveState = 'done'; waveTimer = 2;
      centerMessage(`${act.act} COMPLETE`, 2);
    }
  } else if (waveState === 'done') {
    waveTimer -= dt;
    // cleanup boss leftovers
    if (waveTimer <= 0) actComplete();
  }
}

function updateEnemies(gdt, rdt) {
  for (const e of enemies) {
    if (e.dead) continue;
    e.flash = Math.max(0, e.flash - gdt);
    e.spawnT = Math.max(0, e.spawnT - gdt);
    e.fireCd -= gdt; e.stateT += gdt;
    // friction for knockback
    e.x += e.vx * gdt; e.y += e.vy * gdt;
    e.vx *= (1 - 6 * gdt); e.vy *= (1 - 6 * gdt);
    const d = dist(e, player), a = angTo(e, player);
    const slow = slowmoActive ? 1 : 1; // enemies already slowed by gdt
    const mv = (aa, sp) => {
      const p = collideCircle(e.x + Math.cos(aa) * sp * gdt * slow, e.y + Math.sin(aa) * sp * gdt * slow, e.r);
      e.x = p.x; e.y = p.y;
    };
    switch (e.behavior) {
      case 'chase': {
        mv(a, e.speed);
        if (d < e.r + player.r + 6 && e.fireCd <= 0) { e.fireCd = 0.9; hurtPlayer(e.dmg); burst(player.x, player.y, '#fff', 6, 200, 0.3, 3); }
        break;
      }
      case 'dart': {
        e.dartT -= gdt;
        if (e.dartT <= 0) { e.dartT = rand(0.7, 1.4); e.aimA = a + rand(-0.4, 0.4); }
        mv(e.aimA, e.speed * (d > 200 ? 1.2 : 0.9));
        if (d < e.r + player.r + 4 && e.fireCd <= 0) { e.fireCd = 0.6; hurtPlayer(e.dmg); }
        break;
      }
      case 'strafe': {
        const want = 380;
        if (d > want + 60) mv(a, e.speed);
        else if (d < want - 120) mv(a + Math.PI, e.speed);
        else mv(a + Math.PI / 2 * e.strafeDir, e.speed * 0.7);
        if (Math.random() < gdt * 0.5) e.strafeDir *= -1;
        if (e.fireCd <= 0 && d < 640 && lineOfSight(e, player)) {
          e.fireCd = rand(1.1, 1.9) - actIndex * 0.12;
          fireBullet(e.x, e.y, a + rand(-0.08, 0.08), { dmg: e.dmg, speed: 460, spread: 0.03, color: '#c77cff' }, false);
          ZAudio.enemyShoot();
        }
        break;
      }
      case 'snipe': {
        if (d > 560) mv(a, e.speed); else if (d < 300) mv(a + Math.PI, e.speed);
        else mv(a + Math.PI / 2 * e.strafeDir, e.speed * 0.4);
        e.aimA = a; // laser tracks
        if (e.fireCd <= 0 && d < 800 && lineOfSight(e, player)) {
          e.fireCd = rand(2.2, 3.0);
          // windup then fire
          e.windup = 0.6;
        }
        if (e.windup !== undefined && e.windup > 0) {
          e.windup -= gdt; e.aimA = a;
          if (e.windup <= 0) {
            fireBullet(e.x, e.y, e.aimA, { dmg: e.dmg, speed: 900, spread: 0, color: '#ff4d4d' }, false);
            ZAudio.enemyShoot(); e.windup = 0;
          }
        }
        break;
      }
      case 'brute': { // ACT 1 boss: charges + shockwave slam
        e.chargeT -= gdt;
        if (e.stateT > 2.5 && e.chargeT <= 0 && d > 200) { e.charging = 0.8; e.chargeT = 4; e.aimA = a; ZAudio.dash(); feed('⚠ BRUTUS IS CHARGING!'); }
        if (e.charging > 0) {
          e.charging -= gdt;
          mv(e.aimA, 560);
          burst(e.x, e.y, '#ff5252', 2, 200, 0.3, 5);
          if (d < e.r + player.r + 10) { e.charging = 0; hurtPlayer(e.dmg + 8); addShake(10); }
        } else {
          mv(a, e.speed);
          if (d < 130 && e.fireCd <= 0) { // slam
            e.fireCd = 2.2;
            explode(e.x, e.y, 170, 18, false);
            // ring of bullets
            for (let i = 0; i < 10; i++) fireBullet(e.x, e.y, (i / 10) * TAU, { dmg: 10, speed: 300, color: '#ff9a3d' }, false);
          }
        }
        break;
      }
      case 'viper': { // ACT 2 boss: fast dashes + fan shots + summons
        e.summonCd -= gdt;
        e.dartT -= gdt;
        if (e.dartT <= 0) { e.dartT = rand(0.8, 1.4); e.aimA = a + rand(-1, 1); burst(e.x, e.y, '#7cff9e', 8, 300, 0.3, 4); }
        const want = 340;
        mv(d > want ? a : e.aimA, e.speed);
        if (e.fireCd <= 0 && lineOfSight(e, player)) {
          e.fireCd = e.hp < e.maxHp * 0.4 ? 0.9 : 1.3;
          const base = a;
          for (let i = -2; i <= 2; i++) fireBullet(e.x, e.y, base + i * 0.14, { dmg: 12, speed: 520, color: '#7cff9e' }, false);
          ZAudio.enemyShoot();
        }
        if (e.summonCd <= 0 && enemies.length < 8) {
          e.summonCd = 7;
          feed('VIPER calls reinforcements!');
          for (let i = 0; i < 3; i++) { const p = spawnPos(); spawnEnemy('runner', p.x, p.y); }
        }
        break;
      }
      case 'falcon': { // final boss: phases
        const frac = e.hp / e.maxHp;
        e.phase = frac < 0.33 ? 3 : frac < 0.66 ? 2 : 1;
        if (e.phase !== e.lastPhase) {
          e.lastPhase = e.phase;
          centerMessage(e.phase === 2 ? 'FALCON: PHASE 2' : 'FALCON: FINAL FURY', 1.6);
          explode(e.x, e.y, 220, 0, true);
          ZAudio.boss();
        }
        e.summonCd -= gdt;
        // movement: stalk + teleport dash in phase 3
        if (e.phase === 3 && Math.random() < gdt * 0.8) {
          burst(e.x, e.y, '#ff2a2a', 20, 400, 0.4, 5);
          const p = spawnPos(); e.x = p.x; e.y = p.y;
          burst(e.x, e.y, '#ff2a2a', 20, 400, 0.4, 5);
        } else mv(a, e.speed * (e.phase === 3 ? 1.4 : 1));
        if (e.fireCd <= 0 && d < 700) {
          e.fireCd = e.phase === 1 ? 1.5 : e.phase === 2 ? 1.0 : 0.7;
          if (e.phase === 1) {
            for (let i = 0; i < 8; i++) fireBullet(e.x, e.y, (i / 8) * TAU + e.stateT, { dmg: 12, speed: 340, color: '#ff2a2a' }, false);
          } else if (e.phase === 2) {
            for (let i = -3; i <= 3; i++) fireBullet(e.x, e.y, a + i * 0.12, { dmg: 13, speed: 560, color: '#ff9a3d' }, false);
          } else {
            for (let i = 0; i < 12; i++) fireBullet(e.x, e.y, rand(0, TAU), { dmg: 11, speed: 420, color: '#ff2a2a' }, false);
            if (lineOfSight(e, player)) fireBullet(e.x, e.y, a, { dmg: 20, speed: 800, color: '#fff' }, false);
          }
          ZAudio.enemyShoot();
        }
        if (e.summonCd <= 0 && enemies.length < 7) {
          e.summonCd = e.phase === 3 ? 5 : 8;
          const p = spawnPos(); spawnEnemy(Math.random() < 0.5 ? 'gunman' : 'thug', p.x, p.y);
          feed('FALCON summons a guard!');
        }
        if (d < e.r + player.r + 8 && e.fireCd <= -0.5) { hurtPlayer(e.dmg); }
        break;
      }
    }
    // separation
    for (const o of enemies) {
      if (o === e || o.dead) continue;
      const dd = dist(e, o), min = e.r + o.r;
      if (dd > 0 && dd < min) {
        const push = (min - dd) * 0.5;
        const aa = Math.atan2(e.y - o.y, e.x - o.x);
        e.x += Math.cos(aa) * push * 0.5; e.y += Math.sin(aa) * push * 0.5;
      }
    }
  }
  enemies = enemies.filter(e => !e.dead);
}

function updateBullets(gdt) {
  for (const b of bullets) {
    b.life -= gdt;
    b.x += b.vx * gdt; b.y += b.vy * gdt;
    if (b.life <= 0 || bulletHitsWall(b.x, b.y)) { b.dead = true; sparks(b.x, b.y, 3); continue; }
    for (const e of enemies) {
      if (e.dead || e.spawnT > 0) continue;
      if (Math.hypot(e.x - b.x, e.y - b.y) < e.r + b.r) {
        // headshot-ish bonus for close range
        hurtEnemy(e, b.dmg, b.x - b.vx * 0.02, b.y - b.vy * 0.02);
        b.dead = true; break;
      }
    }
  }
  bullets = bullets.filter(b => !b.dead);
  for (const b of ebullets) {
    b.life -= gdt;
    b.x += b.vx * gdt; b.y += b.vy * gdt;
    if (b.life <= 0 || bulletHitsWall(b.x, b.y)) { b.dead = true; continue; }
    if (!player.dead && Math.hypot(player.x - b.x, player.y - b.y) < player.r + b.r - 2) {
      // dash dodge = style!
      if (player.dashT > 0) { style += 4; dmgNum(player.x, player.y - 10, 'DODGED!', '#7cc4ff'); }
      else hurtPlayer(b.dmg);
      b.dead = true;
    }
  }
  ebullets = ebullets.filter(b => !b.dead);
}

function updateGrenades(gdt) {
  for (const g of grenades) {
    g.t += gdt;
    const k = Math.min(1, g.t / g.dur);
    g.x = lerp(g.sx, g.tx, k); g.y = lerp(g.sy, g.ty, k);
    g.fuse -= gdt;
    if (g.fuse <= 0) { g.dead = true; explode(g.tx, g.ty, 190, 160, true); }
  }
  grenades = grenades.filter(g => !g.dead);
}

function updatePickups(gdt) {
  for (const p of pickups) {
    p.t += gdt; p.life -= gdt;
    if (p.life <= 0) { p.dead = true; continue; }
    if (dist(p, player) < player.r + 20) {
      p.dead = true;
      ZAudio.pickup(); flash(0.08);
      const w = WEAPONS[p.kind];
      if (w) {
        const inv = player.weapons[p.kind];
        inv.unlocked = true;
        inv.mag = WEAPONS[p.kind].mag;
        inv.reserve = Math.min(inv.reserve + WEAPONS[p.kind].reserve === Infinity ? 0 : WEAPONS[p.kind].reserve, WEAPONS[p.kind].reserve * 2 || 999);
        if (WEAPONS[p.kind].reserve !== Infinity) inv.reserve = Math.max(inv.reserve, WEAPONS[p.kind].reserve);
        player.cur = p.kind;
        feed(`🔫 ${p.kind} ACQUIRED!`); subtitle(`${p.kind} online. [1-4] to swap. Make it loud.`);
        centerMessage(p.kind, 0.9);
      } else if (p.kind === 'MEDKIT') { player.hp = Math.min(player.maxHp, player.hp + 40); feed('✚ +40 HP'); }
      else if (p.kind === 'ARMOR') { player.armor = Math.min(player.maxArmor, player.armor + 35); feed('🛡 +ARMOR'); }
      else if (p.kind === 'AMMO') {
        for (const k of Object.keys(player.weapons)) {
          const inv = player.weapons[k];
          if (inv.unlocked && WEAPONS[k].reserve !== Infinity) inv.reserve += WEAPONS[k].mag * 2;
        }
        feed('📦 AMMO RESTOCKED');
      }
      else if (p.kind === 'GRENADE') { player.grenades = Math.min(6, player.grenades + 2); feed('💣 +2 GRENADES'); }
    }
  }
  pickups = pickups.filter(p => !p.dead);
}

function updateFx(dt, gdt) {
  for (const p of parts) {
    p.life -= gdt;
    if (p.ring) continue;
    p.x += (p.vx || 0) * gdt; p.y += (p.vy || 0) * gdt;
    const dr = 1 - Math.min(0.9, (p.drag || 0) * gdt);
    if (p.vx) { p.vx *= dr; p.vy *= dr; }
    if (p.grow) p.size += gdt * 14;
  }
  parts = parts.filter(p => p.life > 0);
  for (const c of casings) { c.life -= dt; c.x += c.vx * dt; c.y += c.vy * dt; c.vx *= 0.94; c.vy *= 0.94; c.rot += c.vr * dt; }
  for (let i = casings.length - 1; i >= 0; i--) if (casings[i].life <= 0) casings.splice(i, 1);
  if (casings.length > 120) casings.splice(0, casings.length - 120);
  for (const d of dmgNums) { d.life -= dt; d.y -= dt * 60; }
  for (let i = dmgNums.length - 1; i >= 0; i--) if (dmgNums[i].life <= 0) dmgNums.splice(i, 1);
  shake = Math.max(0, shake - dt * 40);
  // rain
  const theme = STORY.acts[actIndex] && STORY.acts[actIndex].theme;
  if (state === 'play' && theme && theme.rain) {
    for (const r of rain) { r.y += r.s * dt; r.x -= r.s * dt * 0.15; if (r.y > H) { r.y = -10; r.x = rand(0, W + 100); } }
  }
}

function updateCamera(dt) {
  // look-ahead toward aim
  const lx = player.x + Math.cos(player.aim) * 90, ly = player.y + Math.sin(player.aim) * 90;
  camera.x = lerp(camera.x, lx - W / 2, 1 - Math.pow(0.001, dt));
  camera.y = lerp(camera.y, ly - H / 2, 1 - Math.pow(0.001, dt));
  camera.x = clamp(camera.x, -80, WORLD.w - W + 80);
  camera.y = clamp(camera.y, -80, WORLD.h - H + 80);
}

// ---------- render ----------
function render() {
  const theme = (STORY.acts[actIndex] && STORY.acts[actIndex].theme) || { ground: '#1b2230', road: '#11151d', accent: '#f5c518', night: 0.3 };
  // ground
  ctx.fillStyle = theme.ground;
  ctx.fillRect(0, 0, W, H);
  ctx.save();
  const shx = shake > 0 ? rand(-shake, shake) * 0.5 : 0;
  const shy = shake > 0 ? rand(-shake, shake) * 0.5 : 0;
  ctx.translate(-camera.x + shx, -camera.y + shy);

  if (state === 'play' || state === 'pause' || state === 'gameover') {
    // streets grid
    ctx.strokeStyle = 'rgba(255,255,255,0.05)'; ctx.lineWidth = 2;
    for (let x = 0; x <= WORLD.w; x += 200) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, WORLD.h); ctx.stroke(); }
    for (let y = 0; y <= WORLD.h; y += 200) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(WORLD.w, y); ctx.stroke(); }
    // center plaza
    ctx.fillStyle = 'rgba(245,197,24,0.05)';
    ctx.beginPath(); ctx.arc(WORLD.w / 2, WORLD.h / 2, 220, 0, TAU); ctx.fill();
    ctx.strokeStyle = theme.accent; ctx.globalAlpha = 0.25;
    ctx.beginPath(); ctx.arc(WORLD.w / 2, WORLD.h / 2, 220, 0, TAU); ctx.stroke();
    ctx.globalAlpha = 1;

    // obstacles
    for (const o of obstacles) {
      if (o.wall) { ctx.fillStyle = '#05070c'; ctx.fillRect(o.x, o.y, o.w, o.h); continue; }
      ctx.fillStyle = o.crate ? '#3a2f22' : '#232c3f';
      ctx.fillRect(o.x, o.y, o.w, o.h);
      ctx.strokeStyle = o.crate ? '#8a6d3b' : theme.accent;
      ctx.globalAlpha = o.crate ? 1 : 0.35; ctx.lineWidth = 2;
      ctx.strokeRect(o.x + 1, o.y + 1, o.w - 2, o.h - 2);
      ctx.globalAlpha = 1;
      if (o.crate) {
        ctx.strokeStyle = 'rgba(0,0,0,.4)';
        ctx.beginPath(); ctx.moveTo(o.x, o.y); ctx.lineTo(o.x + o.w, o.y + o.h); ctx.moveTo(o.x + o.w, o.y); ctx.lineTo(o.x, o.y + o.h); ctx.stroke();
      } else if (!o.crates) {
        // windows
        ctx.fillStyle = 'rgba(255,220,120,0.12)';
        for (let wy = o.y + 12; wy < o.y + o.h - 10; wy += 26)
          for (let wx = o.x + 12; wx < o.x + o.w - 10; wx += 30)
            if ((wx + wy) % 3 === 0) ctx.fillRect(wx, wy, 14, 10);
      }
      // shadow
      ctx.fillStyle = 'rgba(0,0,0,.35)';
      ctx.fillRect(o.x + 6, o.y + o.h, o.w, 8);
    }

    // pickups
    for (const p of pickups) {
      const bob = Math.sin(p.t * 4) * 4;
      const blink = p.life < 4 ? (Math.sin(p.t * 14) > 0 ? 1 : 0.3) : 1;
      ctx.globalAlpha = blink;
      ctx.fillStyle = 'rgba(0,0,0,.5)';
      ctx.beginPath(); ctx.ellipse(p.x, p.y + 14, 16, 6, 0, 0, TAU); ctx.fill();
      const colors = { MEDKIT: '#37d67a', ARMOR: '#4aa8ff', AMMO: '#ffd166', GRENADE: '#ff9a3d', SMG: '#7cc4ff', RIFLE: '#9dff6e', SHOTGUN: '#ff9a3d' };
      ctx.fillStyle = colors[p.kind] || '#fff';
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 2;
      ctx.save(); ctx.translate(p.x, p.y + bob);
      if (WEAPONS[p.kind]) { // gun crate
        ctx.fillRect(-18, -12, 36, 24); ctx.strokeRect(-18, -12, 36, 24);
        ctx.fillStyle = '#000'; ctx.font = 'bold 9px Inter'; ctx.textAlign = 'center';
        ctx.fillText(p.kind, 0, 4);
      } else {
        ctx.beginPath(); ctx.arc(0, 0, 14, 0, TAU); ctx.fill(); ctx.stroke();
        ctx.font = '15px serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText({ MEDKIT: '✚', ARMOR: '🛡', AMMO: '📦', GRENADE: '💣' }[p.kind] || '?', 0, 1);
      }
      ctx.restore();
      ctx.globalAlpha = 1;
    }

    // sniper lasers (under entities)
    for (const e of enemies) {
      if ((e.behavior === 'snipe' && e.windup > 0) || e.type === 'sniper') {
        if (!lineOfSight(e, player)) continue;
        ctx.strokeStyle = e.windup > 0 ? 'rgba(255,40,40,.85)' : 'rgba(255,40,40,.25)';
        ctx.lineWidth = e.windup > 0 ? 2.5 : 1;
        ctx.setLineDash([8, 6]);
        ctx.beginPath(); ctx.moveTo(e.x, e.y); ctx.lineTo(player.x, player.y); ctx.stroke();
        ctx.setLineDash([]);
      }
    }

    // casings
    for (const c of casings) {
      ctx.save(); ctx.translate(c.x, c.y); ctx.rotate(c.rot);
      ctx.fillStyle = '#f5c518'; ctx.fillRect(-3, -1.5, 6, 3);
      ctx.restore();
    }

    // enemies
    for (const e of enemies) drawEnemy(e);

    // player
    if (!player.dead) drawPlayer();

    // grenades
    for (const g of grenades) {
      const k = Math.min(1, g.t / g.dur);
      const h = Math.sin(k * Math.PI) * 60; // fake height
      ctx.fillStyle = 'rgba(0,0,0,.35)';
      ctx.beginPath(); ctx.ellipse(g.x, g.y + 6, 8, 4, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = g.fuse < 0.3 ? (Math.sin(g.t * 40) > 0 ? '#ff2a2a' : '#333') : '#2bff62';
      ctx.beginPath(); ctx.arc(g.x, g.y - h * 0.4, 8, 0, TAU); ctx.fill();
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.stroke();
    }

    // bullets
    for (const b of bullets) {
      ctx.strokeStyle = b.color; ctx.lineWidth = 4; ctx.lineCap = 'round';
      ctx.shadowColor = b.color; ctx.shadowBlur = 8;
      ctx.beginPath(); ctx.moveTo(b.x - b.vx * 0.012, b.y - b.vy * 0.012); ctx.lineTo(b.x, b.y); ctx.stroke();
      ctx.shadowBlur = 0;
    }
    for (const b of ebullets) {
      ctx.fillStyle = b.color; ctx.shadowColor = b.color; ctx.shadowBlur = 10;
      ctx.beginPath(); ctx.arc(b.x, b.y, 5, 0, TAU); ctx.fill();
      ctx.shadowBlur = 0;
    }

    // particles
    for (const p of parts) {
      const a = clamp(p.life / p.maxLife, 0, 1);
      if (p.ring) {
        ctx.globalAlpha = a;
        ctx.strokeStyle = p.color; ctx.lineWidth = 6 * a + 1;
        const r = lerp(p.r1, p.r0, a);
        ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, TAU); ctx.stroke();
        ctx.globalAlpha = 1;
        continue;
      }
      ctx.globalAlpha = p.ghost ? a * 0.8 : a;
      ctx.fillStyle = p.color;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.size * (p.grow ? 1 : a) + 0.5, 0, TAU); ctx.fill();
      ctx.globalAlpha = 1;
    }

    // damage numbers
    ctx.textAlign = 'center';
    for (const d of dmgNums) {
      ctx.globalAlpha = clamp(d.life / 0.9, 0, 1);
      ctx.font = d.big ? 'bold 22px Inter' : 'bold 15px Inter';
      ctx.strokeStyle = '#000'; ctx.lineWidth = 3;
      ctx.strokeText(d.txt, d.x, d.y);
      ctx.fillStyle = d.color; ctx.fillText(d.txt, d.x, d.y);
      ctx.globalAlpha = 1;
    }
  }
  ctx.restore();

  // rain overlay (screen space)
  if (state === 'play' && theme.rain) {
    ctx.strokeStyle = 'rgba(150,200,255,.35)'; ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (const r of rain) { ctx.moveTo(r.x, r.y); ctx.lineTo(r.x - 6, r.y + 22); }
    ctx.stroke();
  }
  // night tint
  if (state === 'play' && theme.night) {
    ctx.fillStyle = `rgba(5,8,20,${theme.night * 0.5})`;
    ctx.fillRect(0, 0, W, H);
  }
  // low-hp heartbeat tint
  if (state === 'play' && player.hp < 30 && !player.dead) {
    ctx.fillStyle = `rgba(180,0,0,${0.08 + Math.sin(runTime * 6) * 0.05})`;
    ctx.fillRect(0, 0, W, H);
  }
  // reload arc
  if (state === 'play' && player.reloadT > 0 && !player.dead) {
    const sx = player.x - camera.x, sy = player.y - camera.y;
    ctx.strokeStyle = '#f5c518'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.arc(sx, sy, 26, -Math.PI / 2, -Math.PI / 2 + (1 - player.reloadT) * 4); ctx.stroke();
    ctx.fillStyle = '#fff'; ctx.font = 'bold 11px Inter'; ctx.textAlign = 'center';
    ctx.fillText('RELOADING', sx, sy - 32);
  }
}

function drawPlayer() {
  const p = player;
  if (p.iframes > 0 && Math.sin(runTime * 40) > 0 && p.dashT <= 0) ctx.globalAlpha = 0.45;
  // shadow
  ctx.fillStyle = 'rgba(0,0,0,.4)';
  ctx.beginPath(); ctx.ellipse(p.x, p.y + 14, 14, 6, 0, 0, TAU); ctx.fill();
  // dash trail
  if (p.dashT > 0) {
    ctx.strokeStyle = 'rgba(124,196,255,.7)'; ctx.lineWidth = 20; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(p.x - p.dashDx * 60, p.y - p.dashDy * 60); ctx.lineTo(p.x, p.y); ctx.stroke();
  }
  // body — hero blue shirt
  ctx.fillStyle = '#a8d4f0';
  ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, TAU); ctx.fill();
  ctx.strokeStyle = slowmoActive ? '#b366ff' : '#f5c518'; ctx.lineWidth = 3; ctx.stroke();
  // head
  ctx.fillStyle = '#8d5524';
  ctx.beginPath(); ctx.arc(p.x, p.y, 8, 0, TAU); ctx.fill();
  // gun toward aim
  ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.aim);
  ctx.fillStyle = '#222'; ctx.fillRect(8, -3.5, 22, 7);
  ctx.fillStyle = '#555'; ctx.fillRect(24, -2, 8, 4);
  // muzzle flash
  if (p.fireCd > WEAPONS[p.cur].rate - 0.06) {
    ctx.fillStyle = '#ffe66d';
    ctx.beginPath(); ctx.moveTo(32, 0); ctx.lineTo(44, -7); ctx.lineTo(48, 0); ctx.lineTo(44, 7); ctx.fill();
  }
  ctx.restore();
  // name tag
  ctx.fillStyle = '#f5c518'; ctx.font = 'bold 11px Inter'; ctx.textAlign = 'center';
  ctx.fillText(heroName(), p.x, p.y - 24);
  // armor ring
  if (p.armor > 0) {
    ctx.strokeStyle = 'rgba(74,168,255,.8)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(p.x, p.y, p.r + 5, 0, TAU); ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

function drawEnemy(e) {
  const spawnA = e.spawnT > 0 ? 0.4 + Math.sin(e.spawnT * 30) * 0.3 : 1;
  ctx.globalAlpha = spawnA;
  ctx.fillStyle = 'rgba(0,0,0,.4)';
  ctx.beginPath(); ctx.ellipse(e.x, e.y + e.r * 0.8, e.r * 0.9, e.r * 0.35, 0, 0, TAU); ctx.fill();
  // body
  ctx.fillStyle = e.flash > 0 ? '#fff' : e.color;
  ctx.beginPath(); ctx.arc(e.x, e.y, e.r, 0, TAU); ctx.fill();
  ctx.strokeStyle = e.boss ? '#ffd166' : 'rgba(0,0,0,.5)';
  ctx.lineWidth = e.boss ? 3 : 2; ctx.stroke();
  // facing gun/head
  const a = angTo(e, player);
  ctx.save(); ctx.translate(e.x, e.y); ctx.rotate(a);
  if (e.behavior === 'strafe' || e.behavior === 'snipe' || e.boss) {
    ctx.fillStyle = '#1a1a1a'; ctx.fillRect(e.r * 0.4, -3, e.r + 6, 6);
  }
  // eyes
  ctx.fillStyle = e.boss ? '#ff0000' : '#111';
  ctx.beginPath(); ctx.arc(4, -5, e.boss ? 3.5 : 2.5, 0, TAU); ctx.arc(4, 5, e.boss ? 3.5 : 2.5, 0, TAU); ctx.fill();
  ctx.restore();
  if (e.boss) {
    // crown / skull mark
    ctx.fillStyle = '#ffd166'; ctx.font = 'bold 16px serif'; ctx.textAlign = 'center';
    ctx.fillText('☠', e.x, e.y - e.r - 8);
    // hp mini bar
    ctx.fillStyle = 'rgba(0,0,0,.6)'; ctx.fillRect(e.x - 30, e.y + e.r + 6, 60, 6);
    ctx.fillStyle = '#ff2a2a'; ctx.fillRect(e.x - 30, e.y + e.r + 6, 60 * clamp(e.hp / e.maxHp, 0, 1), 6);
  } else if (e.hp < e.maxHp) {
    ctx.fillStyle = 'rgba(0,0,0,.5)'; ctx.fillRect(e.x - 14, e.y - e.r - 10, 28, 4);
    ctx.fillStyle = '#7dff9e'; ctx.fillRect(e.x - 14, e.y - e.r - 10, 28 * clamp(e.hp / e.maxHp, 0, 1), 4);
  }
  ctx.globalAlpha = 1;
}

function drawMinimap() {
  const s = mmCanvas.width / WORLD.w;
  mm.clearRect(0, 0, mmCanvas.width, mmCanvas.height);
  mm.fillStyle = 'rgba(10,14,22,.9)'; mm.fillRect(0, 0, mmCanvas.width, mmCanvas.height);
  mm.fillStyle = 'rgba(255,255,255,.15)';
  for (const o of obstacles) if (!o.wall) mm.fillRect(o.x * s, o.y * s, Math.max(2, o.w * s), Math.max(2, o.h * s));
  for (const p of pickups) { mm.fillStyle = '#ffd166'; mm.fillRect(p.x * s - 1, p.y * s - 1, 3, 3); }
  for (const e of enemies) { mm.fillStyle = e.boss ? '#ff2a2a' : '#ff6b6b'; mm.beginPath(); mm.arc(e.x * s, e.y * s, e.boss ? 4 : 2, 0, TAU); mm.fill(); }
  mm.fillStyle = '#7dff9e'; mm.strokeStyle = '#fff'; mm.lineWidth = 1;
  mm.beginPath(); mm.arc(player.x * s, player.y * s, 3.5, 0, TAU); mm.fill(); mm.stroke();
}

// ---------- pause / mute ----------
function togglePause() {
  if (state === 'play') {
    state = 'pause';
    $('pause-stats').innerHTML = `${STORY.acts[actIndex].act} — ${STORY.acts[actIndex].name} &nbsp;•&nbsp; SCORE <b>${score.toLocaleString()}</b> &nbsp;•&nbsp; KILLS <b>${kills}</b>`;
    show('pause'); ZAudio.stopMusic();
  } else if (state === 'pause') {
    state = 'play'; hide('pause'); ZAudio.startMusic(1 + actIndex * 0.4 + (bossActive ? 0.6 : 0));
  }
}
function toggleMute() {
  ZAudio.init();
  const m = ZAudio.toggleMute();
  $('mute-btn').textContent = m ? '🔇' : '🔊';
}
$('mute-btn').addEventListener('click', e => { e.stopPropagation(); toggleMute(); });

// ---------- menu wiring ----------
function refreshMenu() {
  applyPhoto();
  $('high-score').textContent = 'BEST: ' + best().toLocaleString();
  const sa = savedAct();
  if (sa > 0 && sa < 3) { $('btn-continue').classList.remove('hidden'); $('continue-act').textContent = ['I', 'II', 'III'][sa]; }
  else $('btn-continue').classList.add('hidden');
}
$('btn-start').addEventListener('click', () => {
  ZAudio.init(); ZAudio.ui();
  score = 0; kills = 0; runTime = 0; style = 0; combo = 1;
  slowmoMeter = 100; player.grenades = 3; player.armor = 0;
  for (const k of Object.keys(player.weapons)) { player.weapons[k].unlocked = k === 'PISTOL'; player.weapons[k].mag = k === 'PISTOL' ? 12 : 0; player.weapons[k].reserve = k === 'PISTOL' ? Infinity : 0; }
  player.cur = 'PISTOL';
  hide('menu');
  playCutscene(STORY.intro(), () => startAct(0));
});
$('btn-continue').addEventListener('click', () => {
  ZAudio.init(); ZAudio.ui();
  score = 0; kills = 0; style = 0; combo = 1;
  hide('menu');
  startAct(savedAct());
});
$('btn-how').addEventListener('click', () => { ZAudio.ui(); hide('menu'); show('howto'); });
$('btn-how-back').addEventListener('click', () => { ZAudio.ui(); hide('howto'); show('menu'); });
$('btn-credits-link').addEventListener('click', () => { hide('menu'); $('final-score').textContent = best().toLocaleString(); $('final-kills').textContent = '—'; $('final-time').textContent = '—'; $('final-best').textContent = best().toLocaleString(); state = 'victory'; show('victory'); });
$('btn-resume').addEventListener('click', togglePause);
$('btn-restart-act').addEventListener('click', () => { ZAudio.ui(); hide('pause'); startAct(actIndex, true); });
$('btn-quit').addEventListener('click', () => { ZAudio.ui(); ZAudio.stopMusic(); hide('pause'); hide('hud'); $('touch-ui').classList.add('hidden'); state = 'menu'; refreshMenu(); show('menu'); });
$('btn-retry').addEventListener('click', () => { ZAudio.ui(); hide('gameover'); setCinema(false); player.hp = player.maxHp; startAct(actIndex, true); });
$('btn-go-menu').addEventListener('click', () => { ZAudio.ui(); hide('gameover'); setCinema(false); state = 'menu'; refreshMenu(); show('menu'); });
$('btn-play-again').addEventListener('click', () => { ZAudio.ui(); hide('victory'); setCinema(false); score = 0; kills = 0; runTime = 0; style = 0; startAct(0); });
$('btn-v-menu').addEventListener('click', () => { ZAudio.ui(); hide('victory'); setCinema(false); state = 'menu'; refreshMenu(); show('menu'); });
$('btn-photo').addEventListener('click', () => $('photo-input').click());
$('photo-input').addEventListener('change', e => {
  const f = e.target.files[0];
  if (!f) return;
  const r = new FileReader();
  r.onload = () => {
    // downscale to keep localStorage small
    const img = new Image();
    img.onload = () => {
      const c = document.createElement('canvas');
      const S = 256; c.width = S; c.height = S;
      const g = c.getContext('2d');
      const sc = Math.max(S / img.width, S / img.height);
      const w = img.width * sc, h = img.height * sc;
      g.drawImage(img, (S - w) / 2, (S - h) / 2, w, h);
      try { localStorage.setItem('zach_photo', c.toDataURL('image/jpeg', 0.85)); } catch (err) { alert('Photo too large to save, but it will work for this session.'); }
      applyPhoto(); ZAudio.pickup();
      alert('You are now the star! ⭐');
    };
    img.src = r.result;
  };
  r.readAsDataURL(f);
  e.target.value = '';
});

// ---------- boot ----------
refreshMenu();
show('menu');
requestAnimationFrame(loop);
})();
