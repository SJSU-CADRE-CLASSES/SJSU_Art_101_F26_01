(function () {
'use strict';

// Three kinds of empathy, each tied to the brain regions research associates with it.
const KINDS = [
  { id: 'affective', name: 'Affective empathy', region: 'Anterior insula, anterior cingulate',
    fact: 'Affective empathy is feeling a share of what someone else feels. Watching another person in pain activates part of the same circuits that process your own pain.',
    odd: 'Even a handshake with someone anxious can nudge your heart rate toward theirs.', color: [226, 70, 120] },
  { id: 'cognitive', name: 'Cognitive empathy', region: 'Temporoparietal junction, medial prefrontal cortex',
    fact: 'Cognitive empathy, or theory of mind, is working out what someone thinks and feels without feeling it yourself. It is how a good negotiator or a good teacher reads a room.',
    odd: 'Children usually pass the "false belief" test, knowing someone can be wrong about the world, at around four years old.', color: [30, 120, 220] },
  { id: 'compassion', name: 'Compassion', region: 'Ventral striatum, medial orbitofrontal cortex',
    fact: 'Compassion is the wish to help. Studies by Tania Singer and Olga Klimecki found that compassion training activates reward and affiliation circuits, while raw shared distress activates pain circuits.',
    odd: 'This is why caring professionals who train compassion tend to burn out less than those who only absorb distress.', color: [60, 160, 80] }
];

// valence: how pleasant; weight: how strongly it spreads between people.
const EMOTIONS = [
  { id: 'joy', name: 'Joy', valence: 1, spread: .9, note: 'Positive emotions spread readily and are cheap to carry.' },
  { id: 'calm', name: 'Calm', valence: .6, spread: .6, note: 'Calm is contagious too. A steady person lowers the arousal of everyone near them.' },
  { id: 'grief', name: 'Grief', valence: -.8, spread: .8, note: 'Grief is heavy to share. Being present helps more than absorbing it.' },
  { id: 'fear', name: 'Fear', valence: -1, spread: 1, note: 'Fear is the most contagious emotion, because it evolved to warn a group fast.' }
];

const panel = document.createElement('aside');
panel.id = 'empathy-panel';
panel.setAttribute('aria-label', 'Empathy explorer');
panel.innerHTML =
  '<div class="eyebrow">Simulated exchange / consent protocol active</div>' +
  '<h2>Empathy explorer</h2>' +
  '<div class="tabs" role="tablist"></div>' +
  '<div class="kind" aria-live="polite"></div>' +
  '<div class="eyebrow sect">Send a feeling</div>' +
  '<div class="emos"></div>' +
  '<canvas class="link" aria-label="Signal passing between two people"></canvas>' +
  '<label class="open"><span>Openness</span><input type="range" min="0" max="100" value="50" aria-label="How open the receiver is"><output>50%</output></label>' +
  '<div class="meters"></div>' +
  '<p class="note"></p>' +
  '<p class="foot"><strong>Private thought: preserved.</strong> This channel shares emotional intensity. Memories and thought content require separate consent. A fictional model.</p>';
document.body.appendChild(panel);

const style = document.createElement('style');
style.textContent =
  '#empathy-panel{position:fixed;z-index:2;top:120px;right:24px;bottom:56px;width:330px;overflow-y:auto;padding:0 6px 0 0;color:#636a75;font-size:12px;line-height:1.5}' +
  '#empathy-panel .eyebrow{color:#8a9099;font-size:10px;letter-spacing:.16em;text-transform:uppercase}' +
  '#empathy-panel h2{margin:5px 0 12px;color:#0b1f4d;font:500 18px "Barlow",sans-serif;letter-spacing:.04em;text-transform:uppercase}' +
  '#empathy-panel .sect{margin-top:14px;padding-top:10px;border-top:1px solid #d4d7dc}' +
  '#empathy-panel .tabs,#empathy-panel .emos{display:flex;gap:6px;flex-wrap:wrap;margin-top:7px}' +
  '#empathy-panel button{padding:6px 9px;border:1px solid #0b1f4d;background:#fff;color:#0b1f4d;font:500 10px "Barlow",sans-serif;letter-spacing:.1em;text-transform:uppercase;cursor:pointer}' +
  '#empathy-panel button:hover,#empathy-panel button:focus-visible{background:rgba(11,31,77,.08);outline:none}' +
  '#empathy-panel button.on{background:#0b1f4d;color:#fff}' +
  '#empathy-panel .kind{min-height:150px;margin-top:10px;padding:2px 0 0 10px;border-left:3px solid var(--c,#0b1f4d)}' +
  '#empathy-panel .kind b{display:block;color:#0b1f4d;font-size:10px;font-weight:500;letter-spacing:.12em;text-transform:uppercase}' +
  '#empathy-panel .kind p{margin:5px 0}' +
  '#empathy-panel .kind em{display:block;color:#8a9099;font-size:11px;font-style:normal}' +
  '#empathy-panel canvas.link{position:static;display:block;width:100%;height:70px;margin-top:10px;cursor:default;touch-action:auto}' +
  '#empathy-panel .open{display:grid;grid-template-columns:70px 1fr 38px;gap:8px;align-items:center;margin-top:6px;color:#8a9099;font-size:10px;letter-spacing:.1em;text-transform:uppercase}' +
  '#empathy-panel .open output{text-align:right;color:#0b1f4d}' +
  '#empathy-panel input[type=range]{width:100%;accent-color:#1c3a7a;cursor:pointer}' +
  '#empathy-panel .meter{display:grid;grid-template-columns:96px 1fr 30px;gap:8px;align-items:center;margin:6px 0;font-size:10px;letter-spacing:.08em;text-transform:uppercase}' +
  '#empathy-panel .bar{height:5px;background:#eceef1}' +
  '#empathy-panel .bar span{display:block;height:100%;background:var(--c);transition:width .25s}' +
  '#empathy-panel .meter em{color:#0b1f4d;font-style:normal;text-align:right}' +
  '#empathy-panel .note{min-height:36px;margin-top:8px;color:#636a75}' +
  '#empathy-panel .foot{margin-top:8px;color:#8a9099;font-size:9px;letter-spacing:.09em;line-height:1.8;text-transform:uppercase}' +
  '#empathy-panel .foot strong{color:#1c3a7a;font-weight:400}' +
  '#empathy-toggle{display:none}' +
  '@media(max-width:1100px){#empathy-toggle{display:block;position:fixed;z-index:4;top:150px;left:24px;right:auto;padding:8px 12px;border:1px solid #0b1f4d;background:#fff;color:#0b1f4d;font:500 12px "Barlow",sans-serif;letter-spacing:.12em;text-transform:uppercase;cursor:pointer}' +
  '#empathy-panel{display:none;z-index:3;top:auto;left:0;right:0;bottom:0;width:100%;max-height:60vh;padding:14px 18px;border-top:1px solid #d4d7dc;background:rgba(255,255,255,.96)}' +
  '#empathy-panel.show{display:block}#empathy-panel .kind{min-height:0}}' +
  '@media(max-width:760px){#empathy-toggle{top:104px;left:14px}}';
document.head.appendChild(style);

const toggle = document.createElement('button');
toggle.id = 'empathy-toggle'; toggle.type = 'button'; toggle.textContent = 'Explore empathy';
toggle.addEventListener('click', () => {
  const open = panel.classList.toggle('show');
  toggle.textContent = open ? 'Close' : 'Explore empathy';
});
document.body.appendChild(toggle);

const state = { kind: KINDS[0], emo: EMOTIONS[0], open: .5 };
const tabsEl = panel.querySelector('.tabs'), kindEl = panel.querySelector('.kind');
const emosEl = panel.querySelector('.emos'), metersEl = panel.querySelector('.meters');
const noteEl = panel.querySelector('.note'), slider = panel.querySelector('input'), out = panel.querySelector('output');
const link = panel.querySelector('canvas.link'), lctx = link.getContext('2d');

function makeButtons(host, list, key) {
  return list.map(item => {
    const b = document.createElement('button');
    b.type = 'button'; b.textContent = item.name;
    b.addEventListener('click', () => { state[key] = item; render(); });
    host.appendChild(b);
    return b;
  });
}
const tabBtns = makeButtons(tabsEl, KINDS, 'kind');
const emoBtns = makeButtons(emosEl, EMOTIONS, 'emo');

const METERS = ['Felt resonance', 'Understanding', 'Caring drive', 'Overwhelm'].map(name => {
  const d = document.createElement('div'); d.className = 'meter';
  d.innerHTML = '<span>' + name + '</span><div class="bar"><span></span></div><em>0</em>';
  metersEl.appendChild(d);
  return { d, bar: d.querySelector('.bar span'), em: d.querySelector('em') };
});

// Fictional model: openness scales what is felt; negative emotion at high openness tips into distress
// unless the caring drive (compassion) is the lens in use.
function compute() {
  const { kind, emo, open } = state;
  const strong = emo.spread * open;
  const felt = strong * (kind.id === 'affective' ? 1 : kind.id === 'compassion' ? .75 : .35);
  const understand = Math.min(1, .35 + .6 * open) * (kind.id === 'cognitive' ? 1 : .7);
  const care = (kind.id === 'compassion' ? 1 : .45) * (.3 + .7 * open) * (emo.valence < 0 ? 1 : .6);
  const distress = emo.valence < 0 ? felt * Math.abs(emo.valence) * (kind.id === 'compassion' ? .35 : 1) * (open > .6 ? 1.25 : .8) : 0;
  return [felt, understand, care, distress].map(v => Math.max(0, Math.min(1, v)));
}

function render() {
  tabBtns.forEach((b, i) => b.classList.toggle('on', KINDS[i] === state.kind));
  emoBtns.forEach((b, i) => b.classList.toggle('on', EMOTIONS[i] === state.emo));
  const k = state.kind;
  panel.style.setProperty('--c', 'rgb(' + k.color.join(',') + ')');
  kindEl.style.setProperty('--c', 'rgb(' + k.color.join(',') + ')');
  kindEl.innerHTML = '<b>' + k.name + ' / ' + k.region + '</b><p>' + k.fact + '</p><em>' + k.odd + '</em>';
  const v = compute();
  METERS.forEach((m, i) => {
    m.bar.style.width = Math.round(v[i] * 100) + '%'; m.em.textContent = Math.round(v[i] * 100);
    m.d.style.setProperty('--c', i === 3 ? '#c0392b' : 'rgb(' + k.color.join(',') + ')');
  });
  out.textContent = Math.round(state.open * 100) + '%';
  let tip = state.emo.note;
  if (v[3] > .55) tip += ' High openness to a heavy feeling risks empathic distress. Try Compassion or lower the openness.';
  else if (state.open < .15) tip += ' Nearly closed: little is shared, so little is felt.';
  noteEl.textContent = tip;
}

slider.addEventListener('input', () => { state.open = slider.value / 100; render(); });

// Two people with signal particles; speed and count follow how much is being felt.
const particles = [];
let last = performance.now();
function sizeLink() {
  const r = link.getBoundingClientRect(), dpr = Math.min(window.devicePixelRatio || 1, 2);
  link.width = Math.max(1, r.width * dpr); link.height = Math.max(1, r.height * dpr);
  lctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return [r.width, r.height];
}
function frame(now) {
  const dt = Math.min(.05, (now - last) / 1000); last = now;
  const [w, h] = sizeLink();
  lctx.clearRect(0, 0, w, h);
  const v = compute(), rgb = state.kind.color.join(','), bad = state.emo.valence < 0;
  const ax = 22, bx = w - 22, y = h / 2;
  lctx.strokeStyle = 'rgba(138,144,153,.35)'; lctx.lineWidth = 1;
  lctx.beginPath(); lctx.moveTo(ax, y); lctx.lineTo(bx, y); lctx.stroke();
  if (Math.random() < dt * (2 + state.emo.spread * 12 * (.3 + state.open))) {
    particles.push({ t: 0, off: (Math.random() - .5) * 18, speed: .35 + state.emo.spread * .5 });
  }
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i]; p.t += dt * p.speed;
    if (p.t >= 1) { particles.splice(i, 1); continue; }
    // The share that gets through is the receiver's openness; the rest fades before arriving.
    const reach = state.open, alpha = p.t < reach ? .85 : Math.max(0, .85 * (1 - (p.t - reach) * 6));
    const px = ax + (bx - ax) * p.t, py = y + p.off * Math.sin(p.t * Math.PI);
    lctx.fillStyle = 'rgba(' + (bad ? '192,57,43' : rgb) + ',' + alpha + ')';
    lctx.beginPath(); lctx.arc(px, py, 2.2, 0, 6.283); lctx.fill();
  }
  lctx.strokeStyle = '#0b1f4d'; lctx.fillStyle = '#fff'; lctx.lineWidth = 1.2;
  lctx.beginPath(); lctx.arc(ax, y, 9, 0, 6.283); lctx.fill(); lctx.stroke();
  const pulse = 9 + v[0] * 9 + Math.sin(now / 300) * v[0] * 2;
  lctx.fillStyle = 'rgba(' + (v[3] > .55 ? '192,57,43' : rgb) + ',' + (.15 + v[0] * .35) + ')';
  lctx.beginPath(); lctx.arc(bx, y, pulse, 0, 6.283); lctx.fill();
  lctx.fillStyle = '#fff'; lctx.beginPath(); lctx.arc(bx, y, 9, 0, 6.283); lctx.fill(); lctx.stroke();
  lctx.fillStyle = '#8a9099'; lctx.font = '500 8px Barlow, sans-serif'; lctx.textAlign = 'center';
  lctx.fillText('SENDER', ax, y + 26); lctx.fillText('YOU', bx, y + 26);
  requestAnimationFrame(frame);
}

render();
requestAnimationFrame(frame);
})();
