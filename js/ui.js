import { on, emit } from './bus.js';
import { audio } from './audio.js';
import {
  CITY, JOBS, PROPERTIES, BUSINESSES, VEHICLES, SHOP_ITEMS, STORY, TRAITS,
  SKIN_TONES, HAIR_COLORS, SHIRT_COLORS, PANTS_COLORS, EYE_COLORS, HAIR_STYLES, TIPS, LANDMARKS, DISTRICTS,
} from './data.js';
import {
  state, startNewLife, continueLife, getSaveSummary, saveGame,
  setPaused, setPhoneOpen, setUIBlock, interact, chooseDialogue, closeDialogue,
  applyJob, quitJob, startWork, startDelivery, deposit, withdraw, takeLoan, repayLoan,
  buyProperty, buyBusiness, collectBiz, upgradeBusiness, buyVehicle, buyItem, useItem,
  snapshot, drawMinimap, adminSet, getPeople,
} from './game.js';

const $ = (id) => document.getElementById(id);
let phoneApp = 'home';
let creator = {
  name: 'Zach', gender: 'm', skin: SKIN_TONES[2], hair: HAIR_COLORS[0], hairStyle: 0,
  shirt: SHIRT_COLORS[1], pants: PANTS_COLORS[0], eyes: EYE_COLORS[0], height: 1, body: 1, trait: 'hustler',
};

export function initUI() {
  wireMenu();
  wireCreator();
  wireHud();
  wirePhone();
  wireDialogue();
  wireModals();
  wireAdmin();
  on('notify', (e) => toast(e.detail.text, e.detail.kind));
  on('prompt', (e) => { $('prompt').textContent = e.detail.text || ''; $('prompt').classList.toggle('show', !!e.detail.text); });
  on('dialogue', (e) => renderDialogue(e.detail));
  on('time', () => refreshHud());
  on('money', () => refreshHud());
  on('needs', () => refreshHud());
  on('mission', (e) => renderMission(e.detail.mission));
  on('mission-side', (e) => { $('mission-side').textContent = e.detail.text; });
  on('hud', (e) => $('hud').classList.toggle('hidden', !e.detail.on));
  on('toggle-phone', () => togglePhone());
  on('escape', onEscape);
  on('shop-open', (e) => openShop(e.detail.kind, e.detail.car));
  on('open-app', (e) => { openPhone(); showApp(e.detail.app); });
  tickMinimap();
  const save = getSaveSummary();
  if (save) {
    $('btn-continue').classList.remove('hidden');
    $('continue-meta').textContent = `${save.name} · Day ${save.day} · $${save.money.toLocaleString()}`;
  }
}

function wireMenu() {
  $('btn-new').onclick = () => { audio.unlock(); audio.click(); show('creator'); hide('menu'); buildDoll(); };
  $('btn-continue').onclick = () => {
    audio.unlock(); audio.click();
    if (continueLife()) { hide('menu'); hide('loader'); $('hud').classList.remove('hidden'); }
  };
  $('btn-how').onclick = () => { audio.click(); show('howto'); hide('menu'); };
  $('btn-how-back').onclick = () => { hide('howto'); show('menu'); };
  $('btn-admin-link').onclick = () => { audio.click(); hide('menu'); show('admin'); renderAdmin(); };
  $('star-name').onclick = () => {
    const n = prompt('Your name in New Aurora', creator.name);
    if (n) { creator.name = n.slice(0, 18); $('star-name').textContent = creator.name; }
  };
}

function wireCreator() {
  $('c-name').value = creator.name;
  $('c-name').oninput = (e) => { creator.name = e.target.value.slice(0, 18); $('star-name').textContent = creator.name; };
  swatches('c-skin', SKIN_TONES, 'skin');
  swatches('c-hair', HAIR_COLORS, 'hair');
  swatches('c-shirt', SHIRT_COLORS, 'shirt');
  swatches('c-pants', PANTS_COLORS, 'pants');
  swatches('c-eyes', EYE_COLORS, 'eyes');
  HAIR_STYLES.forEach((h) => {
    const b = document.createElement('button');
    b.className = 'chip'; b.textContent = h.name;
    b.onclick = () => { creator.hairStyle = h.id; document.querySelectorAll('#c-style .chip').forEach((x) => x.classList.remove('on')); b.classList.add('on'); buildDoll(); };
    if (h.id === 0) b.classList.add('on');
    $('c-style').appendChild(b);
  });
  TRAITS.forEach((t) => {
    const b = document.createElement('button');
    b.className = 'chip trait';
    b.innerHTML = `<b>${t.name}</b><span>${t.desc}</span>`;
    b.onclick = () => { creator.trait = t.id; document.querySelectorAll('#c-trait .chip').forEach((x) => x.classList.remove('on')); b.classList.add('on'); };
    if (t.id === 'hustler') b.classList.add('on');
    $('c-trait').appendChild(b);
  });
  $('c-height').oninput = (e) => { creator.height = 0.88 + e.target.value / 100 * 0.28; buildDoll(); };
  $('c-body').oninput = (e) => { creator.body = 0.85 + e.target.value / 100 * 0.4; buildDoll(); };
  document.querySelectorAll('input[name="gender"]').forEach((r) => {
    r.onchange = () => { creator.gender = r.value; };
  });
  $('btn-create').onclick = () => {
    audio.unlock(); audio.start();
    hide('creator');
    $('hud').classList.remove('hidden');
    startNewLife({ ...creator });
    refreshHud();
    renderMission(STORY[0]);
  };
  $('btn-create-back').onclick = () => { hide('creator'); show('menu'); };
}

function swatches(id, colors, key) {
  colors.forEach((c, i) => {
    const b = document.createElement('button');
    b.className = 'swatch' + (i === (key === 'skin' ? 2 : 0) || (key === 'shirt' && i === 1) ? ' on' : '');
    b.style.background = c;
    b.onclick = () => {
      creator[key] = c;
      document.querySelectorAll('#' + id + ' .swatch').forEach((x) => x.classList.remove('on'));
      b.classList.add('on');
      buildDoll();
    };
    $(id).appendChild(b);
  });
}

function buildDoll() {
  const d = $('doll');
  d.style.setProperty('--skin', creator.skin);
  d.style.setProperty('--hair', creator.hair);
  d.style.setProperty('--shirt', creator.shirt);
  d.style.setProperty('--pants', creator.pants);
  d.className = 'doll style-' + creator.hairStyle;
}

function wireHud() {
  $('btn-phone').onclick = () => togglePhone();
  $('mute-btn').onclick = () => {
    const m = audio.toggle();
    $('mute-btn').textContent = m ? '🔇' : '🔊';
  };
  $('btn-pause').onclick = () => pause(true);
  $('btn-resume').onclick = () => pause(false);
  $('btn-save').onclick = () => { saveGame(); toast('Life saved.', 'info'); };
  $('btn-quit').onclick = () => { saveGame(); pause(false); $('hud').classList.add('hidden'); hide('pause'); show('menu'); state.mode = 'menu'; };
  $('btn-touch-e').onclick = () => interact();
  $('btn-touch-f').onclick = () => {
    const ev = new KeyboardEvent('keydown', { code: 'KeyF' });
    dispatchEvent(ev);
  };
  if ('ontouchstart' in window) $('touch-ui').classList.remove('hidden');
}

function pause(v) {
  setPaused(v);
  $('pause').classList.toggle('hidden', !v);
  setUIBlock(v);
  if (v) {
    const s = snapshot();
    $('pause-stats').innerHTML = `Day ${state.day} · ${state.name}<br>Cash $${state.money.toLocaleString()} · Net $${s.net.toLocaleString()}`;
  }
}

function onEscape() {
  if (!$('dialogue').classList.contains('hidden')) { closeDialogue(); return; }
  if (!$('shop').classList.contains('hidden')) { closeShop(); return; }
  if (!$('phone').classList.contains('hidden')) { togglePhone(false); return; }
  if (!$('map-full').classList.contains('hidden')) { hide('map-full'); setUIBlock(false); return; }
  if (!$('admin').classList.contains('hidden')) { hide('admin'); show('menu'); return; }
  if (state.mode === 'play' || state.mode === 'interior' || state.mode === 'pause') pause(state.mode !== 'pause');
}

function refreshHud() {
  const h = Math.floor(state.time / 60) % 24;
  const m = Math.floor(state.time % 60);
  const ap = h >= 12 ? 'PM' : 'AM';
  const hr = ((h + 11) % 12) + 1;
  $('clock').textContent = `${hr}:${String(m).padStart(2, '0')} ${ap}`;
  $('day-label').textContent = `DAY ${state.day}`;
  $('weather-ico').textContent = { sunny: '☀', rain: '🌧', storm: '⛈', fog: '🌫', wind: '💨' }[state.weather] || '☀';
  $('cash').textContent = '$' + state.money.toLocaleString();
  $('hud-name').textContent = state.name || 'Zach';
  setBar('hunger', state.needs.hunger);
  setBar('energy', state.needs.energy);
  setBar('fun', state.needs.fun);
  setBar('social', state.needs.social);
  setBar('hygiene', state.needs.hygiene);
  $('level-pip').textContent = 'LV ' + state.level;
}

function setBar(id, v) {
  const fill = $(id + '-fill');
  if (!fill) return;
  fill.style.width = v + '%';
  fill.classList.toggle('low', v < 22);
}

function renderMission(m) {
  if (!m) { $('mission-title').textContent = 'Free Life'; $('mission-brief').textContent = 'The city is yours.'; return; }
  $('mission-title').textContent = m.title;
  $('mission-brief').textContent = m.brief;
}

function tickMinimap() {
  const c = $('minimap');
  if (c && (state.mode === 'play' || state.mode === 'interior' || state.mode === 'intro')) {
    drawMinimap(c.getContext('2d'), c.width, c.height);
  }
  requestAnimationFrame(tickMinimap);
}

function togglePhone(force) {
  const open = force ?? $('phone').classList.contains('hidden');
  $('phone').classList.toggle('hidden', !open);
  setPhoneOpen(open);
  setUIBlock(open);
  if (open) { audio.click(); showApp(phoneApp === 'home' ? 'home' : phoneApp); $('phone-clock').textContent = $('clock').textContent; }
}

function openPhone() {
  if ($('phone').classList.contains('hidden')) togglePhone(true);
}

function wirePhone() {
  document.querySelectorAll('.app-ico').forEach((b) => {
    b.onclick = () => { audio.click(); showApp(b.dataset.app); };
  });
  $('phone-home').onclick = () => showApp('home');
  $('phone-close').onclick = () => togglePhone(false);
}

function showApp(app) {
  phoneApp = app;
  $('phone-home-grid').classList.toggle('hidden', app !== 'home');
  $('phone-view').classList.toggle('hidden', app === 'home');
  if (app === 'home') { $('phone-title').textContent = CITY; return; }
  const titles = { map: 'Map', bank: 'First National', jobs: 'Career', estate: 'Real Estate', biz: 'Business', people: 'People', missions: 'Missions', bag: 'Inventory', car: 'Garage', settings: 'Settings' };
  $('phone-title').textContent = titles[app] || app;
  const v = $('phone-view');
  if (app === 'map') v.innerHTML = renderMapApp();
  if (app === 'bank') v.innerHTML = renderBank();
  if (app === 'jobs') v.innerHTML = renderJobs();
  if (app === 'estate') v.innerHTML = renderEstate();
  if (app === 'biz') v.innerHTML = renderBiz();
  if (app === 'people') v.innerHTML = renderPeople();
  if (app === 'missions') v.innerHTML = renderMissions();
  if (app === 'bag') v.innerHTML = renderBag();
  if (app === 'car') v.innerHTML = renderGarage();
  if (app === 'settings') v.innerHTML = renderSettings();
  bindViewButtons(v);
}

function renderMapApp() {
  const rows = LANDMARKS.map((l) => `<button class="list-row" data-tip="${l.name}"><span>${l.name}</span><em>${DISTRICTS.find((d) => d.id === l.district)?.name || ''}</em></button>`).join('');
  return `<p class="muted">Gold diamond marks your current story objective. Districts of ${CITY}:</p>
    <div class="chips">${DISTRICTS.map((d) => `<span class="chip on" style="border-color:${d.color}">${d.name}</span>`).join('')}</div>
    <div class="list scroll">${rows}</div>
    <button class="btn" id="open-big-map">Open full map</button>`;
}

function renderBank() {
  const s = snapshot();
  return `<div class="bank-hero"><div>Checking</div><b>$${state.money.toLocaleString()}</b></div>
    <div class="stat-grid">
      <div><span>Savings</span><b>$${state.bank.toLocaleString()}</b></div>
      <div><span>Business</span><b>$${state.bizBank.toLocaleString()}</b></div>
      <div><span>Loan</span><b>$${state.loan.toLocaleString()}</b></div>
      <div><span>Credit</span><b>${state.credit}</b></div>
    </div>
    <div class="net">Net worth <b>$${s.net.toLocaleString()}</b></div>
    <div class="row-btns">
      <input id="bank-amt" type="number" min="1" step="50" value="100">
      <button class="btn" data-act="dep">Deposit</button>
      <button class="btn" data-act="wd">Withdraw</button>
    </div>
    <div class="row-btns">
      <button class="btn" data-act="loan">Take loan</button>
      <button class="btn" data-act="repay">Repay</button>
      <button class="btn" data-act="collect">Collect biz</button>
    </div>
    <p class="muted">Max loan ≈ $${(state.credit * 80).toLocaleString()}. Weekly payments auto-draft.</p>`;
}

function renderJobs() {
  const cur = JOBS.find((j) => j.id === state.job);
  const cards = JOBS.map((j) => `<div class="card">
    <div class="card-h"><b>${j.name}</b><span>$${j.wage}/hr</span></div>
    <p>${j.desc}</p>
    <p class="muted">${j.employer} · Lv ${j.reqLevel}+ · ${j.hours[0]}:00–${j.hours[1]}:00</p>
    <button class="btn ${state.job === j.id ? 'ghost' : ''}" data-job="${j.id}">${state.job === j.id ? 'Current' : 'Apply'}</button>
  </div>`).join('');
  return `${cur ? `<p>Clocked as <b>${cur.name}</b>.</p><button class="btn danger" data-act="quit">Quit</button>` : '<p>You are unemployed. The city has opinions about that.</p>'}
    <button class="btn gold" data-act="gig">Start delivery gig</button>
    <button class="btn" data-act="work">Work current shift</button>
    <div class="list scroll">${cards}</div>`;
}

function renderEstate() {
  return PROPERTIES.map((p) => {
    const own = state.properties.includes(p.id);
    return `<div class="card"><div class="card-h"><b>${p.name}</b><span>${p.type === 'rent' ? '$' + p.rent + '/wk' : '$' + p.price.toLocaleString()}</span></div>
      <p>${p.desc}</p><p class="muted">${p.district} · ${p.beds} bed</p>
      <button class="btn" data-prop="${p.id}">${own ? (state.home === p.id ? 'Home' : 'Make home') : (p.type === 'rent' ? 'Rent' : 'Buy')}</button></div>`;
  }).join('');
}

function renderBiz() {
  return `<p class="muted">Business account: $${state.bizBank.toLocaleString()} <button class="btn" data-act="collect">Collect</button></p>` +
    BUSINESSES.map((b) => {
      const own = state.businesses.find((x) => x.id === b.id);
      return `<div class="card"><div class="card-h"><b>${b.name}</b><span>$${b.price.toLocaleString()}</span></div>
        <p>${b.desc}</p><p class="muted">Income $${b.income[0]}–$${b.income[1]}/day ${own ? '· Lv ' + own.level : ''}</p>
        ${own ? `<button class="btn" data-up="${b.id}">Upgrade $${b.upgrade.toLocaleString()}</button>` : `<button class="btn gold" data-biz="${b.id}">Buy</button>`}
      </div>`;
    }).join('');
}

function renderPeople() {
  const people = getPeople().sort((a, b) => b.rel - a.rel).slice(0, 24);
  return `<p class="muted">Relationships grow when you talk and gift.</p>` +
    people.map((p) => `<div class="list-row"><div><b>${p.name}</b><div class="muted">${p.job} · ${p.personality}</div></div><em>${relWord(p.rel)}</em></div>`).join('');
}

function relWord(r) {
  if (r >= 80) return 'Close';
  if (r >= 50) return 'Friend';
  if (r >= 20) return 'Known';
  if (r > 0) return 'Met';
  return 'Stranger';
}

function renderMissions() {
  return STORY.map((m, i) => `<div class="card ${i === state.story ? 'active' : ''} ${state.storyDone.includes(i) ? 'done' : ''}">
    <div class="card-h"><b>${i === state.story ? '▶ ' : state.storyDone.includes(i) ? '✓ ' : ''}${m.title}</b></div>
    <p>${m.brief}</p><p class="muted">${m.hint}</p>
  </div>`).join('') + `<p class="muted">Deliveries completed: ${state.deliveries}</p>`;
}

function renderBag() {
  if (!state.inventory.length) return '<p class="muted">Pockets empty. The mall is downtown.</p>';
  return state.inventory.map((i) => {
    const d = SHOP_ITEMS.find((s) => s.id === i.id);
    return `<div class="list-row"><span>${d?.icon || '•'} ${d?.name || i.id} ×${i.n}</span><button class="btn" data-use="${i.id}">Use</button></div>`;
  }).join('');
}

function renderGarage() {
  if (!state.ownedVehicles.length) return '<p class="muted">No keys yet. Apex Motors sits east of the plaza.</p>';
  return state.ownedVehicles.map((id) => {
    const d = VEHICLES.find((v) => v.id === id);
    return `<div class="card"><b>${d?.name}</b><p class="muted">${d?.type} · tank ${d?.fuel}</p></div>`;
  }).join('');
}

function renderSettings() {
  return `<p>Audio, camera, save.</p>
    <button class="btn" data-act="mute">${audio.muted ? 'Unmute' : 'Mute'}</button>
    <button class="btn" data-act="save">Save life</button>
    <p class="muted">WASD move · Mouse look (click game or hold RMB) · E interact · F vehicle · Tab phone · Shift sprint · Space jump / handbrake</p>
    <p class="muted">Tip: ${TIPS[state.day % TIPS.length]}</p>`;
}

function bindViewButtons(v) {
  v.querySelector('#open-big-map')?.addEventListener('click', () => {
    togglePhone(false);
    show('map-full');
    setUIBlock(true);
    const c = $('map-big');
    c.width = Math.min(900, innerWidth - 80);
    c.height = Math.min(700, innerHeight - 140);
    drawMinimap(c.getContext('2d'), c.width, c.height);
  });
  v.querySelectorAll('[data-act]').forEach((b) => b.onclick = () => {
    const a = b.dataset.act;
    const amt = Number($('bank-amt')?.value || 100);
    if (a === 'dep') deposit(amt);
    if (a === 'wd') withdraw(amt);
    if (a === 'loan') takeLoan(amt * 10);
    if (a === 'repay') repayLoan(amt);
    if (a === 'collect') collectBiz();
    if (a === 'quit') quitJob();
    if (a === 'gig') startDelivery();
    if (a === 'work') startWork();
    if (a === 'mute') audio.toggle();
    if (a === 'save') { saveGame(); toast('Saved.', 'info'); }
    showApp(phoneApp);
    refreshHud();
  });
  v.querySelectorAll('[data-job]').forEach((b) => b.onclick = () => { applyJob(b.dataset.job); showApp('jobs'); });
  v.querySelectorAll('[data-prop]').forEach((b) => b.onclick = () => { buyProperty(b.dataset.prop); showApp('estate'); refreshHud(); });
  v.querySelectorAll('[data-biz]').forEach((b) => b.onclick = () => { buyBusiness(b.dataset.biz); showApp('biz'); refreshHud(); });
  v.querySelectorAll('[data-up]').forEach((b) => b.onclick = () => { upgradeBusiness(b.dataset.up); showApp('biz'); refreshHud(); });
  v.querySelectorAll('[data-use]').forEach((b) => b.onclick = () => { useItem(b.dataset.use); showApp('bag'); refreshHud(); });
}

function wireDialogue() {
  $('dlg-close').onclick = () => closeDialogue();
}

function renderDialogue(d) {
  const el = $('dialogue');
  if (!d) { el.classList.add('hidden'); setUIBlock(false); return; }
  el.classList.remove('hidden');
  setUIBlock(true);
  $('dlg-name').textContent = d.npc.name;
  $('dlg-job').textContent = d.npc.job + ' · ' + d.npc.personality;
  $('dlg-text').textContent = d.text;
  const box = $('dlg-opts');
  box.innerHTML = '';
  d.options.forEach((o) => {
    const b = document.createElement('button');
    b.className = 'btn';
    b.textContent = o.label;
    b.onclick = () => chooseDialogue(o.id);
    box.appendChild(b);
  });
}

function openShop(kind, car) {
  const el = $('shop');
  el.classList.remove('hidden');
  setUIBlock(true);
  const body = $('shop-body');
  if (kind === 'vehicle' && car) {
    $('shop-title').textContent = 'Apex Motors';
    const v = car.def;
    body.innerHTML = `<p>${v.name} — $${v.price.toLocaleString()}</p><p class="muted">Top speed ${v.speed} · fuel ${v.fuel}</p>
      <button class="btn gold" id="buy-car">Buy keys</button>`;
    $('buy-car').onclick = () => { buyVehicle(v.id); closeShop(); refreshHud(); };
    return;
  }
  const food = kind === 'food';
  $('shop-title').textContent = food ? 'Menu' : 'Nexus Shop';
  const items = food ? SHOP_ITEMS.filter((i) => i.type === 'food') : SHOP_ITEMS;
  body.innerHTML = items.map((i) => `<div class="list-row"><span>${i.icon} ${i.name}</span><button class="btn" data-buy="${i.id}">$${i.price}</button></div>`).join('');
  body.querySelectorAll('[data-buy]').forEach((b) => b.onclick = () => { buyItem(b.dataset.buy); refreshHud(); });
}

function closeShop() { hide('shop'); setUIBlock(false); }

function wireModals() {
  $('shop-close').onclick = closeShop;
  $('map-close').onclick = () => { hide('map-full'); setUIBlock(false); };
}

function wireAdmin() {
  $('admin-close').onclick = () => { hide('admin'); show('menu'); };
  $('ad-time').oninput = (e) => { $('ad-time-v').textContent = e.target.value + ':00'; };
  $('ad-apply-time').onclick = () => adminSet('time', Number($('ad-time').value));
  $('ad-weather').onchange = (e) => adminSet('weather', e.target.value);
  $('ad-money').onclick = () => adminSet('money', 5000);
  $('ad-needs').onclick = () => adminSet('needs', 100);
  $('ad-ban').onclick = () => toast('Report filed. (Single-player — logged.)', 'warn');
}

function renderAdmin() {
  const s = snapshot();
  $('admin-stats').innerHTML = `
    <div class="stat-grid">
      <div><span>Citizens</span><b>${getPeople().length}</b></div>
      <div><span>Player cash</span><b>$${state.money.toLocaleString()}</b></div>
      <div><span>Net worth</span><b>$${s.net.toLocaleString()}</b></div>
      <div><span>Credit</span><b>${state.credit}</b></div>
      <div><span>Day</span><b>${state.day}</b></div>
      <div><span>Level</span><b>${state.level}</b></div>
    </div>
    <h3>Citizens</h3>
    <div class="list scroll tall">${getPeople().map((p) => `<div class="list-row"><span>${p.name}</span><em>${p.job}</em></div>`).join('')}</div>`;
}

function toast(text, kind = 'info') {
  const stack = $('toasts');
  const t = document.createElement('div');
  t.className = 'toast ' + kind;
  t.textContent = text;
  stack.appendChild(t);
  audio.notify();
  setTimeout(() => t.classList.add('out'), 3400);
  setTimeout(() => t.remove(), 4000);
}

function show(id) { $(id).classList.remove('hidden'); }
function hide(id) { $(id).classList.add('hidden'); }

export function hideLoader() {
  $('loader').classList.add('fade');
  setTimeout(() => $('loader').classList.add('hidden'), 700);
}
