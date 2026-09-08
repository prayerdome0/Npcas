/* Procedural WebAudio SFX + music for ZACH: SHADOW PROTOCOL — no audio files needed */
const ZAudio = (() => {
  let ctx = null, master = null, musicGain = null, muted = false;
  let musicTimer = null, musicStep = 0;

  function init() {
    if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return; }
    try {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      master = ctx.createGain(); master.gain.value = 0.8; master.connect(ctx.destination);
      musicGain = ctx.createGain(); musicGain.gain.value = 0.32; musicGain.connect(master);
    } catch (e) { console.warn('audio unavailable', e); }
  }
  function now() { return ctx ? ctx.currentTime : 0; }
  function env(g, t, a, peak, d) {
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + a);
    g.gain.exponentialRampToValueAtTime(0.0001, t + a + d);
  }
  function osc(type, f0, f1, t, dur, peak, dest) {
    if (!ctx || muted) return;
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(f0, t);
    if (f1 && f1 !== f0) o.frequency.exponentialRampToValueAtTime(Math.max(1, f1), t + dur);
    env(g, t, 0.005, peak, dur);
    o.connect(g); g.connect(dest || master);
    o.start(t); o.stop(t + dur + 0.05);
  }
  function noise(t, dur, peak, filterFreq, q, dest) {
    if (!ctx || muted) return;
    const len = Math.max(1, Math.floor(ctx.sampleRate * dur));
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource(); src.buffer = buf;
    const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = filterFreq || 2000; f.Q.value = q || 0.8;
    const g = ctx.createGain(); env(g, t, 0.004, peak, dur);
    src.connect(f); f.connect(g); g.connect(dest || master);
    src.start(t); src.stop(t + dur + 0.05);
  }

  const S = {
    init,
    toggleMute() { muted = !muted; if (musicGain) musicGain.gain.value = muted ? 0 : 0.32; return muted; },
    get muted() { return muted; },
    ui() { if (!ctx) return; osc('square', 660, 880, now(), 0.07, 0.12); },
    shoot(w) {
      if (!ctx) return; const t = now();
      if (w === 'PISTOL') { noise(t, 0.09, 0.5, 3500); osc('square', 320, 90, t, 0.08, 0.25); }
      else if (w === 'SMG') { noise(t, 0.06, 0.4, 4200); osc('square', 420, 120, t, 0.05, 0.2); }
      else if (w === 'RIFLE') { noise(t, 0.12, 0.55, 3000); osc('sawtooth', 220, 60, t, 0.11, 0.3); }
      else if (w === 'SHOTGUN') { noise(t, 0.22, 0.7, 1800); osc('sawtooth', 150, 40, t, 0.2, 0.4); }
      else { noise(t, 0.08, 0.4, 3000); }
    },
    enemyShoot() { if (!ctx) return; osc('square', 500, 200, now(), 0.06, 0.08); },
    reload() { if (!ctx) return; const t = now(); osc('square', 300, 300, t, 0.04, 0.12); osc('square', 450, 450, t + 0.12, 0.05, 0.12); },
    hit() { if (!ctx) return; noise(now(), 0.06, 0.3, 1200); },
    kill() { if (!ctx) return; const t = now(); osc('sawtooth', 300, 60, t, 0.18, 0.3); noise(t, 0.12, 0.3, 900); },
    hurt() { if (!ctx) return; const t = now(); osc('sawtooth', 140, 50, t, 0.25, 0.4); noise(t, 0.15, 0.3, 600); },
    explosion() { if (!ctx) return; const t = now(); noise(t, 0.7, 0.8, 500); osc('sine', 90, 25, t, 0.6, 0.6); },
    dash() { if (!ctx) return; noise(now(), 0.18, 0.22, 2500); },
    slowmo(on) { if (!ctx) return; const t = now(); osc('sine', on ? 800 : 200, on ? 150 : 900, t, 0.4, 0.2); },
    pickup() { if (!ctx) return; const t = now(); osc('sine', 600, 600, t, 0.08, 0.2); osc('sine', 900, 900, t + 0.09, 0.12, 0.2); },
    grenade() { if (!ctx) return; osc('sine', 400, 100, now(), 0.3, 0.2); },
    boss() { if (!ctx) return; const t = now(); osc('sawtooth', 70, 45, t, 0.8, 0.5); osc('sawtooth', 105, 60, t + 0.1, 0.8, 0.35); noise(t, 0.5, 0.25, 400); },
    wave() { if (!ctx) return; const t = now(); osc('square', 220, 220, t, 0.12, 0.2); osc('square', 330, 330, t + 0.15, 0.18, 0.2); },
    sting(win) {
      if (!ctx) return; const t = now();
      const seq = win ? [262, 330, 392, 523, 659] : [330, 262, 196, 131];
      seq.forEach((f, i) => osc('triangle', f, f, t + i * 0.16, 0.22, 0.25));
    },
    // dark driving action loop: bass pulse + hats + tension arp
    startMusic(intensity = 1) {
      if (!ctx) return; this.stopMusic();
      const bass = [55, 55, 65.4, 49]; // A A C G
      musicStep = 0;
      const tempo = 140; // ms per 16th-ish
      musicTimer = setInterval(() => {
        if (muted || !ctx) return;
        const t = now(); const s = musicStep % 16;
        if (s % 4 === 0) { // kick-ish thump
          osc('sine', 120, 35, t, 0.16, 0.5, musicGain);
          osc('sawtooth', bass[(musicStep >> 4) % 4], bass[(musicStep >> 4) % 4], t, 0.22, 0.16 * intensity, musicGain);
        }
        if (s % 2 === 0) noise(t, 0.03, 0.06, 8000, 1, musicGain); // hats
        if (intensity > 1 && s % 8 === 6) osc('square', 440 * Math.pow(2, (musicStep % 5) / 12), 440, t, 0.1, 0.05, musicGain);
        musicStep++;
      }, tempo);
    },
    stopMusic() { if (musicTimer) { clearInterval(musicTimer); musicTimer = null; } }
  };
  return S;
})();
