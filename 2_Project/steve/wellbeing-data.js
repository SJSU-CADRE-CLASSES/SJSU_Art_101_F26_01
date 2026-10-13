(function () {
'use strict';
const panel = document.getElementById('data-panel');
if (!panel) return;

// Each stream is sensed in one region of the brain; neural-view.js launches its pulse from that anchor.
const STREAMS = [
  { id: 'hrv', name: 'Heart rhythm', unit: 'ms HRV', dec: 0, lo: 20, hi: 100, base: 58, amp: 9, ideal: 62,
    period: 1800, speed: 2.3, trail: 12, color: [214, 64, 69], anchor: [0, -40, -10],
    region: 'Brainstem / cardiac center', measures: 'Beat-to-beat variation in heart timing (RMSSD).',
    source: 'Vagal tap on TADPOLE', rate: '250 Hz', use: 'Stress load and recovery. Each heartbeat sends a pulse up the brainstem into the cortex.' },
  { id: 'resp', name: 'Respiration', unit: 'breaths/min', dec: 1, lo: 8, hi: 24, base: 13.8, amp: 2, ideal: 13,
    period: 6000, speed: 1, trail: 32, color: [20, 160, 160], anchor: [0, -52, -14],
    region: 'Brainstem / breathing center', measures: 'Breathing rate and depth from the chest wall signal.',
    source: 'Chest-wall signal via spinal nerves', rate: '25 Hz', use: 'Arousal and calm. One slow wave per breath, spreading from the breathing center.' },
  { id: 'alpha', name: 'Alpha rhythm', unit: '% calm band', dec: 0, lo: 0, hi: 100, base: 64, amp: 14, ideal: 65,
    period: 3600, speed: 1.6, trail: 24, color: [124, 92, 214], anchor: [0, 8, -48],
    region: 'Brain / back of head', measures: 'Share of 8-12 Hz brain rhythm, a marker of relaxed wakefulness.',
    source: 'Cortical surface mesh', rate: '500 Hz', use: 'Rest versus strain. Waves start at the back of the brain and flow through it.' },
  { id: 'theta', name: 'Frontal theta', unit: '% focus load', dec: 0, lo: 0, hi: 100, base: 46, amp: 16, ideal: 50,
    period: 4300, speed: 1.7, trail: 22, color: [30, 120, 220], anchor: [0, 14, 50],
    region: 'Brain / forehead', measures: 'Share of 4-7 Hz rhythm tied to sustained attention and mental effort.',
    source: 'Cortical surface mesh', rate: '500 Hz', use: 'Cognitive load. Pulses start at the forehead and flow back through the brain.' },
  { id: 'affect', name: 'Affective tone', unit: 'valence', dec: 2, lo: -1, hi: 1, base: .42, amp: .22, ideal: .45,
    period: 5000, speed: 1.5, trail: 20, color: [226, 70, 120], anchor: [0, 0, 4],
    region: 'Brain / limbic core', measures: 'Mood direction, from -1 (distress) to +1 (contentment). This stream carries a summary value, never thought content.',
    source: 'Deep limbic hub', rate: '10 Hz', use: 'Early warning of low mood. Radiates from the center of the brain.' },
  { id: 'recovery', name: 'Recovery index', unit: '/ 100', dec: 0, lo: 0, hi: 100, base: 84, amp: 7, ideal: 88,
    period: 7000, speed: 1.2, trail: 36, color: [60, 160, 80], anchor: [-14, -28, -34],
    region: 'Cerebellum / recovery', measures: 'Sleep depth, last-night duration and muscle recovery combined.',
    source: 'Cerebellar motor tone and sleep log', rate: '1 Hz', use: 'Physical resilience. A slow swell rising from the cerebellum.' },
  { id: 'bond', name: 'TADPOLE bond', unit: '% integrity', dec: 1, lo: 90, hi: 100, base: 99.2, amp: .5, ideal: 99.5,
    period: 4600, speed: 2, trail: 16, color: [226, 114, 26], anchor: [0, -50, -13], bci: true,
    region: 'TADPOLE / brainstem and spine', measures: 'Signal quality and tissue health around the TADPOLE implant.',
    source: 'TADPOLE self-diagnostics', rate: '1 Hz', use: 'Device safety. Pulses ride the amber link along the spine.' }
];

const state = { focus: null, index: 92.8 };
window.WellbeingStreams = STREAMS;
window.WellbeingState = state;

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
STREAMS.forEach((s, i) => { s.phase = i * 1.7; s.hist = []; s.value = s.base; s.norm = (s.base - s.lo) / (s.hi - s.lo); });

const HANDLING = [
  ['Processed', 'On TADPOLE. Raw signals remain within the body.'],
  ['Shared', 'Only the seven summary values above, as anonymous cohort averages.'],
  ['Retained', '24 hours on-device. Aggregates are kept for 30 days.'],
  ['Control', 'In the fictional system, withdrawal stops collection and deletes retained data.']
];

panel.innerHTML =
  '<div class="eyebrow">Simulated telemetry / 7 streams</div>' +
  '<h2>Wellbeing signals</h2>' +
  '<div class="index"><span>Wellbeing index</span><b id="wb-index">92.8</b></div>' +
  '<div id="wb-streams" role="list"></div>' +
  '<div id="wb-detail" class="detail"></div>' +
  '<div class="sect"><div class="eyebrow">Modeled data protocol</div><p class="hint">Generated readings. No sensor data is collected.</p><dl>' +
    HANDLING.map(h => '<dt>' + h[0] + '</dt><dd>' + h[1] + '</dd>').join('') + '</dl></div>';

const listEl = document.getElementById('wb-streams');
const detailEl = document.getElementById('wb-detail');
const indexEl = document.getElementById('wb-index');
const rows = STREAMS.map(s => {
  const rgb = s.color.join(',');
  const row = document.createElement('button');
  row.type = 'button'; row.className = 'stream'; row.setAttribute('role', 'listitem');
  row.style.setProperty('--c', 'rgb(' + rgb + ')');
  row.innerHTML = '<i></i><span class="n">' + s.name + '</span><span class="v"></span>' +
    '<svg viewBox="0 0 60 14" preserveAspectRatio="none" aria-hidden="true"><polyline fill="none" stroke="rgb(' + rgb + ')" stroke-width="1.2"/></svg>';
  row.addEventListener('click', () => focus(state.focus === s.id ? null : s.id, true));
  listEl.appendChild(row);
  return { row, v: row.querySelector('.v'), line: row.querySelector('polyline') };
});

function focus(id, pulse) {
  state.focus = id;
  STREAMS.forEach((s, i) => {
    rows[i].row.classList.toggle('sel', s.id === id);
    if (pulse && s.id === id) s.pulse = true;
  });
  const s = STREAMS.find(x => x.id === id);
  detailEl.innerHTML = s
    ? '<div class="eyebrow">' + s.region + '</div><p>' + s.measures + '</p>' +
      '<dl><dt>Source</dt><dd>' + s.source + '</dd><dt>Sampled</dt><dd>' + s.rate + '</dd><dt>Used for</dt><dd>' + s.use + '</dd></dl>'
    : '<p class="hint">Select a stream to light its pulse and see where it is sensed.</p>';
}
focus(null);

function sample(now) {
  const t = now / 1000;
  let score = 0;
  STREAMS.forEach((s, i) => {
    const wave = Math.sin(t / (6 + s.phase) + s.phase) * .7 + Math.sin(t * .8 + s.phase * 3) * .3;
    s.value = clamp(s.base + s.amp * wave, s.lo, s.hi);
    s.norm = (s.value - s.lo) / (s.hi - s.lo);
    s.hist.push(s.norm); if (s.hist.length > 40) s.hist.shift();
    score += 1 - clamp(Math.abs(s.value - s.ideal) / (s.hi - s.lo) * .6, 0, 1);
    rows[i].v.textContent = s.value.toFixed(s.dec) + ' ' + s.unit;
    rows[i].line.setAttribute('points', s.hist.map((n, k) => (k * 60 / 39).toFixed(1) + ',' + (13 - n * 12).toFixed(1)).join(' '));
  });
  state.index = score / STREAMS.length * 100;
  indexEl.textContent = state.index.toFixed(1);
}
sample(performance.now());
setInterval(() => sample(performance.now()), 500);
})();
