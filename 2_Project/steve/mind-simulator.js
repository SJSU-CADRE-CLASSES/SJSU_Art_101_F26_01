(function () {
'use strict';

const canvas = document.getElementById('c');
const ctx = canvas.getContext('2d');

const REGIONS = [
  { id: 'frontal',    name: 'Prefrontal cortex', note: 'Judgment, focus, planning',       color: '#1c3a7a' },
  { id: 'motor',      name: 'Motor strip',       note: 'Voluntary movement',              color: '#2b78c2' },
  { id: 'parietal',   name: 'Parietal lobe',     note: 'Spatial sense, body awareness',   color: '#0e8a8a' },
  { id: 'temporal',   name: 'Temporal lobe',     note: 'Language, auditory memory',       color: '#6a4cb0' },
  { id: 'occipital',  name: 'Visual cortex',     note: 'Sight and imagery',               color: '#b0457a' },
  { id: 'limbic',     name: 'Limbic system',     note: 'Emotion, memory, bonding',        color: '#d1642a' },
  { id: 'cerebellum', name: 'Cerebellum',        note: 'Balance and fine coordination',   color: '#3f8f4f' },
  { id: 'stem',       name: 'Brainstem',         note: 'Breath, heartbeat, arousal',      color: '#7a7f88' }
];
const R = {}; REGIONS.forEach((r, i) => { R[r.id] = i; });

// Anatomical connectivity used for long fibers and influence between regions.
const LINKS = [
  ['frontal','motor'],['frontal','parietal'],['frontal','limbic'],['frontal','temporal'],
  ['motor','parietal'],['motor','cerebellum'],['parietal','occipital'],['parietal','temporal'],
  ['temporal','limbic'],['temporal','occipital'],['limbic','stem'],['cerebellum','stem'],
  ['cerebellum','parietal'],['stem','frontal']
].map(p => [R[p[0]], R[p[1]]]);
const linked = REGIONS.map(() => []);
LINKS.forEach(([a, b]) => { linked[a].push(b); linked[b].push(a); });

const TRAITS = [
  ['Focus',       { frontal: .7, parietal: .2, limbic: -.2 }],
  ['Memory',      { temporal: .5, limbic: .4, frontal: .1 }],
  ['Emotion',     { limbic: .7, frontal: -.3 }],
  ['Empathy',     { frontal: .3, limbic: .35, temporal: .35 }],
  ['Perception',  { parietal: .4, occipital: .5, temporal: .1 }],
  ['Motor',       { motor: .5, cerebellum: .5 }],
  ['Language',    { temporal: .6, frontal: .4 }],
  ['Calm / vitals', { stem: .8, limbic: -.2 }]
];

// Stylised, fictional approximations of each state; not pharmacology.
const PRESET_GROUPS = [
  ['General', [
    ['Baseline', {}],
    ['Deep focus', { frontal: 70, parietal: 25, limbic: -35, occipital: 15 }],
    ['Serenity', { limbic: -45, stem: 30, frontal: 15 }],
    ['Total recall', { temporal: 70, limbic: 50, frontal: 20 }],
    ['Dreamstate', { occipital: 75, temporal: 35, frontal: -60, motor: -40 }],
    ['Overload', { frontal: 100, limbic: 100, occipital: 90, temporal: 90, parietal: 80 }, true]
  ]],
  ['Substances', [
    ['LSD', { occipital: 85, temporal: 60, limbic: 35, parietal: 30, frontal: -35 }],
    ['Mushrooms', { occipital: 65, limbic: 55, temporal: 50, frontal: -45, parietal: -20 }],
    ['Marijuana', { limbic: 40, temporal: 30, occipital: 20, frontal: -25, cerebellum: -35, motor: -15 }],
    ['Ketamine', { parietal: -75, frontal: -50, motor: -45, temporal: -20, limbic: 25, occipital: 35 }],
    ['Vyvanse', { frontal: 60, parietal: 25, motor: 20, stem: 35, limbic: -15 }],
    ['Caffeine', { frontal: 30, stem: 40, motor: 15, limbic: -10 }],
    ['Alcohol', { frontal: -60, cerebellum: -55, motor: -35, limbic: 30, temporal: -15 }],
    ['MDMA', { limbic: 85, temporal: 40, frontal: 15, stem: 30, parietal: -15 }],
    ['Opioid', { stem: -55, limbic: 60, frontal: -30, motor: -30, parietal: -20 }],
    ['Anesthesia', { frontal: -90, parietal: -85, temporal: -80, occipital: -70, limbic: -60, motor: -80, cerebellum: -60, stem: -25 }, true]
  ]],
  ['States', [
    ['Meditation', { frontal: 35, parietal: -45, limbic: -50, stem: 40, occipital: -10 }],
    ['Love', { limbic: 80, frontal: 20, temporal: 35, stem: 25, occipital: 20 }],
    ['Empathy', { limbic: 45, temporal: 40, frontal: 25 }],
    ['Flow state', { frontal: -20, motor: 55, cerebellum: 60, parietal: 40, limbic: 20 }],
    ['Fear', { limbic: 90, stem: 55, frontal: -35, motor: 30, occipital: 25 }],
    ['Rage', { limbic: 85, frontal: -65, motor: 55, stem: 50 }],
    ['Grief', { limbic: 60, frontal: -30, motor: -45, stem: -20, temporal: 25 }],
    ['Euphoria', { limbic: 70, frontal: 10, occipital: 30, motor: 20 }],
    ['Deep sleep', { frontal: -70, parietal: -60, occipital: -50, motor: -75, stem: -35, limbic: -30 }],
    ['Panic', { limbic: 100, stem: 80, frontal: -60, motor: 40 }, true]
  ]]
];

// ---------- brain geometry ----------
const X = [], Y = [], Z = [], REG = [], HEM = [], GRP = [];
const TADPOLE = REGIONS.length;           // drawing group for the BCI symbiont nodes
const tadEdges = [];
const WB = document.body.dataset.scene === 'wellbeing';
function add(x, y, z, reg, hem, grp) { X.push(x); Y.push(y); Z.push(z); REG.push(reg); HEM.push(hem); GRP.push(grp === undefined ? reg : grp); return X.length - 1; }

function cortexRegion(x, y, z) {
  if (y < -0.15 && Math.abs(x) > 0.3 && z > -0.45 && z < 0.55) return R.temporal;
  if (z < -0.5) return R.occipital;
  if (z > 0.3) return R.frontal;
  if (z > 0.0 && y > 0.12) return R.motor;
  return R.parietal;
}

function fibonacci(i, n) {
  const y = 1 - 2 * (i + .5) / n, r = Math.sqrt(1 - y * y), t = i * 2.399963;
  return [Math.cos(t) * r, y, Math.sin(t) * r];
}

function buildCortex() {
  const N = 1500;
  for (const h of [-1, 1]) {
    for (let i = 0; i < N; i++) {
      const [dx, dy, dz] = fibonacci(i, N);
      // gyri and sulci: ridged interference pattern
      const f = Math.sin(9 * dx + 4 * dy + 1.7 * h) * Math.sin(8 * dy + 5 * dz) + .5 * Math.sin(7 * dz + 6 * dx * h);
      const ridge = 1 + .07 * f;
      let sx = .5, sy = .62, sz = .95;
      if (dz < -.4) { sx *= .86; sy *= .86; }
      let x = h * .46 + dx * sx * ridge;
      let y = .08 + dy * sy * ridge;
      let z = dz * sz * ridge;
      if (dy < 0) y += dy * .06;
      // temporal lobe bulge under and out
      if (dy < -.1 && h * dx > .2 && dz > -.35 && dz < .6) { y -= .1 * -dy; x += h * .05; }
      if (Math.abs(x) < .035) continue;
      add(x, y, z, cortexRegion(x, y, z), h);
    }
    // white matter fill
    for (let i = 0; i < 160; i++) {
      const [dx, dy, dz] = fibonacci(i * 7 % 160, 160);
      const k = .35 + .3 * ((i * 37 % 100) / 100);
      const x = h * .46 + dx * .5 * k, y = .08 + dy * .62 * k, z = dz * .95 * k;
      add(x, y, z, cortexRegion(x, y, z), h);
    }
  }
}

function buildLimbic() {
  for (const h of [-1, 1]) {
    for (let i = 0; i < 40; i++) {            // hippocampus
      const t = i / 39;
      add(h * (.3 - .04 * t), -.2 + .1 * Math.sin(t * 3), .05 - .45 * t, R.limbic, h);
    }
    for (let i = 0; i < 36; i++) {            // amygdala
      const [dx, dy, dz] = fibonacci(i, 36);
      add(h * .3 + dx * .07, -.22 + dy * .07, .22 + dz * .07, R.limbic, h);
    }
    for (let i = 0; i < 70; i++) {            // thalamus
      const [dx, dy, dz] = fibonacci(i, 70);
      add(h * .1 + dx * .09, dy * .09, -.05 + dz * .12, R.limbic, h);
    }
    for (let i = 0; i < 50; i++) {            // cingulate gyrus
      const t = i / 49;
      add(h * .07, .26 + .2 * Math.sin(t * Math.PI) - .1 * (1 - t) * 0, .7 - 1.2 * t, R.limbic, h);
    }
  }
  for (let i = 0; i < 45; i++) {              // corpus callosum
    const t = i / 44;
    add((i % 2 ? 1 : -1) * .04 * (1 - t), .3 + .1 * Math.sin(t * Math.PI), .6 - 1.1 * t, R.limbic, i % 2 ? 1 : -1);
  }
}

function buildCerebellum() {
  const N = 520;
  for (let i = 0; i < N; i++) {
    const [dx, dy, dz] = fibonacci(i, N);
    const folds = 1 + .05 * Math.sin(46 * dy);   // fine horizontal folia
    const x = dx * .45 * folds, y = -.45 + dy * .2 * folds, z = -.72 + dz * .28 * folds;
    add(x, y, z, R.cerebellum, x < 0 ? -1 : 1);
  }
}

function buildStem() {
  for (let i = 0; i < 130; i++) {
    const t = i / 129, a = i * 2.4;
    const rad = .085 * (1 - .3 * t);
    add(Math.cos(a) * rad, -.3 - .7 * t, -.25 - .2 * t + Math.sin(a) * rad, R.stem, 0);
  }
}

// BCI symbiont: a bulb with a curling tail and short limbs, clasped to the back of the brainstem.
function buildTadpole() {
  const stemStart = X.length - 130;
  const nd = (x, y, z) => add(x, y, z, R.stem, 0, TADPOLE);
  const link = (a, b) => tadEdges.push([a, b]);
  const c = [0, -.74, -.56], body = [];
  for (let i = 0; i < 34; i++) {
    const [dx, dy, dz] = fibonacci(i, 34);
    body.push(nd(c[0] + dx * .075, c[1] + dy * .095, c[2] + dz * .075));
  }
  body.forEach(a => {
    body.map(b => [Math.hypot(X[a] - X[b], Y[a] - Y[b], Z[a] - Z[b]), b])
      .sort((p, q) => p[0] - q[0]).slice(1, 4).forEach(([, b]) => { if (a < b) link(a, b); });
  });
  body.filter(a => Z[a] > c[2] + .04).forEach(a => {
    let best = stemStart, bd = 9;
    for (let s = stemStart; s < stemStart + 130; s++) {
      const d = Math.hypot(X[a] - X[s], Y[a] - Y[s], Z[a] - Z[s]);
      if (d < bd) { bd = d; best = s; }
    }
    link(a, best);
  });
  let prev = body.reduce((m, a) => Y[a] < Y[m] ? a : m);
  for (let i = 0; i < 16; i++) {
    const t = (i + 1) / 16;
    const n = nd(Math.sin(t * 6) * .05, c[1] - .09 - t * .3, c[2] - .02 - t * .05 + Math.sin(t * 5) * .03);
    link(prev, n); prev = n;
  }
  for (let k = 0; k < 6; k++) {
    const h = k % 2 ? 1 : -1, kk = (k >> 1) + 1;
    const start = body.filter(a => X[a] * h > .03).reduce((m, a) => Math.abs(Y[a] - c[1]) < Math.abs(Y[m] - c[1]) ? a : m, body[0]);
    const end = [h * (.14 + .05 * kk), c[1] + .12 - .07 * kk, c[2] + .14 + .03 * kk];
    const mid = [(X[start] + end[0]) / 2 + h * .05, (Y[start] + end[1]) / 2 - .04, (Z[start] + end[2]) / 2 - .04];
    let last = start;
    for (let j = 1; j <= 4; j++) {
      const u = j / 4, v = 1 - u;
      const p = [X[start], Y[start], Z[start]].map((q, m) => v * v * q + 2 * v * u * mid[m] + u * u * end[m]);
      const n = nd(p[0], p[1], p[2]);
      link(last, n); last = n;
    }
  }
}

buildCortex(); buildLimbic(); buildCerebellum(); buildStem(); buildTadpole();
const N = X.length;

// ---------- connectivity ----------
const edges = [];
const adj = Array.from({ length: N }, () => []);
(function buildEdges() {
  const seen = new Set();
  const K = 3;
  for (const [i, j] of tadEdges) {
    const key = i < j ? i * N + j : j * N + i;
    if (seen.has(key)) continue;
    seen.add(key); edges.push([i, j]); adj[i].push(j); adj[j].push(i);
  }
  for (let i = 0; i < N; i++) {
    const best = [];
    for (let j = 0; j < N; j++) {
      if (j === i) continue;
      const dx = X[i] - X[j], dy = Y[i] - Y[j], dz = Z[i] - Z[j];
      const d = dx * dx + dy * dy + dz * dz;
      if (best.length < K || d < best[best.length - 1][0]) {
        best.push([d, j]); best.sort((a, b) => a[0] - b[0]);
        if (best.length > K) best.pop();
      }
    }
    for (const [d, j] of best) {
      if (d > .012) continue;
      const key = i < j ? i * N + j : j * N + i;
      if (seen.has(key)) continue;
      seen.add(key); edges.push([i, j]);
      adj[i].push(j); adj[j].push(i);
    }
  }
})();

const byRegion = REGIONS.map((_, r) => { const a = []; for (let i = 0; i < N; i++) if (REG[i] === r && GRP[i] !== TADPOLE) a.push(i); return a; });
const byGroup = byRegion.concat([GRP.map((g, i) => g === TADPOLE ? i : -1).filter(i => i >= 0)]);

// long-range fibers (curved through the interior)
const fibers = [];
(function buildFibers() {
  let seed = 7;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const pick = a => a[Math.floor(rnd() * a.length)];
  for (let n = 0; n < 340; n++) {
    const i = Math.floor(rnd() * N);
    if (GRP[i] === TADPOLE) continue;
    const r = REG[i];
    let tr = rnd() < .22 ? r : pick(linked[r]);
    let j = pick(byRegion[tr]);
    if (rnd() < .3 && HEM[i] !== 0) {            // callosal crossing
      const same = byRegion[r].filter(k => HEM[k] === -HEM[i]);
      if (same.length) j = pick(same);
    }
    const d = Math.hypot(X[i] - X[j], Y[i] - Y[j], Z[i] - Z[j]);
    if (d < .45) continue;
    const mx = (X[i] + X[j]) / 2 * .45, my = .05 + ((Y[i] + Y[j]) / 2 - .05) * .45, mz = (Z[i] + Z[j]) / 2 * .6;
    fibers.push({ a: i, b: j, cx: mx, cy: my, cz: mz });
    adj[i].push(j); adj[j].push(i);
  }
})();

// ---------- simulation state ----------
const target = new Float32Array(REGIONS.length);
const level = new Float32Array(REGIONS.length);
const eff = new Float32Array(REGIONS.length);
const act = new Float32Array(N);
let queue = [];
let selected = -1;

function baseRate(r) { return Math.max(.03, Math.min(1.3, .35 + .6 * eff[r])); }

function stepSim(dt, now) {
  for (let r = 0; r < REGIONS.length; r++) level[r] += (target[r] - level[r]) * Math.min(1, dt * 3);
  for (let r = 0; r < REGIONS.length; r++) {
    let s = 0; for (const o of linked[r]) s += level[o];
    eff[r] = Math.max(-1, Math.min(1, level[r] + .22 * s / Math.max(1, linked[r].length)));
  }
  const decay = Math.exp(-dt * 3.2);
  for (let i = 0; i < N; i++) act[i] *= decay;

  for (let r = 0; r < REGIONS.length; r++) {
    const list = byRegion[r];
    let n = list.length * baseRate(r) * .22 * dt, k = Math.floor(n);
    if (Math.random() < n - k) k++;
    for (let c = 0; c < k; c++) fire(list[Math.floor(Math.random() * list.length)], now);
  }
  const next = [];
  for (const q of queue) { if (q[1] <= now) fire(q[0], now); else next.push(q); }
  queue = next.length > 3500 ? next.slice(-3500) : next;
}

function fire(i, now) {
  if (act[i] > .5) return;
  act[i] = 1;
  for (const j of adj[i]) {
    const p = .14 * (.5 + baseRate(REG[j]));
    if (Math.random() < p) queue.push([j, now + .06 + Math.random() * .12]);
  }
}

// ---------- rendering ----------
let W = 0, H = 0, dpr = 1;
let yaw = .9, pitch = .12, zoom = 1, userActive = 0;
const PX = new Float32Array(N), PY = new Float32Array(N), PZ = new Float32Array(N);
let cx0 = 0, cy0 = 0, scale = 1;

function resize() {
  dpr = Math.min(window.devicePixelRatio || 1, WB ? 1.25 : 2);
  W = window.innerWidth; H = window.innerHeight;
  canvas.width = W * dpr; canvas.height = H * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
window.addEventListener('resize', resize); resize();

function layout() {
  const narrow = W <= 700;
  const panelW = narrow ? 0 : Math.max(300, Math.min(380, W * .34));
  const availW = W - panelW, availH = narrow ? H * .52 : H;
  cx0 = availW / 2; cy0 = availH / 2 + (narrow ? 20 : 0);
  scale = Math.min(availW / 2.9, availH / 2.7) * zoom;
}

let cosY, sinY, cosP, sinP;
function project(x, y, z) {
  const rx = x * cosY + z * sinY, rz = -x * sinY + z * cosY;
  const ry = y * cosP - rz * sinP, rz2 = y * sinP + rz * cosP;
  const persp = 1 / (1 - rz2 * .28);
  return [cx0 + rx * scale * persp, cy0 - ry * scale * persp, rz2];
}

function hexRgb(h) { return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]; }
const RGB = REGIONS.map(r => hexRgb(r.color)); RGB.push([226, 114, 26]);
const rgba = (r, a) => 'rgba(' + RGB[r][0] + ',' + RGB[r][1] + ',' + RGB[r][2] + ',' + a + ')';

// ---------- wellbeing mode: live streams drive the same mesh ----------
const SEEDS = {
  hrv: ['stem', [0, -.35, -.28]], resp: ['stem', [0, -.85, -.42]], alpha: ['occipital', [0, .15, -.9]],
  theta: ['frontal', [0, .4, .85]], affect: ['limbic', [0, 0, 0]], recovery: ['cerebellum', [0, -.45, -.72]],
  bond: [null, [0, -.74, -.56]]
};
// Share of each stream's level applied to a region (so effects follow the wellbeing modifiers).
const NO_BRAIN_EFFECT = new Set(['hrv', 'resp']);   // shown in the data panel only
const DRIVES = { alpha: { occipital: 1, parietal: .6 }, theta: { frontal: 1 },
  affect: { limbic: 1 }, recovery: { cerebellum: 1, motor: .3 } };
const FOCUS_REGION = { alpha: R.occipital, theta: R.frontal, affect: R.limbic, recovery: R.cerebellum, bond: R.stem };
let waves = [], lastFocus = null;
const pulseI = new Float32Array(N), pulseC = new Int8Array(N);

function setupWaves() {
  const streams = window.WellbeingStreams || [];
  waves = streams.filter(s => !NO_BRAIN_EFFECT.has(s.id)).map(s => {
    const [reg, p] = SEEDS[s.id] || ['stem', [0, -.5, -.3]];
    const list = reg === null ? byGroup[TADPOLE] : byRegion[R[reg]];
    let seed = list[0], bd = 1e9;
    for (const i of list) { const d = (X[i] - p[0]) ** 2 + (Y[i] - p[1]) ** 2 + (Z[i] - p[2]) ** 2; if (d < bd) { bd = d; seed = i; } }
    const dist = new Float32Array(N).fill(Infinity); dist[seed] = 0;
    const q = [seed];
    for (let h = 0; h < q.length; h++) for (const j of adj[q[h]]) if (dist[j] === Infinity) { dist[j] = dist[q[h]] + 1; q.push(j); }
    let reach = 0; for (let i = 0; i < N; i++) if (dist[i] !== Infinity && dist[i] > reach) reach = dist[i];
    return { s, dist, reach, t0: null, nextAt: 0 };
  });
}

function stepWellbeing(nowMs) {
  const st = window.WellbeingState;
  if (!waves.length) { if (!window.WellbeingStreams) return; setupWaves(); waves.forEach((w, i) => { w.nextAt = nowMs + i * 850; }); }
  const focus = st ? st.focus : null;
  if (focus !== lastFocus) {
    lastFocus = focus;
    select(focus && FOCUS_REGION[focus] !== undefined ? FOCUS_REGION[focus] : -1);
  }
  target.fill(0);
  const share = new Float32Array(REGIONS.length);
  for (const w of waves) {
    const s = w.s, d = DRIVES[s.id];
    if (d) for (const k in d) { target[R[k]] += (s.norm - .5) * 1.2 * d[k]; share[R[k]] += d[k]; }
    if (s.pulse || (w.t0 === null ? nowMs >= w.nextAt : nowMs - w.t0 > s.period)) {
      w.t0 = nowMs; w.nextAt = nowMs + s.period; s.pulse = false;
    }
  }
  for (let r = 0; r < target.length; r++) if (share[r] > 1) target[r] /= share[r];
  pulseI.fill(0);
  waves.forEach((w, c) => {
    if (w.t0 === null) return;
    const s = w.s, age = (nowMs - w.t0) / 1000;
    const radius = age * s.speed * 5, width = 1.2 + s.trail / 20;
    const fade = Math.max(0, 1 - age * 1000 / (s.period * 1.2)) * (focus && focus !== s.id ? .3 : 1);
    if (fade <= 0 || radius > w.reach + width * 2) return;
    for (let i = 0; i < N; i++) {
      const d = w.dist[i]; if (d === Infinity) continue;
      const z = (d - radius) / width, a = Math.exp(-z * z) * fade;
      if (a > pulseI[i]) { pulseI[i] = a; pulseC[i] = c; }
    }
  });
}

function drawWellbeing() {
  const pathsByWave = waves.map(() => new Path2D());
  const used = waves.map(() => false);
  for (const [i, j] of edges) {
    if (pulseI[i] > .3 && pulseI[j] > .3) { const c = pulseC[i]; pathsByWave[c].moveTo(PX[i], PY[i]); pathsByWave[c].lineTo(PX[j], PY[j]); used[c] = true; }
  }
  ctx.lineWidth = 1.1;
  waves.forEach((w, c) => { if (used[c]) { ctx.strokeStyle = 'rgba(' + w.s.color.join(',') + ',.52)'; ctx.stroke(pathsByWave[c]); } });
  for (let i = 0; i < N; i++) {
    const a = pulseI[i]; if (a < .48) continue;
    const rgb = waves[pulseC[i]].s.color.join(','), rad = 1.2 + a * 1.4 * (1 + Math.max(0, PZ[i]) * .4);
    ctx.fillStyle = 'rgba(' + rgb + ',' + (.32 + a * .36) + ')'; ctx.beginPath(); ctx.arc(PX[i], PY[i], rad * .6, 0, 6.283); ctx.fill();
  }
  const st = window.WellbeingState;
  if (statusEl && st) statusEl.innerHTML = 'Wellbeing index &nbsp;<b>' + st.index.toFixed(1) + '</b>';
}

function draw(now) {
  layout();
  cosY = Math.cos(yaw); sinY = Math.sin(yaw); cosP = Math.cos(pitch); sinP = Math.sin(pitch);
  ctx.clearRect(0, 0, W, H);
  for (let i = 0; i < N; i++) { const p = project(X[i], Y[i], Z[i]); PX[i] = p[0]; PY[i] = p[1]; PZ[i] = p[2]; }

  const R8 = REGIONS.length + 1;
  const dim = r => selected < 0 || selected === r || (r === TADPOLE && selected === R.stem) ? 1 : .35;

  // resting mesh, bucketed by region and depth
  const paths = [];
  for (let k = 0; k < R8 * 2; k++) paths.push(new Path2D());
  const lit = Array.from({ length: R8 }, () => new Path2D());
  let anyLit = new Array(R8).fill(false);
  for (const [i, j] of edges) {
    const r = GRP[i], back = (PZ[i] + PZ[j]) < 0 ? 1 : 0;
    const p = paths[r * 2 + back];
    p.moveTo(PX[i], PY[i]); p.lineTo(PX[j], PY[j]);
    if (act[i] + act[j] > .45) { lit[r].moveTo(PX[i], PY[i]); lit[r].lineTo(PX[j], PY[j]); anyLit[r] = true; }
  }
  ctx.lineWidth = .6;
  for (let r = 0; r < R8; r++) {
    ctx.strokeStyle = rgba(r, .05 * dim(r)); ctx.stroke(paths[r * 2 + 1]);
    ctx.strokeStyle = rgba(r, .26 * dim(r));  ctx.stroke(paths[r * 2]);
  }

  // long fibers
  ctx.lineWidth = .7;
  for (const f of fibers) {
    const a = project(X[f.a], Y[f.a], Z[f.a]), b = project(X[f.b], Y[f.b], Z[f.b]), c = project(f.cx, f.cy, f.cz);
    const g = Math.max(act[f.a], act[f.b]), r = REG[f.a];
    ctx.strokeStyle = g > .25 ? rgba(r, Math.min(.9, .25 + g * .7)) : rgba(r, .035 * dim(r) + (c[2] > 0 ? .05 : 0));
    ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.quadraticCurveTo(c[0] * 2 - (a[0] + b[0]) / 2, c[1] * 2 - (a[1] + b[1]) / 2, b[0], b[1]); ctx.stroke();
  }

  // firing edges
  ctx.lineWidth = 1.3;
  for (let r = 0; r < R8; r++) if (anyLit[r]) { ctx.strokeStyle = rgba(r, .85); ctx.stroke(lit[r]); }

  // nodes
  for (let r = 0; r < R8; r++) {
    const list = byGroup[r], d = dim(r);
    ctx.fillStyle = rgba(r, .15 * d);
    for (const i of list) if (PZ[i] < 0 && act[i] < .08) ctx.fillRect(PX[i] - .7, PY[i] - .7, 1.4, 1.4);
    ctx.fillStyle = rgba(r, .8 * d);
    const big = r === TADPOLE ? 1.9 : 1;
    for (const i of list) if (PZ[i] >= 0 && act[i] < .08) { const s = (1.4 + PZ[i] * .9) * big; ctx.fillRect(PX[i] - s / 2, PY[i] - s / 2, s, s); }
    if (r === TADPOLE) { ctx.fillStyle = rgba(r, .5 * d); for (const i of list) if (PZ[i] < 0) ctx.fillRect(PX[i] - 1.2, PY[i] - 1.2, 2.4, 2.4); }
  }
  for (let i = 0; i < N; i++) {
    const a = act[i]; if (a < .08) continue;
    const r = GRP[i], rad = 2 + a * 4.5 * (1 + Math.max(0, PZ[i]) * .4);
    ctx.fillStyle = rgba(r, a * .22); ctx.beginPath(); ctx.arc(PX[i], PY[i], rad * 1.8, 0, 6.283); ctx.fill();
    ctx.fillStyle = rgba(r, .55 + a * .45); ctx.beginPath(); ctx.arc(PX[i], PY[i], rad * .55, 0, 6.283); ctx.fill();
  }

  if (WB) drawWellbeing();
  drawLabels();
}

const centroids = REGIONS.map((_, r) => {
  let x = 0, y = 0, z = 0; const l = byRegion[r];
  for (const i of l) { x += X[i]; y += Y[i]; z += Z[i]; }
  return [x / l.length, y / l.length, z / l.length];
});
// push labels outward so they sit on the outer surface
centroids[R.frontal] = [0, .45, .8]; centroids[R.motor] = [0, .72, .15];
centroids[R.parietal] = [0, .6, -.3]; centroids[R.temporal] = [.78, -.3, .15];
centroids[R.occipital] = [0, .15, -.95]; centroids[R.limbic] = [.12, 0, 0]; centroids[R.stem] = [0, -.6, -.35];

function drawLabels() {
  ctx.font = '500 9px Barlow, Segoe UI, sans-serif';
  ctx.textAlign = 'center';
  REGIONS.forEach((reg, r) => {
    const c = centroids[r];
    // choose the hemisphere facing the camera for lateral labels
    const sx = r === R.temporal ? (Math.sin(yaw) > 0 ? -1 : 1) * Math.abs(c[0]) : c[0];
    const p = project(sx, c[1], c[2]);
    const sel = selected === r;
    ctx.fillStyle = sel ? reg.color : 'rgba(58,63,72,' + (p[2] > -.3 ? .8 : .35) + ')';
    ctx.fillRect(p[0] - 2, p[1] - 2, 4, 4);
    ctx.fillText(reg.name.toUpperCase(), p[0], p[1] - 8);
  });
  const t = project(0, -.9, -.62);
  ctx.fillStyle = 'rgb(226,114,26)'; ctx.fillRect(t[0] - 2, t[1] - 2, 4, 4);
  ctx.fillText('TADPOLE', t[0], t[1] + 14);
}

// ---------- interaction ----------
let drag = null;
canvas.addEventListener('pointerdown', e => {
  drag = { x: e.clientX, y: e.clientY, sx: e.clientX, sy: e.clientY, moved: 0 };
  canvas.setPointerCapture(e.pointerId);
});
canvas.addEventListener('pointermove', e => {
  if (!drag) return;
  const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
  drag.x = e.clientX; drag.y = e.clientY; drag.moved += Math.abs(dx) + Math.abs(dy);
  yaw += dx * .008; pitch = Math.max(-1.2, Math.min(1.2, pitch + dy * .006));
  userActive = performance.now();
});
canvas.addEventListener('pointerup', e => {
  if (drag && drag.moved < 5) pick(e.clientX, e.clientY);
  drag = null;
});
canvas.addEventListener('wheel', e => {
  e.preventDefault();
  zoom = Math.max(.6, Math.min(2.6, zoom * Math.exp(-e.deltaY * .001)));
}, { passive: false });
const touches = new Map(); let pinch = 0;
canvas.addEventListener('touchmove', e => {
  if (e.touches.length === 2) {
    const d = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
    if (pinch) zoom = Math.max(.6, Math.min(2.6, zoom * d / pinch));
    pinch = d;
  }
}, { passive: true });
canvas.addEventListener('touchend', () => { pinch = 0; });

function pick(mx, my) {
  let best = -1, bd = 22 * 22, bz = -9;
  for (let i = 0; i < N; i++) {
    const dx = PX[i] - mx, dy = PY[i] - my, d = dx * dx + dy * dy;
    if (d < bd && (PZ[i] > bz - .15)) { if (d < bd || PZ[i] > bz) { best = i; bd = d; bz = PZ[i]; } }
  }
  select(best < 0 ? -1 : REG[best] === selected ? -1 : REG[best]);
}

// ---------- panel ----------
const regionsEl = document.getElementById('regions');
const traitsEl = document.getElementById('traits');
const presetsEl = document.getElementById('presets');
const statusEl = document.getElementById(WB ? 'readout' : 'status');
const sliders = [], outputs = [], rows = [];

if (regionsEl) REGIONS.forEach((reg, r) => {
  const row = document.createElement('div');
  row.className = 'region'; row.style.setProperty('--c', reg.color);
  row.innerHTML = '<div class="row"><b><i></i>' + reg.name + '</b><output>0</output></div><small>' + reg.note + '</small>' +
    '<input type="range" min="-100" max="100" value="0" aria-label="' + reg.name + ' alteration: suppress to stimulate">';
  const input = row.querySelector('input'), out = row.querySelector('output');
  input.addEventListener('input', () => { target[r] = input.value / 100; out.textContent = fmt(input.value); });
  row.addEventListener('click', e => { if (e.target !== input) select(selected === r ? -1 : r); });
  regionsEl.appendChild(row); sliders.push(input); outputs.push(out); rows.push(row);
});
const fmt = v => (v > 0 ? '+' : '') + v;

function select(r) {
  selected = r;
  rows.forEach((row, i) => row.classList.toggle('sel', i === r));
  if (r >= 0 && rows[r]) rows[r].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
}

function setLevels(map) {
  REGIONS.forEach((reg, r) => {
    const v = map[reg.id] || 0;
    sliders[r].value = v; outputs[r].textContent = fmt(v); target[r] = v / 100;
  });
}

if (presetsEl) PRESET_GROUPS.forEach(([group, list]) => {
  if (!presetsEl) return;
  const label = document.createElement('div');
  label.className = 'eyebrow group'; label.textContent = group;
  presetsEl.appendChild(label);
  list.forEach(([name, map, warn]) => {
    const b = document.createElement('button');
    b.textContent = name; if (warn) b.className = 'warn';
    b.addEventListener('click', () => setLevels(map));
    presetsEl.appendChild(b);
  });
});

const traitBars = !traitsEl ? [] : TRAITS.map(([name]) => {
  const d = document.createElement('div'); d.className = 'trait';
  d.innerHTML = '<span>' + name + '</span><div class="bar"><span></span></div><em>50</em>';
  traitsEl.appendChild(d);
  return [d.querySelector('.bar span'), d.querySelector('em')];
});
const stabil = document.createElement('div'); stabil.className = 'trait';
stabil.innerHTML = '<span>Self integrity</span><div class="bar"><span></span></div><em>100</em>';
if (traitsEl) traitsEl.appendChild(stabil);

function updatePanel() {
  if (!traitsEl) return;
  TRAITS.forEach(([, w], t) => {
    let s = 0; for (const k in w) s += w[k] * eff[R[k]];
    const v = Math.round(50 + 50 * Math.max(-1, Math.min(1, s)));
    traitBars[t][0].style.width = v + '%'; traitBars[t][1].textContent = v;
  });
  let dev = 0; for (let r = 0; r < REGIONS.length; r++) dev += Math.abs(level[r]);
  dev /= REGIONS.length;
  const maxDev = Math.max(...Array.from(level, Math.abs));
  const integrity = Math.round(Math.max(0, 100 - 55 * dev - 30 * maxDev * maxDev));
  stabil.querySelector('.bar span').style.width = integrity + '%';
  stabil.querySelector('em').textContent = integrity;
  const warn = integrity < 45;
  statusEl.classList.toggle('warn', warn);
  statusEl.innerHTML = warn
    ? '<b>Cascade instability</b> &mdash; reset advised &nbsp;/&nbsp; integrity ' + integrity
    : '<b>Mesh stable</b> &nbsp;/&nbsp; ' + (dev < .02 ? 'unaltered baseline' : 'alteration in progress') + ' &nbsp;/&nbsp; integrity ' + integrity;
}

// ---------- loop ----------
let last = performance.now(), panelTick = 0, lastDraw = 0;
const FRAME_MS = WB ? 1000 / 30 : 0;
function frame(t) {
  requestAnimationFrame(frame);
  if (FRAME_MS && t - lastDraw < FRAME_MS - 1) return;
  lastDraw = t;
  const dt = Math.min(.05, (t - last) / 1000); last = t;
  if (!drag && t - userActive > 2500) yaw += dt * (WB ? .06 : .12);
  stepSim(dt, t / 1000);
  if (WB) stepWellbeing(t);
  draw(t / 1000);
  if ((panelTick += dt) > .12) { panelTick = 0; updatePanel(); }
}
requestAnimationFrame(frame);
})();
