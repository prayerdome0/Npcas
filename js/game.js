import * as THREE from 'three';
import { Sky } from 'three/addons/objects/Sky.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import {
  LANDMARKS, JOBS, PROPERTIES, BUSINESSES, VEHICLES, SHOP_ITEMS, STORY,
  FIRST_NAMES, LAST_NAMES, PERSONALITIES, DIALOGUE, DISTRICTS,
} from './data.js';
import {
  createWorld, createHuman, animateHuman, createCarMesh, createInterior,
  collides, inWater, makeLabelSprite, WORLD_SIZE,
} from './world.js';
import { audio } from './audio.js';
import { emit } from './bus.js';

const SAVE_KEY = 'zach-life-v1';
const MINUTE_MS = 900; // 1 game minute in real ms — full day ~ 21.6 real minutes, hours feel playable

export const state = {
  ready: false,
  mode: 'menu',
  time: 8 * 60,
  day: 1,
  weather: 'sunny',
  weatherTimer: 0,
  money: 750,
  bank: 0,
  bizBank: 0,
  credit: 640,
  loan: 0,
  needs: { hunger: 82, energy: 90, fun: 68, social: 52, hygiene: 85 },
  job: null,
  properties: ['studio'],
  home: 'studio',
  businesses: [],
  inventory: [{ id: 'coffee', n: 1 }],
  ownedVehicles: [],
  story: 0,
  storyDone: [],
  deliveries: 0,
  talks: 0,
  relationships: {},
  flags: {},
  xp: 0,
  level: 1,
  keys: {},
  phoneOpen: false,
  uiBlock: false,
  interior: null,
  delivery: null,
  dialogue: null,
  looking: null,
  seed: 1,
};

let renderer, scene, camera, composer, bloom, sky, sun, sunLight, hemi, fill;
let world, player, playerMesh, interiorGroup;
let npcs = [];
let vehicles = [];
let traffic = [];
let rain, rainGeo, rainPositions;
let marker;
let clock = new THREE.Clock();
let camYaw = 0.2, camPitch = 0.42, camDist = 7.2;
let pointerLocked = false;
let introT = 0;
let saveAcc = 0;
let flash = 0;
let talkTarget = null;
let night01 = 0;
let canvasEl;
let lastPrompt = '';

const _f = new THREE.Vector3();
const _r = new THREE.Vector3();
const _p = new THREE.Vector3();
const sunPos = new THREE.Vector3();

export function initGame(canvas) {
  canvasEl = canvas;
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
  renderer.setSize(innerWidth, innerHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x87a8c8);
  scene.fog = new THREE.FogExp2(0x87a8c8, 0.0016);

  camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.15, 40000);

  sky = new Sky();
  sky.scale.setScalar(45000);
  scene.add(sky);
  sun = new THREE.Vector3();
  const su = sky.material.uniforms;
  su['turbidity'].value = 6;
  su['rayleigh'].value = 1.8;
  su['mieCoefficient'].value = 0.005;
  su['mieDirectionalG'].value = 0.75;

  hemi = new THREE.HemisphereLight(0xb8d4f0, 0x3d4a28, 0.7);
  scene.add(hemi);
  sunLight = new THREE.DirectionalLight(0xfff1d0, 2.2);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.set(2048, 2048);
  sunLight.shadow.camera.near = 1;
  sunLight.shadow.camera.far = 180;
  sunLight.shadow.camera.left = sunLight.shadow.camera.bottom = -50;
  sunLight.shadow.camera.right = sunLight.shadow.camera.top = 50;
  sunLight.shadow.bias = -0.0008;
  scene.add(sunLight);
  scene.add(sunLight.target);
  fill = new THREE.AmbientLight(0xffffff, 0.12);
  scene.add(fill);

  world = createWorld(scene);
  buildRain();
  marker = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.55),
    new THREE.MeshBasicMaterial({ color: 0xf0c75e })
  );
  marker.position.y = 3.2;
  scene.add(marker);

  spawnCitizens();
  spawnTraffic();
  spawnDealershipCars();

  composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  bloom = new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), 0.15, 0.4, 0.85);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());

  bindInput();
  window.addEventListener('resize', onResize);
  state.ready = true;
  clock.start();
  loop();
}

function onResize() {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
  composer.setSize(innerWidth, innerHeight);
}

function buildRain() {
  rainGeo = new THREE.BufferGeometry();
  const n = 1400;
  rainPositions = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    rainPositions[i * 3] = (Math.random() - 0.5) * 60;
    rainPositions[i * 3 + 1] = Math.random() * 28;
    rainPositions[i * 3 + 2] = (Math.random() - 0.5) * 60;
  }
  rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPositions, 3));
  rain = new THREE.Points(
    rainGeo,
    new THREE.PointsMaterial({ color: 0xb8d4e8, size: 0.08, transparent: true, opacity: 0.65 })
  );
  rain.visible = false;
  scene.add(rain);
}

function rand(a) { return a[Math.floor(Math.random() * a.length)]; }

function spawnCitizens() {
  const homes = LANDMARKS.filter((l) => l.type === 'home' || l.district === 'oakwood' || l.district === 'eastbrook');
  for (let i = 0; i < 34; i++) {
    const homeLm = homes[i % homes.length];
    const job = JOBS[i % JOBS.length];
    const workLm = LANDMARKS.find((l) => l.id === job.location) || LANDMARKS[0];
    const appearance = {
      skin: rand(['#f6d5b8', '#e8b98a', '#c68642', '#8d5524', '#5c3310', '#2e1a0f']),
      hair: rand(['#1a1a1a', '#3b2a1a', '#6b3a1a', '#c4a35a', '#d8d0c8', '#8b1e3f']),
      hairStyle: i % 5,
      shirt: rand(['#f0f0f0', '#1e3a5f', '#c45c26', '#2d6a4f', '#7b2d8e', '#111111', '#c9a227']),
      pants: rand(['#1f2933', '#3d4a5c', '#4a3728', '#1a3c34']),
      eyes: rand(['#3d2914', '#1f4e79', '#2f6f4e', '#5b3a29']),
      height: 0.92 + Math.random() * 0.16,
      body: 0.9 + Math.random() * 0.25,
    };
    const mesh = createHuman(appearance);
    const x = homeLm.x + (Math.random() - 0.5) * 10;
    const z = homeLm.z + 8 + Math.random() * 6;
    mesh.position.set(x, 0, z);
    scene.add(mesh);
    const npc = {
      id: 'n' + i,
      name: rand(FIRST_NAMES) + ' ' + rand(LAST_NAMES),
      job: job.name,
      jobId: job.id,
      personality: PERSONALITIES[i % PERSONALITIES.length],
      home: new THREE.Vector3(homeLm.x + 6, 0, homeLm.z + 8),
      work: new THREE.Vector3(workLm.x + 8, 0, workLm.z + 10),
      shop: new THREE.Vector3(-52, 0, 40),
      plaza: new THREE.Vector3((Math.random() - 0.5) * 20, 0, 12 + Math.random() * 8),
      mesh,
      target: new THREE.Vector3(x, 0, z),
      speed: 1.6 + Math.random() * 0.8,
      talking: false,
      label: null,
    };
    npcs.push(npc);
  }
}

function spawnTraffic() {
  const loop = [];
  for (let z = -220; z <= 250; z += 20) loop.push(new THREE.Vector3(4.5, 0, z));
  for (let x = 4.5; x <= 200; x += 20) loop.push(new THREE.Vector3(x, 0, 250));
  for (let z = 250; z >= -40; z -= 20) loop.push(new THREE.Vector3(200, 0, z));
  for (let x = 200; x >= -4.5; x -= 20) loop.push(new THREE.Vector3(x, 0, 36));
  const defs = [VEHICLES[1], VEHICLES[2], VEHICLES[3], VEHICLES[6], VEHICLES[4]];
  for (let i = 0; i < 10; i++) {
    const def = defs[i % defs.length];
    const mesh = createCarMesh(def, def.color);
    const idx = (i * 7) % loop.length;
    mesh.position.copy(loop[idx]);
    mesh.position.y = 0;
    scene.add(mesh);
    traffic.push({ mesh, def, path: loop, idx, speed: 9 + Math.random() * 5, ai: true });
  }
}

function spawnDealershipCars() {
  const spots = world.parking;
  VEHICLES.forEach((def, i) => {
    if (def.water || def.fly) return;
    const spot = spots[i % spots.length];
    const mesh = createCarMesh(def);
    mesh.position.set(spot.x + i * 0.2, 0, spot.z);
    mesh.rotation.y = spot.yaw;
    scene.add(mesh);
    vehicles.push({
      id: def.id + '_' + i,
      def,
      mesh,
      owned: false,
      fuel: def.fuel,
      wear: 0,
      hp: 100,
      speed: 0,
      parked: true,
    });
  });
  // boat at harbor
  const boatDef = VEHICLES.find((v) => v.type === 'boat');
  const boat = createCarMesh(boatDef);
  boat.position.set(-240, 0.2, 200);
  scene.add(boat);
  vehicles.push({ id: 'boat_0', def: boatDef, mesh: boat, owned: false, fuel: boatDef.fuel, wear: 0, hp: 100, speed: 0, parked: true });
  const heliDef = VEHICLES.find((v) => v.type === 'heli');
  const heli = createCarMesh(heliDef);
  heli.position.set(58, 0, 200);
  scene.add(heli);
  vehicles.push({ id: 'heli_0', def: heliDef, mesh: heli, owned: false, fuel: heliDef.fuel, wear: 0, hp: 100, speed: 0, parked: true });
}

function bindInput() {
  const k = state.keys;
  addEventListener('keydown', (e) => {
    k[e.code] = true;
    if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.code)) e.preventDefault();
    if (e.code === 'KeyM' && !state.uiBlock) audio.toggle();
    if (e.code === 'KeyH' && player?.vehicle) audio.horn();
    if (e.code === 'KeyF') tryVehicle();
    if (e.code === 'KeyE') interact();
    if (e.code === 'Tab') { e.preventDefault(); emit('toggle-phone'); }
    if (e.code === 'Escape') emit('escape');
  });
  addEventListener('keyup', (e) => { k[e.code] = false; });
  addEventListener('mousemove', (e) => {
    if (state.mode !== 'play' && state.mode !== 'interior' && state.mode !== 'intro') return;
    if (state.uiBlock || state.phoneOpen) return;
    if (!pointerLocked && !(e.buttons & 2) && !(e.buttons & 1)) return;
    camYaw -= e.movementX * 0.0035;
    camPitch = Math.max(0.08, Math.min(1.15, camPitch + e.movementY * 0.0025));
  });
  canvasEl.addEventListener('click', () => {
    if (state.mode === 'play' || state.mode === 'interior') {
      canvasEl.requestPointerLock?.();
    }
  });
  canvasEl.addEventListener('contextmenu', (e) => e.preventDefault());
  document.addEventListener('pointerlockchange', () => {
    pointerLocked = document.pointerLockElement === canvasEl;
  });

  // touch
  let lx = 0, ly = 0, rx = 0, ry = 0, leftId = null, rightId = null;
  addEventListener('touchstart', (e) => {
    for (const t of e.changedTouches) {
      if (t.clientX < innerWidth / 2 && leftId == null) { leftId = t.identifier; lx = t.clientX; ly = t.clientY; }
      else if (rightId == null) { rightId = t.identifier; rx = t.clientX; ry = t.clientY; }
    }
  }, { passive: true });
  addEventListener('touchmove', (e) => {
    for (const t of e.changedTouches) {
      if (t.identifier === leftId) {
        const dx = (t.clientX - lx) / 50, dy = (t.clientY - ly) / 50;
        k._tx = Math.max(-1, Math.min(1, dx));
        k._ty = Math.max(-1, Math.min(1, dy));
      }
      if (t.identifier === rightId) {
        camYaw -= (t.clientX - rx) * 0.01;
        camPitch = Math.max(0.08, Math.min(1.15, camPitch + (t.clientY - ry) * 0.008));
        rx = t.clientX; ry = t.clientY;
      }
    }
  }, { passive: true });
  addEventListener('touchend', (e) => {
    for (const t of e.changedTouches) {
      if (t.identifier === leftId) { leftId = null; k._tx = 0; k._ty = 0; }
      if (t.identifier === rightId) rightId = null;
    }
  });
}

export function hasSave() {
  try { return !!localStorage.getItem(SAVE_KEY); } catch { return false; }
}

export function getSaveSummary() {
  try {
    const s = JSON.parse(localStorage.getItem(SAVE_KEY));
    if (!s) return null;
    return { name: s.name, day: s.day, money: s.money, level: s.level };
  } catch { return null; }
}

export function startNewLife(custom) {
  Object.assign(state, {
    mode: 'intro',
    time: 8 * 60,
    day: 1,
    weather: 'sunny',
    weatherTimer: 0,
    money: 750,
    bank: 0,
    bizBank: 0,
    credit: 640,
    loan: 0,
    needs: { hunger: 82, energy: 90, fun: 68, social: 52, hygiene: 85 },
    job: null,
    properties: ['studio'],
    home: 'studio',
    businesses: [],
    inventory: [{ id: 'coffee', n: 1 }],
    ownedVehicles: [],
    story: 0,
    storyDone: [],
    deliveries: 0,
    talks: 0,
    relationships: {},
    flags: {},
    xp: 0,
    level: 1,
    interior: null,
    delivery: null,
    dialogue: null,
    appearance: custom,
    name: custom.name || 'Zach',
    trait: custom.trait || 'hustler',
  });
  if (playerMesh) scene.remove(playerMesh);
  playerMesh = createHuman(custom);
  player = { x: -186, z: 48, y: 0, yaw: 0, vy: 0, vehicle: null };
  playerMesh.position.set(player.x, 0, player.z);
  scene.add(playerMesh);
  introT = 0;
  camYaw = 0.4; camPitch = 0.5; camDist = 8;
  audio.start();
  emit('hud', { on: true });
  emit('notify', { text: 'Welcome to New Aurora. This life is yours.', kind: 'story' });
  emit('mission', { mission: STORY[0] });
  saveGame();
}

export function continueLife() {
  const raw = localStorage.getItem(SAVE_KEY);
  if (!raw) return false;
  const s = JSON.parse(raw);
  const appearance = s.appearance || {
    name: s.name || 'Zach', skin: '#c68642', hair: '#1a1a1a', hairStyle: 0,
    shirt: '#1e3a5f', pants: '#1f2933', eyes: '#3d2914', height: 1, body: 1, trait: 'hustler',
  };
  startNewLife(appearance);
  Object.assign(state, {
    mode: 'play',
    time: s.time ?? state.time,
    day: s.day ?? 1,
    weather: s.weather ?? 'sunny',
    money: s.money ?? 750,
    bank: s.bank ?? 0,
    bizBank: s.bizBank ?? 0,
    credit: s.credit ?? 640,
    loan: s.loan ?? 0,
    needs: s.needs ?? state.needs,
    job: s.job ?? null,
    properties: s.properties ?? ['studio'],
    home: s.home ?? 'studio',
    businesses: s.businesses ?? [],
    inventory: s.inventory ?? [],
    ownedVehicles: s.ownedVehicles ?? [],
    story: s.story ?? 0,
    storyDone: s.storyDone ?? [],
    deliveries: s.deliveries ?? 0,
    talks: s.talks ?? 0,
    relationships: s.relationships ?? {},
    flags: s.flags ?? {},
    xp: s.xp ?? 0,
    level: s.level ?? 1,
    name: s.name || appearance.name,
    trait: s.trait || appearance.trait,
  });
  player.x = s.x ?? player.x;
  player.z = s.z ?? player.z;
  playerMesh.position.set(player.x, 0, player.z);
  state.ownedVehicles.forEach((id) => {
    const v = vehicles.find((c) => c.def.id === id || c.id.startsWith(id));
    if (v) v.owned = true;
  });
  emit('notify', { text: `Day ${state.day}. ${state.name} is back.`, kind: 'info' });
  emit('mission', { mission: STORY[state.story] || null });
  return true;
}

export function saveGame() {
  if (!player) return;
  const data = {
    name: state.name, appearance: state.appearance, trait: state.trait,
    time: state.time, day: state.day, weather: state.weather,
    money: state.money, bank: state.bank, bizBank: state.bizBank, credit: state.credit, loan: state.loan,
    needs: state.needs, job: state.job, properties: state.properties, home: state.home,
    businesses: state.businesses, inventory: state.inventory, ownedVehicles: state.ownedVehicles,
    story: state.story, storyDone: state.storyDone, deliveries: state.deliveries, talks: state.talks,
    relationships: state.relationships, flags: state.flags, xp: state.xp, level: state.level,
    x: player.x, z: player.z,
  };
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(data)); } catch {}
}

export function setPaused(v) {
  if (v) {
    if (state.mode === 'play' || state.mode === 'interior') state._resume = state.mode;
    state.mode = 'pause';
    document.exitPointerLock?.();
  } else {
    state.mode = state._resume || 'play';
  }
}

export function setPhoneOpen(v) { state.phoneOpen = v; if (v) document.exitPointerLock?.(); }
export function setUIBlock(v) { state.uiBlock = v; if (v) document.exitPointerLock?.(); }

function loop() {
  requestAnimationFrame(loop);
  const dt = Math.min(0.05, clock.getDelta());
  audio.tick(dt);
  if (!state.ready) return;

  if (state.mode === 'intro') {
    updateIntro(dt);
    updateSky();
    composer.render();
    return;
  }

  if (state.mode === 'play' || state.mode === 'interior') {
    updateTime(dt);
    updateWeather(dt);
    if (state.mode === 'play') {
      updatePlayer(dt);
      updateNPCs(dt);
      updateVehicles(dt);
      updateTraffic(dt);
    } else {
      updateInteriorPlayer(dt);
    }
    updateNeeds(dt);
    updateLooking();
    updateMissions();
    updateMarker();
    saveAcc += dt;
    if (saveAcc > 20) { saveAcc = 0; saveGame(); }
  } else if (state.mode === 'menu') {
    camYaw += dt * 0.05;
    camera.position.set(Math.sin(camYaw) * 90, 42, Math.cos(camYaw) * 90);
    camera.lookAt(0, 18, 40);
    updateSky();
  }

  updateSky();
  updateRain(dt);
  if (player && playerMesh && state.mode !== 'menu') updateCamera(dt);
  if (flash > 0) {
    flash -= dt;
    renderer.toneMappingExposure = 3;
  } else if (state.mode !== 'menu') {
    renderer.toneMappingExposure = 0.95 + (1 - night01) * 0.2;
  }
  bloom.strength = 0.12 + night01 * 0.55;
  composer.render();
}

function updateIntro(dt) {
  introT += dt;
  const t = Math.min(1, introT / 5.5);
  const ease = 1 - Math.pow(1 - t, 3);
  const px = player.x, pz = player.z;
  camera.position.set(
    px + Math.sin(0.8) * (80 - ease * 72),
    55 - ease * 48,
    pz + Math.cos(0.8) * (80 - ease * 72)
  );
  camera.lookAt(px, 1.4, pz);
  if (introT > 5.8) {
    state.mode = 'play';
    emit('notify', { text: 'Your studio is behind you. The city is ahead.', kind: 'story' });
  }
}

function hour() { return (state.time / 60) % 24; }

function updateTime(dt) {
  const before = Math.floor(state.time / 60);
  state.time += (dt * 1000) / MINUTE_MS;
  if (state.time >= 24 * 60) {
    state.time -= 24 * 60;
    state.day += 1;
    onNewDay();
  }
  const after = Math.floor(state.time / 60);
  if (after !== before) emit('time', { time: state.time, day: state.day, weather: state.weather });
}

function onNewDay() {
  emit('notify', { text: `Day ${state.day} in New Aurora.`, kind: 'info' });
  for (const b of state.businesses) {
    const def = BUSINESSES.find((x) => x.id === b.id);
    if (!def) continue;
    const [lo, hi] = def.income;
    const pay = Math.round((lo + Math.random() * (hi - lo)) * (1 + 0.18 * (b.level || 0)));
    state.bizBank += pay;
    emit('notify', { text: `${def.name} earned $${pay}.`, kind: 'cash' });
  }
  if (state.day % 7 === 0) {
    const home = PROPERTIES.find((p) => p.id === state.home);
    if (home && home.rent) {
      if (state.money >= home.rent) {
        spend(home.rent, `Rent for ${home.name}`);
      } else if (state.bank >= home.rent) {
        state.bank -= home.rent;
        emit('notify', { text: `Rent auto-paid from savings ($${home.rent}).`, kind: 'info' });
      } else {
        state.credit = Math.max(300, state.credit - 40);
        emit('notify', { text: 'Missed rent. Credit took a hit.', kind: 'warn' });
      }
    }
    if (state.loan > 0) {
      const due = Math.max(80, Math.round(state.loan * 0.04));
      if (state.money + state.bank >= due) {
        if (state.money >= due) spend(due, 'Loan payment');
        else { state.bank -= (due - state.money); spend(state.money, 'Loan payment'); }
        state.loan = Math.max(0, state.loan - due);
        state.credit = Math.min(850, state.credit + 4);
      } else {
        state.credit = Math.max(300, state.credit - 25);
        emit('notify', { text: 'Missed loan payment.', kind: 'warn' });
      }
    }
  }
  emit('money', snapshot());
  saveGame();
}

function updateSky() {
  const h = hour();
  const elev = Math.sin(((h - 6) / 12) * Math.PI) * 58;
  const elevation = (h >= 5.5 && h <= 19.5) ? elev : -28 - Math.abs(h - 12) * 0.4;
  const azimuth = 180 - (h / 24) * 360;
  const phi = THREE.MathUtils.degToRad(90 - elevation);
  const theta = THREE.MathUtils.degToRad(azimuth);
  sunPos.setFromSphericalCoords(1, phi, theta);
  sky.material.uniforms['sunPosition'].value.copy(sunPos);
  night01 = THREE.MathUtils.clamp(1 - Math.max(0, elevation / 50), 0, 1);
  if (state.weather === 'fog') night01 = Math.min(1, night01 + 0.2);
  const fogCol = night01 > 0.7 ? 0x0b1220 : state.weather === 'storm' ? 0x4a5564 : state.weather === 'rain' ? 0x6a7a88 : 0x87a8c8;
  scene.fog.color.setHex(fogCol);
  scene.background.setHex(fogCol);
  scene.fog.density = state.mode === 'interior'
    ? 0.0004
    : state.weather === 'fog' ? 0.0045 : state.weather === 'storm' ? 0.0024 : 0.0015 + night01 * 0.001;
  sky.material.uniforms['turbidity'].value = state.weather === 'storm' ? 12 : state.weather === 'rain' ? 8 : 5;
  sunLight.intensity = Math.max(0.05, (1 - night01) * (state.weather === 'storm' ? 0.6 : 2.1));
  sunLight.color.set(night01 > 0.6 ? 0xaabbff : 0xfff1d0);
  hemi.intensity = 0.25 + (1 - night01) * 0.5;
  const px = player ? player.x : 0, pz = player ? player.z : 0;
  sunLight.position.set(px + sunPos.x * 60, Math.max(12, sunPos.y * 70), pz + sunPos.z * 60);
  sunLight.target.position.set(px, 0, pz);
  for (const m of world.windowMats) m.emissiveIntensity = night01 * 1.4;
  if (world.bulbs) {
    world.bulbs.material.emissiveIntensity = 0.2 + night01 * 1.8;
  }
  audio.setAmbient(1 - night01, player ? (Math.hypot(player.x, player.z - 40) < 120 ? 1 : 0) : 0);
  audio.setRain(state.weather === 'storm' ? 1 : state.weather === 'rain' ? 0.65 : 0);
}

function updateWeather(dt) {
  state.weatherTimer += dt;
  if (state.weatherTimer > 90) {
    state.weatherTimer = 0;
    const roll = Math.random();
    const next = roll < 0.55 ? 'sunny' : roll < 0.75 ? 'rain' : roll < 0.85 ? 'fog' : roll < 0.93 ? 'wind' : 'storm';
    if (next !== state.weather) {
      state.weather = next;
      emit('notify', { text: weatherLine(next), kind: 'weather' });
      emit('time', { time: state.time, day: state.day, weather: state.weather });
      if (next === 'storm') { flash = 0.2; audio.thunder(); }
    }
  }
  if (state.weather === 'storm' && Math.random() < dt * 0.08) {
    flash = 0.12;
    audio.thunder();
  }
}

function weatherLine(w) {
  return {
    sunny: 'Skies clearing over New Aurora.',
    rain: 'Rain moving in. Roads will be slick.',
    storm: 'Storm warning. Harbor traffic slowing.',
    fog: 'Fog rolling off the water. Drive easy.',
    wind: 'Wind picking up between the towers.',
  }[w] || w;
}

function updateRain(dt) {
  const show = state.weather === 'rain' || state.weather === 'storm';
  rain.visible = show && state.mode === 'play';
  if (!show || !player) return;
  rain.position.set(player.x, 0, player.z);
  const pos = rainGeo.attributes.position.array;
  const fast = state.weather === 'storm' ? 28 : 18;
  for (let i = 0; i < pos.length; i += 3) {
    pos[i + 1] -= dt * fast;
    if (pos[i + 1] < 0) pos[i + 1] = 26;
  }
  rainGeo.attributes.position.needsUpdate = true;
}

function inputMove() {
  const k = state.keys;
  let x = (k.KeyD || k.ArrowRight ? 1 : 0) - (k.KeyA || k.ArrowLeft ? 1 : 0);
  let z = (k.KeyS || k.ArrowDown ? 1 : 0) - (k.KeyW || k.ArrowUp ? 1 : 0);
  if (k._tx) x += k._tx;
  if (k._ty) z += k._ty;
  return { x, z, sprint: !!(k.ShiftLeft || k.ShiftRight), jump: !!k.Space };
}

function updatePlayer(dt) {
  if (!player || state.dialogue) {
    if (playerMesh) animateHuman(playerMesh, 0, dt, false);
    return;
  }
  if (player.vehicle) return;
  const inp = inputMove();
  const wet = state.weather === 'rain' || state.weather === 'storm' ? 0.86 : 1;
  let spd = (inp.sprint ? 9.5 : 5.4) * wet;
  if (state.needs.energy < 15) spd *= 0.7;
  if (state.needs.hunger < 10) spd *= 0.75;
  const water = inWater(player.x, player.z, world.waterBoxes);
  if (water && player.y <= 0.4 && !player.vehicle) {
    spd *= 0.45;
    player.y = 0.2;
  }
  _f.set(Math.sin(camYaw), 0, Math.cos(camYaw));
  _r.set(_f.z, 0, -_f.x);
  const mx = _r.x * inp.x + _f.x * inp.z;
  const mz = _r.z * inp.x + _f.z * inp.z;
  const mag = Math.hypot(mx, mz);
  let nx = player.x, nz = player.z;
  if (mag > 0.01) {
    nx += (mx / mag) * spd * dt;
    nz += (mz / mag) * spd * dt;
    player.yaw = Math.atan2(mx, mz);
    playerMesh.rotation.y = player.yaw;
    audio.foot(inp.sprint);
    if (!state.flags.outside && Math.hypot(nx + 186, nz - 36) > 16) {
      state.flags.outside = true;
    }
  }
  if (!collides(nx, player.z, world.colliders)) player.x = nx;
  if (!collides(player.x, nz, world.colliders)) player.z = nz;
  const bound = WORLD_SIZE / 2 - 4;
  player.x = Math.max(-bound, Math.min(bound, player.x));
  player.z = Math.max(-bound, Math.min(bound, player.z));

  if (inp.jump && player.y <= 0.05 && !water) player.vy = 6.2;
  player.vy -= 18 * dt;
  player.y += player.vy * dt;
  if (player.y < 0 && !water) { player.y = 0; player.vy = 0; }
  if (water && player.y < 0.15) { player.y = 0.15; player.vy = 0; }

  playerMesh.position.set(player.x, player.y, player.z);
  animateHuman(playerMesh, mag > 0.01 ? (inp.sprint ? 1.6 : 1) : 0, dt, false);
  playerMesh.visible = true;
}

function updateInteriorPlayer(dt) {
  const inp = inputMove();
  const spd = 4.2;
  _f.set(Math.sin(camYaw), 0, Math.cos(camYaw));
  _r.set(_f.z, 0, -_f.x);
  const mx = _r.x * inp.x + _f.x * inp.z;
  const mz = _r.z * inp.x + _f.z * inp.z;
  const mag = Math.hypot(mx, mz);
  if (mag > 0.01) {
    player.x += (mx / mag) * spd * dt;
    player.z += (mz / mag) * spd * dt;
    player.x = Math.max(-7.2, Math.min(7.2, player.x));
    player.z = Math.max(-5.2, Math.min(5.2, player.z));
    player.yaw = Math.atan2(mx, mz);
    playerMesh.rotation.y = player.yaw;
  }
  player.y = 0;
  playerMesh.position.set(player.x, 0, player.z);
  animateHuman(playerMesh, mag > 0.01 ? 0.9 : 0, dt, false);
}

function updateCamera() {
  const target = player.vehicle ? player.vehicle.mesh.position : playerMesh.position;
  const dist = player.vehicle ? (player.vehicle.def.fly ? 14 : 9) : camDist;
  const ox = Math.sin(camYaw) * dist * Math.cos(camPitch);
  const oy = Math.sin(camPitch) * dist + 1.4;
  const oz = Math.cos(camYaw) * dist * Math.cos(camPitch);
  camera.position.lerp(_p.set(target.x + ox, target.y + oy, target.z + oz), 0.12);
  camera.lookAt(target.x, target.y + 1.3, target.z);
}

function updateNPCs(dt) {
  const h = hour();
  const raining = state.weather === 'rain' || state.weather === 'storm';
  for (const n of npcs) {
    if (n.talking) {
      animateHuman(n.mesh, 0, dt, true);
      const dx = player.x - n.mesh.position.x;
      const dz = player.z - n.mesh.position.z;
      n.mesh.rotation.y = Math.atan2(dx, dz);
      continue;
    }
    if (h >= 22 || h < 6) n.target.copy(n.home);
    else if (h >= 8 && h < 17) n.target.copy(raining ? n.work : n.work);
    else if (h >= 17 && h < 20) n.target.copy(raining ? n.home : n.shop);
    else n.target.copy(n.plaza);

    const dx = n.target.x - n.mesh.position.x;
    const dz = n.target.z - n.mesh.position.z;
    const dist = Math.hypot(dx, dz);
    let spd = n.speed * (raining ? 1.25 : 1);
    if (dist < 1.4) {
      animateHuman(n.mesh, 0, dt, false);
      continue;
    }
    const vx = (dx / dist) * spd * dt;
    const vz = (dz / dist) * spd * dt;
    let nx = n.mesh.position.x + vx;
    let nz = n.mesh.position.z + vz;
    if (collides(nx, n.mesh.position.z, world.colliders, 0.4)) nx = n.mesh.position.x;
    if (collides(n.mesh.position.x, nz, world.colliders, 0.4)) nz = n.mesh.position.z;
    n.mesh.position.x = nx;
    n.mesh.position.z = nz;
    n.mesh.rotation.y = Math.atan2(dx, dz);
    animateHuman(n.mesh, 1, dt, false);

    const pd = player ? Math.hypot(player.x - nx, player.z - nz) : 99;
    if (pd < 10) {
      if (!n.label) {
        n.label = makeLabelSprite(n.name, n.job);
        n.mesh.add(n.label);
      }
      n.label.visible = true;
    } else if (n.label) n.label.visible = false;
  }
}

function updateVehicles(dt) {
  if (player.vehicle) drive(player.vehicle, dt);
  else audio.setEngine(0);
  for (const v of vehicles) {
    if (v.def.fly && v.mesh.userData.rotor) {
      const spin = player.vehicle === v ? 18 : 0.4;
      v.mesh.userData.rotor.forEach((r) => { r.rotation.y += dt * spin; });
    }
  }
}

function drive(v, dt) {
  const inp = inputMove();
  const def = v.def;
  const wet = state.weather === 'rain' || state.weather === 'storm' ? 0.72 : 1;
  const max = def.speed * wet * (v.fuel <= 0 ? 0 : 1);
  const accel = inp.z < -0.1 ? 18 : inp.z > 0.1 ? -12 : 0;
  v.speed += accel * dt;
  v.speed *= 1 - dt * (inp.jump ? 3.5 : 1.6);
  v.speed = Math.max(-max * 0.4, Math.min(max, v.speed));
  const steer = inp.x * dt * (1.6 + Math.abs(v.speed) * 0.08) * Math.sign(v.speed || 1);
  v.mesh.rotation.y -= steer;
  const yaw = v.mesh.rotation.y;
  const nx = v.mesh.position.x + Math.sin(yaw) * v.speed * dt;
  const nz = v.mesh.position.z + Math.cos(yaw) * v.speed * dt;
  const water = inWater(nx, nz, world.waterBoxes);
  if (def.water) {
    if (!water) { v.speed *= 0.2; }
    v.mesh.position.x = nx;
    v.mesh.position.z = nz;
    v.mesh.position.y = 0.25 + Math.sin(performance.now() / 400) * 0.08;
  } else if (def.fly) {
    if (inp.sprint) v.mesh.position.y = Math.min(42, v.mesh.position.y + 8 * dt);
    else v.mesh.position.y = Math.max(0, v.mesh.position.y - 5 * dt);
    v.mesh.position.x = nx;
    v.mesh.position.z = nz;
  } else {
    if (water && v.mesh.position.y < 1) {
      v.hp -= 20 * dt;
      v.speed *= 0.3;
      emit('prompt', { text: 'You are in the water. Get back to shore.' });
    }
    if (!collides(nx, v.mesh.position.z, world.colliders, 1.1)) v.mesh.position.x = nx;
    else { v.speed *= -0.2; v.hp -= 4; v.wear += 2; }
    if (!collides(v.mesh.position.x, nz, world.colliders, 1.1)) v.mesh.position.z = nz;
    else { v.speed *= -0.2; v.hp -= 4; v.wear += 2; }
    v.mesh.position.y = 0;
  }
  if (v.mesh.userData.wheels) {
    v.mesh.userData.wheels.forEach((w) => { w.rotation.x += v.speed * dt; });
  }
  if (v.mesh.userData.headlights) {
    v.mesh.userData.headlights.forEach((h) => { h.material.emissiveIntensity = night01 * 2.2; });
  }
  v.fuel = Math.max(0, v.fuel - Math.abs(v.speed) * dt * 0.04);
  player.x = v.mesh.position.x;
  player.z = v.mesh.position.z;
  player.y = v.mesh.position.y;
  playerMesh.position.copy(v.mesh.position);
  playerMesh.visible = false;
  audio.setEngine(Math.abs(v.speed) / Math.max(1, def.speed));
  if (v.hp <= 0) {
    emit('notify', { text: 'Vehicle totaled. You crawl out.', kind: 'warn' });
    exitVehicle();
  }
}

function updateTraffic(dt) {
  const slow = state.weather === 'rain' || state.weather === 'storm' ? 0.7 : 1;
  for (const t of traffic) {
    const dest = t.path[t.idx];
    const dx = dest.x - t.mesh.position.x;
    const dz = dest.z - t.mesh.position.z;
    const dist = Math.hypot(dx, dz);
    if (dist < 2) t.idx = (t.idx + 1) % t.path.length;
    else {
      t.mesh.position.x += (dx / dist) * t.speed * slow * dt;
      t.mesh.position.z += (dz / dist) * t.speed * slow * dt;
      t.mesh.rotation.y = Math.atan2(dx, dz);
    }
    if (t.mesh.userData.wheels) t.mesh.userData.wheels.forEach((w) => { w.rotation.x += dt * 6; });
    if (t.mesh.userData.headlights) t.mesh.userData.headlights.forEach((h) => { h.material.emissiveIntensity = night01 * 2; });
  }
}

function updateNeeds(dt) {
  const gm = (dt * 1000) / MINUTE_MS;
  const energyMul = state.trait === 'early' ? 0.7 : 1;
  state.needs.hunger = clamp(state.needs.hunger - gm * 0.07);
  state.needs.energy = clamp(state.needs.energy - gm * 0.045 * energyMul);
  state.needs.fun = clamp(state.needs.fun - gm * 0.035);
  state.needs.social = clamp(state.needs.social - gm * 0.03);
  state.needs.hygiene = clamp(state.needs.hygiene - gm * 0.028);
  if (state.needs.hunger < 5) state.needs.energy = clamp(state.needs.energy - gm * 0.08);
}

function clamp(v) { return Math.max(0, Math.min(100, v)); }

function updateLooking() {
  if (!player || state.mode === 'menu') return;
  let best = null, bestD = 3.2;
  if (state.mode === 'interior' && interiorGroup) {
    for (const it of interiorGroup.userData.interact) {
      const d = Math.hypot(player.x - it.x, player.z - it.z);
      if (d < 1.8 && d < bestD) { bestD = d; best = { kind: 'interior', ...it }; }
    }
    const ex = interiorGroup.userData.exit;
    const d = Math.hypot(player.x - ex.x, player.z - ex.z);
    if (d < 1.8) best = { kind: 'interior', id: 'exit', label: 'Exit' };
    state.looking = best;
    const t = best ? `[E]  ${best.label}` : '';
    if (t !== lastPrompt) { lastPrompt = t; emit('prompt', { text: t }); }
    return;
  }
  for (const n of npcs) {
    const d = Math.hypot(player.x - n.mesh.position.x, player.z - n.mesh.position.z);
    if (d < bestD) { bestD = d; best = { kind: 'npc', npc: n, label: `Talk to ${n.name}` }; }
  }
  for (const d of world.doors) {
    const dist = Math.hypot(player.x - d.x, player.z - d.z);
    if (dist < bestD) { bestD = dist; best = { kind: 'door', door: d, label: `Enter ${d.landmark.name}` }; }
  }
  for (const v of vehicles) {
    if (player.vehicle) continue;
    const dist = Math.hypot(player.x - v.mesh.position.x, player.z - v.mesh.position.z);
    if (dist < 2.8 && dist < bestD) {
      const lab = v.owned ? `Drive ${v.def.name}` : `Inspect ${v.def.name} ($${v.def.price.toLocaleString()})`;
      bestD = dist; best = { kind: 'car', car: v, label: lab };
    }
  }
  for (const p of world.farmPlots) {
    const dist = Math.hypot(player.x - p.x, player.z - p.z);
    if (dist < 4 && dist < bestD) { bestD = dist; best = { kind: 'farm', plot: p, label: 'Harvest crops' }; }
  }
  if (state.delivery) {
    const dist = Math.hypot(player.x - state.delivery.x, player.z - state.delivery.z);
    if (dist < 4) best = { kind: 'drop', label: `Deliver package to ${state.delivery.name}` };
  }
  state.looking = best;
  const text = best ? `[E]  ${best.label}` : (player.vehicle ? '[F] Exit vehicle   [H] Horn' : '');
  if (text !== lastPrompt) {
    lastPrompt = text;
    emit('prompt', { text });
  }
}

export function interact() {
  if (state.mode !== 'play' && state.mode !== 'interior') return;
  if (state.dialogue) return;
  const b = state.looking;
  if (!b) return;
  audio.click();
  if (b.kind === 'npc') openDialogue(b.npc);
  else if (b.kind === 'door') enterBuilding(b.door);
  else if (b.kind === 'car') {
    if (b.car.owned) enterVehicle(b.car);
    else emit('shop-open', { kind: 'vehicle', car: b.car });
  } else if (b.kind === 'farm') harvest();
  else if (b.kind === 'drop') completeDelivery();
  else if (b.kind === 'interior') interiorAction(b.id);
}

function interiorAction(id) {
  if (id === 'exit') { exitInterior(); return; }
  if (id === 'bed') sleepNow();
  else if (id === 'fridge') fridgeEat();
  else if (id === 'shower') showerNow();
  else if (id === 'tv') watchTV();
  else if (id === 'wardrobe') cycleClothes();
  else if (id === 'counter' || id === 'shelf' || id === 'shelf2' || id === 'checkout') emit('shop-open', { kind: 'shop' });
  else if (id === 'dine' || id === 'table' || id === 'table2') emit('shop-open', { kind: 'food' });
  else if (id === 'seat' || id === 'seat2') { addNeed('energy', 8); addNeed('fun', 6); skipMinutes(25); emit('notify', { text: 'You rest with a warm cup.', kind: 'info' }); }
  else if (id === 'desk' || id === 'desk2' || id === 'station' || id === 'board') startWork();
  else if (id === 'teller') emit('open-app', { app: 'bank' });
  else if (id === 'dance' || id === 'bar') dance();
  else if (id === 'crates') startDelivery();
}

function enterBuilding(door) {
  const lm = door.landmark;
  state.flags['visit_' + lm.id] = true;
  if (lm.type === 'bank') { emit('open-app', { app: 'bank' }); return; }
  if (!lm.interior) {
    if (lm.type === 'hospital') {
      if (spend(40, 'Clinic visit')) { addNeed('energy', 35); addNeed('hygiene', 10); emit('notify', { text: 'The nurse patches you up.', kind: 'info' }); }
      return;
    }
    if (lm.park || lm.plaza) { addNeed('fun', 8); addNeed('social', 4); emit('notify', { text: 'You take a breath. The city exhales with you.', kind: 'info' }); return; }
    if (lm.type === 'airport') { emit('notify', { text: 'Arrivals, departures, lives in motion.', kind: 'info' }); return; }
    if (lm.type === 'civic') { emit('open-app', { app: 'biz' }); return; }
    emit('notify', { text: `You linger at ${lm.name}.`, kind: 'info' });
    return;
  }
  audio.door();
  world.group.visible = false;
  npcs.forEach((n) => { n.mesh.visible = false; });
  traffic.forEach((t) => { t.mesh.visible = false; });
  vehicles.forEach((v) => { v.mesh.visible = false; });
  if (interiorGroup) scene.remove(interiorGroup);
  interiorGroup = createInterior(lm.interior);
  scene.add(interiorGroup);
  state.interior = { landmark: lm, x: player.x, z: player.z };
  player.x = 0; player.z = 0; player.y = 0;
  playerMesh.position.set(0, 0, 0);
  playerMesh.visible = true;
  state.mode = 'interior';
  camDist = 6;
  scene.fog.density = 0.0001;
  emit('notify', { text: lm.name, kind: 'info' });
}

function exitInterior() {
  audio.door();
  if (interiorGroup) scene.remove(interiorGroup);
  interiorGroup = null;
  world.group.visible = true;
  npcs.forEach((n) => { n.mesh.visible = true; });
  traffic.forEach((t) => { t.mesh.visible = true; });
  vehicles.forEach((v) => { v.mesh.visible = true; });
  player.x = state.interior.x;
  player.z = state.interior.z + 2;
  player.y = 0;
  playerMesh.position.set(player.x, 0, player.z);
  state.interior = null;
  state.mode = 'play';
  camDist = 7.2;
}

function tryVehicle() {
  if (state.mode !== 'play') return;
  if (player.vehicle) { exitVehicle(); return; }
  if (state.looking?.kind === 'car' && state.looking.car.owned) enterVehicle(state.looking.car);
}

function enterVehicle(v) {
  if (v.fuel <= 0) { emit('notify', { text: 'Empty tank. Buy a fuel can.', kind: 'warn' }); return; }
  player.vehicle = v;
  playerMesh.visible = false;
  v.parked = false;
  audio.setEngine(0.2);
  emit('notify', { text: `Driving the ${v.def.name}.`, kind: 'info' });
  state.flags.drove = true;
}

function exitVehicle() {
  if (!player.vehicle) return;
  const v = player.vehicle;
  player.x = v.mesh.position.x + 2;
  player.z = v.mesh.position.z;
  player.y = 0;
  player.vehicle = null;
  playerMesh.visible = true;
  playerMesh.position.set(player.x, 0, player.z);
  audio.setEngine(0);
}

function openDialogue(npc) {
  talkTarget = npc;
  npc.talking = true;
  state.talks += 1;
  const rel = getRel(npc.id);
  if (!state.relationships[npc.id]) state.relationships[npc.id] = { rel: 8, met: true, name: npc.name, job: npc.job };
  const lines = DIALOGUE.greeting[npc.personality] || DIALOGUE.greeting.warm;
  const extra = DIALOGUE.weather[state.weather] || [];
  const line = Math.random() < 0.35 && extra.length ? rand(extra) : rand(lines);
  state.dialogue = {
    npc,
    text: line,
    options: [
      { id: 'chat', label: 'Chat' },
      { id: 'ask', label: 'Ask about the city' },
      { id: 'gift', label: 'Give a gift' },
      { id: 'bye', label: 'Goodbye' },
    ],
  };
  addNeed('social', 6);
  audio.talk();
  emit('dialogue', state.dialogue);
}

export function chooseDialogue(id) {
  const npc = talkTarget;
  if (!npc) return;
  if (id === 'bye') { closeDialogue(); return; }
  if (id === 'chat') {
    const lines = DIALOGUE.chat[npc.personality] || DIALOGUE.chat.warm;
    bumpRel(npc.id, state.trait === 'charm' ? 8 : 5);
    addNeed('social', 8);
    addNeed('fun', 3);
    state.dialogue.text = rand(lines);
    emit('dialogue', state.dialogue);
    return;
  }
  if (id === 'ask') {
    const tips = [
      'Apex Motors is east of the plaza if you want wheels.',
      'Harbor Logistics always needs extra hands for deliveries.',
      'Greenfield Farm buys labor at dawn. Brutal hours, honest pay.',
      'First National will float you a loan if your credit is not a dumpster fire.',
      'Afterlight opens after 21:00. Good for the soul. Bad for the alarm clock.',
      'The penthouse at the Grand Hotel is a statement. Mostly “I made it.”',
    ];
    state.dialogue.text = rand(tips);
    bumpRel(npc.id, 3);
    emit('dialogue', state.dialogue);
    return;
  }
  if (id === 'gift') {
    const gift = state.inventory.find((i) => i.id === 'flowers' || i.id === 'watch');
    if (!gift) {
      state.dialogue.text = 'You pat your pockets. Nothing gift-worthy.';
      emit('dialogue', state.dialogue);
      return;
    }
    gift.n -= 1;
    if (gift.n <= 0) state.inventory = state.inventory.filter((i) => i.n > 0);
    const item = SHOP_ITEMS.find((s) => s.id === gift.id);
    bumpRel(npc.id, item?.rel || 10);
    addNeed('social', 12);
    state.dialogue.text = npc.personality === 'sarcastic' ? 'Okay. That is… actually sweet. Do not make it a thing.' : 'You should not have. Thank you.';
    emit('dialogue', state.dialogue);
  }
}

export function closeDialogue() {
  if (talkTarget) talkTarget.talking = false;
  talkTarget = null;
  state.dialogue = null;
  emit('dialogue', null);
}

function getRel(id) { return state.relationships[id]?.rel || 0; }
function bumpRel(id, n) {
  if (!state.relationships[id]) state.relationships[id] = { rel: 0, met: true };
  state.relationships[id].rel = Math.min(100, (state.relationships[id].rel || 0) + n);
  if (state.relationships[id].rel >= 50) state.flags.friend = true;
}

function addNeed(k, n) { state.needs[k] = clamp(state.needs[k] + n); emit('needs', { ...state.needs }); }

function skipMinutes(m) {
  state.time += m;
  while (state.time >= 24 * 60) { state.time -= 24 * 60; state.day += 1; onNewDay(); }
  emit('time', { time: state.time, day: state.day, weather: state.weather });
}

export function sleepNow() {
  if (state.needs.energy > 85) { emit('notify', { text: 'You are not tired yet.', kind: 'info' }); return; }
  const h = hour();
  const add = h < 7 ? (7 * 60 - state.time) : (24 * 60 - state.time + 7 * 60);
  skipMinutes(add);
  addNeed('energy', 80);
  addNeed('hunger', -18);
  addNeed('hygiene', -8);
  emit('notify', { text: 'You sleep. Morning finds you anyway.', kind: 'info' });
  state.flags.slept = true;
}

export function showerNow() {
  addNeed('hygiene', 55);
  addNeed('fun', 4);
  skipMinutes(15);
  emit('notify', { text: 'Hot water. New person.', kind: 'info' });
}

export function fridgeEat() {
  const g = state.inventory.find((i) => i.id === 'groceries' || i.id === 'sandwich');
  const mul = state.trait === 'chef' ? 1.35 : 1;
  if (g) {
    g.n -= 1;
    if (g.n <= 0) state.inventory = state.inventory.filter((i) => i.n > 0);
    addNeed('hunger', 48 * mul);
    state.flags.ate = true;
    emit('notify', { text: 'Leftovers. Gourmet enough.', kind: 'info' });
  } else {
    addNeed('hunger', 12 * mul);
    emit('notify', { text: 'The fridge contains a sad condiment and hope.', kind: 'info' });
  }
}

export function watchTV() {
  addNeed('fun', 22);
  addNeed('energy', -6);
  skipMinutes(40);
  emit('notify', { text: 'A show about people with nicer apartments.', kind: 'info' });
}

function cycleClothes() {
  const colors = ['#f0f0f0', '#1e3a5f', '#c45c26', '#2d6a4f', '#7b2d8e', '#111111', '#c9a227'];
  const cur = state.appearance.shirt;
  const i = (colors.indexOf(cur) + 1) % colors.length;
  state.appearance.shirt = colors[i];
  if (playerMesh) {
    scene.remove(playerMesh);
    playerMesh = createHuman(state.appearance);
    playerMesh.position.set(player.x, player.y, player.z);
    scene.add(playerMesh);
  }
  addNeed('fun', 6);
  emit('notify', { text: 'New shirt. Same bills.', kind: 'info' });
}

export function dance() {
  addNeed('fun', 28);
  addNeed('energy', -12);
  addNeed('social', 10);
  skipMinutes(50);
  if (spend(12, 'Night out')) emit('notify', { text: 'Bass in your ribs. The city blurs.', kind: 'info' });
}

function harvest() {
  const owned = state.businesses.some((b) => b.id === 'farm_biz') || state.job === 'farmer';
  const pay = owned ? 90 + Math.floor(Math.random() * 80) : 28 + Math.floor(Math.random() * 20);
  state.money += pay;
  addNeed('energy', -14);
  addNeed('hunger', -8);
  skipMinutes(50);
  emit('notify', { text: `Harvested crates. +$${pay}.`, kind: 'cash' });
  emit('money', snapshot());
  audio.cash();
  state.flags.farmed = true;
}

export function applyJob(jobId) {
  const job = JOBS.find((j) => j.id === jobId);
  if (!job) return false;
  if (state.level < job.reqLevel) {
    emit('notify', { text: `Need Life Level ${job.reqLevel}.`, kind: 'warn' });
    audio.error();
    return false;
  }
  state.job = jobId;
  emit('notify', { text: `Hired: ${job.name} at ${job.employer}.`, kind: 'info' });
  saveGame();
  return true;
}

export function quitJob() {
  state.job = null;
  emit('notify', { text: 'You quit. The inbox will survive.', kind: 'info' });
}

export function startWork() {
  if (!state.job) { emit('notify', { text: 'You do not work here. Apply on your phone.', kind: 'warn' }); return; }
  const job = JOBS.find((j) => j.id === state.job);
  const workLm = LANDMARKS.find((l) => l.id === job.location);
  const here = state.interior?.landmark?.id === job.location
    || (workLm && player && Math.hypot(player.x - workLm.x, player.z - workLm.z) < 22);
  if (!here) {
    emit('notify', { text: `Go to ${workLm?.name || 'work'} to clock in.`, kind: 'warn' });
    return;
  }
  const h = hour();
  const overnight = job.hours[0] > job.hours[1];
  const open = overnight ? (h >= job.hours[0] || h < job.hours[1]) : (h >= job.hours[0] && h < job.hours[1]);
  if (!open) {
    emit('notify', { text: `${job.employer} is closed. Hours ${fmtHour(job.hours[0])}–${fmtHour(job.hours[1])}.`, kind: 'warn' });
    return;
  }
  if (state.needs.energy < 12) { emit('notify', { text: 'You can barely stand. Sleep first.', kind: 'warn' }); return; }
  const hours = 4;
  skipMinutes(hours * 60);
  const bonus = state.trait === 'hustler' ? 1.18 : 1;
  const levelB = 1 + (state.level - 1) * 0.06;
  let pay = Math.round(job.wage * hours * bonus * levelB);
  if (job.tips) pay += Math.round(15 + Math.random() * 40);
  state.money += pay;
  addNeed('energy', -job.energy);
  addNeed('hunger', -16);
  addNeed('fun', -8);
  addNeed('hygiene', -10);
  addXP(18);
  state.flags.worked = true;
  emit('notify', { text: `Shift done. +$${pay}.`, kind: 'cash' });
  emit('money', snapshot());
  audio.cash();
  saveGame();
}

function fmtHour(h) {
  const ap = h >= 12 ? 'PM' : 'AM';
  const hr = ((h + 11) % 12) + 1;
  return hr + ap;
}

export function startDelivery() {
  if (state.delivery) { emit('notify', { text: 'Finish the current drop first.', kind: 'warn' }); return; }
  const dest = rand(LANDMARKS.filter((l) => l.type !== 'farm' && !l.park));
  state.delivery = { x: dest.x, z: dest.z, name: dest.name, pay: 40 + Math.floor(Math.random() * 55) };
  emit('notify', { text: `Package for ${dest.name}. Gold marker.`, kind: 'story' });
  emit('mission-side', { text: `Deliver to ${dest.name}` });
}

function completeDelivery() {
  if (!state.delivery) return;
  state.money += state.delivery.pay;
  state.deliveries += 1;
  addXP(10);
  addNeed('energy', -8);
  emit('notify', { text: `Delivered. +$${state.delivery.pay}.`, kind: 'cash' });
  state.delivery = null;
  emit('money', snapshot());
  audio.cash();
}

export function deposit(n) {
  n = Math.floor(n);
  if (n <= 0 || n > state.money) { audio.error(); return false; }
  state.money -= n; state.bank += n;
  emit('money', snapshot()); saveGame(); audio.cash(); return true;
}
export function withdraw(n) {
  n = Math.floor(n);
  if (n <= 0 || n > state.bank) { audio.error(); return false; }
  state.bank -= n; state.money += n;
  emit('money', snapshot()); saveGame(); audio.cash(); return true;
}
export function takeLoan(n) {
  n = Math.floor(n);
  const max = state.credit * 80;
  if (n <= 0 || n > max) { emit('notify', { text: `Max loan $${max.toLocaleString()}.`, kind: 'warn' }); return false; }
  state.loan += n; state.money += n;
  emit('notify', { text: `Loan approved: $${n.toLocaleString()}.`, kind: 'cash' });
  emit('money', snapshot()); saveGame(); return true;
}
export function repayLoan(n) {
  n = Math.min(Math.floor(n), state.loan, state.money);
  if (n <= 0) return false;
  state.money -= n; state.loan -= n;
  state.credit = Math.min(850, state.credit + Math.floor(n / 500));
  emit('money', snapshot()); saveGame(); return true;
}

export function buyProperty(id) {
  const p = PROPERTIES.find((x) => x.id === id);
  if (!p) return false;
  if (state.properties.includes(id)) { state.home = id; emit('notify', { text: `${p.name} is now your home.`, kind: 'info' }); return true; }
  if (p.type === 'rent') {
    if (!spend(p.rent, 'First week rent')) return false;
    state.properties.push(id); state.home = id; state.flags.home = true;
    emit('notify', { text: `Rented ${p.name}.`, kind: 'info' });
    saveGame(); return true;
  }
  if (!spend(p.price, p.name)) return false;
  state.properties.push(id); state.home = id; state.flags.home = true;
  emit('notify', { text: `You own ${p.name}.`, kind: 'cash' });
  addXP(30); saveGame(); return true;
}

export function buyBusiness(id) {
  const b = BUSINESSES.find((x) => x.id === id);
  if (!b) return false;
  if (state.businesses.some((x) => x.id === id)) { emit('notify', { text: 'Already yours.', kind: 'info' }); return false; }
  if (!spend(b.price, b.name)) return false;
  state.businesses.push({ id, level: 0 });
  state.flags.biz = true;
  emit('notify', { text: `You bought ${b.name}. Income lands at midnight.`, kind: 'cash' });
  addXP(40); saveGame(); return true;
}

export function collectBiz() {
  if (state.bizBank <= 0) { emit('notify', { text: 'No business income waiting.', kind: 'info' }); return; }
  state.money += state.bizBank;
  emit('notify', { text: `Transferred $${state.bizBank} from business account.`, kind: 'cash' });
  state.bizBank = 0;
  emit('money', snapshot()); saveGame(); audio.cash();
}

export function upgradeBusiness(id) {
  const owned = state.businesses.find((x) => x.id === id);
  const def = BUSINESSES.find((x) => x.id === id);
  if (!owned || !def) return false;
  if (!spend(def.upgrade, 'Upgrade')) return false;
  owned.level += 1;
  emit('notify', { text: `${def.name} upgraded to level ${owned.level}.`, kind: 'info' });
  saveGame(); return true;
}

export function buyVehicle(defId) {
  const def = VEHICLES.find((v) => v.id === defId);
  if (!def) return false;
  if (state.ownedVehicles.includes(defId)) { emit('notify', { text: 'Already in your garage.', kind: 'info' }); return false; }
  if (!spend(def.price, def.name)) return false;
  state.ownedVehicles.push(defId);
  const v = vehicles.find((c) => c.def.id === defId);
  if (v) v.owned = true;
  state.flags.car = true;
  emit('notify', { text: `${def.name} is yours. Press F to drive.`, kind: 'cash' });
  addXP(25); saveGame(); return true;
}

export function buyItem(id) {
  const item = SHOP_ITEMS.find((s) => s.id === id);
  if (!item) return false;
  if (!spend(item.price, item.name)) return false;
  if (item.type === 'food' && !item.home) {
    const mul = state.trait === 'chef' ? 1.35 : 1;
    addNeed('hunger', (item.hunger || 0) * mul);
    addNeed('energy', item.energy || 0);
    addNeed('fun', item.fun || 0);
    addNeed('social', item.social || 0);
    state.flags.ate = true;
    emit('notify', { text: `You have ${item.name}.`, kind: 'info' });
  } else if (item.type === 'fuel') {
    const v = player.vehicle || vehicles.find((c) => c.owned);
    if (v) { v.fuel = Math.min(v.def.fuel, v.fuel + 30); emit('notify', { text: 'Tank topped up.', kind: 'info' }); }
  } else if (item.type === 'repair') {
    const v = player.vehicle || vehicles.find((c) => c.owned);
    if (v) { v.hp = Math.min(100, v.hp + 40); v.wear = Math.max(0, v.wear - 15); emit('notify', { text: 'Vehicle patched.', kind: 'info' }); }
  } else if (item.type === 'hygiene') {
    addNeed('hygiene', item.hygiene || 20);
  } else if (item.type === 'clothes') {
    addNeed('fun', item.fun || 8);
    cycleClothes();
  } else {
    const existing = state.inventory.find((i) => i.id === id);
    if (existing) existing.n += 1;
    else state.inventory.push({ id, n: 1 });
    emit('notify', { text: `Bought ${item.name}.`, kind: 'info' });
  }
  emit('money', snapshot());
  saveGame();
  return true;
}

export function useItem(id) {
  const it = state.inventory.find((i) => i.id === id);
  if (!it) return;
  const item = SHOP_ITEMS.find((s) => s.id === id);
  if (!item) return;
  it.n -= 1;
  if (it.n <= 0) state.inventory = state.inventory.filter((i) => i.n > 0);
  if (item.type === 'food') {
    const mul = state.trait === 'chef' ? 1.35 : 1;
    addNeed('hunger', (item.hunger || 20) * mul);
    addNeed('energy', item.energy || 0);
    state.flags.ate = true;
  } else if (item.type === 'fuel') {
    const v = player.vehicle || vehicles.find((c) => c.owned);
    if (v) v.fuel = Math.min(v.def.fuel, v.fuel + 30);
  }
  emit('notify', { text: `Used ${item.name}.`, kind: 'info' });
}

function spend(n, why) {
  if (state.money < n) {
    emit('notify', { text: `Need $${n.toLocaleString()} for ${why}.`, kind: 'warn' });
    audio.error();
    return false;
  }
  state.money -= n;
  emit('money', snapshot());
  audio.cash();
  return true;
}

function addXP(n) {
  state.xp += n;
  const need = state.level * 100;
  if (state.xp >= need) {
    state.xp -= need;
    state.level += 1;
    emit('notify', { text: `Life Level ${state.level}. New jobs unlocking.`, kind: 'story' });
  }
}

export function snapshot() {
  const assets = state.properties.reduce((a, id) => a + (PROPERTIES.find((p) => p.id === id)?.price || 0), 0)
    + state.ownedVehicles.reduce((a, id) => a + (VEHICLES.find((v) => v.id === id)?.price || 0), 0)
    + state.businesses.reduce((a, b) => a + (BUSINESSES.find((x) => x.id === b.id)?.price || 0), 0);
  const net = state.money + state.bank + state.bizBank + assets - state.loan;
  if (net >= 50000) state.flags.rich = true;
  return {
    money: state.money, bank: state.bank, bizBank: state.bizBank, credit: state.credit, loan: state.loan, net, level: state.level, xp: state.xp,
  };
}

function updateMissions() {
  const i = state.story;
  if (i >= STORY.length) return;
  const checks = [
    () => state.flags.outside,
    () => state.flags.worked,
    () => state.flags.ate,
    () => state.talks >= 3,
    () => state.flags.car,
    () => state.flags.home && state.home !== 'studio',
    () => state.deliveries >= 3,
    () => state.flags.biz,
    () => state.flags.friend,
    () => snapshot().net >= 50000,
  ];
  if (checks[i] && checks[i]()) completeStory(i);
}

function completeStory(i) {
  if (state.storyDone.includes(i)) return;
  state.storyDone.push(i);
  const m = STORY[i];
  state.money += m.reward.cash;
  addXP(m.reward.xp);
  emit('notify', { text: `Mission complete — ${m.title}. +$${m.reward.cash}`, kind: 'story' });
  audio.start();
  state.story = i + 1;
  emit('money', snapshot());
  emit('mission', { mission: STORY[state.story] || null, complete: m });
  saveGame();
}

function updateMarker() {
  if (!marker) return;
  if (state.delivery) {
    marker.visible = true;
    marker.position.set(state.delivery.x, 3.2 + Math.sin(performance.now() / 300) * 0.3, state.delivery.z);
    marker.rotation.y += 0.03;
    return;
  }
  const m = STORY[state.story];
  const map = {
    0: LANDMARKS.find((l) => l.id === 'home_studio'),
    1: jobLandmark(),
    2: LANDMARKS.find((l) => l.id === 'cafe_corner'),
    3: LANDMARKS.find((l) => l.id === 'plaza'),
    4: LANDMARKS.find((l) => l.id === 'dealership'),
    5: LANDMARKS.find((l) => l.id === 'oakwood_house'),
    6: LANDMARKS.find((l) => l.id === 'warehouse'),
    7: LANDMARKS.find((l) => l.id === 'fish_market'),
    8: LANDMARKS.find((l) => l.id === 'plaza'),
    9: LANDMARKS.find((l) => l.id === 'bank'),
  };
  const lm = map[state.story];
  if (!lm || !m) { marker.visible = false; return; }
  marker.visible = state.mode === 'play';
  marker.position.set(lm.x, (lm.h || 8) + 3 + Math.sin(performance.now() / 350) * 0.35, lm.z);
  marker.rotation.y += 0.02;
}

function jobLandmark() {
  if (!state.job) return LANDMARKS.find((l) => l.id === 'cafe_corner');
  const j = JOBS.find((x) => x.id === state.job);
  return LANDMARKS.find((l) => l.id === j?.location) || LANDMARKS[0];
}

export function drawMinimap(ctx, w, h) {
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = '#0b1220';
  ctx.fillRect(0, 0, w, h);
  const s = w / WORLD_SIZE;
  const toX = (x) => (x + WORLD_SIZE / 2) * s;
  const toY = (z) => (z + WORLD_SIZE / 2) * s;
  ctx.fillStyle = '#2f6a38';
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#5a6168';
  ctx.fillRect(toX(-120), toY(-70), 250 * s, 210 * s);
  ctx.fillStyle = '#1a4a62';
  ctx.fillRect(toX(-310), toY(130), 200 * s, 160 * s);
  ctx.fillStyle = '#3a3d44';
  ctx.fillRect(toX(-6), toY(-260), 12 * s, 560 * s);
  ctx.fillRect(toX(-290), toY(34), 580 * s, 12 * s);
  for (const d of DISTRICTS) {
    /* labels skipped at this scale */
  }
  ctx.fillStyle = '#c9b48a';
  for (const lm of LANDMARKS) {
    ctx.fillRect(toX(lm.x) - 1.5, toY(lm.z) - 1.5, 3, 3);
  }
  ctx.fillStyle = '#7ad0ff';
  for (const n of npcs) ctx.fillRect(toX(n.mesh.position.x), toY(n.mesh.position.z), 1.5, 1.5);
  if (player) {
    ctx.fillStyle = '#f0c75e';
    ctx.beginPath();
    ctx.arc(toX(player.x), toY(player.z), 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#f0c75e';
    ctx.beginPath();
    ctx.moveTo(toX(player.x), toY(player.z));
    ctx.lineTo(toX(player.x + Math.sin(player.yaw) * 14), toY(player.z + Math.cos(player.yaw) * 14));
    ctx.stroke();
  }
  if (state.delivery) {
    ctx.fillStyle = '#ff6b4a';
    ctx.fillRect(toX(state.delivery.x) - 2, toY(state.delivery.z) - 2, 4, 4);
  }
}

export function adminSet(kind, value) {
  if (kind === 'time') state.time = value * 60;
  if (kind === 'weather') state.weather = value;
  if (kind === 'money') { state.money += value; emit('money', snapshot()); }
  if (kind === 'needs') Object.keys(state.needs).forEach((k) => { state.needs[k] = 100; });
  emit('time', { time: state.time, day: state.day, weather: state.weather });
}

export function getPeople() {
  return npcs.map((n) => ({
    id: n.id, name: n.name, job: n.job, personality: n.personality,
    rel: getRel(n.id),
    district: 'New Aurora',
  }));
}

export function getWorldRef() {
  return { player, npcs, vehicles, landmarks: LANDMARKS, hour: hour() };
}

export { hour as gameHour, fmtHour };
