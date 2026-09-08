import * as THREE from 'three';
import { LANDMARKS } from './data.js';

const WORLD = 620;
export const WORLD_SIZE = WORLD;

function tex(w, h, draw) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = 8;
  t.colorSpace = THREE.SRGBColorSpace;
  t.needsUpdate = true;
  return t;
}

function windowTex(tint, litChance, night) {
  return tex(64, 128, (g, w, h) => {
    g.fillStyle = tint;
    g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(0,0,0,0.18)';
    g.fillRect(0, 0, w, 6);
    const cols = 4, rows = 10;
    const bw = w / cols, bh = h / rows;
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const on = Math.random() < litChance;
        if (night) {
          g.fillStyle = on ? (Math.random() < 0.3 ? '#ffe0a0' : '#d8c878') : '#0b1018';
        } else {
          g.fillStyle = on ? 'rgba(200,220,240,0.45)' : 'rgba(20,28,40,0.35)';
        }
        g.fillRect(x * bw + 3, y * bh + 4, bw - 6, bh - 7);
      }
    }
  });
}

function grassTex() {
  return tex(128, 128, (g, w, h) => {
    g.fillStyle = '#3d7a3a';
    g.fillRect(0, 0, w, h);
    for (let i = 0; i < 800; i++) {
      g.fillStyle = Math.random() < 0.5 ? '#4e8f44' : '#2f6a32';
      g.fillRect(Math.random() * w, Math.random() * h, 2, 2);
    }
  });
}

function asphaltTex() {
  return tex(128, 128, (g, w, h) => {
    g.fillStyle = '#2a2d33';
    g.fillRect(0, 0, w, h);
    for (let i = 0; i < 600; i++) {
      g.fillStyle = `rgba(255,255,255,${Math.random() * 0.05})`;
      g.fillRect(Math.random() * w, Math.random() * h, 2, 2);
    }
  });
}

function waterTex() {
  return tex(128, 128, (g, w, h) => {
    g.fillStyle = '#1a4a62';
    g.fillRect(0, 0, w, h);
    g.strokeStyle = 'rgba(160,210,230,0.25)';
    g.lineWidth = 2;
    for (let i = 0; i < 10; i++) {
      g.beginPath();
      g.moveTo(0, i * 14 + 4);
      for (let x = 0; x < w; x += 8) g.lineTo(x, i * 14 + 4 + Math.sin(x * 0.2 + i) * 3);
      g.stroke();
    }
  });
}

function dirtTex() {
  return tex(128, 128, (g, w, h) => {
    g.fillStyle = '#6b5340';
    g.fillRect(0, 0, w, h);
    for (let i = 0; i < 500; i++) {
      g.fillStyle = Math.random() < 0.5 ? '#7a5e48' : '#5a4434';
      g.fillRect(Math.random() * w, Math.random() * h, 3, 3);
    }
  });
}

function concreteTex() {
  return tex(128, 128, (g, w, h) => {
    g.fillStyle = '#8a8e94';
    g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(0,0,0,0.08)';
    for (let i = 0; i < 20; i++) g.fillRect(0, i * 6, w, 1);
  });
}

export function makeLabelSprite(text, sub = '') {
  const c = document.createElement('canvas');
  c.width = 512; c.height = 128;
  const g = c.getContext('2d');
  g.clearRect(0, 0, 512, 128);
  g.fillStyle = 'rgba(8,12,20,0.72)';
  roundRect(g, 16, 16, 480, 96, 16);
  g.fill();
  g.fillStyle = '#f3e6c4';
  g.font = 'bold 36px Outfit, sans-serif';
  g.textAlign = 'center';
  g.fillText(text, 256, sub ? 58 : 76);
  if (sub) {
    g.fillStyle = '#9aa6b8';
    g.font = '22px Outfit, sans-serif';
    g.fillText(sub, 256, 92);
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  const mat = new THREE.SpriteMaterial({ map: t, transparent: true, depthTest: false });
  const s = new THREE.Sprite(mat);
  s.scale.set(4.2, 1.05, 1);
  s.position.y = 2.6;
  return s;
}

function roundRect(g, x, y, w, h, r) {
  g.beginPath();
  g.moveTo(x + r, y);
  g.arcTo(x + w, y, x + w, y + h, r);
  g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r);
  g.arcTo(x, y, x + w, y, r);
  g.closePath();
}

export function createHuman(opts) {
  const g = new THREE.Group();
  const skin = new THREE.MeshStandardMaterial({ color: opts.skin, roughness: 0.62 });
  const shirt = new THREE.MeshStandardMaterial({ color: opts.shirt, roughness: 0.78 });
  const pants = new THREE.MeshStandardMaterial({ color: opts.pants, roughness: 0.86 });
  const hairM = new THREE.MeshStandardMaterial({ color: opts.hair, roughness: 0.9 });
  const shoe = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.5 });
  const white = new THREE.MeshStandardMaterial({ color: 0xf5f5f5, roughness: 0.3 });
  const iris = new THREE.MeshStandardMaterial({ color: opts.eyes || 0x2a4a6a, roughness: 0.2 });
  const mouthM = new THREE.MeshStandardMaterial({ color: 0x5a2030, roughness: 0.5 });

  const bodyS = opts.body || 1;
  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.38 * bodyS, 0.48, 0.22), shirt);
  torso.position.y = 1.12;
  torso.castShadow = true;
  g.add(torso);

  const pelvis = new THREE.Mesh(new THREE.BoxGeometry(0.36 * bodyS, 0.16, 0.2), pants);
  pelvis.position.y = 0.82;
  g.add(pelvis);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.145, 12, 10), skin);
  head.position.y = 1.52;
  head.castShadow = true;
  g.add(head);

  const nose = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.05, 0.04), skin);
  nose.position.set(0, 1.5, 0.14);
  g.add(nose);

  const eyeL = new THREE.Group();
  const ew = new THREE.Mesh(new THREE.SphereGeometry(0.032, 8, 6), white);
  const ir = new THREE.Mesh(new THREE.SphereGeometry(0.018, 8, 6), iris);
  ir.position.z = 0.02;
  eyeL.add(ew, ir);
  eyeL.position.set(-0.05, 1.54, 0.12);
  const eyeR = eyeL.clone();
  eyeR.position.x = 0.05;
  g.add(eyeL, eyeR);

  const mouth = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.02, 0.02), mouthM);
  mouth.position.set(0, 1.42, 0.13);
  g.add(mouth);

  addHair(g, opts.hairStyle || 0, hairM);

  function limb(w, h, d, mat) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    m.castShadow = true;
    const wrap = new THREE.Group();
    m.position.y = -h / 2;
    wrap.add(m);
    return wrap;
  }
  const armL = limb(0.1, 0.42, 0.1, shirt);
  armL.position.set(-0.26 * bodyS, 1.28, 0);
  const armR = limb(0.1, 0.42, 0.1, shirt);
  armR.position.set(0.26 * bodyS, 1.28, 0);
  const handL = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 6), skin);
  handL.position.set(-0.26 * bodyS, 0.82, 0);
  const handR = handL.clone();
  handR.position.x = 0.26 * bodyS;
  const legL = limb(0.12, 0.5, 0.14, pants);
  legL.position.set(-0.1, 0.76, 0);
  const legR = limb(0.12, 0.5, 0.14, pants);
  legR.position.set(0.1, 0.76, 0);
  const shoeL = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.08, 0.2), shoe);
  shoeL.position.set(-0.1, 0.04, 0.02);
  const shoeR = shoeL.clone();
  shoeR.position.x = 0.1;
  g.add(armL, armR, legL, legR, shoeL, shoeR, handL, handR);

  g.userData.parts = { armL, armR, legL, legR, head, mouth, eyeL, eyeR, torso, handL, handR };
  g.userData.phase = Math.random() * Math.PI * 2;
  g.userData.blink = Math.random() * 4;
  g.scale.setScalar(1.05 * (opts.height || 1));
  return g;
}

function addHair(g, style, mat) {
  if (style === 4) return;
  if (style === 0) {
    const h = new THREE.Mesh(new THREE.SphereGeometry(0.155, 10, 8), mat);
    h.scale.set(1, 0.7, 1);
    h.position.set(0, 1.62, 0);
    g.add(h);
  } else if (style === 1) {
    const h = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.08, 0.28), mat);
    h.position.set(0, 1.64, 0.01);
    g.add(h);
  } else if (style === 2) {
    const h = new THREE.Mesh(new THREE.SphereGeometry(0.17, 10, 8), mat);
    h.position.set(0, 1.6, -0.02);
    g.add(h);
    const tail = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.28, 0.08), mat);
    tail.position.set(0, 1.42, -0.16);
    g.add(tail);
  } else if (style === 3) {
    const bun = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 6), mat);
    bun.position.set(0, 1.7, -0.04);
    const cap = new THREE.Mesh(new THREE.SphereGeometry(0.15, 10, 8), mat);
    cap.scale.set(1, 0.55, 1);
    cap.position.set(0, 1.6, 0);
    g.add(bun, cap);
  }
}

export function animateHuman(mesh, speed, dt, talking) {
  const p = mesh.userData.parts;
  if (!p) return;
  const d = mesh.userData;
  d.phase += dt * Math.max(speed, 0.15) * 9;
  const swing = Math.sin(d.phase) * Math.min(speed, 1.4) * 0.7;
  p.armL.rotation.x = swing;
  p.armR.rotation.x = -swing;
  p.legL.rotation.x = -swing * 0.85;
  p.legR.rotation.x = swing * 0.85;
  if (speed > 0.2) mesh.position.y = Math.abs(Math.sin(d.phase)) * 0.05;
  else mesh.position.y = 0;
  d.blink -= dt;
  const closed = d.blink < 0 && d.blink > -0.12;
  p.eyeL.scale.y = closed ? 0.1 : 1;
  p.eyeR.scale.y = closed ? 0.1 : 1;
  if (d.blink < -0.12) d.blink = 2 + Math.random() * 3;
  p.mouth.scale.y = talking ? 1.8 + Math.sin(d.phase * 6) * 1.2 : 1;
}

export function createCarMesh(def, color) {
  const g = new THREE.Group();
  const col = color ?? def.color;
  const bodyM = new THREE.MeshStandardMaterial({ color: col, metalness: 0.45, roughness: 0.35 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.4 });
  const glass = new THREE.MeshStandardMaterial({ color: 0x89b8d4, metalness: 0.6, roughness: 0.15, transparent: true, opacity: 0.55 });
  const lightM = new THREE.MeshStandardMaterial({ color: 0xfff2c4, emissive: 0xffe8a0, emissiveIntensity: 0 });
  const tailM = new THREE.MeshStandardMaterial({ color: 0xff2a2a, emissive: 0xff2222, emissiveIntensity: 0.2 });

  if (def.type === 'motorcycle') {
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.45, 1.6), bodyM);
    body.position.y = 0.5;
    const wheelG = new THREE.CylinderGeometry(0.28, 0.28, 0.12, 12);
    const w1 = new THREE.Mesh(wheelG, dark); w1.rotation.z = Math.PI / 2; w1.position.set(0, 0.28, 0.55);
    const w2 = w1.clone(); w2.position.z = -0.55;
    g.add(body, w1, w2);
    g.userData.wheels = [w1, w2];
  } else if (def.type === 'boat') {
    const hull = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.5, 4.2), bodyM);
    hull.position.y = 0.3;
    const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.7, 1.4), glass);
    cabin.position.set(0, 0.85, -0.4);
    g.add(hull, cabin);
    g.userData.wheels = [];
  } else if (def.type === 'heli') {
    const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.1, 2.4), bodyM);
    cabin.position.y = 1.1;
    const skid = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.08, 2.6), dark);
    skid.position.y = 0.4;
    const rotor = new THREE.Mesh(new THREE.BoxGeometry(6.5, 0.05, 0.25), dark);
    rotor.position.y = 1.8;
    const rotor2 = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.05, 6.5), dark);
    rotor2.position.y = 1.8;
    g.add(cabin, skid, rotor, rotor2);
    g.userData.rotor = [rotor, rotor2];
    g.userData.wheels = [];
  } else {
    const isTruck = def.type === 'truck';
    const len = isTruck ? 4.6 : 3.6;
    const body = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.7, len), bodyM);
    body.position.y = 0.55;
    body.castShadow = true;
    const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.55, isTruck ? 1.3 : 1.6), glass);
    cabin.position.set(0, 1.1, isTruck ? 1.2 : 0.2);
    const wheelG = new THREE.CylinderGeometry(0.32, 0.32, 0.22, 10);
    const wheels = [];
    const zs = isTruck ? [1.4, 0.2, -1.5] : [1.15, -1.15];
    for (const z of zs) {
      for (const x of [-0.85, 0.85]) {
        const w = new THREE.Mesh(wheelG, dark);
        w.rotation.z = Math.PI / 2;
        w.position.set(x, 0.32, z);
        g.add(w);
        wheels.push(w);
      }
    }
    const hl1 = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.14, 0.08), lightM);
    hl1.position.set(-0.55, 0.55, len / 2 + 0.02);
    const hl2 = hl1.clone(); hl2.position.x = 0.55;
    const tl1 = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.12, 0.08), tailM);
    tl1.position.set(-0.55, 0.55, -len / 2 - 0.02);
    const tl2 = tl1.clone(); tl2.position.x = 0.55;
    g.add(body, cabin, hl1, hl2, tl1, tl2);
    g.userData.wheels = wheels;
    g.userData.headlights = [hl1, hl2];
  }
  g.userData.defId = def.id;
  return g;
}

function aabb(x, z, w, d, h = 20) {
  return { minx: x - w / 2, maxx: x + w / 2, minz: z - d / 2, maxz: z + d / 2, h };
}

function hitBox(scene, x, y, z, w, h, d, mat, colliders, cast = true) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.position.set(x, y, z);
  m.castShadow = cast;
  m.receiveShadow = true;
  scene.add(m);
  colliders.push(aabb(x, z, w, d, h));
  return m;
}

export function createWorld(scene) {
  const group = new THREE.Group();
  scene.add(group);
  const colliders = [];
  const doors = [];
  const parking = [];
  const waypoints = [];
  const waterBoxes = [];
  const farmPlots = [];
  const lamps = [];
  const windowMats = [];

  const grass = grassTex(); grass.repeat.set(40, 40);
  const asphalt = asphaltTex(); asphalt.repeat.set(8, 8);
  const waterT = waterTex(); waterT.repeat.set(20, 20);
  const dirt = dirtTex(); dirt.repeat.set(16, 16);
  const conc = concreteTex(); conc.repeat.set(10, 10);

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(WORLD, WORLD),
    new THREE.MeshStandardMaterial({ map: grass, color: 0x88aa66, roughness: 0.95 })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  group.add(ground);

  const downtown = new THREE.Mesh(
    new THREE.PlaneGeometry(250, 210),
    new THREE.MeshStandardMaterial({ map: conc, color: 0x8d9096, roughness: 0.9 })
  );
  downtown.rotation.x = -Math.PI / 2;
  downtown.position.set(8, 0.02, 40);
  downtown.receiveShadow = true;
  group.add(downtown);

  const industrialG = new THREE.Mesh(
    new THREE.PlaneGeometry(180, 140),
    new THREE.MeshStandardMaterial({ color: 0x6a6860, roughness: 0.95 })
  );
  industrialG.rotation.x = -Math.PI / 2;
  industrialG.position.set(200, 0.02, 190);
  industrialG.receiveShadow = true;
  group.add(industrialG);

  const farmG = new THREE.Mesh(
    new THREE.PlaneGeometry(220, 180),
    new THREE.MeshStandardMaterial({ map: dirt, color: 0x8a7048, roughness: 1 })
  );
  farmG.rotation.x = -Math.PI / 2;
  farmG.position.set(-180, 0.02, -180);
  farmG.receiveShadow = true;
  group.add(farmG);

  const airportG = new THREE.Mesh(
    new THREE.PlaneGeometry(200, 120),
    new THREE.MeshStandardMaterial({ color: 0x7a8088, roughness: 0.85 })
  );
  airportG.rotation.x = -Math.PI / 2;
  airportG.position.set(10, 0.03, 230);
  airportG.receiveShadow = true;
  group.add(airportG);

  // Water — harbor + river
  const waterMat = new THREE.MeshStandardMaterial({
    map: waterT, color: 0x2a6a88, roughness: 0.18, metalness: 0.35, transparent: true, opacity: 0.92,
  });
  const harbor = new THREE.Mesh(new THREE.PlaneGeometry(200, 160), waterMat);
  harbor.rotation.x = -Math.PI / 2;
  harbor.position.set(-210, 0.08, 210);
  group.add(harbor);
  waterBoxes.push({ minx: -310, maxx: -110, minz: 130, maxz: 290, kind: 'harbor' });

  const river = new THREE.Mesh(new THREE.PlaneGeometry(520, 28), waterMat.clone());
  river.rotation.x = -Math.PI / 2;
  river.position.set(20, 0.08, -78);
  group.add(river);
  waterBoxes.push({ minx: -240, maxx: 280, minz: -92, maxz: -64, kind: 'river' });

  // Roads
  const roadMat = new THREE.MeshStandardMaterial({ map: asphalt, color: 0x33363c, roughness: 0.92 });
  const lineMat = new THREE.MeshBasicMaterial({ color: 0xd4c46a });
  function road(x, z, w, l, rot = 0) {
    const r = new THREE.Mesh(new THREE.PlaneGeometry(w, l), roadMat);
    r.rotation.x = -Math.PI / 2;
    r.rotation.z = rot;
    r.position.set(x, 0.05, z);
    r.receiveShadow = true;
    group.add(r);
    const line = new THREE.Mesh(new THREE.PlaneGeometry(0.18, l * 0.92), lineMat);
    line.rotation.x = -Math.PI / 2;
    line.rotation.z = rot;
    line.position.set(x, 0.06, z);
    group.add(line);
  }
  // N-S highway
  road(0, 20, 12, 560);
  // E-W highway
  road(0, 40, 12, 580, Math.PI / 2);
  // downtown grid
  for (let x = -90; x <= 90; x += 45) road(x, 40, 8, 180);
  for (let z = -20; z <= 100; z += 40) road(0, z, 8, 220, Math.PI / 2);
  // to airport
  road(0, 180, 12, 120);
  // to industrial
  road(140, 160, 10, 160, Math.PI / 2);
  road(200, 160, 10, 120);
  // to harbor
  road(-140, 140, 10, 140, Math.PI / 2);
  // to farm
  road(-120, -140, 8, 160);
  road(-180, -80, 8, 140, Math.PI / 2);
  // oakwood
  road(-190, 40, 8, 140);
  road(-190, 40, 8, 120, Math.PI / 2);
  // eastbrook
  road(200, 40, 8, 120);
  road(200, 40, 8, 100, Math.PI / 2);

  // Runway
  const runway = new THREE.Mesh(
    new THREE.PlaneGeometry(140, 16),
    new THREE.MeshStandardMaterial({ color: 0x2e3238, roughness: 0.8 })
  );
  runway.rotation.x = -Math.PI / 2;
  runway.position.set(10, 0.07, 258);
  group.add(runway);
  for (let i = -5; i <= 5; i++) {
    const mk = new THREE.Mesh(new THREE.PlaneGeometry(4, 1.2), new THREE.MeshBasicMaterial({ color: 0xf2f2f2 }));
    mk.rotation.x = -Math.PI / 2;
    mk.position.set(i * 12, 0.08, 258);
    group.add(mk);
  }

  // Farm plots
  const cropColors = [0x5aa050, 0xc4b44a, 0x7a4a28, 0x4a7a38];
  for (let i = 0; i < 8; i++) {
    const fx = -230 + (i % 4) * 28;
    const fz = -220 + Math.floor(i / 4) * 32;
    const crop = new THREE.Mesh(
      new THREE.PlaneGeometry(24, 22),
      new THREE.MeshStandardMaterial({ color: cropColors[i % 4], roughness: 1 })
    );
    crop.rotation.x = -Math.PI / 2;
    crop.position.set(fx, 0.06, fz);
    group.add(crop);
    farmPlots.push({ x: fx, z: fz, ready: true });
  }

  // Plaza fountain
  const fountainBase = new THREE.Mesh(
    new THREE.CylinderGeometry(6, 7, 0.6, 20),
    new THREE.MeshStandardMaterial({ color: 0xb8c0c8, roughness: 0.4 })
  );
  fountainBase.position.set(0, 0.3, 12);
  group.add(fountainBase);
  const waterF = new THREE.Mesh(
    new THREE.CylinderGeometry(4.5, 4.5, 0.2, 16),
    new THREE.MeshStandardMaterial({ color: 0x4aa0c8, roughness: 0.15, metalness: 0.3 })
  );
  waterF.position.set(0, 0.65, 12);
  group.add(waterF);
  const spout = new THREE.Mesh(
    new THREE.CylinderGeometry(0.25, 0.25, 3.2, 8),
    new THREE.MeshStandardMaterial({ color: 0xd0d6dc })
  );
  spout.position.set(0, 2.2, 12);
  group.add(spout);

  // Bridge over river
  const bridge = new THREE.Mesh(
    new THREE.BoxGeometry(14, 0.6, 36),
    new THREE.MeshStandardMaterial({ color: 0x6a6e74, roughness: 0.7 })
  );
  bridge.position.set(0, 0.6, -78);
  group.add(bridge);

  // Landmark buildings
  const occupied = [];
  for (const lm of LANDMARKS) {
    if (lm.park || lm.plaza) {
      occupied.push({ x: lm.x, z: lm.z, r: 16 });
      continue;
    }
    if (lm.type === 'harbor' && lm.id === 'pier') {
      const pier = new THREE.Mesh(
        new THREE.BoxGeometry(lm.w, 0.6, lm.d),
        new THREE.MeshStandardMaterial({ color: lm.color, roughness: 0.8 })
      );
      pier.position.set(lm.x, 0.4, lm.z);
      group.add(pier);
      occupied.push({ x: lm.x, z: lm.z, r: 20 });
      doors.push({ landmark: lm, x: lm.x + 6, z: lm.z - 10 });
      continue;
    }
    const dayTex = windowTex(lm.glass ? '#6a849c' : '#44505c', 0.35, false);
    const nightTex = windowTex('#1a222c', 0.55, true);
    const mat = new THREE.MeshStandardMaterial({
      map: dayTex,
      color: lm.color,
      roughness: lm.glass ? 0.25 : 0.7,
      metalness: lm.glass ? 0.55 : 0.08,
      emissive: new THREE.Color(0xffcc88),
      emissiveMap: nightTex,
      emissiveIntensity: 0,
    });
    windowMats.push(mat);
    const y = lm.h / 2;
    hitBox(group, lm.x, y, lm.z, lm.w, lm.h, lm.d, mat, colliders);
    // roof
    const roof = new THREE.Mesh(
      new THREE.BoxGeometry(lm.w + 0.4, 0.4, lm.d + 0.4),
      new THREE.MeshStandardMaterial({ color: 0x2a3038, roughness: 0.8 })
    );
    roof.position.set(lm.x, lm.h + 0.2, lm.z);
    group.add(roof);
    occupied.push({ x: lm.x, z: lm.z, r: Math.max(lm.w, lm.d) * 0.7 + 6 });
    const doorX = lm.x;
    const doorZ = lm.z + lm.d / 2 + 0.6;
    doors.push({ landmark: lm, x: doorX, z: doorZ });
    const pad = new THREE.Mesh(
      new THREE.BoxGeometry(1.6, 0.12, 1.2),
      new THREE.MeshStandardMaterial({ color: 0xe8c75a, emissive: 0xaa8844, emissiveIntensity: 0.3 })
    );
    pad.position.set(doorX, 0.08, doorZ);
    group.add(pad);
  }

  // Filler buildings downtown
  const fillerCols = [0x4a5564, 0x6d7a88, 0xb8a088, 0x8a949e, 0x5c6b73, 0xc4b49a, 0x3d4a58, 0x9aa8b4];
  for (let i = 0; i < 28; i++) {
    const x = -100 + (i % 7) * 32 + (i % 3) * 4;
    const z = -10 + Math.floor(i / 7) * 34 + 8;
    if (occupied.some((o) => Math.hypot(o.x - x, o.z - z) < o.r)) continue;
    if (Math.abs(x) < 8 || Math.abs(z - 40) < 8) continue;
    const h = 10 + (i * 17) % 48;
    const w = 10 + (i % 4) * 2;
    const d = 10 + (i % 3) * 2;
    const glass = h > 28;
    const dayTex = windowTex(glass ? '#5a7388' : '#3a4450', 0.3, false);
    const nightTex = windowTex('#141a22', 0.5, true);
    const mat = new THREE.MeshStandardMaterial({
      map: dayTex,
      color: fillerCols[i % fillerCols.length],
      roughness: glass ? 0.28 : 0.72,
      metalness: glass ? 0.5 : 0.05,
      emissive: new THREE.Color(0xffcc88),
      emissiveMap: nightTex,
      emissiveIntensity: 0,
    });
    windowMats.push(mat);
    hitBox(group, x, h / 2, z, w, h, d, mat, colliders);
  }

  // Oakwood houses
  for (let i = 0; i < 10; i++) {
    const x = -260 + (i % 5) * 22;
    const z = 8 + Math.floor(i / 5) * 28;
    if (occupied.some((o) => Math.hypot(o.x - x, o.z - z) < 16)) continue;
    const h = 6 + (i % 3);
    const mat = new THREE.MeshStandardMaterial({ color: [0xe8d2b0, 0xd2b48c, 0xc4a882, 0xe0c8a0][i % 4], roughness: 0.85 });
    hitBox(group, x, h / 2, z, 8, h, 8, mat, colliders);
    const roof = new THREE.Mesh(
      new THREE.ConeGeometry(6.2, 3.2, 4),
      new THREE.MeshStandardMaterial({ color: 0x6a3030, roughness: 0.8 })
    );
    roof.position.set(x, h + 1.5, z);
    roof.rotation.y = Math.PI / 4;
    group.add(roof);
  }

  // Eastbrook houses
  for (let i = 0; i < 8; i++) {
    const x = 160 + (i % 4) * 24;
    const z = 0 + Math.floor(i / 4) * 30;
    if (occupied.some((o) => Math.hypot(o.x - x, o.z - z) < 16)) continue;
    const h = 7;
    hitBox(group, x, h / 2, z, 9, h, 9, new THREE.MeshStandardMaterial({ color: 0xdec8a4, roughness: 0.85 }), colliders);
  }

  // Industrial boxes
  for (let i = 0; i < 6; i++) {
    const x = 150 + (i % 3) * 40;
    const z = 140 + Math.floor(i / 3) * 36;
    if (occupied.some((o) => Math.hypot(o.x - x, o.z - z) < 20)) continue;
    hitBox(group, x, 6, z, 16, 12, 12, new THREE.MeshStandardMaterial({ color: 0x6a6054, roughness: 0.8 }), colliders);
  }

  // Trees (instanced)
  const trunkG = new THREE.CylinderGeometry(0.18, 0.28, 1.6, 5);
  const leafG = new THREE.ConeGeometry(1.3, 3.2, 6);
  const trunkM = new THREE.MeshStandardMaterial({ color: 0x4a321e, roughness: 1 });
  const leafM = new THREE.MeshStandardMaterial({ color: 0x2f7a3a, roughness: 0.9 });
  const treePos = [];
  function scatterTrees(cx, cz, r, n, extra = 0) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const d = Math.random() * r;
      const x = cx + Math.cos(a) * d;
      const z = cz + Math.sin(a) * d;
      if (Math.abs(x) > WORLD / 2 - 8 || Math.abs(z) > WORLD / 2 - 8) continue;
      if (occupied.some((o) => Math.hypot(o.x - x, o.z - z) < o.r * 0.7)) continue;
      treePos.push([x, z, 0.8 + extra + Math.random() * 0.5]);
    }
  }
  scatterTrees(-200, -20, 40, 18);
  scatterTrees(186, -48, 50, 40);
  scatterTrees(160, -180, 90, 90, 0.4);
  scatterTrees(-40, -200, 40, 20);
  scatterTrees(200, 80, 20, 10);

  const trunks = new THREE.InstancedMesh(trunkG, trunkM, treePos.length);
  const leaves = new THREE.InstancedMesh(leafG, leafM, treePos.length);
  trunks.castShadow = leaves.castShadow = true;
  const dummy = new THREE.Object3D();
  treePos.forEach((p, i) => {
    dummy.position.set(p[0], 0.8, p[1]);
    dummy.scale.set(1, p[2], 1);
    dummy.updateMatrix();
    trunks.setMatrixAt(i, dummy.matrix);
    dummy.position.set(p[0], 2.4 * p[2], p[1]);
    dummy.scale.set(p[2], p[2], p[2]);
    dummy.updateMatrix();
    leaves.setMatrixAt(i, dummy.matrix);
  });
  group.add(trunks, leaves);

  // Street lamps
  const poleG = new THREE.CylinderGeometry(0.07, 0.09, 5.2, 6);
  const poleM = new THREE.MeshStandardMaterial({ color: 0x22262c, metalness: 0.6, roughness: 0.4 });
  const lampG = new THREE.SphereGeometry(0.22, 8, 6);
  const lampM = new THREE.MeshStandardMaterial({ color: 0xffe6a0, emissive: 0xffcc66, emissiveIntensity: 0.2 });
  const lampPos = [];
  for (let x = -90; x <= 90; x += 45) {
    for (let z = -20; z <= 100; z += 40) {
      lampPos.push([x + 5, z + 5]);
    }
  }
  for (let x = -240; x <= 240; x += 40) lampPos.push([x, 46], [x, 34]);
  const poles = new THREE.InstancedMesh(poleG, poleM, lampPos.length);
  const bulbs = new THREE.InstancedMesh(lampG, lampM, lampPos.length);
  lampPos.forEach((p, i) => {
    dummy.position.set(p[0], 2.6, p[1]);
    dummy.scale.set(1, 1, 1);
    dummy.updateMatrix();
    poles.setMatrixAt(i, dummy.matrix);
    dummy.position.set(p[0], 5.2, p[1]);
    dummy.updateMatrix();
    bulbs.setMatrixAt(i, dummy.matrix);
    lamps.push({ x: p[0], z: p[1], mesh: null });
  });
  group.add(poles, bulbs);

  // Parking at dealership
  for (let i = 0; i < 6; i++) {
    parking.push({ x: 110 + (i % 3) * 6, z: -28 + Math.floor(i / 3) * 8, yaw: 0 });
  }
  parking.push({ x: -176, z: 48, yaw: Math.PI / 2 });
  parking.push({ x: 70, z: 8, yaw: 0 });
  parking.push({ x: -40, z: 20, yaw: 0 });
  parking.push({ x: 200, z: 10, yaw: 0 });

  // Waypoints along major roads
  for (let z = -240; z <= 260; z += 18) waypoints.push(new THREE.Vector3(6, 0, z), new THREE.Vector3(-6, 0, z));
  for (let x = -240; x <= 240; x += 18) waypoints.push(new THREE.Vector3(x, 0, 46), new THREE.Vector3(x, 0, 34));
  for (const lm of LANDMARKS) waypoints.push(new THREE.Vector3(lm.x + 8, 0, lm.z + 8));

  // Static plane at airport
  const plane = new THREE.Group();
  const fus = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.2, 12), new THREE.MeshStandardMaterial({ color: 0xe8eef4, metalness: 0.4, roughness: 0.4 }));
  fus.position.y = 1.4;
  const wing = new THREE.Mesh(new THREE.BoxGeometry(12, 0.15, 2.2), new THREE.MeshStandardMaterial({ color: 0xd0d8e0, metalness: 0.4 }));
  wing.position.y = 1.4;
  const tail = new THREE.Mesh(new THREE.BoxGeometry(0.2, 2.2, 1.4), new THREE.MeshStandardMaterial({ color: 0xc45c26 }));
  tail.position.set(0, 2.4, -5.2);
  plane.add(fus, wing, tail);
  plane.position.set(-40, 0, 258);
  group.add(plane);

  // Cargo ship
  const ship = new THREE.Group();
  const hull = new THREE.Mesh(new THREE.BoxGeometry(8, 2.2, 22), new THREE.MeshStandardMaterial({ color: 0x8a3a2a, metalness: 0.3, roughness: 0.6 }));
  hull.position.y = 0.4;
  const superstructure = new THREE.Mesh(new THREE.BoxGeometry(4, 4, 5), new THREE.MeshStandardMaterial({ color: 0xe8e0d0 }));
  superstructure.position.set(0, 3.2, -6);
  ship.add(hull, superstructure);
  ship.position.set(-250, 0, 210);
  group.add(ship);

  // Crates at harbor
  for (let i = 0; i < 8; i++) {
    const crate = new THREE.Mesh(
      new THREE.BoxGeometry(1.6, 1.6, 1.6),
      new THREE.MeshStandardMaterial({ color: i % 2 ? 0xb8860b : 0x3a6a8a })
    );
    crate.position.set(-200 + (i % 4) * 3, 0.8, 176 + Math.floor(i / 4) * 3);
    crate.castShadow = true;
    group.add(crate);
  }

  return {
    group, colliders, doors, parking, waypoints, waterBoxes, farmPlots, lamps, windowMats, bulbs,
    waterMat,
  };
}

export function createInterior(type) {
  const g = new THREE.Group();
  const wall = new THREE.MeshStandardMaterial({ color: type === 'club' ? 0x1a1020 : 0xe8dcc8, roughness: 0.85 });
  const floorC = type === 'factory' || type === 'warehouse' ? 0x5a5850 : type === 'club' ? 0x120814 : 0xc4b49a;
  const floor = new THREE.Mesh(new THREE.BoxGeometry(16, 0.2, 12), new THREE.MeshStandardMaterial({ color: floorC, roughness: 0.7 }));
  floor.position.y = 0.1;
  floor.receiveShadow = true;
  g.add(floor);
  const ceil = new THREE.Mesh(new THREE.BoxGeometry(16, 0.2, 12), new THREE.MeshStandardMaterial({ color: 0xf2eee6 }));
  ceil.position.y = 4.2;
  g.add(ceil);
  const walls = [
    [0, 2.1, -6, 16, 4.2, 0.3],
    [0, 2.1, 6, 16, 4.2, 0.3],
    [-8, 2.1, 0, 0.3, 4.2, 12],
    [8, 2.1, 0, 0.3, 4.2, 12],
  ];
  for (const [x, y, z, w, h, d] of walls) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), wall);
    m.position.set(x, y, z);
    g.add(m);
  }
  const wood = new THREE.MeshStandardMaterial({ color: 0x6a4428, roughness: 0.7 });
  const fabric = new THREE.MeshStandardMaterial({ color: 0x3d5a80, roughness: 0.9 });
  const metal = new THREE.MeshStandardMaterial({ color: 0x888c92, metalness: 0.6, roughness: 0.3 });
  const interact = [];

  function box(x, y, z, w, h, d, mat, id, label) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    m.position.set(x, y, z);
    m.castShadow = true;
    g.add(m);
    if (id) interact.push({ id, label, x, z, mesh: m });
    return m;
  }

  if (type === 'apartment' || type === 'house') {
    box(-5, 0.45, -3.5, 2.4, 0.7, 1.8, wood, 'bed', 'Sleep');
    box(-5, 0.9, -3.5, 2.4, 0.25, 1.8, fabric);
    box(5, 0.9, -3.2, 1.4, 1.8, 1.2, metal, 'fridge', 'Fridge');
    box(5.4, 1.1, 2.2, 1.2, 2.2, 0.8, metal, 'shower', 'Shower');
    box(-4.5, 0.45, 3.2, 2.2, 0.5, 1.1, fabric, 'tv', 'Watch TV');
    box(0, 0.4, 3.4, 2.4, 0.4, 0.8, wood, 'wardrobe', 'Wardrobe');
  } else if (type === 'cafe') {
    box(0, 0.7, -3.6, 5, 1.2, 1.4, wood, 'counter', 'Order');
    box(-4, 0.5, 1, 1.2, 0.7, 1.2, wood, 'seat', 'Sit & rest');
    box(4, 0.5, 1, 1.2, 0.7, 1.2, wood, 'seat2', 'Sit & rest');
  } else if (type === 'shop') {
    box(-3, 0.8, -2, 3, 1.6, 1, wood, 'shelf', 'Browse shop');
    box(3, 0.8, -2, 3, 1.6, 1, wood, 'shelf2', 'Browse shop');
    box(0, 0.7, 3.4, 4, 1.2, 1.2, wood, 'counter', 'Checkout');
  } else if (type === 'restaurant') {
    box(0, 0.7, -3.8, 6, 1.1, 1.4, wood, 'counter', 'Dine');
    box(-4, 0.45, 1.4, 1.6, 0.5, 1.6, fabric, 'table', 'Sit down');
    box(4, 0.45, 1.4, 1.6, 0.5, 1.6, fabric, 'table2', 'Sit down');
  } else if (type === 'office') {
    box(-3, 0.7, -2, 2.2, 0.8, 1.2, wood, 'desk', 'Work');
    box(3, 0.7, -2, 2.2, 0.8, 1.2, wood, 'desk2', 'Work');
    box(0, 0.8, 3.2, 3, 1.4, 1, metal, 'board', 'Job board');
  } else if (type === 'bank') {
    box(0, 0.9, -3.4, 8, 1.6, 1.4, metal, 'teller', 'Banking');
  } else if (type === 'dealer') {
    box(0, 0.6, -3, 6, 1, 1.4, metal, 'desk', 'Browse vehicles');
  } else if (type === 'club') {
    box(0, 0.2, 0, 4, 0.2, 4, new THREE.MeshStandardMaterial({ color: 0x7c3aed, emissive: 0x4c1d95, emissiveIntensity: 0.4 }), 'dance', 'Dance');
    box(-5, 0.7, -3, 3, 1.2, 1.2, metal, 'bar', 'Bar');
  } else if (type === 'factory' || type === 'warehouse') {
    box(-3, 0.8, 0, 3, 1.6, 4, metal, 'station', 'Work');
    box(4, 0.8, -2, 2, 1.6, 2, metal, 'crates', 'Pick up delivery');
  }

  box(0, 1, 5.5, 1.6, 2.2, 0.2, new THREE.MeshStandardMaterial({ color: 0x4a2a18 }), 'exit', 'Exit');
  const light = new THREE.PointLight(type === 'club' ? 0xaa66ff : 0xfff2d8, 40, 18);
  light.position.set(0, 3.4, 0);
  g.add(light);
  g.userData.interact = interact;
  g.userData.exit = { x: 0, z: 5.2 };
  return g;
}

export function collides(x, z, colliders, radius = 0.45) {
  for (const c of colliders) {
    if (x + radius > c.minx && x - radius < c.maxx && z + radius > c.minz && z - radius < c.maxz) return c;
  }
  return null;
}

export function inWater(x, z, boxes) {
  for (const b of boxes) {
    if (x > b.minx && x < b.maxx && z > b.minz && z < b.maxz) return b;
  }
  return null;
}
