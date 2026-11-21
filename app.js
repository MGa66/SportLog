/* SportLog – Trainings-Tracker als installierbare Web-App (PWA)
   Alle Daten liegen lokal auf dem Gerät (IndexedDB). */
'use strict';
const APP_VERSION = '1.3.0';

/* =========================================================
   Konstanten
   ========================================================= */
const SPORTS = {
  run:   { label: 'Laufen',    icon: 'run',   color: 'var(--run)',   pace: true },
  bike:  { label: 'Radfahren', icon: 'bike',  color: 'var(--bike)',  pace: false },
  walk:  { label: 'Gehen',     icon: 'walk',  color: 'var(--walk)',  pace: true },
  indoor: { label: 'Rolle',    icon: 'trainer', color: 'var(--indoor)', pace: false, indoor: true },
  other: { label: 'Sonstiges', icon: 'pulse', color: 'var(--other)', pace: false },
};
const sp = s => SPORTS[s] || SPORTS.other;

const GROUPS = ['Brust', 'Rücken', 'Beine', 'Schultern', 'Arme', 'Bauch', 'Ganzkörper', 'Sonstiges'];

const DEFAULT_EXERCISES = [
  ['Bankdrücken', 'Brust'], ['Schrägbankdrücken (Kurzhantel)', 'Brust'], ['Butterfly', 'Brust'], ['Dips', 'Brust'], ['Liegestütze', 'Brust'],
  ['Kreuzheben', 'Rücken'], ['Klimmzüge', 'Rücken'], ['Latzug', 'Rücken'], ['Langhantelrudern', 'Rücken'], ['Kabelrudern', 'Rücken'],
  ['Kniebeugen', 'Beine'], ['Beinpresse', 'Beine'], ['Ausfallschritte', 'Beine'], ['Rumänisches Kreuzheben', 'Beine'],
  ['Beinstrecker', 'Beine'], ['Beinbeuger', 'Beine'], ['Wadenheben', 'Beine'],
  ['Schulterdrücken', 'Schultern'], ['Seitheben', 'Schultern'], ['Face Pulls', 'Schultern'],
  ['Bizepscurls', 'Arme'], ['Hammercurls', 'Arme'], ['Trizepsdrücken am Kabel', 'Arme'], ['French Press', 'Arme'],
  ['Crunches', 'Bauch'], ['Beinheben hängend', 'Bauch'], ['Plank (Sekunden)', 'Bauch'],
];

const ICONS = {
  home: '<path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/>',
  dumbbell: '<path d="M6.5 6.5v11M17.5 6.5v11M3.5 9v6M20.5 9v6M6.5 12h11"/>',
  run: '<circle cx="15" cy="4.5" r="2"/><path d="M5 20l4-5 3 2 1 4"/><path d="M9 15l2-6 4 1 2 4h3"/><path d="M11 9l-4 2"/>',
  bike: '<circle cx="5.5" cy="16" r="3.5"/><circle cx="18.5" cy="16" r="3.5"/><path d="M5.5 16l4-8h5.5l3.5 8M9.5 8L12 16H5.5M13 5h3"/>',
  trainer: '<circle cx="6" cy="12" r="3.6"/><circle cx="17.5" cy="12" r="3.6"/><path d="M6 12l3.6-6.5h5.2l2.7 6.5M9.6 5.5l2.4 6.5H6M12.6 3h2.4"/><path d="M14.5 21l3-5.4 3 5.4M3 21h18"/>',
  walk: '<circle cx="13" cy="4" r="2"/><path d="M9 21l2-6 3 3v3"/><path d="M10 15l1-6 3 1 2 3"/><path d="M11 9l-3 3"/>',
  pulse: '<path d="M3 12h4l2-6 4 12 2-6h6"/>',
  chart: '<path d="M4 20V11M10 20V5M16 20v-6M21 20H3"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  play: '<path d="M7 4.5l12.5 7.5L7 19.5z"/>',
  pause: '<path d="M6.5 4.5h3.5v15H6.5zM14 4.5h3.5v15H14z"/>',
  stop: '<rect x="5.5" y="5.5" width="13" height="13" rx="2.5"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7"/>',
  trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',
  up: '<path d="M6 15l6-6 6 6"/>',
  down: '<path d="M6 9l6 6 6-6"/>',
  back: '<path d="M15 5l-7 7 7 7"/>',
  chev: '<path d="M9 5l7 7-7 7"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  upload: '<path d="M12 16V4M7 9l5-5 5 5M4 20h16"/>',
  download: '<path d="M12 4v12M7 11l5 5 5-5M4 20h16"/>',
  edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/>',
  x: '<path d="M6 6l12 12M18 6L6 18"/>',
  pin: '<path d="M12 21s-7-6.5-7-12a7 7 0 0114 0c0 5.5-7 12-7 12z"/><circle cx="12" cy="9" r="2.5"/>',
  trophy: '<path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 01-10 0zM7 6H4a3 3 0 003 4M17 6h3a3 3 0 01-3 4"/>',
  copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 00-1-1H5a1 1 0 00-1 1v10a1 1 0 001 1h3"/>',
  list: '<path d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01"/>',
  link: '<path d="M10 14a4 4 0 005.7 0l3-3a4 4 0 00-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 00-5.7 0l-3 3a4 4 0 005.7 5.7l1-1"/>',
};
const FILLED = new Set(['play', 'pause', 'stop']);
function ic(n, cls = '') {
  const attrs = FILLED.has(n)
    ? 'fill="currentColor" stroke="none"'
    : 'fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';
  return `<svg class="ic ${cls}" viewBox="0 0 24 24" aria-hidden="true" ${attrs}>${ICONS[n] || ''}</svg>`;
}

/* =========================================================
   Hilfsfunktionen
   ========================================================= */
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
const pad = n => String(n).padStart(2, '0');
const clone = o => JSON.parse(JSON.stringify(o));
const num = v => (v === '' || v == null) ? NaN : parseFloat(String(v).replace(',', '.'));
const fmtN = (n, d = 0) => (+n || 0).toLocaleString('de-DE', { maximumFractionDigits: d });
const fmtKg = n => fmtN(n, 2);
const kgInput = n => (n ? String(n).replace('.', ',') : '');

function fmtDur(sec) {
  sec = Math.max(0, Math.round(sec || 0));
  const h = Math.floor(sec / 3600), m = Math.floor(sec % 3600 / 60), s = sec % 60;
  return h ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}
function fmtDurShort(sec) {
  const m = Math.round((sec || 0) / 60);
  if (m < 60) return `${m} min`;
  return `${Math.floor(m / 60)} h ${pad(m % 60)} min`;
}
function fmtHours(sec) {
  const m = Math.round((sec || 0) / 60);
  return m < 60 ? `${m} min` : `${Math.floor(m / 60)}:${pad(m % 60)} h`;
}
const statsCls = n => (n === 4 || n <= 2) ? 'stats c2' : 'stats c3';
const fmtKm = m => fmtN((m || 0) / 1000, 2);
function fmtPace(sec, m) {
  if (!m || m < 10 || !sec) return '–';
  const spk = sec / (m / 1000);
  return spk > 3600 ? '–' : fmtDur(spk);
}
function fmtSpeed(sec, m) {
  if (!m || !sec) return '–';
  return fmtN((m / 1000) / (sec / 3600), 1);
}
const rateStr = (sport, sec, m) => sp(sport).pace ? `${fmtPace(sec, m)} /km` : `${fmtSpeed(sec, m)} km/h`;
const fmtDate = ts => new Date(ts).toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
const fmtDateShort = ts => new Date(ts).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: '2-digit' });
const fmtTime = ts => new Date(ts).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });

function relDay(ts) {
  const d = new Date(ts), t0 = new Date(); t0.setHours(0, 0, 0, 0);
  const d0 = new Date(d); d0.setHours(0, 0, 0, 0);
  const diff = Math.round((t0 - d0) / 864e5);
  if (diff === 0) return 'Heute';
  if (diff === 1) return 'Gestern';
  if (diff > 1 && diff < 7) return d.toLocaleDateString('de-DE', { weekday: 'long' });
  return d.toLocaleDateString('de-DE', d.getFullYear() === t0.getFullYear()
    ? { day: 'numeric', month: 'short' } : { day: 'numeric', month: 'short', year: 'numeric' });
}
function startOfWeek(date) {
  const d = new Date(date); d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - (d.getDay() + 6) % 7);
  return d.getTime();
}
function isoWeek(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const y0 = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d - y0) / 864e5 + 1) / 7);
}
const localDate = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const localTime = d => `${pad(d.getHours())}:${pad(d.getMinutes())}`;

function defaultName(sport, ts) {
  const h = new Date(ts).getHours();
  const part = h < 5 ? 'in der Nacht' : h < 11 ? 'am Morgen' : h < 14 ? 'am Mittag' : h < 18 ? 'am Nachmittag' : 'am Abend';
  return `${sp(sport).label} ${part}`;
}

// Geo
function hav(a, b) {
  const R = 6371000, r = Math.PI / 180;
  const dLat = (b[0] - a[0]) * r, dLon = (b[1] - a[1]) * r;
  const s = Math.sin(dLat / 2) ** 2 + Math.cos(a[0] * r) * Math.cos(b[0] * r) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(s)));
}
// Trackpunkt-Format: [lat, lon, zeit(ms), höhe, puls, segment]
function elevGain(tr) {
  let gain = 0, ref = null;
  for (const p of tr) {
    const e = p[3];
    if (e == null || isNaN(e)) continue;
    if (ref == null) { ref = e; continue; }
    if (e - ref >= 3) { gain += e - ref; ref = e; } else if (ref - e >= 3) ref = e;
  }
  return Math.round(gain);
}
function trackCum(tr) {
  const out = []; let d = 0, t = 0;
  for (let i = 0; i < tr.length; i++) {
    if (i > 0) {
      const p = tr[i], q = tr[i - 1];
      if ((p[5] || 0) === (q[5] || 0)) {
        if (p[0] != null && q[0] != null) d += hav(q, p);
        if (p[2] && q[2]) t += Math.max(0, (p[2] - q[2]) / 1000);
      }
    }
    out.push([d, t]);
  }
  return out;
}
function splits(tr, step) {
  const c = trackCum(tr), res = [];
  if (!c.length || !c[c.length - 1][1]) return res;
  let next = step, lastT = 0, lastD = 0;
  for (let i = 1; i < c.length; i++) {
    while (c[i][0] >= next) {
      const [d0, t0] = c[i - 1], [d1, t1] = c[i];
      const f = d1 > d0 ? (next - d0) / (d1 - d0) : 1;
      const tk = t0 + f * (t1 - t0);
      res.push({ km: next / 1000, time: tk - lastT, dist: step });
      lastT = tk; lastD = next; next += step;
    }
  }
  const end = c[c.length - 1];
  if (end[0] - lastD > step * 0.05) res.push({ km: end[0] / 1000, time: end[1] - lastT, dist: end[0] - lastD, partial: true });
  return res;
}

/* =========================================================
   Speicher (IndexedDB als Key-Value-Store)
   ========================================================= */
const DB_NAME = 'sportlog', STORE = 'kv';
let dbp = null;
function openDB() {
  if (!dbp) dbp = new Promise((res, rej) => {
    const r = indexedDB.open(DB_NAME, 1);
    r.onupgradeneeded = () => r.result.createObjectStore(STORE);
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });
  return dbp;
}
async function kvGet(k) {
  const d = await openDB();
  return new Promise((res, rej) => {
    const q = d.transaction(STORE, 'readonly').objectStore(STORE).get(k);
    q.onsuccess = () => res(q.result); q.onerror = () => rej(q.error);
  });
}
async function kvSet(k, v) {
  const d = await openDB();
  return new Promise((res, rej) => {
    const tx = d.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).put(v, k);
    tx.oncomplete = () => res(); tx.onerror = () => rej(tx.error);
  });
}

const S = {
  exercises: [], plans: [], sessions: [], activities: [],
  settings: { rest: 90, lastBackup: null },
  activeWorkout: null, recording: null,
};
const KEYS = ['exercises', 'plans', 'sessions', 'activities', 'settings', 'activeWorkout', 'recording'];
const pending = {};
let askedPersist = false;
function persist(k, delay = 0) {
  clearTimeout(pending[k]?.t);
  const run = () => {
    delete pending[k];
    kvSet(k, S[k] ?? null).catch(e => { console.error(e); toast('Speichern fehlgeschlagen'); });
    if (!askedPersist && navigator.storage?.persist) { askedPersist = true; navigator.storage.persist().catch(() => {}); }
  };
  if (!delay) return run();
  pending[k] = { t: setTimeout(run, delay), run };
}
function flushPersist() { for (const k of Object.keys(pending)) { clearTimeout(pending[k].t); pending[k].run(); } }

async function load() {
  for (const k of KEYS) {
    const v = await kvGet(k);
    if (v !== undefined && v !== null) S[k] = v;
  }
  S.settings = Object.assign({ rest: 90, lastBackup: null }, S.settings);
  if (!(await kvGet('seeded'))) {
    if (!S.exercises.length) S.exercises = DEFAULT_EXERCISES.map(([name, group]) => ({ id: uid(), name, group }));
    persist('exercises');
    await kvSet('seeded', true);
  }
}

/* =========================================================
   Daten-Abfragen
   ========================================================= */
const exById = id => S.exercises.find(e => e.id === id);
const exName = (id, fallback) => exById(id)?.name || fallback || 'Gelöschte Übung';

/* ---------- Piktogramme ----------
   Zuordnung über den Namen (oder von Hand im Übungsdialog gewählt). */
const PX = typeof PICTOS === 'object' ? PICTOS : {};
const PXN = typeof PICTO_NAMES === 'object' ? PICTO_NAMES : {};
const GEF = /gef(ü|ue)hrt|smith|multipresse/;
const ICON_RULES = [
  [/schr(ä|ae)gbank|incline/, n => GEF.test(n) ? 'incline_smith' : 'incline_db'],
  [/bankdr|bench/, 'bench'],
  [/revers.*(butterfly|fly)|butterfly.*revers|rear.?delt/, 'reverse_fly'],
  [/butterfly|\bfly|flys/, 'fly'],
  [/\bdips/, 'dips'],
  [/liegest|push.?up/, 'pushup'],
  [/kreuzheb|deadlift|\brdl/, 'deadlift'],
  [/klimmz|pull.?up|chin.?up/, 'pullup'],
  [/latzug|pulldown/, n => /eng|close|v.?griff/.test(n) ? 'pulldown_close' : 'pulldown'],
  [/t.?bar/, 'tbar_row'],
  [/kabelrudern|rudern.*kabel|cable.?row/, 'cable_row'],
  [/rudern.*masch|masch.*rudern|machine.?row/, 'machine_row'],
  [/rudern|\brow\b/, 'bb_row'],
  [/(ü|ue|u)berz(ü|ue|u)g|pullover|straight.?arm/, 'pullover'],
  [/hackenschmidt|hack/, 'hack'],
  [/beinpresse|leg.?press/, 'legpress'],
  [/beinstreck|leg.?ext/, 'legext'],
  [/beinbeug|leg.?curl/, 'legcurl'],
  [/wade|calf/, n => /sitz|seated/.test(n) ? 'calf_seated' : 'calf_standing'],
  [/kniebeug|squat/, 'squat'],
  [/schulterdr|military|overhead.?press|\bohp/, n => GEF.test(n) ? 'ohp_smith' : /masch/.test(n) ? 'ohp_machine' : 'ohp_db'],
  [/seitheb|lateral/, n => /kabel|cable/.test(n) ? 'lateral_cable' : /masch/.test(n) ? 'lateral_machine' : 'lateral_db'],
  [/face.?pull|hintere schulter/, 'facepull'],
  [/hammer/, 'hammer'],
  [/(ü|ue|u)bergriff|obergriff|reverse.?curl/, 'curl_overhand'],
  [/french|stirn|skull/, 'frenchpress'],
  [/curl|bizeps/, n => /vorgebeugt|bent/.test(n) ? 'curl_bentover' : /\bsz|stange|langhantel/.test(n) ? 'curl_sz' : 'curl'],
  [/trizeps|triceps|pushdown/, n => /seil|rope/.test(n) ? 'tri_rope' : /einarm|single/.test(n) ? 'tri_single' : 'tri_bar'],
  [/toe|zehen|beinheben/, 'toes2bar'],
  [/scheibenwisch|wiper/, 'wipers'],
  [/bauchmasch|crunch.*masch|ab.?machine/, 'abmachine'],
];
function matchIcon(name) {
  const n = String(name || '').toLowerCase();
  for (const [re, k] of ICON_RULES) if (re.test(n)) { const key = typeof k === 'function' ? k(n) : k; return PX[key] ? key : null; }
  return null;
}
function exIconKey(id, fallbackName) {
  const ex = exById(id);
  if (ex?.icon && PX[ex.icon]) return ex.icon;
  return matchIcon(ex?.name || fallbackName);
}
const pictoSvg = key => `<svg class="px" viewBox="0 0 64 64" aria-hidden="true">${PX[key]}</svg>`;
const pictoByKey = (key, cls = '') => `<span class="pb ${cls}">${key && PX[key] ? pictoSvg(key) : ic('dumbbell')}</span>`;
const picto = (id, cls = '', fallbackName) => pictoByKey(exIconKey(id, fallbackName), cls);
const sessionVolume = s => s.exercises.reduce((a, e) => a + e.sets.reduce((b, x) => b + (x.kg || 0) * (x.reps || 0), 0), 0);
const sessionSets = s => s.exercises.reduce((a, e) => a + e.sets.length, 0);
const sessionReps = s => s.exercises.reduce((a, e) => a + e.sets.reduce((b, x) => b + (x.reps || 0), 0), 0);
const e1rm = x => (x.kg > 0 && x.reps > 0) ? x.kg * (1 + x.reps / 30) : 0;
const entryKey = e => e.kind === 'strength' ? 'str' : (SPORTS[e.sport] ? e.sport : 'other');

function allEntries() {
  return [
    ...S.sessions.map(s => ({ ...s, kind: 'strength' })),
    ...S.activities.map(a => ({ ...a, kind: 'cardio' })),
  ].sort((a, b) => b.start - a.start);
}
function entryDuration(e) { return e.kind === 'strength' ? (e.end - e.start) / 1000 : (e.duration || 0); }

function lastPerformance(exId, excludeId, before = Infinity) {
  const list = S.sessions.filter(s => s.id !== excludeId && s.start < before).sort((a, b) => b.start - a.start);
  for (const s of list) {
    const e = s.exercises.find(x => x.exerciseId === exId);
    if (e && e.sets.length) return { date: s.start, sets: e.sets };
  }
  return null;
}
function exerciseHistory(exId) {
  return S.sessions.filter(s => s.exercises.some(e => e.exerciseId === exId))
    .sort((a, b) => a.start - b.start)
    .map(s => {
      const sets = s.exercises.filter(e => e.exerciseId === exId).flatMap(e => e.sets);
      return {
        session: s, date: s.start, sets,
        maxKg: Math.max(0, ...sets.map(x => x.kg)),
        e1: Math.max(0, ...sets.map(e1rm)),
        vol: sets.reduce((a, x) => a + x.kg * x.reps, 0),
        reps: sets.reduce((a, x) => a + x.reps, 0),
        maxReps: Math.max(0, ...sets.map(x => x.reps)),
      };
    });
}
const setsText = sets => sets.every(x => !x.kg) ? `${sets.map(x => x.reps).join(' · ')} Wdh.` : sets.map(x => x.kg ? `${fmtKg(x.kg)}×${x.reps}` : `${x.reps} Wdh.`).join(' · ');

/* ---------- Supersätze ----------
   item.link = true heißt: mit der nächsten Übung als Supersatz verbunden.
   Aufeinanderfolgende verbundene Übungen bilden eine Gruppe. */
function ssGroups(items) {
  const g = [];
  items.forEach((it, i) => { if (i === 0 || !items[i - 1].link) g.push([]); g[g.length - 1].push(i); });
  return g;
}
function fixLinks(items) { if (items.length) items[items.length - 1].link = false; }
function moveBlock(items, i, dir) {
  const g = ssGroups(items), gi = g.findIndex(x => x.includes(i)), gj = gi + dir;
  if (gi < 0 || gj < 0 || gj >= g.length) return items;
  [g[gi], g[gj]] = [g[gj], g[gi]];
  return g.flat().map(k => items[k]);
}
function removeItem(items, i) {
  if (!items[i].link && i > 0) items[i - 1].link = false;
  items.splice(i, 1); fixLinks(items);
}
function moveTools(i, gi, n, action) {
  return `<button class="icon-btn sm" data-a="${action}" data-i="${i}" data-d="-1" ${gi === 0 ? 'disabled' : ''} aria-label="Nach oben">${ic('up')}</button>
    <button class="icon-btn sm" data-a="${action}" data-i="${i}" data-d="1" ${gi === n - 1 ? 'disabled' : ''} aria-label="Nach unten">${ic('down')}</button>`;
}
function linkBtn(i, linked, action) {
  return linked
    ? `<div class="ss-link on"><button data-a="${action}" data-i="${i}">${ic('x')}Verbindung lösen</button></div>`
    : `<div class="ss-link"><button data-a="${action}" data-i="${i}">${ic('link')}Als Supersatz verbinden</button></div>`;
}
// Rendert eine Übungsliste, Supersätze werden als Gruppe umrahmt.
// card(i, inGroup, gi, nGroups) liefert die Karte einer Übung.
function groupedList(items, card, { linkAction = null, tools = null, sub = null } = {}) {
  const groups = ssGroups(items);
  return groups.map((g, gi) => {
    const inner = g.map((i, k) => card(i, g.length > 1, gi, groups.length) + (k < g.length - 1 && linkAction ? linkBtn(i, true, linkAction) : '')).join('');
    const body = g.length > 1
      ? `<div class="ss-group"><div class="ss-head"><span class="ss-tag">${ic('link')}Supersatz</span><small>${sub ? sub(g) : ''}</small>${tools ? `<span class="tools">${tools(g[0], gi, groups.length)}</span>` : ''}</div>${inner}</div>`
      : inner;
    return body + (linkAction && gi < groups.length - 1 ? linkBtn(g[g.length - 1], false, linkAction) : '');
  }).join('');
}

/* ---------- Leistung & Bestwerte ---------- */
const RANGES = [['1m', '4 Wochen', 28], ['3m', '3 Monate', 91], ['6m', '6 Monate', 182], ['1y', '1 Jahr', 365], ['all', 'Alles', 0]];
let progRange = '3m';
const rangeDays = k => (RANGES.find(r => r[0] === k) || RANGES[1])[2];
const rangeLabel = k => (RANGES.find(r => r[0] === k) || RANGES[1])[1];
const rangeStart = k => rangeDays(k) ? Date.now() - rangeDays(k) * 864e5 : 0;
const rangeChips = () => `<div class="chips">${RANGES.map(([k, l]) => `<button class="${k === progRange ? 'on' : ''}" data-a="progRange" data-r="${k}">${l}</button>`).join('')}</div>`;
const isBodyweight = h => h.length > 0 && h.every(x => x.maxKg === 0);
const perfVal = (x, bw) => bw ? x.maxReps : x.e1;

// Alle neuen Bestwerte in zeitlicher Reihenfolge (das allererste Training einer Übung zählt nicht)
function prEvents() {
  const best = {}, out = [];
  for (const s of [...S.sessions].sort((a, b) => a.start - b.start)) {
    const byEx = {};
    for (const e of s.exercises) (byEx[e.exerciseId] ||= { name: e.name, sets: [] }).sets.push(...e.sets);
    for (const [id, { name, sets }] of Object.entries(byEx)) {
      const kg = Math.max(0, ...sets.map(x => x.kg)), e1 = Math.max(0, ...sets.map(e1rm)), reps = Math.max(0, ...sets.map(x => x.reps));
      const b = best[id];
      if (b) {
        let ev = null;
        if (kg > 0 && kg > b.kg) {
          const set = sets.filter(x => x.kg === kg).sort((p, q) => q.reps - p.reps)[0];
          ev = { type: 'kg', label: 'Gewichts', value: `${fmtKg(kg)} kg × ${set.reps}`, prev: b.kg ? `${fmtKg(b.kg)} kg` : '' };
        } else if (kg > 0 && e1 > b.e1 + 0.05) {
          const set = sets.reduce((p, q) => e1rm(q) > e1rm(p) ? q : p);
          ev = { type: 'e1', label: '1RM', value: `${fmtKg(set.kg)} kg × ${set.reps}`, prev: `1RM ${fmtN(b.e1, 1)} → ${fmtN(e1, 1)} kg` };
        } else if (kg === 0 && b.kg === 0 && reps > b.reps) {
          ev = { type: 'reps', label: 'Wiederholungs', value: `${reps} Wdh.`, prev: `${b.reps} Wdh.` };
        }
        if (ev) out.push({ ...ev, date: s.start, sessionId: s.id, exerciseId: id, name });
      }
      best[id] = { kg: Math.max(b?.kg || 0, kg), e1: Math.max(b?.e1 || 0, e1), reps: Math.max(b?.reps || 0, reps) };
    }
  }
  return out;
}
function deltaTag(d, unit, dec, label = '') {
  const cls = Math.abs(d) < (dec ? 0.05 : 0.5) ? 'flat' : d > 0 ? 'up' : 'down';
  const sign = cls === 'flat' ? '±' : d > 0 ? '+' : '−';
  return `<span class="delta ${cls}">${label ? label + ' ' : ''}${sign}${fmtN(cls === 'flat' ? 0 : Math.abs(d), dec)}${unit ? (unit === '%' ? ' %' : ' ' + unit) : ''}</span>`;
}
const pctTag = (a, b, label) => b ? deltaTag((a - b) / b * 100, '%', 0, label) : '';
// Vergleich einer Übung mit dem letzten Training davor
function compareLast(e, s) {
  const last = lastPerformance(e.exerciseId, s.id, s.start); if (!last) return '';
  const vol = sets => sets.reduce((a, x) => a + x.kg * x.reps, 0);
  const bw = e.sets.every(x => !x.kg) && last.sets.every(x => !x.kg);
  const tags = bw
    ? [deltaTag(Math.max(...e.sets.map(x => x.reps)) - Math.max(...last.sets.map(x => x.reps)), 'Wdh.', 0, 'Max.'),
       deltaTag(e.sets.reduce((a, x) => a + x.reps, 0) - last.sets.reduce((a, x) => a + x.reps, 0), 'Wdh.', 0, 'Gesamt')]
    : [deltaTag(Math.max(...e.sets.map(e1rm)) - Math.max(...last.sets.map(e1rm)), 'kg', 1, '1RM'), pctTag(vol(e.sets), vol(last.sets), 'Volumen')];
  return `<div class="cmp"><span>vs. ${relDay(last.date)}</span>${tags.join('')}</div>`;
}
// Schwerster Satz je Wiederholungszahl (nur Sätze, die kein schwererer Satz mit mehr Wdh. übertrifft)
function bestSets(hist) {
  const sets = hist.flatMap(x => x.sets.filter(s => s.kg > 0).map(s => ({ ...s, date: x.date, sid: x.session.id })));
  sets.sort((a, b) => b.reps - a.reps || b.kg - a.kg || a.date - b.date);
  const out = []; let maxKg = 0;
  for (const s of sets) if (s.kg > maxKg) { out.push(s); maxKg = s.kg; }
  return out.reverse();
}
function strengthBuckets(start) {
  const first = start || Math.min(Date.now(), ...S.sessions.map(s => s.start));
  const monthly = (Date.now() - first) / 864e5 > 190;
  const b = [];
  if (monthly) {
    const d = new Date(first); d.setDate(1); d.setHours(0, 0, 0, 0);
    while (d.getTime() <= Date.now()) { b.push({ start: d.getTime(), label: d.toLocaleDateString('de-DE', { month: 'short' }).replace('.', ''), v: 0 }); d.setMonth(d.getMonth() + 1); }
  } else {
    let t = startOfWeek(new Date(first));
    while (t <= Date.now()) { const d = new Date(t); b.push({ start: t, label: String(isoWeek(d)), v: 0 }); d.setDate(d.getDate() + 7); t = d.getTime(); }
  }
  const data = b.slice(-24);
  for (const s of S.sessions) {
    if (s.start < data[0].start) continue;
    let k = data.length - 1; while (k > 0 && s.start < data[k].start) k--;
    data[k].v += sessionVolume(s) / 1000;
  }
  return { data, monthly };
}
function sparkline(vals, color = 'var(--str)') {
  const W = 72, H = 28, p = 4;
  if (vals.length < 2) return `<svg class="spark" viewBox="0 0 ${W} ${H}" aria-hidden="true"><circle cx="${W - p}" cy="${H / 2}" r="3.5" fill="${color}"/></svg>`;
  const mn = Math.min(...vals), mx = Math.max(...vals);
  const X = i => p + i / (vals.length - 1) * (W - 2 * p), Y = v => mx === mn ? H / 2 : H - p - (v - mn) / (mx - mn) * (H - 2 * p);
  const pts = vals.map((v, i) => `${X(i).toFixed(1)},${Y(v).toFixed(1)}`).join(' ');
  return `<svg class="spark" viewBox="0 0 ${W} ${H}" aria-hidden="true"><polyline points="${pts}" fill="none" stroke="${color}" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"/><circle cx="${X(vals.length - 1).toFixed(1)}" cy="${Y(vals[vals.length - 1]).toFixed(1)}" r="3.5" fill="${color}"/></svg>`;
}

/* =========================================================
   Navigation & Rendering
   ========================================================= */
let view = { name: 'home', p: {} };
const TAB_OF = {
  home: 'home', strength: 'strength', planEdit: 'strength', workout: 'strength', session: 'strength',
  exercises: 'strength', exercise: 'strength', progress: 'strength', cardio: 'cardio', record: 'cardio', manual: 'cardio',
  activity: 'cardio', history: 'history', more: 'more',
};
const TABS = [['home', 'home', 'Start'], ['strength', 'dumbbell', 'Kraft'], ['cardio', 'run', 'Ausdauer'], ['history', 'chart', 'Verlauf'], ['more', 'menu', 'Mehr']];

function go(name, p = {}, replace = false) {
  view = { name, p };
  replace ? history.replaceState(view, '') : history.pushState(view, '');
  render();
  window.scrollTo(0, 0);
}
window.addEventListener('popstate', e => {
  if (view.name === 'planEdit') planDraft = null;
  closeSheet();
  view = e.state && VIEWS[e.state.name] ? e.state : { name: 'home', p: {} };
  render();
});

function render() {
  const fn = VIEWS[view.name] || vHome;
  $('#main').innerHTML = fn(view.p || {});
  const tab = TAB_OF[view.name];
  $('#nav').innerHTML = TABS.map(([v, icon, label]) =>
    `<button class="${tab === v ? 'on' : ''}" data-a="nav" data-v="${v}">${ic(icon)}<span>${label}</span></button>`).join('');
  if (view.name !== 'record' && !S.recording) stopGeo();
  document.body.classList.toggle('has-rest', view.name === 'workout');
  updateBanner(); updateRest();
}

function head(title, { back = false, right = '' } = {}) {
  return `<header class="top">${back ? `<button class="icon-btn" data-a="back" aria-label="Zurück">${ic('back')}</button>` : ''}<h1>${title}</h1><div class="top-right">${right}</div></header>`;
}
const notFound = () => `${head('Nicht gefunden', { back: true })}<div class="empty">Dieser Eintrag existiert nicht mehr.</div>`;

/* ---------- Toast & Sheet ---------- */
let toastT = null;
function toast(msg) {
  const t = $('#toast'); t.textContent = msg; t.classList.add('show');
  clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 2600);
}
let askResolve = null;
function openSheet(html) { settleAsk(false); $('#sheet').innerHTML = html; $('#sheetWrap').classList.remove('hidden'); }
function closeSheet() { settleAsk(false); $('#sheetWrap').classList.add('hidden'); $('#sheet').innerHTML = ''; }
function settleAsk(v) { const r = askResolve; askResolve = null; r?.(v); }
// Eigene Rückfrage statt Browser-Dialog: funktioniert überall, auch in der Vorschau
function ask(msg, { ok = 'OK', cancel = 'Abbrechen', danger = false } = {}) {
  return new Promise(res => {
    openSheet(`<div class="ask"><p>${esc(msg)}</p><div class="two">
      <button class="btn" data-a="askNo">${cancel}</button>
      <button class="btn ${danger ? 'danger' : 'primary'}" data-a="askYes">${ok}</button></div></div>`);
    askResolve = res;
  });
}

/* =========================================================
   Entry-Zeile (Listen)
   ========================================================= */
function entryRow(e) {
  let title, sub, icon;
  if (e.kind === 'strength') {
    icon = 'dumbbell'; title = e.name || 'Krafttraining';
    const v = sessionVolume(e), n = e.exercises.length;
    sub = [relDay(e.start), `${n} Übung${n === 1 ? '' : 'en'}`, v ? `${fmtN(v)} kg` : null, fmtDurShort((e.end - e.start) / 1000)];
  } else {
    const s = sp(e.sport); icon = s.icon; title = e.name || s.label;
    sub = [relDay(e.start), e.distance ? `${fmtKm(e.distance)} km` : null, fmtDur(e.duration),
      e.avgPower ? `Ø ${e.avgPower} W` : e.distance >= 100 && e.duration ? rateStr(e.sport, e.duration, e.distance) : null];
  }
  return `<button class="entry" data-a="open" data-kind="${e.kind}" data-id="${e.id}">
    <span class="badge" style="--c:var(--${entryKey(e)})">${ic(icon)}</span>
    <span class="entry-txt"><b>${esc(title)}</b><small>${esc(sub.filter(Boolean).join(' · '))}</small></span>${ic('chev', 'chev')}</button>`;
}

/* =========================================================
   VIEW: Start
   ========================================================= */
function vHome() {
  const ws = startOfWeek(new Date());
  const entries = allEntries();
  const week = entries.filter(e => e.start >= ws);
  const today = new Date().toDateString();
  let strip = '';
  for (let i = 0; i < 7; i++) {
    const d = new Date(ws); d.setDate(d.getDate() + i);
    const d1 = new Date(d); d1.setDate(d1.getDate() + 1);
    const keys = [...new Set(week.filter(e => e.start >= d.getTime() && e.start < d1.getTime()).map(entryKey))];
    strip += `<div class="day ${d.toDateString() === today ? 'today' : ''}">
      <span>${d.toLocaleDateString('de-DE', { weekday: 'short' }).slice(0, 2)}</span><b>${d.getDate()}</b>
      <i>${keys.map(k => `<em style="background:var(--${k})"></em>`).join('')}</i></div>`;
  }
  const time = week.reduce((a, e) => a + entryDuration(e), 0);
  const runKm = week.filter(e => e.sport === 'run').reduce((a, e) => a + e.distance, 0);
  const bikeKm = week.filter(e => e.sport === 'bike').reduce((a, e) => a + e.distance, 0);
  const h = new Date().getHours();
  const hello = h < 5 ? 'Gute Nacht' : h < 11 ? 'Guten Morgen' : h < 18 ? 'Hallo' : 'Guten Abend';

  return `
  <header class="hero">
    <small>${new Date().toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' })}</small>
    <h1>${hello}!</h1>
  </header>
  <section class="card">
    <div class="card-head"><h2>Diese Woche</h2><span class="muted">KW ${isoWeek(new Date())}</span></div>
    <div class="week">${strip}</div>
    <div class="kpis">
      <div><b>${week.length}</b><span>Einheiten</span></div>
      <div><b>${fmtHours(time)}</b><span>Trainingszeit</span></div>
      <div><b style="color:var(--run)">${fmtN(runKm / 1000, 1)}</b><span>km Laufen</span></div>
      <div><b style="color:var(--bike)">${fmtN(bikeKm / 1000, 1)}</b><span>km Rad</span></div>
    </div>
  </section>
  <section class="quick">
    <button data-a="nav" data-v="strength" style="--c:var(--str)">${ic('dumbbell')}<span>Krafttraining</span></button>
    <button data-a="goRecord" data-sport="run" style="--c:var(--run)">${ic('run')}<span>Lauf starten</span></button>
    <button data-a="goRecord" data-sport="bike" style="--c:var(--bike)">${ic('bike')}<span>Radfahrt starten</span></button>
    <button data-a="manual" style="--c:var(--walk)">${ic('edit')}<span>Nachtragen</span></button>
  </section>
  <section>
    <div class="sec-head"><h2>Zuletzt</h2>${entries.length > 5 ? '<button class="link" data-a="nav" data-v="history">Alle</button>' : ''}</div>
    <div class="list">${entries.slice(0, 5).map(entryRow).join('') || '<div class="empty">Noch keine Einträge. Starte dein erstes Training!</div>'}</div>
  </section>`;
}

/* =========================================================
   VIEW: Krafttraining (Pläne)
   ========================================================= */
function vStrength() {
  const w = S.activeWorkout;
  const plans = S.plans.map(p => {
    const last = S.sessions.filter(s => s.planId === p.id).sort((a, b) => b.start - a.start)[0];
    const names = p.items.map(it => exName(it.exerciseId)).join(', ');
    return `<div class="plan-card">
      <button class="plan-main" data-a="editPlan" data-id="${p.id}">
        <b>${esc(p.name)}</b>
        <small>${p.items.length} Übung${p.items.length === 1 ? '' : 'en'}${last ? ` · zuletzt ${relDay(last.start)}` : ''}</small>
        <small class="muted clamp">${esc(names) || 'Noch keine Übungen'}</small>
      </button>
      <button class="btn primary" data-a="startWorkout" data-plan="${p.id}">${ic('play')}Start</button>
    </div>`;
  }).join('');
  return `${head('Krafttraining')}
  ${w ? `<button class="resume" data-a="nav" data-v="workout">${ic('dumbbell')}<span><b>${w.editingId ? 'Bearbeitung offen' : 'Training läuft'}</b><small>${esc(w.name)} – tippen zum Fortsetzen</small></span>${ic('chev', 'chev')}</button>` : ''}
  <div class="sec-head"><h2>Trainingspläne</h2><button class="link" data-a="newPlan">${ic('plus')}Neuer Plan</button></div>
  <div class="list">${plans || `<div class="empty">Noch kein Plan.<br>Lege z. B. „Push", „Pull" und „Beine" an.<br><button class="btn primary" data-a="newPlan">${ic('plus')}Ersten Plan erstellen</button></div>`}</div>
  <button class="btn block ghost" data-a="startWorkout" data-plan="">${ic('play')}Freies Training ohne Plan</button>
  <div class="sec-head"><h2>Fortschritt</h2></div>
  <div class="list">
    <button class="entry" data-a="nav" data-v="progress"><span class="badge" style="--c:var(--warn)">${ic('trophy')}</span>
      <span class="entry-txt"><b>Leistung & Bestwerte</b><small>${pr4Text()}</small></span>${ic('chev', 'chev')}</button>
    <button class="entry" data-a="nav" data-v="exercises"><span class="badge" style="--c:var(--str)">${ic('list')}</span>
      <span class="entry-txt"><b>Übungen</b><small>${S.exercises.length} Übungen · Verlauf und Diagramm je Übung</small></span>${ic('chev', 'chev')}</button>
  </div>`;
}
function pr4Text() {
  if (!S.sessions.length) return 'Trends, Rekorde und Volumen je Übung';
  const n = prEvents().filter(p => p.date >= Date.now() - 28 * 864e5).length;
  return `${n} neue${n === 1 ? 'r' : ''} Bestwert${n === 1 ? '' : 'e'} in 4 Wochen · Trend je Übung`;
}

/* ---------- Plan bearbeiten ---------- */
let planDraft = null;
function vPlanEdit(p) {
  const existing = S.plans.find(x => x.id === p.id);
  if (!planDraft || planDraft.id !== p.id) planDraft = existing ? clone(existing) : { id: p.id, name: '', items: [] };
  const d = planDraft;
  const card = (i, inGroup, gi, n) => {
    const it = d.items[i];
    return `<div class="pi-card">
      <div class="pi-head"><span class="pi-name">${picto(it.exerciseId, 'sm')}<b>${esc(exName(it.exerciseId))}</b></span>
        <span class="tools">${inGroup ? '' : moveTools(i, gi, n, 'planMove')}
          <button class="icon-btn sm danger" data-a="planRemove" data-i="${i}" aria-label="Entfernen">${ic('trash')}</button>
        </span></div>
      <div class="pi-fields">
        <label><span>Sätze</span><input inputmode="numeric" data-i="planItem" data-idx="${i}" data-f="sets" value="${esc(it.sets)}"></label>
        <label><span>Wdh.</span><input data-i="planItem" data-idx="${i}" data-f="reps" value="${esc(it.reps)}" placeholder="z. B. 8-12"></label>
        ${it.link
          ? '<label><span>Pause</span><span class="no-rest">direkt weiter</span></label>'
          : `<label><span>${inGroup ? 'Pause/Runde' : 'Pause (s)'}</span><input inputmode="numeric" data-i="planItem" data-idx="${i}" data-f="rest" value="${esc(it.rest)}"></label>`}
      </div>
    </div>`;
  };
  const items = groupedList(d.items, card, {
    linkAction: 'planLink',
    tools: (i, gi, n) => moveTools(i, gi, n, 'planMove'),
    sub: g => `${g.length} Übungen im Wechsel`,
  });
  return `${head(existing ? 'Plan bearbeiten' : 'Neuer Plan', { back: true, right: `<button class="btn primary sm" data-a="savePlan">Speichern</button>` })}
  <label class="field"><span>Name des Plans</span><input data-i="planName" value="${esc(d.name)}" placeholder="z. B. Push-Tag"></label>
  <div class="sec-head"><h2>Übungen</h2><span class="muted">${d.items.length}</span></div>
  ${d.items.length > 1 ? '<p class="hint">Supersatz: zwei Übungen im Wechsel ohne Pause, z. B. Bizeps und Trizeps. Die Pause kommt erst nach jeder Runde.</p>' : ''}
  <div class="list">${items || '<div class="empty small">Noch keine Übungen im Plan.</div>'}</div>
  <button class="btn block" data-a="openPicker" data-t="plan">${ic('plus')}Übung hinzufügen</button>
  ${existing ? `<button class="btn block danger-ghost" data-a="deletePlan">${ic('trash')}Plan löschen</button>` : ''}`;
}

/* ---------- Übungsauswahl (Sheet) ---------- */
let pickerTarget = null;
function openPicker(target) {
  pickerTarget = target;
  openSheet(`
    <div class="sheet-head"><h3>Übung hinzufügen</h3><button class="btn primary sm" data-a="closeSheet">Fertig</button></div>
    <input class="search" type="search" placeholder="Übung suchen …" data-i="pickq" autocomplete="off">
    <div id="picklist">${pickList('')}</div>
    <details class="newex"><summary>${ic('plus')}Neue Übung anlegen</summary>
      <div class="newex-row"><input id="newExName" placeholder="Name der Übung">
      <select id="newExGroup">${GROUPS.map(g => `<option>${g}</option>`).join('')}</select>
      <button class="btn primary" data-a="createExercise">Anlegen</button></div>
    </details>`);
}
function pickList(q) {
  q = q.trim().toLowerCase();
  const list = S.exercises.filter(e => !q || e.name.toLowerCase().includes(q));
  if (!list.length) return '<div class="empty small">Keine Übung gefunden – unten neu anlegen.</div>';
  return GROUPS.map(g => {
    const xs = list.filter(e => (e.group || 'Sonstiges') === g).sort((a, b) => a.name.localeCompare(b.name, 'de'));
    if (!xs.length) return '';
    return `<div class="pick-group">${g}</div>` + xs.map(e => `<button class="pick" data-a="pick" data-id="${e.id}">${picto(e.id, 'sm')}<span>${esc(e.name)}</span>${ic('plus')}</button>`).join('');
  }).join('');
}
function addExerciseToTarget(id) {
  if (pickerTarget === 'plan' && planDraft) {
    planDraft.items.push({ exerciseId: id, sets: 3, reps: '8-12', rest: S.settings.rest });
  } else if (pickerTarget === 'workout' && S.activeWorkout) {
    S.activeWorkout.exercises.push(makeWorkoutExercise(id, 3, '', S.settings.rest));
    persist('activeWorkout');
  }
  render();
  toast(`${exName(id)} hinzugefügt`);
}

/* =========================================================
   VIEW: Training durchführen
   ========================================================= */
function makeWorkoutExercise(exId, nSets, target, rest, excludeId, before) {
  const last = lastPerformance(exId, excludeId, before);
  const sets = [];
  const n = Math.max(1, parseInt(nSets) || (last ? last.sets.length : 3));
  for (let i = 0; i < n; i++) {
    const ls = last ? (last.sets[i] || last.sets[last.sets.length - 1]) : null;
    sets.push({
      kg: '', reps: '', done: false,
      phKg: ls ? kgInput(ls.kg) : '', phReps: ls ? String(ls.reps) : (parseInt(target) ? String(parseInt(target)) : ''),
      src: ls ? 'last' : 'plan',
    });
  }
  return { exerciseId: exId, target: target || '', rest: parseInt(rest) || S.settings.rest, sets, last };
}

function startWorkout(planId) {
  if (S.activeWorkout) { toast('Es läuft bereits ein Training'); go('workout'); return; }
  const plan = planId ? S.plans.find(p => p.id === planId) : null;
  const w = { id: uid(), planId: plan ? plan.id : null, name: plan ? plan.name : 'Freies Training', start: Date.now(), exercises: [], note: '', restEnd: null, restTotal: 0 };
  if (plan) for (const it of plan.items) w.exercises.push({ ...makeWorkoutExercise(it.exerciseId, it.sets, it.reps, it.rest), link: !!it.link });
  S.activeWorkout = w; persist('activeWorkout');
  go('workout');
  if (!plan) openPicker('workout');
}

function vWorkout() {
  const w = S.activeWorkout;
  if (!w) return `${head('Training', { back: true })}<div class="empty">Kein Training aktiv.<br><button class="btn primary" data-a="nav" data-v="strength">Zu den Plänen</button></div>`;
  const editing = !!w.editingId;
  const card = (ei, inGroup, gi, n) => {
    const e = w.exercises[ei];
    const done = e.sets.filter(s => s.done).length;
    const restTxt = e.link ? 'danach direkt weiter' : e.rest ? (inGroup ? `Pause nach Runde ${e.rest}s` : `Pause ${e.rest}s`) : '';
    return `<div class="ex-card${inGroup ? ' in-ss' : ''}">
      <div class="ex-head">${picto(e.exerciseId, 'sm')}
        <button class="ex-title" data-a="openExercise" data-id="${e.exerciseId}"><b>${esc(exName(e.exerciseId))}</b>
          <small>${e.target ? `Ziel: ${e.sets.length} × ${esc(e.target)} · ` : ''}${done}/${e.sets.length} Sätze${restTxt ? ` · ${restTxt}` : ''}</small></button>
        <span class="tools">${inGroup ? '' : moveTools(ei, gi, n, 'exMove')}
          <button class="icon-btn sm danger" data-a="exRemove" data-e="${ei}" aria-label="Übung entfernen">${ic('trash')}</button>
        </span>
      </div>
      ${e.last ? `<div class="ex-last">Letztes Mal (${relDay(e.last.date)}): ${esc(setsText(e.last.sets))}</div>` : ''}
      <div class="sets">
        <div class="set-row head"><span>Satz</span><span>kg</span><span>Wdh.</span><span></span></div>
        ${e.sets.map((s, si) => `<div class="set-row ${s.done ? 'done' : ''}" data-row="${ei}-${si}">
          <span class="set-no">${si + 1}</span>
          <input inputmode="decimal" enterkeyhint="next" data-i="wset" data-e="${ei}" data-s="${si}" data-f="kg" value="${esc(s.kg)}" placeholder="${esc(s.phKg || '–')}" aria-label="Gewicht Satz ${si + 1}">
          <input inputmode="numeric" enterkeyhint="done" data-i="wset" data-e="${ei}" data-s="${si}" data-f="reps" value="${esc(s.reps)}" placeholder="${esc(s.phReps || '–')}" aria-label="Wiederholungen Satz ${si + 1}">
          <button class="chk" data-a="toggleSet" data-e="${ei}" data-s="${si}" aria-label="Satz abhaken">${ic('check')}</button>
        </div>`).join('')}
      </div>
      <div class="ex-foot">
        <button class="link" data-a="addSet" data-e="${ei}">${ic('plus')}Satz</button>
        ${e.sets.length > 1 ? `<button class="link muted" data-a="removeSet" data-e="${ei}">Letzten Satz entfernen</button>` : ''}
      </div>
    </div>`;
  };
  const cards = groupedList(w.exercises, card, {
    linkAction: editing ? null : 'wLink',
    tools: (i, gi, n) => moveTools(i, gi, n, 'exMove'),
    sub: () => 'im Wechsel, Pause nach jeder Runde',
  });

  return `<div class="wk-head">
      <button class="icon-btn" data-a="back" aria-label="Zurück">${ic('back')}</button>
      <div class="wk-title"><input data-i="wname" value="${esc(w.name)}" aria-label="Name des Trainings">
        <small>${editing ? `Bearbeiten · ${fmtDateShort(w.start)}` : `${ic('clock')}<span id="wtimer">${fmtDur((Date.now() - w.start) / 1000)}</span>`}</small></div>
      <button class="btn primary sm" data-a="finishWorkout">${editing ? 'Speichern' : 'Fertig'}</button>
    </div>
    ${!editing && w.exercises.length ? '<p class="hint">Gewicht und Wiederholungen eintragen, dann ✓ tippen. Leere Felder übernehmen den grauen Vorschlag.</p>' : ''}
    <div class="list">${cards || '<div class="empty small">Füge deine erste Übung hinzu.</div>'}</div>
    <button class="btn block" data-a="openPicker" data-t="workout">${ic('plus')}Übung hinzufügen</button>
    <label class="field"><span>Notiz</span><textarea data-i="wnote" rows="2" placeholder="Wie lief's? (optional)">${esc(w.note)}</textarea></label>
    <button class="btn block danger-ghost" data-a="discardWorkout">${editing ? 'Änderungen verwerfen' : 'Training abbrechen'}</button>
    <div id="restbar" class="restbar hidden">
      <div class="rest-fill" id="restFill"></div>
      <span class="rest-label">Pause</span><b id="restTime">0:00</b>
      <button data-a="restAdj" data-d="-15">−15</button><button data-a="restAdj" data-d="15">+15</button>
      <button data-a="restSkip">Weiter</button>
    </div>`;
}

let actx = null;
function beep() {
  try {
    actx = actx || new (window.AudioContext || window.webkitAudioContext)();
    const t = actx.currentTime;
    [0, 0.25].forEach(off => {
      const o = actx.createOscillator(), g = actx.createGain();
      o.frequency.value = 880;
      g.gain.setValueAtTime(0.0001, t + off);
      g.gain.exponentialRampToValueAtTime(0.25, t + off + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + off + 0.2);
      o.connect(g).connect(actx.destination); o.start(t + off); o.stop(t + off + 0.22);
    });
  } catch (e) { /* kein Audio */ }
}
function startRest(sec) {
  const w = S.activeWorkout;
  if (!w || !sec || w.editingId) return;
  w.restEnd = Date.now() + sec * 1000; w.restTotal = sec;
  persist('activeWorkout'); updateRest();
}
function updateRest() {
  const w = S.activeWorkout, bar = $('#restbar');
  if (w && w.restEnd) {
    const left = Math.ceil((w.restEnd - Date.now()) / 1000);
    if (left <= 0) {
      const late = Date.now() - w.restEnd;
      w.restEnd = null; persist('activeWorkout');
      if (late < 4000) { navigator.vibrate?.([300, 150, 300]); beep(); toast('Pause vorbei – nächster Satz!'); }
    } else if (bar) {
      bar.classList.remove('hidden');
      $('#restTime').textContent = fmtDur(left);
      $('#restFill').style.width = Math.min(100, 100 * left / (w.restTotal || left)) + '%';
      return;
    }
  }
  bar?.classList.add('hidden');
}

async function finishWorkout() {
  const w = S.activeWorkout; if (!w) return;
  const gid = [];
  ssGroups(w.exercises).forEach((g, k) => g.forEach(i => { gid[i] = k; }));
  const exercises = w.exercises.map((e, i) => ({
    exerciseId: e.exerciseId, name: exName(e.exerciseId), g: gid[i],
    sets: e.sets.filter(s => s.done).map(s => ({ kg: Math.max(0, num(s.kg) || 0), reps: Math.max(0, Math.round(num(s.reps) || 0)) })),
  })).filter(e => e.sets.length);
  exercises.forEach((e, i) => { if (exercises[i + 1]?.g === e.g) e.link = true; delete e.g; });
  if (!exercises.length) {
    if ((await ask('Es ist noch kein Satz abgehakt. Training ohne Speichern beenden?', { ok: 'Beenden', danger: true }))) discardWorkout(true);
    return;
  }
  const open = w.exercises.reduce((a, e) => a + e.sets.filter(s => !s.done).length, 0);
  if (!w.editingId && !(await ask(open ? `${open} Satz/Sätze sind nicht abgehakt und werden nicht gespeichert. Training beenden?` : 'Training beenden und speichern?', { ok: 'Speichern' }))) return;
  const id = w.editingId || w.id;
  const session = { id, planId: w.planId, name: (w.name || '').trim() || 'Krafttraining', start: w.start, end: w.editingId ? w.end : Date.now(), exercises, note: w.note || '' };
  const i = S.sessions.findIndex(s => s.id === id);
  if (i >= 0) S.sessions[i] = session; else S.sessions.push(session);
  S.activeWorkout = null;
  persist('sessions'); persist('activeWorkout');
  go('session', { id, fresh: !w.editingId }, true);
}
async function discardWorkout(force) {
  const w = S.activeWorkout; if (!w) return;
  if (!force && !(await ask(w.editingId ? 'Änderungen verwerfen?' : 'Training wirklich abbrechen? Eingetragene Sätze gehen verloren.', { ok: 'Verwerfen', danger: true }))) return;
  S.activeWorkout = null; persist('activeWorkout');
  go(w.editingId ? 'session' : 'strength', w.editingId ? { id: w.editingId } : {}, true);
}

/* =========================================================
   VIEW: Trainingsdetails
   ========================================================= */
function vSession(p) {
  const s = S.sessions.find(x => x.id === p.id); if (!s) return notFound();
  const prs = prEvents().filter(ev => ev.sessionId === s.id);
  const prOf = id => prs.find(ev => ev.exerciseId === id);
  const card = (i, inGroup) => {
    const e = s.exercises[i], pr = prOf(e.exerciseId);
    return `<div class="ex-card${inGroup ? ' in-ss' : ''}">
      <div class="ex-head">${picto(e.exerciseId, 'sm', e.name)}<button class="ex-title" data-a="openExercise" data-id="${e.exerciseId}"><b>${esc(exName(e.exerciseId, e.name))}</b>
      <small>${e.sets.length} Sätze · ${fmtN(e.sets.reduce((a, x) => a + x.kg * x.reps, 0))} kg Volumen</small></button>
      ${pr ? `<span class="pr">${ic('trophy')}${pr.label}-Bestwert</span>` : ''}</div>
      <div class="set-list">${e.sets.map((x, k) => `<div><span>${k + 1}</span><b>${x.kg ? `${fmtKg(x.kg)} kg × ${x.reps}` : `${x.reps} Wdh.`}</b></div>`).join('')}</div>
      ${compareLast(e, s)}
    </div>`;
  };
  const cards = groupedList(s.exercises, card, { sub: g => `${g.length} Übungen im Wechsel` });
  const prNames = [...new Set(prs.map(ev => exName(ev.exerciseId, ev.name)))];
  return `${head('Krafttraining', { back: true })}
  ${p.fresh ? `<div class="congrats">${ic('trophy')}<div><b>Training gespeichert – stark!</b><small>${prNames.length ? `${prNames.length} neue${prNames.length === 1 ? 'r' : ''} Bestwert${prNames.length === 1 ? '' : 'e'}: ${esc(prNames.join(', '))}` : 'Weiter so!'}</small></div></div>` : ''}
  <div class="detail-hero" style="--c:var(--str)"><span class="badge">${ic('dumbbell')}</span><div><h2>${esc(s.name)}</h2><small>${fmtDate(s.start)} · ${fmtTime(s.start)}–${fmtTime(s.end)}</small></div></div>
  <div class="stats c2">
    <div><b>${fmtHours((s.end - s.start) / 1000)}</b><span>Dauer</span></div>
    <div><b>${sessionSets(s)}</b><span>Sätze</span></div>
    <div><b>${sessionReps(s)}</b><span>Wiederholungen</span></div>
    <div><b>${fmtN(sessionVolume(s))}</b><span>kg Volumen</span></div>
  </div>
  <div class="list">${cards}</div>
  ${s.note ? `<div class="note">${esc(s.note)}</div>` : ''}
  <div class="actions">
    <button class="btn" data-a="editSession" data-id="${s.id}">${ic('edit')}Bearbeiten</button>
    <button class="btn" data-a="sessionToPlan" data-id="${s.id}">${ic('copy')}Als Plan</button>
    <button class="btn danger-ghost" data-a="deleteSession" data-id="${s.id}">${ic('trash')}Löschen</button>
  </div>`;
}

/* =========================================================
   VIEW: Übungen & Fortschritt
   ========================================================= */
function vExercises() {
  const rows = GROUPS.map(g => {
    const xs = S.exercises.filter(e => (e.group || 'Sonstiges') === g).sort((a, b) => a.name.localeCompare(b.name, 'de'));
    if (!xs.length) return '';
    return `<div class="pick-group">${g}</div>` + xs.map(e => {
      const h = exerciseHistory(e.id);
      const best = h.length ? Math.max(...h.map(x => x.maxKg)) : 0;
      const sub = h.length ? `${h.length}× trainiert${best ? ` · Bestwert ${fmtKg(best)} kg` : ''} · zuletzt ${relDay(h[h.length - 1].date)}` : 'Noch nicht trainiert';
      return `<button class="entry ex-row" data-name="${esc(e.name.toLowerCase())}" data-a="openExercise" data-id="${e.id}">
        ${picto(e.id)}<span class="entry-txt"><b>${esc(e.name)}</b><small>${sub}</small></span>${ic('chev', 'chev')}</button>`;
    }).join('');
  }).join('');
  return `${head('Übungen', { back: true, right: `<button class="btn primary sm" data-a="newExercise">${ic('plus')}Neu</button>` })}
  <input class="search" type="search" placeholder="Übung suchen …" data-i="exq" autocomplete="off">
  <div class="list compact">${rows || '<div class="empty">Keine Übungen vorhanden.</div>'}</div>`;
}

let exMetric = 'e1';
function vExercise(p) {
  const ex = exById(p.id); if (!ex) return notFound();
  const all = exerciseHistory(ex.id), bw = isBodyweight(all);
  const start = rangeStart(progRange), h = all.filter(x => x.date >= start);
  const metrics = bw ? [['maxReps', 'Max. Wdh.'], ['reps', 'Wdh. gesamt']] : [['e1', 'Gesch. 1RM'], ['kg', 'Max. Gewicht'], ['vol', 'Volumen']];
  if (!metrics.some(m => m[0] === exMetric)) exMetric = metrics[0][0];
  const unit = { kg: 'kg', e1: 'kg', vol: 'kg', maxReps: 'Wdh.', reps: 'Wdh.' }[exMetric];
  const prSessions = new Set(prEvents().filter(ev => ev.exerciseId === ex.id).map(ev => ev.sessionId));
  const pts = h.map(x => ({ x: x.date, y: exMetric === 'kg' ? x.maxKg : x[exMetric], hi: prSessions.has(x.session.id) }));
  const bestKg = Math.max(0, ...all.map(x => x.maxKg)), bestE1 = Math.max(0, ...all.map(x => x.e1)), bestReps = Math.max(0, ...all.map(x => x.maxReps));
  const vals = h.map(x => perfVal(x, bw));
  const change = h.length > 1
    ? (bw ? deltaTag(vals[vals.length - 1] - vals[0], 'Wdh.', 0, 'Max.') : `${deltaTag(vals[vals.length - 1] - vals[0], 'kg', 1, '1RM')}${pctTag(vals[vals.length - 1], vals[0])}`)
    : '';
  const hist = [...h].reverse().map(x => {
    const prev = all[all.indexOf(x) - 1];
    const d = prev ? (bw ? deltaTag(x.maxReps - prev.maxReps, 'Wdh.', 0) : deltaTag(x.e1 - prev.e1, 'kg', 1)) : '';
    return `<button class="hist-row" data-a="open" data-kind="strength" data-id="${x.session.id}">
      <span class="muted">${fmtDateShort(x.date)}</span><span class="hist-sets">${esc(setsText(x.sets))}</span>
      ${prSessions.has(x.session.id) ? `<span class="pr-dot" title="Bestwert">${ic('trophy')}</span>` : ''}${d}</button>`;
  }).join('');
  const best = bw ? [] : bestSets(all).slice(-8);
  return `${head(esc(ex.name), { back: true, right: `<button class="icon-btn" data-a="editExercise" data-id="${ex.id}" aria-label="Bearbeiten">${ic('edit')}</button>` })}
  <div class="ex-hero">${picto(ex.id, 'lg')}<div><span class="muted">${esc(ex.group || 'Sonstiges')}</span>
    <button class="link" data-a="editExercise" data-id="${ex.id}">${ic('edit')}Piktogramm oder Name ändern</button></div></div>
  <div class="${statsCls(bw ? 3 : 4)}">
    ${bw ? `<div><b>${bestReps}</b><span>Max. Wdh.</span></div>` : `<div><b>${fmtKg(bestKg)}</b><span>kg Bestwert</span></div><div><b>${fmtN(bestE1, 1)}</b><span>kg gesch. 1RM</span></div>`}
    <div><b>${all.length}</b><span>Einheiten</span></div>
    <div><b>${all.length ? relDay(all[all.length - 1].date) : '–'}</b><span>Zuletzt</span></div>
  </div>
  ${rangeChips()}
  <section class="card">
    <div class="trend"><span>Entwicklung · ${rangeLabel(progRange)}</span>${change || `<span class="muted small">${h.length ? 'erst ein Training im Zeitraum' : 'kein Training im Zeitraum'}</span>`}</div>
    <div class="chips">${metrics.map(([k, l]) => `<button class="${k === exMetric ? 'on' : ''}" data-a="exMetric" data-m="${k}">${l}</button>`).join('')}</div>
    ${pts.length ? lineChart(pts, { color: 'var(--str)', unit, dec: exMetric === 'e1' ? 1 : 0 }) : `<div class="empty small">${all.length ? 'Im gewählten Zeitraum nicht trainiert.' : 'Noch keine Daten. Nach dem ersten Training siehst du hier deinen Fortschritt.'}</div>`}
    ${pts.some(q => q.hi) ? `<div class="legend"><i></i>neuer Bestwert</div>` : ''}
  </section>
  ${exMetric === 'e1' ? '<p class="hint">Geschätztes 1RM (Epley-Formel): Gewicht × (1 + Wdh./30). So lassen sich Sätze mit unterschiedlich vielen Wiederholungen vergleichen.</p>' : ''}
  ${best.length ? `<div class="sec-head"><h2>Bestleistungen</h2><span class="muted small">je Wiederholungszahl</span></div>
  <section class="card best">${best.map(s => `<button class="best-row" data-a="open" data-kind="strength" data-id="${s.sid}"><b>${s.reps} Wdh.</b><span>${fmtKg(s.kg)} kg</span><small>${fmtDateShort(s.date)}</small></button>`).join('')}</section>` : ''}
  <div class="sec-head"><h2>Verlauf</h2><span class="muted small">${bw ? 'Δ max. Wdh.' : 'Δ gesch. 1RM'} zum Training davor</span></div>
  <div class="list compact">${hist || '<div class="empty small">Keine Einträge im Zeitraum.</div>'}</div>
  <button class="btn block danger-ghost" data-a="deleteExercise" data-id="${ex.id}">${ic('trash')}Übung löschen</button>`;
}

/* =========================================================
   VIEW: Fortschritt (Leistungstracking Kraft)
   ========================================================= */
function vProgress() {
  const start = rangeStart(progRange), days = rangeDays(progRange);
  const inR = S.sessions.filter(s => s.start >= start);
  const prev = days ? S.sessions.filter(s => s.start >= start - days * 864e5 && s.start < start) : [];
  if (!S.sessions.length) return `${head('Fortschritt', { back: true })}
    <div class="empty">Hier siehst du, wie du dich entwickelst: Trend je Übung, neue Bestwerte und bewegtes Gewicht.<br>Dafür brauchst du mindestens ein gespeichertes Krafttraining.<br><button class="btn primary" data-a="nav" data-v="strength">Zum Training</button></div>`;
  const vol = inR.reduce((a, s) => a + sessionVolume(s), 0), pvol = prev.reduce((a, s) => a + sessionVolume(s), 0);
  const prs = prEvents().filter(ev => ev.date >= start).reverse();
  const { data, monthly } = strengthBuckets(start);

  const exIds = [...new Set(inR.flatMap(s => s.exercises.map(e => e.exerciseId)))];
  const rows = exIds.map(id => {
    const all = exerciseHistory(id), bw = isBodyweight(all), h = all.filter(x => x.date >= start);
    const vals = h.map(x => perfVal(x, bw)), last = vals[vals.length - 1];
    const trend = h.length > 1
      ? (bw ? deltaTag(last - vals[0], 'Wdh.', 0) : pctTag(last, vals[0]))
      : '<span class="delta flat">1×</span>';
    return { n: h.length, html: `<button class="prog-row" data-a="openExercise" data-id="${id}">
      ${picto(id, 'sm')}<span class="entry-txt"><b>${esc(exName(id))}</b><small>${h.length} Training${h.length === 1 ? '' : 's'} · ${bw ? `max. ${Math.max(...h.map(x => x.maxReps))} Wdh.` : `1RM ${fmtN(last, 1)} kg`}</small></span>
      ${sparkline(vals)}${trend}</button>` };
  }).sort((a, b) => b.n - a.n).map(r => r.html).join('');

  const mg = {};
  for (const s of inR) for (const e of s.exercises) { const g = exById(e.exerciseId)?.group || 'Sonstiges'; mg[g] = (mg[g] || 0) + e.sets.length; }
  const mgMax = Math.max(1, ...Object.values(mg));
  const mgHtml = Object.entries(mg).sort((a, b) => b[1] - a[1])
    .map(([g, n]) => `<div class="hbar"><span>${g}</span><i style="--w:${Math.max(4, n / mgMax * 100)}%"></i><b>${n}</b></div>`).join('');

  const prHtml = prs.slice(0, 12).map(ev => `<button class="pr-row" data-a="open" data-kind="strength" data-id="${ev.sessionId}">
      <span class="pr-ic">${ic('trophy')}</span>
      <span class="entry-txt"><b>${esc(exName(ev.exerciseId, ev.name))}</b><small>${relDay(ev.date)} · ${ev.label}-Bestwert${ev.prev ? ` · vorher ${ev.prev}` : ''}</small></span>
      <b class="pr-val">${ev.value}</b></button>`).join('');

  return `${head('Fortschritt', { back: true })}
  ${rangeChips()}
  <div class="stats">
    <div><b>${inR.length}</b><span>Trainings</span>${prev.length ? deltaTag(inR.length - prev.length, '', 0) : ''}</div>
    <div><b>${fmtN(vol / 1000, 1)} t</b><span>bewegtes Gewicht</span>${pvol ? pctTag(vol, pvol) : ''}</div>
    <div><b>${prs.length}</b><span>neue Bestwerte</span></div>
  </div>
  ${days ? `<p class="hint">Veränderung im Vergleich zu den ${rangeLabel(progRange)} davor.</p>` : ''}
  <section class="card">
    <div class="card-head"><h2>Bewegtes Gewicht</h2><span class="muted small">Tonnen pro ${monthly ? 'Monat' : 'Woche'}</span></div>
    ${barChart(data, { color: 'var(--str)', dec: 1 })}
    <div class="muted small center">${monthly ? 'Monat' : 'Kalenderwoche'}</div>
  </section>
  <div class="sec-head"><h2>Übungen</h2><span class="muted small">Trend im Zeitraum</span></div>
  <div class="list compact">${rows || '<div class="empty small">Im gewählten Zeitraum kein Krafttraining.</div>'}</div>
  <p class="hint">Der Trend vergleicht das geschätzte 1RM im ersten und letzten Training des Zeitraums. Bei Übungen ohne Gewicht zählen die maximalen Wiederholungen.</p>
  <div class="sec-head"><h2>Neue Bestwerte</h2>${prs.length > 12 ? `<span class="muted small">die letzten 12 von ${prs.length}</span>` : ''}</div>
  <div class="list compact">${prHtml || '<div class="empty small">Im Zeitraum noch kein neuer Bestwert. Bestwerte zählen ab dem zweiten Training einer Übung.</div>'}</div>
  ${mgHtml ? `<div class="sec-head"><h2>Sätze pro Muskelgruppe</h2></div><section class="card bars">${mgHtml}</section>` : ''}`;
}
let sheetIcon = 'auto';
function exerciseSheet(id) {
  const ex = id ? exById(id) : null;
  openSheet(`<div class="sheet-head"><h3>${ex ? 'Übung bearbeiten' : 'Neue Übung'}</h3><button class="icon-btn" data-a="closeSheet" aria-label="Schließen">${ic('x')}</button></div>
    <label class="field"><span>Name</span><input id="exName" data-i="exNameLive" value="${esc(ex?.name || '')}" placeholder="z. B. Bulgarian Split Squats"></label>
    <label class="field"><span>Muskelgruppe</span><select id="exGroup">${GROUPS.map(g => `<option ${g === (ex?.group || 'Sonstiges') ? 'selected' : ''}>${g}</option>`).join('')}</select></label>
    <div class="field"><span>Piktogramm</span>
      <div class="icon-grid" id="iconGrid">
        <button class="ig auto" data-a="pickIcon" data-k="auto" aria-label="Automatisch">${pictoByKey(matchIcon(ex?.name), 'sm')}<small>Auto</small></button>
        ${Object.keys(PX).map(k => `<button class="ig" data-a="pickIcon" data-k="${k}" title="${esc(PXN[k] || k)}" aria-label="${esc(PXN[k] || k)}">${pictoByKey(k, 'sm')}</button>`).join('')}
      </div>
      <small class="muted" id="iconHint"></small></div>
    <button class="btn primary block" data-a="saveExercise" data-id="${id || ''}">Speichern</button>`);
  setSheetIcon(ex?.icon && PX[ex.icon] ? ex.icon : 'auto');
  if (!ex) setTimeout(() => $('#exName')?.focus(), 60);
}
function setSheetIcon(k) {
  sheetIcon = k;
  $$('#iconGrid .ig').forEach(b => b.classList.toggle('on', b.dataset.k === k));
  const auto = matchIcon($('#exName')?.value);
  const hint = $('#iconHint');
  if (hint) hint.textContent = k === 'auto'
    ? (auto ? `Automatisch: ${PXN[auto]} (passend zum Namen)` : 'Automatisch: kein passendes Piktogramm, es wird eine Hantel gezeigt')
    : `Gewählt: ${PXN[k] || k}`;
}

/* =========================================================
   VIEW: Ausdauer
   ========================================================= */
function vCardio() {
  const r = S.recording;
  const recent = allEntries().filter(e => e.kind === 'cardio').slice(0, 6);
  return `${head('Ausdauer')}
  ${r ? `<button class="resume" data-a="goRecord" style="--c:${sp(r.sport).color}">${ic(sp(r.sport).icon)}<span><b>Aufzeichnung ${r.status === 'paused' ? 'pausiert' : 'läuft'}</b><small>${sp(r.sport).label} – tippen zum Öffnen</small></span>${ic('chev', 'chev')}</button>` : ''}
  <div class="sec-head"><h2>Live aufzeichnen</h2></div>
  <div class="sport-tiles">
    ${['run', 'bike', 'walk'].map(k => `<button data-a="goRecord" data-sport="${k}" style="--c:${sp(k).color}">${ic(sp(k).icon)}<span>${sp(k).label}</span></button>`).join('')}
  </div>
  <p class="hint">Zeichnet GPS-Strecke, Zeit, Distanz und Tempo auf. Der Bildschirm bleibt dabei an – die App muss im Vordergrund bleiben.</p>
  ${indoorSection()}
  <div class="sec-head"><h2>Nachtragen & Garmin</h2></div>
  <div class="two">
    <button class="btn" data-a="manual">${ic('edit')}Manuell eintragen</button>
    <button class="btn" data-a="importPick">${ic('upload')}Datei importieren</button>
  </div>
  <p class="hint">Importiert FIT, GPX und TCX, auch als ZIP. Mehrere Dateien auf einmal gehen auch.</p>
  <details class="help"><summary>So holst du Aktivitäten aus Garmin Connect</summary>
    <ol>
      <li>Öffne <b>connect.garmin.com</b> im Browser (geht auch am Handy) und melde dich an.</li>
      <li>Öffne die Aktivität und tippe oben rechts auf das <b>Zahnrad-Symbol</b>.</li>
      <li>Wähle <b>Original exportieren</b> (ZIP mit FIT-Datei, enthält alle Werte) oder <b>TCX</b>.</li>
      <li>Hier auf „Datei importieren" tippen und die Datei auswählen.</li>
    </ol>
    <p class="muted small">Doppelte Aktivitäten (gleiche Startzeit) werden automatisch übersprungen.</p>
  </details>
  <div class="sec-head"><h2>Letzte Aktivitäten</h2>${recent.length ? '<button class="link" data-a="nav" data-v="history">Alle</button>' : ''}</div>
  <div class="list">${recent.map(entryRow).join('') || '<div class="empty small">Noch keine Lauf- oder Radeinheiten.</div>'}</div>`;
}

function indoorSection() {
  const rides = S.activities.filter(a => a.sport === 'indoor').sort((a, b) => a.start - b.start);
  const since = Date.now() - 28 * 864e5, recent = rides.filter(a => a.start >= since);
  const withP = rides.filter(a => a.avgPower && a.start >= Date.now() - 182 * 864e5);
  const avgP = recent.filter(a => a.avgPower);
  const body = rides.length ? `
    <div class="kpis">
      <div><b>${recent.length}</b><span>Fahrten</span></div>
      <div><b>${fmtHours(recent.reduce((x, a) => x + a.duration, 0))}</b><span>Zeit</span></div>
      <div><b>${fmtN(recent.reduce((x, a) => x + a.distance, 0) / 1000, 0)}</b><span>km</span></div>
      <div><b>${avgP.length ? Math.round(avgP.reduce((x, a) => x + a.avgPower, 0) / avgP.length) : '–'}</b><span>Ø Watt</span></div>
    </div>
    <p class="muted small">Letzte 4 Wochen</p>
    ${withP.length > 1 ? `<div class="card-head"><h2>Ø Leistung je Fahrt</h2><span class="muted small">6 Monate</span></div>${lineChart(withP.map(a => ({ x: a.start, y: a.avgPower })), { color: 'var(--indoor)', unit: 'W' })}` : '<p class="muted small">Ab zwei Fahrten mit Leistungsdaten siehst du hier deine Entwicklung in Watt.</p>'}`
    : `<p class="small">Hier landen deine Fahrten auf der Rolle, zum Beispiel mit Zwift. Du siehst Leistung, Trittfrequenz und Puls, und wie sich deine Watt über die Wochen entwickeln.</p>`;
  return `<div class="sec-head"><h2>Rolle / Indoor</h2>${rides.length ? `<button class="link" data-a="histIndoor">Alle ${rides.length}</button>` : ''}</div>
  <section class="card indoor-card" style="--c:var(--indoor)">${body}
    <div class="two"><button class="btn" data-a="importPick">${ic('upload')}FIT importieren</button><button class="btn" data-a="manualIndoor">${ic('edit')}Eintragen</button></div>
  </section>
  <details class="help"><summary>So holst du Fahrten aus Zwift</summary>
    <ol>
      <li>Öffne <b>zwift.com/feed</b> im Browser (geht auch am Handy) und melde dich an.</li>
      <li>Wähle <b>JUST ME</b> und öffne die Fahrt.</li>
      <li>Tippe auf das <b>Zahnrad-Symbol</b> und dann auf <b>DOWNLOAD FIT FILE</b>.</li>
      <li>Hier auf „FIT importieren" tippen und die Datei auswählen.</li>
    </ol>
    <p class="muted small">Am PC liegen die Dateien auch im Zwift-Ordner unter „Activities". Zwift-Fahrten werden automatisch als Rolle erkannt. Die Strecke aus der virtuellen Welt wird nur als Linie gezeigt, nicht auf einer echten Karte.</p>
  </details>`;
}

/* =========================================================
   Live-Aufzeichnung (GPS)
   ========================================================= */
let geoWatch = null, lastFix = null, geoErr = null, wakeLock = null, lastMapDraw = 0, lastRecSave = 0;
function startGeo() {
  if (geoWatch != null) return;
  if (!('geolocation' in navigator)) { geoErr = 'Dieses Gerät unterstützt kein GPS im Browser.'; return; }
  geoErr = null;
  geoWatch = navigator.geolocation.watchPosition(onPos, onGeoErr, { enableHighAccuracy: true, maximumAge: 0, timeout: 30000 });
}
function stopGeo() {
  if (geoWatch != null) navigator.geolocation.clearWatch(geoWatch);
  geoWatch = null; lastFix = null;
}
function onGeoErr(err) {
  geoErr = window.SPORTLOG_PREVIEW ? 'GPS geht in der Vorschau nicht. Bitte in der installierten App testen.'
    : err.code === 1 ? 'Standortzugriff verweigert. Bitte in den Browser-/App-Einstellungen erlauben.'
    : err.code === 3 ? 'Noch kein GPS-Signal … (im Freien geht es besser)' : 'GPS nicht verfügbar.';
  updateGpsStatus();
}
async function lockScreen() {
  try { if ('wakeLock' in navigator && !wakeLock) { wakeLock = await navigator.wakeLock.request('screen'); wakeLock.addEventListener('release', () => { wakeLock = null; }); } } catch (e) { /* nicht verfügbar */ }
}
function releaseScreen() { try { wakeLock?.release(); } catch (e) { /* egal */ } wakeLock = null; }
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && S.recording?.status === 'running') lockScreen();
  if (document.visibilityState === 'hidden') flushPersist();
});

const elapsed = r => r.acc + (r.status === 'running' ? Date.now() - r.resumedAt : 0);

function onPos(pos) {
  const c = pos.coords;
  geoErr = null;
  lastFix = { lat: c.latitude, lon: c.longitude, acc: c.accuracy, ele: c.altitude, t: pos.timestamp || Date.now() };
  updateGpsStatus();
  const r = S.recording;
  if (!r || r.status !== 'running') return;
  if (c.accuracy > 35) return; // zu ungenau
  const pt = [+c.latitude.toFixed(6), +c.longitude.toFixed(6), lastFix.t, c.altitude != null ? Math.round(c.altitude * 10) / 10 : null, null, r.seg];
  const prev = r.points[r.points.length - 1];
  if (prev && prev[5] === r.seg) {
    const d = hav(prev, pt), dt = (pt[2] - prev[2]) / 1000;
    if (d < Math.max(3, c.accuracy * 0.3) && dt < 30) return;          // GPS-Zittern im Stand
    if (dt > 0 && d / dt > (r.sport === 'bike' ? 30 : 12)) return;     // unrealistischer Sprung
    r.distance += d;
  }
  r.points.push(pt);
  const now = Date.now();
  if (now - lastRecSave > 5000) { lastRecSave = now; persist('recording'); }
  if (now - lastMapDraw > 4000) drawRecMap();
  updateRecUI();
}
function gpsStatusHtml() {
  if (geoErr) return `<span class="gps bad">${ic('pin')}${esc(geoErr)}</span>`;
  if (!lastFix) return `<span class="gps wait">${ic('pin')}GPS wird gesucht …</span>`;
  const a = Math.round(lastFix.acc);
  if (a <= 15) return `<span class="gps good">${ic('pin')}GPS gut (±${a} m)</span>`;
  if (a <= 35) return `<span class="gps ok">${ic('pin')}GPS ok (±${a} m)</span>`;
  return `<span class="gps bad">${ic('pin')}GPS ungenau (±${a} m)</span>`;
}
function updateGpsStatus() { const el = $('#gpsStatus'); if (el) el.innerHTML = gpsStatusHtml(); }
function currentRate(r) {
  const pts = r.points;
  if (pts.length < 2) return null;
  const last = pts[pts.length - 1];
  if (Date.now() - last[2] > 15000) return null;
  let d = 0, i = pts.length - 1;
  while (i > 0 && pts[i - 1][5] === last[5] && last[2] - pts[i - 1][2] <= 30000) { d += hav(pts[i - 1], pts[i]); i--; }
  const dt = (last[2] - pts[i][2]) / 1000;
  return dt >= 5 && d >= 5 ? { d, dt } : null;
}
function updateRecUI() {
  const r = S.recording, el = $('#recTime');
  if (!r || !el) return;
  const sec = elapsed(r) / 1000, s = sp(r.sport);
  el.textContent = fmtDur(sec);
  $('#recDist').textContent = fmtKm(r.distance);
  const cur = currentRate(r);
  $('#recCur').textContent = cur ? (s.pace ? fmtPace(cur.dt, cur.d) : fmtSpeed(cur.dt, cur.d)) : '–';
  $('#recAvg').textContent = s.pace ? fmtPace(sec, r.distance) : fmtSpeed(sec, r.distance);
}
function drawRecMap() {
  lastMapDraw = Date.now();
  const r = S.recording, m = $('#recMap');
  if (!r || !m) return;
  m.innerHTML = r.points.length > 1 ? routeSvg(r.points) : '<div class="map-empty">Strecke erscheint, sobald du dich bewegst</div>';
  const el = $('#recElev'); if (el) el.textContent = elevGain(r.points);
}

function vRecord(p) {
  const r = S.recording;
  if (!r) {
    startGeo();
    const sport = SPORTS[p.sport] && p.sport !== 'other' ? p.sport : 'run';
    return `${head('Aufzeichnen', { back: true })}
    <div class="sport-tiles small">${['run', 'bike', 'walk'].map(k => `<button class="${k === sport ? 'on' : ''}" data-a="recSport" data-sport="${k}" style="--c:${sp(k).color}">${ic(sp(k).icon)}<span>${sp(k).label}</span></button>`).join('')}</div>
    <div id="gpsStatus" class="gps-box">${gpsStatusHtml()}</div>
    <button class="start-btn" data-a="recStart" data-sport="${sport}" style="--c:${sp(sport).color}">${ic('play')}<span>Start</span></button>
    <ul class="tips">
      <li>Der Bildschirm bleibt während der Aufzeichnung an. Lass die App im Vordergrund – sonst stoppt das GPS.</li>
      <li>Am besten im Freien warten, bis „GPS gut" erscheint.</li>
      <li>Displayhelligkeit runterdrehen spart Akku.</li>
    </ul>`;
  }
  const s = sp(r.sport);
  return `<div class="rec" style="--c:${s.color}">
    <div class="rec-top"><span class="sport-tag">${ic(s.icon)}${s.label}</span><span id="gpsStatus">${gpsStatusHtml()}</span></div>
    <div class="rec-time ${r.status}" id="recTime">${fmtDur(elapsed(r) / 1000)}</div>
    <div class="rec-grid">
      <div><b id="recDist">${fmtKm(r.distance)}</b><span>km</span></div>
      <div><b id="recCur">–</b><span>${s.pace ? 'Pace jetzt /km' : 'km/h jetzt'}</span></div>
      <div><b id="recAvg">–</b><span>${s.pace ? 'Ø Pace /km' : 'Ø km/h'}</span></div>
      <div><b id="recElev">${elevGain(r.points)}</b><span>Höhenmeter</span></div>
    </div>
    <div class="rec-map" id="recMap">${r.points.length > 1 ? routeSvg(r.points) : '<div class="map-empty">Strecke erscheint, sobald du dich bewegst</div>'}</div>
    ${r.status === 'paused' ? '<div class="paused-label">Pausiert</div>' : ''}
    <div class="rec-ctrl">
      ${r.status === 'running'
        ? `<button class="round pause" data-a="recPause" aria-label="Pause">${ic('pause')}</button>`
        : `<button class="round go" data-a="recResume" aria-label="Weiter">${ic('play')}</button>
           <button class="round stop" data-a="recStop" aria-label="Beenden">${ic('stop')}</button>`}
    </div>
    ${r.status === 'paused' ? '<button class="link muted center" data-a="recDiscard">Aufzeichnung verwerfen</button>' : ''}
  </div>`;
}

function recStart(sport) {
  const now = Date.now();
  S.recording = { id: uid(), sport, start: now, status: 'running', acc: 0, resumedAt: now, seg: 0, points: [], distance: 0 };
  if (lastFix && lastFix.acc <= 35 && now - lastFix.t < 10000) {
    S.recording.points.push([+lastFix.lat.toFixed(6), +lastFix.lon.toFixed(6), now, lastFix.ele != null ? Math.round(lastFix.ele * 10) / 10 : null, null, 0]);
  }
  persist('recording'); startGeo(); lockScreen();
  navigator.vibrate?.(80);
  render();
}
async function recStop() {
  const r = S.recording; if (!r) return;
  if (r.status === 'running') { r.acc += Date.now() - r.resumedAt; r.status = 'paused'; }
  const sec = r.acc / 1000;
  if (r.distance < 20 && sec < 30) {
    if ((await ask('Die Aufzeichnung ist sehr kurz. Verwerfen?', { ok: 'Verwerfen', danger: true }))) return recDiscard(true);
  } else if (!(await ask('Aufzeichnung beenden und speichern?', { ok: 'Speichern' }))) { render(); return; }
  const a = {
    id: r.id, kind: 'cardio', sport: r.sport, name: defaultName(r.sport, r.start), start: r.start,
    duration: Math.round(sec), distance: Math.round(r.distance), elevGain: elevGain(r.points),
    avgHr: null, maxHr: null, calories: null, track: r.points, source: 'live', note: '',
  };
  S.activities.push(a); S.recording = null;
  persist('activities'); persist('recording');
  stopGeo(); releaseScreen();
  go('activity', { id: a.id, fresh: true }, true);
}
async function recDiscard(force) {
  if (!force && !(await ask('Aufzeichnung wirklich verwerfen?', { ok: 'Verwerfen', danger: true }))) return;
  S.recording = null; persist('recording'); stopGeo(); releaseScreen();
  go('cardio', {}, true);
}

/* =========================================================
   Manuell eintragen / bearbeiten
   ========================================================= */
function vManual(p) {
  const a = p.id ? S.activities.find(x => x.id === p.id) : null;
  if (p.id && !a) return notFound();
  const sport = a?.sport || p.sport || 'run';
  const d = new Date(a?.start || Date.now());
  const dur = a?.duration || 0;
  return `${head(a ? 'Aktivität bearbeiten' : 'Aktivität nachtragen', { back: true })}
  <div class="seg">${Object.entries(SPORTS).map(([k, s]) => `<label style="--c:${s.color}"><input type="radio" name="msport" value="${k}" ${k === sport ? 'checked' : ''}><span>${s.label}</span></label>`).join('')}</div>
  <label class="field"><span>Name (optional)</span><input id="mName" value="${esc(a?.name || '')}" placeholder="z. B. Runde um den See"></label>
  <div class="row2">
    <label class="field"><span>Datum</span><input type="date" id="mDate" value="${localDate(d)}"></label>
    <label class="field"><span>Startzeit</span><input type="time" id="mTime" value="${localTime(d)}"></label>
  </div>
  <div class="field"><span>Dauer</span>
    <div class="dur">
      <label><input inputmode="numeric" id="mH" value="${dur ? Math.floor(dur / 3600) : ''}" placeholder="0"><em>h</em></label>
      <label><input inputmode="numeric" id="mM" value="${dur ? Math.floor(dur % 3600 / 60) : ''}" placeholder="0"><em>min</em></label>
      <label><input inputmode="numeric" id="mS" value="${dur ? dur % 60 : ''}" placeholder="0"><em>s</em></label>
    </div></div>
  <div class="row2">
    <label class="field"><span>Distanz (km)</span><input inputmode="decimal" id="mDist" value="${a?.distance ? String(Math.round(a.distance) / 1000).replace('.', ',') : ''}" placeholder="z. B. 5,2"></label>
    <label class="field"><span>Höhenmeter</span><input inputmode="numeric" id="mElev" value="${a?.elevGain || ''}" placeholder="optional"></label>
  </div>
  <div class="row2">
    <label class="field"><span>Ø Puls</span><input inputmode="numeric" id="mHr" value="${a?.avgHr || ''}" placeholder="optional"></label>
    <label class="field"><span>Kalorien</span><input inputmode="numeric" id="mCal" value="${a?.calories || ''}" placeholder="optional"></label>
  </div>
  <div class="row2" id="mPowerRow" ${['bike', 'indoor'].includes(sport) ? '' : 'hidden'}>
    <label class="field"><span>Ø Leistung (Watt)</span><input inputmode="numeric" id="mPow" value="${a?.avgPower || ''}" placeholder="optional"></label>
    <label class="field"><span>Ø Trittfrequenz</span><input inputmode="numeric" id="mCad" value="${a?.avgCad || ''}" placeholder="U/min, optional"></label>
  </div>
  <label class="field"><span>Notiz</span><textarea id="mNote" rows="2" placeholder="optional">${esc(a?.note || '')}</textarea></label>
  <button class="btn primary block" data-a="saveManual" data-id="${a?.id || ''}">${ic('check')}Speichern</button>`;
}
function saveManual(id) {
  const sport = $('input[name="msport"]:checked')?.value || 'run';
  const date = $('#mDate').value, time = $('#mTime').value || '12:00';
  const start = date ? new Date(`${date}T${time}`).getTime() : Date.now();
  const dur = (parseInt($('#mH').value) || 0) * 3600 + (parseInt($('#mM').value) || 0) * 60 + (parseInt($('#mS').value) || 0);
  const dist = num($('#mDist').value);
  if (!dur) { toast('Bitte eine Dauer eintragen'); return; }
  if (isNaN(start)) { toast('Datum ungültig'); return; }
  const fields = {
    sport, start, duration: dur, distance: isNaN(dist) ? 0 : Math.round(dist * 1000),
    elevGain: parseInt($('#mElev').value) || 0, avgHr: parseInt($('#mHr').value) || null,
    avgPower: parseInt($('#mPow')?.value) || null, avgCad: parseInt($('#mCad')?.value) || null,
    calories: parseInt($('#mCal').value) || null, note: $('#mNote').value.trim(),
    name: $('#mName').value.trim() || defaultName(sport, start),
  };
  let a = id ? S.activities.find(x => x.id === id) : null;
  if (a) Object.assign(a, fields);
  else { a = { id: uid(), kind: 'cardio', maxHr: null, track: [], source: 'manual', ...fields }; S.activities.push(a); }
  persist('activities');
  toast('Gespeichert');
  go('activity', { id: a.id }, true);
}

/* =========================================================
   VIEW: Aktivitätsdetails
   ========================================================= */
function vActivity(p) {
  const a = S.activities.find(x => x.id === p.id); if (!a) return notFound();
  const s = sp(a.sport), indoor = !!s.indoor;
  const tr = a.track || [];
  const geo = tr.filter(q => q[0] != null);
  const hasTimes = tr.length > 1 && tr[tr.length - 1][2];
  const step = a.sport === 'bike' ? 5000 : 1000;
  const sp_ = !indoor && hasTimes && a.distance >= step ? splits(tr, step) : [];
  const fastest = sp_.filter(x => !x.partial).reduce((m, x) => Math.min(m, x.time / x.dist), Infinity);
  const src = { live: 'Live aufgezeichnet', manual: 'Manuell eingetragen', gpx: 'Importiert (GPX)', tcx: 'Importiert (TCX)', fit: 'Importiert (FIT)' }[a.source] || '';
  let profiles = '';
  if (tr.length > 10) {
    // x-Achse: Strecke (draußen) oder Zeit (Rolle, oder ohne GPS)
    const cum = trackCum(tr);
    const byTime = indoor || cum[cum.length - 1][0] < 100;
    const t0 = tr.find(q => q[2])?.[2];
    const X = (q, i) => byTime ? (q[2] - t0) / 60000 : cum[i][0] / 1000;
    const xf = byTime ? (v => `${fmtN(v, 0)} min`) : (v => `${fmtN(v, 1)} km`);
    const series = (idx, smooth = 0) => {
      let pts = tr.map((q, i) => ({ x: X(q, i), y: q[idx] })).filter(q => q.y != null && !isNaN(q.y) && !isNaN(q.x));
      if (smooth && pts.length > smooth) { // gleitender Mittelwert gegen Zacken
        const out = []; let acc = 0;
        pts.forEach((q, i) => { acc += q.y; if (i >= smooth) acc -= pts[i - smooth].y; out.push({ x: q.x, y: acc / Math.min(i + 1, smooth) }); });
        pts = out;
      }
      return thin(pts, 250);
    };
    const card = (title, sub, pts, opt) => pts.length > 10 ? `<section class="card"><div class="card-head"><h2>${title}</h2><span class="muted small">${sub}</span></div>${lineChart(pts, { xFmt: xf, dots: false, ...opt })}</section>` : '';
    profiles += card('Leistung', `Ø ${a.avgPower || '–'} W · max ${a.maxPower || '–'} W`, series(6, 30), { color: 'var(--indoor)', unit: 'W', area: true });
    profiles += card('Puls', `Ø ${a.avgHr || '–'} · max ${a.maxHr || '–'}`, series(4), { color: 'var(--danger)', unit: 'bpm', area: false });
    profiles += card('Trittfrequenz', `Ø ${a.avgCad || '–'} U/min`, series(7, 10).filter(q => q.y > 0), { color: 'var(--bike)', unit: 'U/min', area: false });
    if (!indoor) profiles += card('Höhenprofil', `${a.elevGain || 0} Hm`, series(3), { color: s.color, unit: 'm', area: true });
  }
  const stats = [
    a.distance ? [fmtKm(a.distance), 'km'] : null,
    [fmtDur(a.duration), 'Zeit'],
    a.distance >= 100 ? (s.pace ? [fmtPace(a.duration, a.distance), 'Ø Pace /km'] : [fmtSpeed(a.duration, a.distance), 'Ø km/h']) : null,
    a.avgPower ? [a.avgPower, 'Ø Watt'] : null,
    a.np ? [a.np, 'NP (Watt)'] : null,
    a.maxPower ? [a.maxPower, 'Max. Watt'] : null,
    a.avgCad ? [a.avgCad, 'Ø U/min'] : null,
    a.kj ? [fmtN(a.kj), 'kJ Arbeit'] : null,
    !indoor && a.elevGain ? [fmtN(a.elevGain), 'Höhenmeter'] : null,
    a.avgHr ? [a.avgHr, 'Ø Puls'] : null,
    a.maxHr ? [a.maxHr, 'Max. Puls'] : null,
    a.calories ? [fmtN(a.calories), 'kcal'] : null,
  ].filter(Boolean);
  const map = geo.length > 1 ? (indoor
    ? `<section class="card map-card" style="--c:${s.color}">${routeSvg(tr)}<span class="osm">Virtuelle Strecke${a.device ? ` (${esc(a.device)})` : ''}</span></section>`
    : `<section class="card map-card" style="--c:${s.color}">${routeSvg(tr)}<a class="osm" href="https://www.openstreetmap.org/?mlat=${geo[0][0]}&mlon=${geo[0][1]}#map=15/${geo[0][0]}/${geo[0][1]}" target="_blank" rel="noopener">Start auf Karte zeigen ↗</a></section>`) : '';
  return `${head(s.label, { back: true })}
  ${p.fresh ? `<div class="congrats" style="--c:${s.color}">${ic('trophy')}<div><b>Gespeichert – gut gemacht!</b><small>${a.distance ? `${fmtKm(a.distance)} km in ${fmtDur(a.duration)}` : fmtDur(a.duration)}</small></div></div>` : ''}
  <div class="detail-hero" style="--c:${s.color}"><span class="badge">${ic(s.icon)}</span><div><h2>${esc(a.name || s.label)}</h2><small>${fmtDate(a.start)} · ${fmtTime(a.start)}</small></div></div>
  <div class="${statsCls(stats.length)}">${stats.map(([v, l]) => `<div><b>${v}</b><span>${l}</span></div>`).join('')}</div>
  ${a.np ? '<p class="hint">NP (normalisierte Leistung) gewichtet harte Abschnitte stärker und zeigt, wie anstrengend eine Fahrt mit wechselnder Leistung wirklich war.</p>' : ''}
  ${map}
  ${sp_.length ? `<section class="card"><div class="card-head"><h2>Abschnitte</h2><span class="muted">je ${step / 1000} km</span></div>
    <div class="splits">${sp_.map(x => {
      const pace = x.time / x.dist;
      return `<div class="split"><span>${x.partial ? fmtN(x.km, 2) : fmtN(x.km)}</span><i style="--w:${Math.max(8, Math.min(100, 100 * fastest / pace))}%"></i><b>${s.pace ? fmtDur(pace * 1000) + ' /km' : fmtSpeed(x.time, x.dist) + ' km/h'}</b></div>`;
    }).join('')}</div></section>` : ''}
  ${profiles}
  ${a.note ? `<div class="note">${esc(a.note)}</div>` : ''}
  <p class="muted small center">${src}${a.device ? ` · ${esc(a.device)}` : ''}</p>
  <div class="actions">
    <button class="btn" data-a="editActivity" data-id="${a.id}">${ic('edit')}Bearbeiten</button>
    ${geo.length > 1 && !indoor ? `<button class="btn" data-a="exportGpx" data-id="${a.id}">${ic('download')}GPX</button>` : ''}
    <button class="btn danger-ghost" data-a="deleteActivity" data-id="${a.id}">${ic('trash')}Löschen</button>
  </div>`;
}
function thin(arr, max) {
  if (arr.length <= max) return arr;
  const step = arr.length / max, out = [];
  for (let i = 0; i < max; i++) out.push(arr[Math.floor(i * step)]);
  out.push(arr[arr.length - 1]);
  return out;
}

/* =========================================================
   Import: GPX / TCX (z. B. Export aus Garmin Connect)
   ========================================================= */
const tagsNS = (el, n) => Array.from(el.getElementsByTagNameNS('*', n));
const firstNS = (el, n) => el.getElementsByTagNameNS('*', n)[0] || null;
const childNS = (el, n) => Array.from(el.children).find(c => c.localName === n) || null;
const txtNum = el => el ? parseFloat(el.textContent) : null;
function parseXML(txt) {
  const x = new DOMParser().parseFromString(txt, 'application/xml');
  if (x.getElementsByTagName('parsererror').length) throw new Error('XML ungültig');
  return x;
}
function guessSport(str, fallback) {
  str = (str || '').toLowerCase();
  if (/bik|cycl|ride|rad|velo|mtb/.test(str)) return 'bike';
  if (/walk|hik|geh|wander/.test(str)) return 'walk';
  if (/run|lauf|jog/.test(str)) return 'run';
  return fallback;
}
function finalizeImport(track, meta) {
  const times = track.map(p => p[2]).filter(Boolean);
  const t0 = times[0], t1 = times[times.length - 1];
  const cum = track.length > 1 ? trackCum(track) : [[0, 0]];
  const hrs = track.map(p => p[4]).filter(Boolean);
  const start = meta.start || t0 || Date.now();
  return {
    id: uid(), kind: 'cardio', sport: meta.sport, name: meta.name || defaultName(meta.sport, start), start,
    duration: Math.round(meta.duration || (t0 && t1 ? (t1 - t0) / 1000 : 0)),
    distance: Math.round(meta.distance || cum[cum.length - 1][0]),
    elevGain: elevGain(track),
    avgHr: meta.avgHr || (hrs.length ? Math.round(hrs.reduce((a, b) => a + b, 0) / hrs.length) : null),
    maxHr: meta.maxHr || (hrs.length ? Math.max(...hrs) : null),
    calories: meta.calories || null,
    track: track.filter(p => p[0] != null).length > 1 ? track.filter(p => p[0] != null) : [],
    source: meta.source, note: '',
  };
}
function parseGPX(txt) {
  const x = parseXML(txt);
  let pts = tagsNS(x, 'trkpt');
  if (!pts.length) pts = tagsNS(x, 'rtept');
  const track = [];
  for (const p of pts) {
    const lat = parseFloat(p.getAttribute('lat')), lon = parseFloat(p.getAttribute('lon'));
    if (isNaN(lat) || isNaN(lon)) continue;
    const t = firstNS(p, 'time'), e = firstNS(p, 'ele'), hr = firstNS(p, 'hr');
    track.push([+lat.toFixed(6), +lon.toFixed(6), t ? Date.parse(t.textContent) || null : null, e ? parseFloat(e.textContent) : null, hr ? parseInt(hr.textContent) || null : null, 0]);
  }
  if (!track.length) throw new Error('Keine Trackpunkte');
  const trk = firstNS(x, 'trk');
  const type = trk ? childNS(trk, 'type')?.textContent : '';
  const name = trk ? childNS(trk, 'name')?.textContent?.trim() : '';
  return finalizeImport(track, { sport: guessSport(`${type} ${name}`, 'run'), name, source: 'gpx' });
}
function parseTCX(txt) {
  const x = parseXML(txt);
  const act = firstNS(x, 'Activity');
  if (!act) throw new Error('Keine Aktivität');
  const sportAttr = act.getAttribute('Sport') || '';
  const laps = tagsNS(act, 'Lap');
  let duration = 0, distance = 0, calories = 0, maxHr = 0, hrW = 0, hrT = 0;
  for (const l of laps) {
    const t = txtNum(childNS(l, 'TotalTimeSeconds')) || 0;
    duration += t;
    distance += txtNum(childNS(l, 'DistanceMeters')) || 0;
    calories += txtNum(childNS(l, 'Calories')) || 0;
    const mx = childNS(l, 'MaximumHeartRateBpm'); if (mx) maxHr = Math.max(maxHr, txtNum(childNS(mx, 'Value')) || 0);
    const av = childNS(l, 'AverageHeartRateBpm'); if (av) { hrW += (txtNum(childNS(av, 'Value')) || 0) * t; hrT += t; }
  }
  const track = [];
  for (const tp of tagsNS(act, 'Trackpoint')) {
    const pos = childNS(tp, 'Position');
    const hrEl = childNS(tp, 'HeartRateBpm');
    const time = childNS(tp, 'Time');
    const watts = firstNS(tp, 'Watts'), cad = childNS(tp, 'Cadence');
    track.push([
      pos ? +(+txtNum(childNS(pos, 'LatitudeDegrees'))).toFixed(6) : null,
      pos ? +(+txtNum(childNS(pos, 'LongitudeDegrees'))).toFixed(6) : null,
      time ? Date.parse(time.textContent) || null : null,
      txtNum(childNS(tp, 'AltitudeMeters')),
      hrEl ? Math.round(txtNum(childNS(hrEl, 'Value'))) || null : null, 0,
      watts ? Math.round(txtNum(watts)) : null, cad ? Math.round(txtNum(cad)) : null,
    ]);
  }
  const idEl = childNS(act, 'Id');
  const start = idEl ? Date.parse(idEl.textContent) : (laps[0] ? Date.parse(laps[0].getAttribute('StartTime')) : null);
  const notes = childNS(act, 'Notes')?.textContent?.trim();
  const sport = /running/i.test(sportAttr) ? 'run' : /biking/i.test(sportAttr) ? 'bike' : guessSport(notes, 'other');
  const geoTrack = track.filter(p => p[0] != null);
  const hrs = track.map(p => p[4]).filter(Boolean);
  const a = finalizeImport(geoTrack.length > 1 ? geoTrack : [], {
    sport, name: notes, source: 'tcx', start: start || null,
    duration, distance, calories: Math.round(calories) || null,
    maxHr: maxHr || (hrs.length ? Math.max(...hrs) : null),
    avgHr: hrT ? Math.round(hrW / hrT) : (hrs.length ? Math.round(hrs.reduce((p, q) => p + q, 0) / hrs.length) : null),
  });
  if (!a.duration && track.length) { const ts = track.map(p => p[2]).filter(Boolean); a.duration = Math.round((ts[ts.length - 1] - ts[0]) / 1000) || 0; }
  const hasPower = track.some(p => p[6] > 0);
  if (hasPower && geoTrack.length < 2) {
    a.track = downsample(track.filter(p => p[2]));
    if (a.sport === 'bike' || a.sport === 'other') a.sport = 'indoor';
  }
  return hasPower ? addPower(a) : a;
}
/* ---------- FIT (Zwift, Garmin, Wahoo …) ----------
   Eigener Leser für das binäre FIT-Format, ohne Bibliothek.
   Trackpunkt: [lat, lon, zeit(ms), höhe, puls, segment, watt, trittfrequenz] */
const FIT_EPOCH = 631065600; // 31.12.1989 in Unix-Sekunden
const FIT_BASE = { // Größe und ungültiger Wert je Basistyp
  0: [1, 0xFF], 1: [1, 0x7F], 2: [1, 0xFF], 3: [2, 0x7FFF], 4: [2, 0xFFFF], 5: [4, 0x7FFFFFFF], 6: [4, 0xFFFFFFFF],
  7: [1, null], 8: [4, null], 9: [8, null], 10: [1, 0], 11: [2, 0], 12: [4, 0], 13: [1, 0xFF], 14: [8, null], 15: [8, null], 16: [8, null],
};
function parseFIT(buf) {
  const u8 = new Uint8Array(buf), dv = new DataView(buf);
  if (u8.length < 14) throw new Error('Datei zu kurz');
  const hsize = u8[0];
  if (String.fromCharCode(u8[8], u8[9], u8[10], u8[11]) !== '.FIT') throw new Error('Keine FIT-Datei');
  const end = Math.min(u8.length - 2, hsize + dv.getUint32(4, true));
  const defs = {}, out = { records: [], sessions: [], manufacturer: null, sport: null, subSport: null, created: null };
  let p = hsize, lastTs = 0;

  const readVal = (pos, f, little) => {
    const [size, inv] = FIT_BASE[f.type] || [1, null];
    if (f.size < size || pos + size > u8.length) return null;
    let v;
    switch (f.type) {
      case 1: v = dv.getInt8(pos); break;
      case 0: case 2: case 10: case 13: v = u8[pos]; break;
      case 3: v = dv.getInt16(pos, little); break;
      case 4: case 11: v = dv.getUint16(pos, little); break;
      case 5: v = dv.getInt32(pos, little); break;
      case 6: case 12: v = dv.getUint32(pos, little); break;
      case 8: v = dv.getFloat32(pos, little); break;
      case 9: v = dv.getFloat64(pos, little); break;
      default: return null; // Text und 64-Bit-Werte werden nicht gebraucht
    }
    return (inv !== null && v === inv) || Number.isNaN(v) ? null : v;
  };
  const readMsg = def => {
    const m = {};
    for (const f of def.fields) { const v = readVal(p, f, def.little); if (v !== null) m[f.id] = v; p += f.size; }
    p += def.devSize;
    return m;
  };
  const handle = (num, m) => {
    if (num === 20) { // record
      const ele = m[78] != null ? m[78] / 5 - 500 : m[2] != null ? m[2] / 5 - 500 : null;
      out.records.push([
        m[0] != null ? +(m[0] * 180 / 2147483648).toFixed(6) : null,
        m[1] != null ? +(m[1] * 180 / 2147483648).toFixed(6) : null,
        m[253] != null ? (m[253] + FIT_EPOCH) * 1000 : null,
        ele != null ? Math.round(ele * 10) / 10 : null,
        m[3] ?? null, 0, m[7] ?? null, m[4] ?? null, m[5] != null ? m[5] / 100 : null,
      ]);
    } else if (num === 18) out.sessions.push(m);
    else if (num === 0) { out.manufacturer = m[1] ?? null; if (m[4] != null) out.created = (m[4] + FIT_EPOCH) * 1000; }
    else if (num === 12) { out.sport = m[0] ?? null; out.subSport = m[1] ?? null; }
  };

  while (p < end) {
    const h = u8[p++];
    if (h & 0x80) { // Datensatz mit komprimiertem Zeitstempel
      const def = defs[(h >> 5) & 3]; if (!def) throw new Error('Definition fehlt');
      const off = h & 31;
      let ts = (lastTs & ~31) + off; if (off < (lastTs & 31)) ts += 32;
      lastTs = ts;
      const m = readMsg(def); m[253] = ts; handle(def.num, m);
    } else if (h & 0x40) { // Definition
      const local = h & 15, hasDev = h & 0x20;
      p++; // reserviert
      const little = u8[p++] === 0;
      const num = dv.getUint16(p, little); p += 2;
      const n = u8[p++], fields = [];
      for (let i = 0; i < n; i++) { fields.push({ id: u8[p], size: u8[p + 1], type: u8[p + 2] & 31 }); p += 3; }
      let devSize = 0;
      if (hasDev) { const nd = u8[p++]; for (let i = 0; i < nd; i++) { devSize += u8[p + 1]; p += 3; } }
      defs[local] = { num, little, fields, devSize };
    } else { // normaler Datensatz
      const def = defs[h & 15]; if (!def) throw new Error('Definition fehlt');
      const m = readMsg(def);
      if (m[253] != null) lastTs = m[253];
      handle(def.num, m);
    }
  }
  return out;
}

// Leistungswerte aus den Trackpunkten (Watt an Index 6, Trittfrequenz an Index 7)
function powerStats(track) {
  const pts = track.filter(q => q[2] && q[6] != null);
  if (pts.length < 2) return null;
  let work = 0, sum = 0, n = 0, max = 0;
  for (let i = 0; i < pts.length; i++) {
    const w = pts[i][6]; sum += w; n++; max = Math.max(max, w);
    if (i) work += w * Math.min(5, Math.max(0, (pts[i][2] - pts[i - 1][2]) / 1000));
  }
  // Normalisierte Leistung: 30-s-Mittel, vierte Potenz, Mittel, vierte Wurzel (sekundengenau aufgefüllt)
  let np = null;
  const t0 = pts[0][2], dur = (pts[pts.length - 1][2] - t0) / 1000;
  if (dur >= 300 && dur < 86400) {
    const sec = new Array(Math.floor(dur) + 1); let k = 0;
    for (let s = 0; s < sec.length; s++) { while (k < pts.length - 1 && (pts[k + 1][2] - t0) / 1000 <= s) k++; sec[s] = pts[k][6]; }
    let win = 0, acc = 0, cnt = 0;
    for (let s = 0; s < sec.length; s++) {
      win += sec[s]; if (s >= 30) win -= sec[s - 30];
      if (s >= 29) { acc += (win / 30) ** 4; cnt++; }
    }
    if (cnt) np = Math.round((acc / cnt) ** 0.25);
  }
  const cads = track.map(q => q[7]).filter(c => c > 0);
  return {
    avgPower: Math.round(sum / n), maxPower: Math.round(max), np, kj: Math.round(work / 1000),
    avgCad: cads.length ? Math.round(cads.reduce((a, b) => a + b, 0) / cads.length) : null,
    maxCad: cads.length ? Math.max(...cads) : null,
  };
}
function addPower(a, pre = {}) {
  const ps = powerStats(a.track || []) || {};
  for (const k of ['avgPower', 'maxPower', 'np', 'kj', 'avgCad', 'maxCad']) {
    const v = pre[k] ?? ps[k];
    if (v != null && !(k !== 'kj' && v === 0)) a[k] = v;
  }
  return a;
}
function downsample(track, max = 7200) {
  if (track.length <= max) return track;
  const step = Math.ceil(track.length / max);
  return track.filter((_, i) => i % step === 0 || i === track.length - 1);
}

function fitToActivity(f) {
  const s = f.sessions.reduce((b, x) => (x[8] || 0) > (b?.[8] || 0) ? x : b, null) || {};
  const sportN = s[5] ?? f.sport ?? 0, sub = s[6] ?? f.subSport ?? 0;
  const zwift = f.manufacturer === 260;
  const recs = f.records.filter(r => r[2]);
  const hasGps = recs.filter(r => r[0] != null).length > 1;
  const hasPower = recs.some(r => r[6] > 0);
  let sport = sportN === 1 ? 'run' : sportN === 2 ? 'bike' : (sportN === 11 || sportN === 17) ? 'walk' : 'other';
  if ((sportN === 2 || (sport === 'other' && hasPower)) && (sub === 6 || sub === 58 || zwift || (!hasGps && hasPower))) sport = 'indoor';
  const start = s[2] != null ? (s[2] + FIT_EPOCH) * 1000 : recs[0]?.[2] ?? f.created ?? Date.now();
  const t0 = recs[0]?.[2], t1 = recs[recs.length - 1]?.[2];
  const lastDist = [...recs].reverse().find(r => r[8] != null)?.[8];
  const track = downsample(recs.map(r => r.slice(0, 8)));
  const a = {
    id: uid(), kind: 'cardio', sport, start,
    name: zwift ? 'Zwift' : defaultName(sport, start),
    duration: Math.round(s[8] != null ? s[8] / 1000 : s[7] != null ? s[7] / 1000 : t0 && t1 ? (t1 - t0) / 1000 : 0),
    distance: Math.round(s[9] != null ? s[9] / 100 : lastDist ?? (track.length > 1 ? trackCum(track).pop()[0] : 0)),
    elevGain: s[22] ?? elevGain(track),
    avgHr: s[16] ?? null, maxHr: s[17] ?? null, calories: s[11] ?? null,
    track, source: 'fit', device: zwift ? 'Zwift' : null, note: '',
  };
  const hrs = track.map(q => q[4]).filter(Boolean);
  if (!a.avgHr && hrs.length) a.avgHr = Math.round(hrs.reduce((x, y) => x + y, 0) / hrs.length);
  if (!a.maxHr && hrs.length) a.maxHr = Math.max(...hrs);
  return addPower(a, { avgPower: s[20], maxPower: s[21], np: s[34], kj: s[48] != null ? Math.round(s[48] / 1000) : null, avgCad: s[18], maxCad: s[19] });
}

/* ---------- ZIP (z. B. „Original exportieren" bei Garmin Connect) ---------- */
async function unzip(buf) {
  const dv = new DataView(buf), u8 = new Uint8Array(buf), out = [];
  let e = u8.length - 22;
  while (e >= 0 && dv.getUint32(e, true) !== 0x06054b50) e--;
  if (e < 0) throw new Error('Kein ZIP');
  let c = dv.getUint32(e + 16, true);
  const n = dv.getUint16(e + 10, true);
  for (let i = 0; i < n; i++) {
    if (dv.getUint32(c, true) !== 0x02014b50) break;
    const method = dv.getUint16(c + 10, true), csize = dv.getUint32(c + 20, true);
    const nlen = dv.getUint16(c + 28, true), xlen = dv.getUint16(c + 30, true), clen = dv.getUint16(c + 32, true);
    const loc = dv.getUint32(c + 42, true);
    const name = new TextDecoder().decode(u8.subarray(c + 46, c + 46 + nlen));
    const data0 = loc + 30 + dv.getUint16(loc + 26, true) + dv.getUint16(loc + 28, true);
    const raw = u8.slice(data0, data0 + csize);
    let data = null;
    if (method === 0) data = raw.buffer;
    else if (method === 8 && 'DecompressionStream' in window) {
      data = await new Response(new Blob([raw]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).arrayBuffer();
    }
    if (data) out.push({ name, data });
    c += 46 + nlen + xlen + clen;
  }
  return out;
}
async function fileToActivities(name, buf) {
  const n = name.toLowerCase();
  const u8 = new Uint8Array(buf);
  if (n.endsWith('.zip') || (u8[0] === 0x50 && u8[1] === 0x4b)) {
    const list = [];
    for (const f of await unzip(buf)) if (/\.(fit|gpx|tcx)$/i.test(f.name)) list.push(...await fileToActivities(f.name, f.data));
    return list;
  }
  if (n.endsWith('.fit') || String.fromCharCode(...u8.subarray(8, 12)) === '.FIT') return [fitToActivity(parseFIT(buf))];
  const txt = new TextDecoder().decode(u8);
  return [(n.endsWith('.tcx') || /<TrainingCenterDatabase/i.test(txt.slice(0, 2000))) ? parseTCX(txt) : parseGPX(txt)];
}
async function importFiles(files) {
  let ok = 0, dup = 0, fail = 0, lastId = null;
  for (const f of files) {
    try {
      const list = await fileToActivities(f.name, await f.arrayBuffer());
      if (!list.length) throw new Error('Keine Aktivität gefunden');
      for (const a of list) {
        if (!a.duration && !a.distance) { fail++; continue; }
        if (S.activities.some(b => Math.abs(b.start - a.start) < 60000)) { dup++; continue; }
        S.activities.push(a); ok++; lastId = a.id;
      }
    } catch (e) { console.warn(f.name, e); fail++; }
  }
  if (ok) persist('activities');
  const msg = [ok ? `${ok} importiert` : null, dup ? `${dup} schon vorhanden` : null, fail ? `${fail} nicht lesbar` : null].filter(Boolean).join(' · ');
  toast(msg || 'Keine Datei gewählt');
  if (ok === 1) go('activity', { id: lastId }); else render();
}
function toGPX(a) {
  const tr = a.track.filter(p => p[0] != null);
  const segs = [];
  for (const p of tr) { const k = p[5] || 0; if (!segs.length || segs[segs.length - 1].k !== k) segs.push({ k, pts: [] }); segs[segs.length - 1].pts.push(p); }
  const type = { run: 'running', bike: 'cycling', walk: 'walking' }[a.sport] || 'other';
  return `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="SportLog" xmlns="http://www.topografix.com/GPX/1/1" xmlns:gpxtpx="http://www.garmin.com/xmlschemas/TrackPointExtension/v1">
<metadata><name>${esc(a.name)}</name><time>${new Date(a.start).toISOString()}</time></metadata>
<trk><name>${esc(a.name)}</name><type>${type}</type>
${segs.map(s => `<trkseg>\n${s.pts.map(p => `<trkpt lat="${p[0]}" lon="${p[1]}">${p[3] != null ? `<ele>${p[3]}</ele>` : ''}${p[2] ? `<time>${new Date(p[2]).toISOString()}</time>` : ''}${p[4] ? `<extensions><gpxtpx:TrackPointExtension><gpxtpx:hr>${p[4]}</gpxtpx:hr></gpxtpx:TrackPointExtension></extensions>` : ''}</trkpt>`).join('\n')}\n</trkseg>`).join('\n')}
</trk></gpx>`;
}
async function download(blob, name) {
  if (window.SPORTLOG_PREVIEW) {
    try {
      const dl = await window.claude?.use?.('downloads');
      if (!dl) { toast('Download ist in der Vorschau nicht verfügbar'); return false; }
      await dl.save({ filename: name, data: blob });
      return true;
    } catch (e) { toast('Download abgebrochen'); return false; }
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = name;
  document.body.appendChild(a); a.click();
  setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 1500);
  return true;
}

/* =========================================================
   VIEW: Verlauf & Statistik
   ========================================================= */
let histFilter = 'all', histMetric = 'time';
const METRICS = {
  time: { label: 'Zeit', unit: 'h', dec: 1, color: 'var(--accent)' },
  run: { label: 'Laufen', unit: 'km', dec: 1, color: 'var(--run)' },
  bike: { label: 'Rad', unit: 'km', dec: 0, color: 'var(--bike)' },
  str: { label: 'Kraft', unit: 'Einheiten', dec: 0, color: 'var(--str)' },
  indoor: { label: 'Rolle', unit: 'h', dec: 1, color: 'var(--indoor)' },
};
function weeklySeries(metric, n = 12) {
  const ws = startOfWeek(new Date()), b = [];
  for (let i = n - 1; i >= 0; i--) { const d = new Date(ws); d.setDate(d.getDate() - 7 * i); b.push({ start: d.getTime(), label: String(isoWeek(d)), v: 0 }); }
  const endD = new Date(ws); endD.setDate(endD.getDate() + 7); const end = endD.getTime();
  const add = (ts, v) => { if (ts < b[0].start || ts >= end) return; let k = b.length - 1; while (k > 0 && ts < b[k].start) k--; b[k].v += v; };
  for (const s of S.sessions) { if (metric === 'time') add(s.start, (s.end - s.start) / 3600000); if (metric === 'str') add(s.start, 1); }
  for (const a of S.activities) {
    if (metric === 'time') add(a.start, a.duration / 3600);
    if (metric === a.sport && (metric === 'run' || metric === 'bike')) add(a.start, a.distance / 1000);
    if (metric === 'indoor' && a.sport === 'indoor') add(a.start, a.duration / 3600);
  }
  return b;
}
function vHistory() {
  const all = allEntries();
  const match = e => histFilter === 'all' || entryKey(e) === histFilter || (histFilter === 'more' && ['walk', 'other'].includes(entryKey(e)));
  const list = all.filter(match);
  const m = METRICS[histMetric];
  const series = weeklySeries(histMetric);
  const total = series.reduce((a, x) => a + x.v, 0);
  // Monatssummen
  const m0 = new Date(); m0.setDate(1); m0.setHours(0, 0, 0, 0);
  const month = all.filter(e => e.start >= m0.getTime());
  let groups = '', cur = '';
  for (const e of list) {
    const k = new Date(e.start).toLocaleDateString('de-DE', { month: 'long', year: 'numeric' });
    if (k !== cur) { groups += `<div class="month">${k}</div>`; cur = k; }
    groups += entryRow(e);
  }
  const F = [['all', 'Alle'], ['str', 'Kraft'], ['run', 'Laufen'], ['bike', 'Rad'], ['indoor', 'Rolle'], ['more', 'Weitere']];
  return `${head('Verlauf')}
  <section class="card">
    <div class="chips">${Object.entries(METRICS).map(([k, x]) => `<button class="${k === histMetric ? 'on' : ''}" data-a="histMetric" data-m="${k}">${x.label}</button>`).join('')}</div>
    <div class="chart-cap"><b>${fmtN(total, m.dec)} ${m.unit}</b><span class="muted">in den letzten 12 Wochen · Ø ${fmtN(total / 12, 1)} pro Woche</span></div>
    ${barChart(series, { color: m.color, dec: m.dec })}
    <div class="muted small center">Kalenderwoche</div>
  </section>
  <section class="card month-sum">
    <div class="card-head"><h2>${m0.toLocaleDateString('de-DE', { month: 'long' })}</h2></div>
    <div class="kpis">
      <div><b>${month.length}</b><span>Einheiten</span></div>
      <div><b style="color:var(--str)">${month.filter(e => e.kind === 'strength').length}</b><span>Kraft</span></div>
      <div><b style="color:var(--run)">${fmtN(month.filter(e => e.sport === 'run').reduce((a, e) => a + e.distance, 0) / 1000, 1)}</b><span>km Laufen</span></div>
      <div><b style="color:var(--bike)">${fmtN(month.filter(e => e.sport === 'bike').reduce((a, e) => a + e.distance, 0) / 1000, 1)}</b><span>km Rad</span></div>
    </div>
  </section>
  <div class="chips filter">${F.map(([k, l]) => `<button class="${k === histFilter ? 'on' : ''}" data-a="histFilter" data-f="${k}">${l}</button>`).join('')}</div>
  <div class="list">${groups || '<div class="empty small">Keine Einträge.</div>'}</div>`;
}

/* =========================================================
   Diagramme (SVG, ohne Bibliotheken)
   ========================================================= */
function niceTicks(min, max, count = 4) {
  if (min === max) { min -= 1; max += 1; }
  const step0 = (max - min) / count, mag = 10 ** Math.floor(Math.log10(step0)), nrm = step0 / mag;
  const step = (nrm < 1.5 ? 1 : nrm < 3 ? 2 : nrm < 7 ? 5 : 10) * mag;
  const lo = Math.floor(min / step) * step, hi = Math.ceil(max / step) * step, t = [];
  for (let v = lo; v <= hi + step / 2; v += step) t.push(+v.toFixed(10));
  return t;
}
function barChart(data, { color = 'var(--accent)', dec = 0 } = {}) {
  const W = 640, H = 220, pl = 6, pr = 6, pt = 28, pb = 30, n = data.length;
  const max = Math.max(0, ...data.map(d => d.v));
  const bw = (W - pl - pr) / n, ih = H - pt - pb;
  const bars = data.map((d, i) => {
    const h = max ? Math.max(d.v > 0 ? 3 : 0, d.v / max * ih) : 0;
    const x = pl + i * bw + bw * 0.16, w = bw * 0.68, y = H - pb - h;
    const last = i === n - 1;
    return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="5" fill="${color}" opacity="${last ? 1 : 0.62}"/>
      ${d.v > 0 && n <= 14 ? `<text x="${x + w / 2}" y="${y - 7}" text-anchor="middle" class="ct val">${fmtN(d.v, dec)}</text>` : ''}
      ${((n - 1 - i) % Math.ceil(n / 9) === 0) ? `<text x="${x + w / 2}" y="${H - 8}" text-anchor="middle" class="ct ${last ? 'cur' : ''}">${d.label}</text>` : ''}`;
  }).join('');
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img"><line x1="${pl}" x2="${W - pr}" y1="${H - pb}" y2="${H - pb}" class="axis"/>${bars}</svg>`;
}
let gradN = 0;
function lineChart(pts, { color = 'var(--accent)', unit = '', dec = 0, xFmt = null, dots = true, area = true } = {}) {
  const W = 640, H = 250, pl = 58, pr = 14, pt = 34, pb = 30;
  let x0 = Math.min(...pts.map(p => p.x)), x1 = Math.max(...pts.map(p => p.x));
  if (x0 === x1) { x0 -= xFmt ? 0.5 : 864e5; x1 += xFmt ? 0.5 : 864e5; }
  const ys = pts.map(p => p.y);
  const ticks = niceTicks(Math.min(...ys), Math.max(...ys), 4);
  const y0 = ticks[0], y1 = ticks[ticks.length - 1];
  const stp = ticks.length > 1 ? ticks[1] - ticks[0] : 1;
  dec = Math.max(0, Math.min(dec, 2), stp < 1 ? Math.ceil(-Math.log10(stp) - 1e-9) : 0);
  const X = x => pl + (x - x0) / (x1 - x0) * (W - pl - pr);
  const Y = y => H - pb - (y - y0) / ((y1 - y0) || 1) * (H - pt - pb);
  const path = pts.map((p, i) => `${i ? 'L' : 'M'}${X(p.x).toFixed(1)} ${Y(p.y).toFixed(1)}`).join(' ');
  const id = 'g' + (++gradN);
  const grid = ticks.map(t => `<line x1="${pl}" x2="${W - pr}" y1="${Y(t)}" y2="${Y(t)}" class="grid"/><text x="${pl - 8}" y="${Y(t) + 6}" text-anchor="end" class="ct">${fmtN(t, dec)}</text>`).join('');
  const fx = xFmt || (v => fmtDateShort(v));
  const xl = `<text x="${pl}" y="${H - 6}" class="ct">${fx(x0 + (xFmt ? 0 : 0))}</text><text x="${W - pr}" y="${H - 6}" text-anchor="end" class="ct">${fx(x1)}</text>`;
  const ar = area && pts.length > 1 ? `<path d="${path} L${X(pts[pts.length - 1].x).toFixed(1)} ${H - pb} L${X(pts[0].x).toFixed(1)} ${H - pb} Z" fill="url(#${id})"/>` : '';
  const ds = dots ? pts.map(p => p.hi
    ? `<circle cx="${X(p.x).toFixed(1)}" cy="${Y(p.y).toFixed(1)}" r="7" fill="var(--warn)" stroke="var(--s1)" stroke-width="2.5"/>`
    : `<circle cx="${X(p.x).toFixed(1)}" cy="${Y(p.y).toFixed(1)}" r="5" fill="var(--s1)" stroke="${color}" stroke-width="3"/>`).join('') : '';
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img">
    <defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${color}" stop-opacity=".28"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></linearGradient></defs>
    ${grid}<text x="${pl - 8}" y="18" text-anchor="end" class="ct unit">${unit}</text>${ar}
    <path d="${path}" fill="none" stroke="${color}" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round"/>${ds}${xl}</svg>`;
}
function routeSvg(track) {
  const pts = track.filter(p => p[0] != null);
  if (pts.length < 2) return '';
  const W = 600, H = 340, P = 22;
  const lat0 = pts.reduce((a, p) => a + p[0], 0) / pts.length;
  const k = Math.cos(lat0 * Math.PI / 180);
  const xs = pts.map(p => p[1] * k), ys = pts.map(p => -p[0]);
  const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
  const sc = Math.min((W - 2 * P) / ((maxX - minX) || 1e-9), (H - 2 * P) / ((maxY - minY) || 1e-9));
  const ox = (W - (maxX - minX) * sc) / 2, oy = (H - (maxY - minY) * sc) / 2;
  const X = i => (ox + (xs[i] - minX) * sc).toFixed(1), Y = i => (oy + (ys[i] - minY) * sc).toFixed(1);
  const stepI = Math.max(1, Math.floor(pts.length / 1500));
  let d = '', prevSeg = null;
  for (let i = 0; i < pts.length; i += stepI) {
    const seg = pts[i][5] || 0;
    d += `${seg !== prevSeg ? 'M' : 'L'}${X(i)} ${Y(i)} `; prevSeg = seg;
  }
  const L = pts.length - 1;
  d += `L${X(L)} ${Y(L)}`;
  return `<svg class="route" viewBox="0 0 ${W} ${H}" role="img" aria-label="Strecke">
    <defs><pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse"><path d="M30 0H0V30" fill="none" class="rgrid"/></pattern></defs>
    <rect width="${W}" height="${H}" fill="url(#grid)"/>
    <path d="${d}" fill="none" stroke="var(--c, var(--accent))" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"/>
    <circle cx="${X(0)}" cy="${Y(0)}" r="8" fill="var(--ok)" stroke="var(--s1)" stroke-width="3"/>
    <circle cx="${X(L)}" cy="${Y(L)}" r="8" fill="var(--danger)" stroke="var(--s1)" stroke-width="3"/></svg>`;
}

/* =========================================================
   VIEW: Mehr (Einstellungen, Backup)
   ========================================================= */
let deferredInstall = null, pendingBackup = null;
window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferredInstall = e; if (view.name === 'more') render(); });
function vMore() {
  const lb = S.settings.lastBackup;
  const old = !lb || Date.now() - lb > 14 * 864e5;
  const count = S.sessions.length + S.activities.length;
  return `${head('Mehr')}
  ${deferredInstall ? `<button class="btn primary block" data-a="install">${ic('download')}App installieren</button>` : ''}
  <div class="sec-head"><h2>Training</h2></div>
  <div class="list">
    <button class="entry" data-a="nav" data-v="exercises"><span class="badge" style="--c:var(--str)">${ic('list')}</span><span class="entry-txt"><b>Übungen verwalten</b><small>${S.exercises.length} Übungen</small></span>${ic('chev', 'chev')}</button>
    <label class="entry setting"><span class="badge" style="--c:var(--accent)">${ic('clock')}</span><span class="entry-txt"><b>Standard-Pause</b><small>für neue Übungen in Plänen</small></span>
      <select data-i="restSetting">${[45, 60, 90, 120, 150, 180, 240].map(v => `<option value="${v}" ${v === S.settings.rest ? 'selected' : ''}>${v >= 60 ? `${Math.floor(v / 60)}:${pad(v % 60)} min` : `${v} s`}</option>`).join('')}</select></label>
  </div>
  <div class="sec-head"><h2>Datensicherung</h2></div>
  <div class="card">
    <p class="small">Deine ${count} Einträge sind nur auf diesem Gerät gespeichert. Lade regelmäßig ein Backup herunter – damit kannst du alles auch in eine spätere Version der App übernehmen.</p>
    <p class="small ${old && count ? 'warn' : 'muted'}">Letztes Backup: ${lb ? `${relDay(lb)} (${fmtDateShort(lb)})` : 'noch nie'}</p>
    <div class="two">
      <button class="btn primary" data-a="backupExport">${ic('download')}Backup speichern</button>
      <button class="btn" data-a="backupPick">${ic('upload')}Wiederherstellen</button>
    </div>
  </div>
  <div class="sec-head"><h2>Info</h2></div>
  <div class="card small">
    <p><b>SportLog</b> · Version ${APP_VERSION}</p>
    <p class="muted">Live-GPS funktioniert nur bei eingeschaltetem Bildschirm mit geöffneter App. Garmin-Aktivitäten kannst du als TCX/GPX importieren (Ausdauer → Import).</p>
  </div>
  <button class="btn block danger-ghost" data-a="wipeAll">${ic('trash')}Alle Daten löschen</button>`;
}
function backupData() {
  return { app: 'SportLog', version: 1, exportedAt: new Date().toISOString(), exercises: S.exercises, plans: S.plans, sessions: S.sessions, activities: S.activities, settings: S.settings };
}

/* =========================================================
   Aktionen (Klicks)
   ========================================================= */
const A = {
  nav: el => go(el.dataset.v),
  back: () => history.back(),
  banner: () => go(S.recording ? 'record' : 'workout'),
  open: el => go(el.dataset.kind === 'strength' ? 'session' : 'activity', { id: el.dataset.id }),
  closeSheet: () => closeSheet(),
  askYes: () => { const r = askResolve; askResolve = null; closeSheet(); r?.(true); },
  askNo: () => closeSheet(),

  // Pläne
  newPlan: () => { planDraft = null; go('planEdit', { id: uid() }); },
  editPlan: el => { planDraft = null; go('planEdit', { id: el.dataset.id }); },
  savePlan: () => {
    const d = planDraft; if (!d) return;
    d.name = d.name.trim() || `Plan ${S.plans.length + 1}`;
    d.items = d.items.map(it => ({ exerciseId: it.exerciseId, sets: Math.max(1, parseInt(it.sets) || 3), reps: String(it.reps || '').trim(), rest: parseInt(it.rest) || S.settings.rest, link: !!it.link }));
    fixLinks(d.items);
    const i = S.plans.findIndex(p => p.id === d.id);
    if (i >= 0) S.plans[i] = d; else S.plans.push(d);
    persist('plans'); planDraft = null; toast('Plan gespeichert');
    history.back();
  },
  deletePlan: async () => {
    if (!planDraft || !(await ask(`Plan „${planDraft.name || 'ohne Namen'}" löschen? Bisherige Trainings bleiben erhalten.`, { ok: 'Löschen', danger: true }))) return;
    S.plans = S.plans.filter(p => p.id !== planDraft.id); persist('plans'); planDraft = null; history.back();
  },
  planMove: el => { planDraft.items = moveBlock(planDraft.items, +el.dataset.i, +el.dataset.d); render(); },
  planRemove: el => { removeItem(planDraft.items, +el.dataset.i); render(); },
  planLink: el => { const it = planDraft.items[+el.dataset.i]; it.link = !it.link; fixLinks(planDraft.items); render(); },

  // Übungsauswahl
  openPicker: el => openPicker(el.dataset.t),
  pick: el => addExerciseToTarget(el.dataset.id),
  createExercise: () => {
    const name = $('#newExName').value.trim(); if (!name) { toast('Bitte einen Namen eingeben'); return; }
    let ex = S.exercises.find(e => e.name.toLowerCase() === name.toLowerCase());
    if (!ex) { ex = { id: uid(), name, group: $('#newExGroup').value }; S.exercises.push(ex); persist('exercises'); }
    $('#newExName').value = '';
    addExerciseToTarget(ex.id);
    $('#picklist').innerHTML = pickList($('[data-i="pickq"]')?.value || '');
  },

  // Training
  startWorkout: el => startWorkout(el.dataset.plan || null),
  toggleSet: el => {
    const w = S.activeWorkout, ei = +el.dataset.e, e = w.exercises[ei], si = +el.dataset.s, s = e.sets[si];
    let next = null;
    try { actx?.resume(); } catch (er) { /* egal */ }
    if (!s.done) {
      if (s.kg === '') s.kg = s.phKg || '';
      if (s.reps === '') s.reps = s.phReps || '';
      if (!(num(s.reps) > 0)) { toast('Bitte Wiederholungen eintragen'); render(); return; }
      s.done = true;
      for (let j = si + 1; j < e.sets.length; j++) {
        const n = e.sets[j];
        if (!n.done && n.src !== 'last') { n.phKg = s.kg; n.phReps = s.reps; }
      }
      navigator.vibrate?.(30);
      // Supersatz: erst zur Partnerübung (gleicher Satz), Pause erst nach der Runde
      const grp = ssGroups(w.exercises).find(g => g.includes(ei)), pos = grp.indexOf(ei);
      const partner = [...grp.slice(pos + 1), ...grp.slice(0, pos)].find(k => w.exercises[k].sets[si] && !w.exercises[k].sets[si].done);
      const allDone = w.exercises.every(x => x.sets.every(y => y.done));
      if (grp.length > 1 && partner != null) {
        w.restEnd = null; next = `${partner}-${si}`;
        toast(`Ohne Pause weiter: ${exName(w.exercises[partner].exerciseId)}`);
      } else if (!allDone) startRest(w.exercises[grp[grp.length - 1]].rest);
    } else s.done = false;
    persist('activeWorkout'); render();
    if (next) requestAnimationFrame(() => {
      const row = $(`[data-row="${next}"]`); if (!row) return;
      row.classList.add('next'); row.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => row.classList.remove('next'), 2600);
    });
  },
  addSet: el => {
    const e = S.activeWorkout.exercises[+el.dataset.e], prev = e.sets[e.sets.length - 1];
    e.sets.push({ kg: '', reps: '', done: false, phKg: prev ? (prev.kg !== '' ? prev.kg : prev.phKg) : '', phReps: prev ? (prev.reps !== '' ? prev.reps : prev.phReps) : '', src: 'carry' });
    persist('activeWorkout'); render();
  },
  removeSet: async el => {
    const e = S.activeWorkout.exercises[+el.dataset.e];
    if (e.sets[e.sets.length - 1].done && !(await ask('Der letzte Satz ist schon abgehakt. Trotzdem entfernen?', { ok: 'Entfernen', danger: true }))) return;
    e.sets.pop(); persist('activeWorkout'); render();
  },
  exMove: el => { const w = S.activeWorkout; w.exercises = moveBlock(w.exercises, +el.dataset.i, +el.dataset.d); persist('activeWorkout'); render(); },
  wLink: el => { const ex = S.activeWorkout.exercises, e = ex[+el.dataset.i]; e.link = !e.link; fixLinks(ex); persist('activeWorkout'); render(); },
  exRemove: async el => {
    const ex = S.activeWorkout.exercises, e = ex[+el.dataset.e];
    if (e.sets.some(s => s.done) && !(await ask(`${exName(e.exerciseId)} mit abgehakten Sätzen entfernen?`, { ok: 'Entfernen', danger: true }))) return;
    removeItem(ex, +el.dataset.e); persist('activeWorkout'); render();
  },
  finishWorkout: () => finishWorkout(),
  discardWorkout: () => discardWorkout(),
  restAdj: el => { const w = S.activeWorkout; if (!w?.restEnd) return; w.restEnd += +el.dataset.d * 1000; w.restTotal = Math.max(w.restTotal + +el.dataset.d, 1); persist('activeWorkout'); updateRest(); },
  restSkip: () => { const w = S.activeWorkout; if (w) { w.restEnd = null; persist('activeWorkout'); } updateRest(); },

  // Trainings-Details
  editSession: el => {
    if (S.activeWorkout) { toast('Bitte erst das laufende Training beenden'); return; }
    const s = S.sessions.find(x => x.id === el.dataset.id); if (!s) return;
    S.activeWorkout = {
      id: uid(), editingId: s.id, planId: s.planId, name: s.name, start: s.start, end: s.end, note: s.note || '', restEnd: null, restTotal: 0,
      exercises: s.exercises.map(e => ({
        exerciseId: e.exerciseId, target: '', rest: S.settings.rest, link: !!e.link, last: lastPerformance(e.exerciseId, s.id, s.start),
        sets: e.sets.map(x => ({ kg: kgInput(x.kg), reps: String(x.reps), done: true, phKg: '', phReps: '', src: 'last' })),
      })),
    };
    persist('activeWorkout'); go('workout');
  },
  deleteSession: async el => {
    if (!(await ask('Dieses Training löschen?', { ok: 'Löschen', danger: true }))) return;
    S.sessions = S.sessions.filter(s => s.id !== el.dataset.id); persist('sessions'); toast('Gelöscht'); history.back();
  },
  sessionToPlan: el => {
    const s = S.sessions.find(x => x.id === el.dataset.id); if (!s) return;
    const plan = {
      id: uid(), name: S.plans.some(p => p.name === s.name) ? `${s.name} (Kopie)` : s.name,
      items: s.exercises.map(e => {
        const reps = e.sets.map(x => x.reps), mn = Math.min(...reps), mx = Math.max(...reps);
        return { exerciseId: e.exerciseId, sets: e.sets.length, reps: mn === mx ? String(mn) : `${mn}-${mx}`, rest: S.settings.rest, link: !!e.link };
      }),
    };
    S.plans.push(plan); persist('plans'); toast('Plan erstellt'); planDraft = null; go('planEdit', { id: plan.id });
  },

  // Übungen
  openExercise: el => go('exercise', { id: el.dataset.id }),
  pickIcon: el => setSheetIcon(el.dataset.k),
  exMetric: el => { exMetric = el.dataset.m; render(); },
  progRange: el => { progRange = el.dataset.r; render(); },
  newExercise: () => exerciseSheet(null),
  editExercise: el => exerciseSheet(el.dataset.id),
  saveExercise: el => {
    const name = $('#exName').value.trim(); if (!name) { toast('Bitte einen Namen eingeben'); return; }
    const id = el.dataset.id;
    const fields = { name, group: $('#exGroup').value };
    if (sheetIcon !== 'auto') fields.icon = sheetIcon;
    if (id) { const ex = exById(id); Object.assign(ex, fields); if (sheetIcon === 'auto') delete ex.icon; }
    else S.exercises.push({ id: uid(), ...fields });
    persist('exercises'); closeSheet(); render(); toast('Übung gespeichert');
  },
  deleteExercise: async el => {
    const ex = exById(el.dataset.id); if (!ex) return;
    if (!(await ask(`„${ex.name}" löschen? Sie wird aus allen Plänen entfernt. Vergangene Trainings bleiben erhalten.`, { ok: 'Löschen', danger: true }))) return;
    S.exercises = S.exercises.filter(e => e.id !== ex.id);
    S.plans.forEach(p => { p.items = p.items.filter(it => it.exerciseId !== ex.id); });
    persist('exercises'); persist('plans'); history.back();
  },

  // Ausdauer
  goRecord: el => go('record', { sport: el.dataset.sport }),
  recSport: el => go('record', { sport: el.dataset.sport }, true),
  recStart: el => recStart(el.dataset.sport),
  recPause: () => { const r = S.recording; r.acc += Date.now() - r.resumedAt; r.status = 'paused'; persist('recording'); navigator.vibrate?.(60); render(); },
  recResume: () => { const r = S.recording; r.status = 'running'; r.resumedAt = Date.now(); r.seg++; persist('recording'); lockScreen(); navigator.vibrate?.(60); render(); },
  recStop: () => recStop(),
  recDiscard: () => recDiscard(),
  manual: () => go('manual', {}),
  manualIndoor: () => go('manual', { sport: 'indoor' }),
  histIndoor: () => { histFilter = 'indoor'; histMetric = 'indoor'; go('history'); },
  saveManual: el => saveManual(el.dataset.id || null),
  editActivity: el => go('manual', { id: el.dataset.id }),
  deleteActivity: async el => {
    if (!(await ask('Diese Aktivität löschen?', { ok: 'Löschen', danger: true }))) return;
    S.activities = S.activities.filter(a => a.id !== el.dataset.id); persist('activities'); toast('Gelöscht'); history.back();
  },
  exportGpx: el => {
    const a = S.activities.find(x => x.id === el.dataset.id); if (!a) return;
    download(new Blob([toGPX(a)], { type: 'application/gpx+xml' }), `${localDate(new Date(a.start))}_${a.sport}.gpx`);
  },
  importPick: () => { const f = $('#fileImport'); f.value = ''; f.click(); },

  // Verlauf
  histFilter: el => { histFilter = el.dataset.f; render(); },
  histMetric: el => { histMetric = el.dataset.m; render(); },

  // Mehr
  install: async () => { if (!deferredInstall) return; deferredInstall.prompt(); await deferredInstall.userChoice; deferredInstall = null; render(); },
  backupExport: async () => {
    if (!(await download(new Blob([JSON.stringify(backupData())], { type: 'application/json' }), `sportlog-backup-${localDate(new Date())}.json`))) return;
    S.settings.lastBackup = Date.now(); persist('settings'); render(); toast('Backup gespeichert (Downloads)');
  },
  backupPick: () => { const f = $('#fileBackup'); f.value = ''; f.click(); },
  restore: async el => {
    const b = pendingBackup; if (!b) return;
    if (el.dataset.mode === 'replace') {
      if (!(await ask('Alle aktuellen Daten werden durch das Backup ersetzt. Fortfahren?', { ok: 'Ersetzen', danger: true }))) return;
      S.exercises = b.exercises; S.plans = b.plans; S.sessions = b.sessions; S.activities = b.activities;
      S.settings = Object.assign({ rest: 90 }, b.settings || {}, { lastBackup: S.settings.lastBackup });
    } else {
      const merge = (cur, inc) => { const m = new Map(cur.map(x => [x.id, x])); inc.forEach(x => m.set(x.id, x)); return [...m.values()]; };
      S.exercises = merge(S.exercises, b.exercises); S.plans = merge(S.plans, b.plans);
      S.sessions = merge(S.sessions, b.sessions); S.activities = merge(S.activities, b.activities);
    }
    ['exercises', 'plans', 'sessions', 'activities', 'settings'].forEach(k => persist(k));
    pendingBackup = null; closeSheet(); render(); toast('Backup wiederhergestellt');
  },
  wipeAll: async () => {
    if (!(await ask('Wirklich ALLE Trainings, Pläne und Aktivitäten löschen?', { ok: 'Weiter', danger: true }))) return;
    if (!(await ask('Letzte Warnung: Das kann nicht rückgängig gemacht werden. Hast du ein Backup?', { ok: 'Alles löschen', danger: true }))) return;
    S.plans = []; S.sessions = []; S.activities = []; S.activeWorkout = null; S.recording = null;
    S.exercises = DEFAULT_EXERCISES.map(([name, group]) => ({ id: uid(), name, group }));
    KEYS.forEach(k => persist(k)); stopGeo(); toast('Alle Daten gelöscht'); go('home', {}, true);
  },
};

/* ---------- Eingaben ---------- */
const I = {
  planName: el => { if (planDraft) planDraft.name = el.value; },
  planItem: el => { if (planDraft) planDraft.items[+el.dataset.idx][el.dataset.f] = el.value; },
  pickq: el => { $('#picklist').innerHTML = pickList(el.value); },
  exNameLive: el => {
    const auto = $('#iconGrid .ig.auto'); if (auto) auto.innerHTML = `${pictoByKey(matchIcon(el.value), 'sm')}<small>Auto</small>`;
    setSheetIcon(sheetIcon);
  },
  exq: el => { const q = el.value.trim().toLowerCase(); $$('.ex-row').forEach(r => { r.hidden = !!q && !r.dataset.name.includes(q); }); },
  wset: el => {
    const s = S.activeWorkout?.exercises[+el.dataset.e]?.sets[+el.dataset.s]; if (!s) return;
    s[el.dataset.f] = el.value.replace(/[^0-9.,]/g, '');
    persist('activeWorkout', 500);
  },
  wname: el => { if (S.activeWorkout) { S.activeWorkout.name = el.value; persist('activeWorkout', 500); } },
  wnote: el => { if (S.activeWorkout) { S.activeWorkout.note = el.value; persist('activeWorkout', 500); } },
  restSetting: el => { S.settings.rest = parseInt(el.value) || 90; persist('settings'); toast('Gespeichert'); },
};

document.addEventListener('click', e => {
  const el = e.target.closest('[data-a]');
  if (!el || el.disabled) return;
  const fn = A[el.dataset.a];
  if (fn) { e.preventDefault(); fn(el, e); }
});
document.addEventListener('input', e => { const h = I[e.target.dataset?.i]; if (h) h(e.target, e); });
document.addEventListener('change', e => {
  if (e.target.name === 'msport') { const r = $('#mPowerRow'); if (r) r.hidden = !['bike', 'indoor'].includes(e.target.value); }
  if (e.target.matches('select[data-i]')) { const h = I[e.target.dataset.i]; if (h) h(e.target, e); }
});
// Enter im Satz-Feld → nächstes Feld
document.addEventListener('keydown', e => {
  if (e.key !== 'Enter' || !e.target.matches('[data-i="wset"]')) return;
  e.preventDefault();
  const inputs = $$('[data-i="wset"]'), i = inputs.indexOf(e.target);
  if (e.target.dataset.f === 'reps') { $(`[data-a="toggleSet"][data-e="${e.target.dataset.e}"][data-s="${e.target.dataset.s}"]`)?.click(); setTimeout(() => $$('[data-i="wset"]')[i + 1]?.focus(), 30); }
  else inputs[i + 1]?.focus();
});
$('#fileImport').addEventListener('change', e => { if (e.target.files.length) importFiles(Array.from(e.target.files)); });
$('#fileBackup').addEventListener('change', async e => {
  const f = e.target.files[0]; if (!f) return;
  try {
    const b = JSON.parse(await f.text());
    if (b.app !== 'SportLog' || !Array.isArray(b.sessions) || !Array.isArray(b.activities)) throw new Error('kein Backup');
    ['exercises', 'plans'].forEach(k => { if (!Array.isArray(b[k])) b[k] = []; });
    pendingBackup = b;
    openSheet(`<div class="sheet-head"><h3>Backup wiederherstellen</h3><button class="icon-btn" data-a="closeSheet" aria-label="Schließen">${ic('x')}</button></div>
      <p class="small">Backup vom ${fmtDate(Date.parse(b.exportedAt) || Date.now())}:<br>${b.sessions.length} Krafttrainings, ${b.activities.length} Aktivitäten, ${b.plans.length} Pläne, ${b.exercises.length} Übungen.</p>
      <button class="btn primary block" data-a="restore" data-mode="merge">Zusammenführen (empfohlen)</button>
      <p class="muted small">Fügt fehlende Einträge hinzu, behält alles Vorhandene.</p>
      <button class="btn block danger-ghost" data-a="restore" data-mode="replace">Alles ersetzen</button>`);
  } catch (err) { toast('Das ist keine gültige SportLog-Backup-Datei'); }
});

/* ---------- Banner & Takt ---------- */
function updateBanner() {
  const b = $('#banner'), r = S.recording, w = S.activeWorkout;
  if (r && view.name !== 'record') {
    b.innerHTML = `<span class="dot" style="background:${sp(r.sport).color}"></span><b>${sp(r.sport).label} ${r.status === 'paused' ? 'pausiert' : 'läuft'}</b><span>${fmtDur(elapsed(r) / 1000)} · ${fmtKm(r.distance)} km</span>${ic('chev')}`;
    b.style.setProperty('--c', sp(r.sport).color); b.classList.remove('hidden');
  } else if (w && view.name !== 'workout') {
    b.innerHTML = `<span class="dot" style="background:var(--str)"></span><b>${w.editingId ? 'Bearbeitung offen' : 'Training läuft'}</b><span>${w.editingId ? '' : fmtDur((Date.now() - w.start) / 1000)}</span>${ic('chev')}`;
    b.style.setProperty('--c', 'var(--str)'); b.classList.remove('hidden');
  } else b.classList.add('hidden');
}
function tick() {
  const w = S.activeWorkout, wt = $('#wtimer');
  if (wt && w) wt.textContent = fmtDur((Date.now() - w.start) / 1000);
  updateBanner(); updateRest();
  if (S.recording) updateRecUI();
}

const VIEWS = {
  home: vHome, strength: vStrength, planEdit: vPlanEdit, workout: vWorkout, session: vSession,
  exercises: vExercises, exercise: vExercise, progress: vProgress, cardio: vCardio, record: vRecord, manual: vManual,
  activity: vActivity, history: vHistory, more: vMore,
};

/* ---------- Start ---------- */
(async function init() {
  try { await load(); } catch (e) { console.error(e); toast('Lokaler Speicher nicht verfügbar – Daten werden nicht gesichert'); }
  history.replaceState({ name: 'home', p: {} }, '');
  view = { name: 'home', p: {} };
  if (S.recording) {
    startGeo();
    if (S.recording.status === 'running') lockScreen();
    go('record');
  } else if (S.activeWorkout) go('workout');
  else render();
  setInterval(tick, 1000);
  if (!window.SPORTLOG_PREVIEW && 'serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
    navigator.serviceWorker.register('sw.js').catch(e => console.warn('SW', e));
  }
})();
