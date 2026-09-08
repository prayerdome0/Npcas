let ctx;
let muted = false;
let master;
let ambientGain;
let engineGain;
let rainGain;
let musicGain;
let started = false;
let engineOsc;
let rainNodes = [];
let musicTimer = 0;
let stepCooldown = 0;

function ac() {
  if (!ctx) {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    master = ctx.createGain();
    master.gain.value = 0.7;
    master.connect(ctx.destination);
    ambientGain = ctx.createGain();
    ambientGain.gain.value = 0.08;
    ambientGain.connect(master);
    engineGain = ctx.createGain();
    engineGain.gain.value = 0;
    engineGain.connect(master);
    rainGain = ctx.createGain();
    rainGain.gain.value = 0;
    rainGain.connect(master);
    musicGain = ctx.createGain();
    musicGain.gain.value = 0.05;
    musicGain.connect(master);
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

export const audio = {
  get muted() { return muted; },
  setMuted(v) {
    muted = v;
    if (master) master.gain.value = muted ? 0 : 0.7;
  },
  toggle() {
    this.setMuted(!muted);
    return muted;
  },
  unlock() {
    ac();
    if (!started) {
      started = true;
      startAmbient();
      startEngine();
      startRain();
    }
  },
  click() { blip(880, 0.04, 'square', 0.04); },
  notify() { blip(660, 0.08, 'sine', 0.08); blip(990, 0.1, 'sine', 0.05, 0.08); },
  cash() { blip(523, 0.08, 'sine', 0.08); blip(659, 0.1, 'sine', 0.07, 0.07); blip(784, 0.16, 'sine', 0.08, 0.14); },
  error() { blip(180, 0.18, 'sawtooth', 0.06); },
  door() { noise(0.12, 0.08, 400); blip(220, 0.08, 'square', 0.03); },
  talk() { blip(320 + Math.random() * 80, 0.05, 'sine', 0.04); },
  start() { blip(392, 0.1, 'sine', 0.08); blip(523, 0.14, 'sine', 0.08, 0.1); blip(784, 0.22, 'sine', 0.1, 0.22); },
  horn() { blip(410, 0.28, 'square', 0.07); blip(330, 0.28, 'square', 0.05, 0.02); },
  splash() { noise(0.2, 0.1, 800); },
  thunder() { noise(0.8, 0.35, 80); },
  foot(sprint) {
    if (stepCooldown > 0) return;
    stepCooldown = sprint ? 0.22 : 0.34;
    noise(0.04, sprint ? 0.05 : 0.03, 200);
  },
  setEngine(amount) {
    if (!engineGain) return;
    const t = ctx.currentTime;
    engineGain.gain.linearRampToValueAtTime(Math.max(0, amount) * 0.12, t + 0.08);
    if (engineOsc) engineOsc.frequency.linearRampToValueAtTime(70 + amount * 140, t + 0.08);
  },
  setRain(amount) {
    if (!rainGain) return;
    rainGain.gain.linearRampToValueAtTime(amount * 0.12, ctx.currentTime + 0.4);
  },
  setAmbient(day01, downtown) {
    if (!ambientGain) return;
    const night = day01 < 0.22 || day01 > 0.8 ? 0.05 : 0.09;
    ambientGain.gain.linearRampToValueAtTime(night + downtown * 0.04, ctx.currentTime + 0.5);
  },
  tick(dt) {
    if (stepCooldown > 0) stepCooldown -= dt;
    musicTimer += dt;
    if (started && musicTimer > 8) {
      musicTimer = 0;
      cityChord();
    }
  },
};

function blip(freq, dur, type = 'sine', vol = 0.06, delay = 0) {
  if (muted) return;
  const c = ac();
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.value = freq;
  g.gain.value = 0;
  o.connect(g); g.connect(master);
  const t = c.currentTime + delay;
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(vol, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.start(t); o.stop(t + dur + 0.02);
}

function noise(dur, vol, freq) {
  if (muted) return;
  const c = ac();
  const n = c.createBufferSource();
  const len = Math.floor(c.sampleRate * dur);
  const buf = c.createBuffer(1, len, c.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
  n.buffer = buf;
  const f = c.createBiquadFilter();
  f.type = 'lowpass';
  f.frequency.value = freq;
  const g = c.createGain();
  g.gain.value = vol;
  n.connect(f); f.connect(g); g.connect(master);
  n.start();
}

function startAmbient() {
  const c = ac();
  const o = c.createOscillator();
  o.type = 'sine';
  o.frequency.value = 70;
  const f = c.createBiquadFilter();
  f.type = 'lowpass';
  f.frequency.value = 180;
  o.connect(f); f.connect(ambientGain);
  o.start();
  const o2 = c.createOscillator();
  o2.type = 'triangle';
  o2.frequency.value = 110;
  const g2 = c.createGain();
  g2.gain.value = 0.3;
  o2.connect(g2); g2.connect(ambientGain);
  o2.start();
}

function startEngine() {
  const c = ac();
  engineOsc = c.createOscillator();
  engineOsc.type = 'sawtooth';
  engineOsc.frequency.value = 80;
  const f = c.createBiquadFilter();
  f.type = 'lowpass';
  f.frequency.value = 400;
  engineOsc.connect(f); f.connect(engineGain);
  engineOsc.start();
}

function startRain() {
  const c = ac();
  const n = c.createBufferSource();
  const len = c.sampleRate * 2;
  const buf = c.createBuffer(1, len, c.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  n.buffer = buf;
  n.loop = true;
  const f = c.createBiquadFilter();
  f.type = 'highpass';
  f.frequency.value = 800;
  n.connect(f); f.connect(rainGain);
  n.start();
  rainNodes.push(n);
}

function cityChord() {
  if (muted) return;
  const notes = [196, 247, 294, 330, 392];
  const n = notes[Math.floor(Math.random() * notes.length)];
  blip(n, 1.6, 'sine', 0.03);
  blip(n * 1.5, 1.4, 'sine', 0.02, 0.05);
}
