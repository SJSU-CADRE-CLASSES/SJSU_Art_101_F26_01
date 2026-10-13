(function () {
  const panel = document.getElementById('brain-panel');
  if (!panel) return;
  const NAVY = '11,31,77', AMBER = '226,114,26';
  let seed = 41;
  const random = () => (seed = seed * 16807 % 2147483647) / 2147483647;

  const ellipsoid = (count, c, r, wobble) => {
    const golden = Math.PI * (3 - Math.sqrt(5)), points = [];
    for (let i = 0; i < count; i++) {
      const v = 1 - (i + .5) / count * 2, s = Math.sqrt(1 - v * v), a = i * golden;
      const ux = Math.cos(a) * s, uz = Math.sin(a) * s;
      const fold = 1 + wobble * Math.sin(ux * 9 + v * 6) * Math.cos(uz * 8 + ux * 3);
      points.push([c[0] + ux * r[0] * fold, c[1] + v * r[1] * fold, c[2] + uz * r[2] * fold]);
    }
    return points;
  };

  const brains = {
    human() {
      const cerebrum = ellipsoid(110, [0, .12, 0], [1, .72, .78], .07).map(p => [p[0], p[1] < 0 ? p[1] * .8 : p[1], p[2]]);
      const cerebellum = ellipsoid(34, [-.5, -.5, 0], [.38, .22, .5], .06);
      const stem = [];
      for (let i = 0; i < 8; i++) for (let k = 0; k < 5; k++) {
        const a = k * Math.PI * 2 / 5 + i * .5;
        stem.push([-.08 - i * .03 + Math.cos(a) * .13, -.45 - i * .1, Math.sin(a) * .13]);
      }
      return { points: [...cerebrum, ...cerebellum, ...stem], accents: new Set(stem.map((_, i) => cerebrum.length + cerebellum.length + i)) };
    },
    primate() {
      const cerebrum = ellipsoid(80, [0, .1, 0], [.95, .78, .72], .04);
      const cerebellum = ellipsoid(24, [-.45, -.5, 0], [.34, .2, .44], .04);
      const stem = [];
      for (let i = 0; i < 6; i++) for (let k = 0; k < 5; k++) {
        const a = k * Math.PI * 2 / 5 + i * .5;
        stem.push([-.05 - i * .02 + Math.cos(a) * .12, -.5 - i * .1, Math.sin(a) * .12]);
      }
      return { points: [...cerebrum, ...cerebellum, ...stem], accents: new Set(stem.map((_, i) => cerebrum.length + cerebellum.length + i)) };
    },
    cephalopod() {
      const ring = [];
      for (let i = 0; i < 36; i++) {
        const a = i / 36 * Math.PI * 2;
        for (let k = 0; k < 3; k++) {
          const b = k * Math.PI * 2 / 3 + a * 2;
          ring.push([Math.cos(a) * (.35 + Math.cos(b) * .1), Math.sin(b) * .1, Math.sin(a) * (.35 + Math.cos(b) * .1)]);
        }
      }
      const left = ellipsoid(54, [-.95, 0, 0], [.42, .5, .62], .08);
      const right = ellipsoid(54, [.95, 0, 0], [.42, .5, .62], .08);
      const upper = ellipsoid(24, [0, .5, 0], [.3, .2, .3], .05);
      const stalks = [];
      [-1, 1].forEach(side => { for (let i = 0; i < 5; i++) stalks.push([side * (.45 + i * .1), 0, 0]); });
      const points = [...ring, ...left, ...right, ...upper, ...stalks];
      const accents = new Set(stalks.map((_, i) => points.length - stalks.length + i));
      return { points, accents };
    }
  };

  const data = {
    human: [
      ['SPECIES', 'HOMO SAPIENS'], ['NEURONS', '~86 BILLION'], ['MASS', '~1.4 KG'],
      ['LINK STATE', () => `TADPOLE BONDED / ${(97.2 + Math.random() * 2.4).toFixed(1)}%`],
      ['SIGNAL RATE', () => `${(4.1 + Math.random() * .8).toFixed(2)} KHZ`]
    ],
    primate: [
      ['SPECIES', 'PAN TROGLODYTES'], ['NEURONS', '~28 BILLION'], ['MASS', '~0.4 KG'],
      ['LINK STATE', () => `CONSENT ACTIVE / ${(91 + Math.random() * 4).toFixed(1)}%`],
      ['SIGNAL RATE', () => `${(2.6 + Math.random() * .7).toFixed(2)} KHZ`]
    ],
    cephalopod: [
      ['SPECIES', 'OCTOPUS VULGARIS'], ['NEURONS', '~500 MILLION'], ['ARM NEURONS', '~60% OF TOTAL'],
      ['LINK STATE', () => `COASTAL EXCHANGE / ${(88 + Math.random() * 5).toFixed(1)}%`],
      ['SIGNAL RATE', () => `${(1.4 + Math.random() * .6).toFixed(2)} KHZ`]
    ]
  };

  const cards = [...panel.querySelectorAll('[data-brain]')].map(card => {
    const kind = card.dataset.brain, canvas = card.querySelector('canvas');
    const { points, accents } = brains[kind]();
    const extent = points.reduce((m, p) => Math.max(m, Math.hypot(p[0], p[1], p[2])), 0);
    const normal = points.map(p => p.map(c => c / extent));
    const edges = [];
    normal.forEach((p, i) => {
      normal.map((q, j) => [Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2]), j])
        .sort((a, b) => a[0] - b[0]).slice(1, 4)
        .forEach(([d, j]) => { if (i < j && d < .35) edges.push([i, j]); });
    });
    return {
      kind, canvas, ctx: canvas.getContext('2d'), points: normal, accents, edges,
      phase: random() * Math.PI * 2, step: 0,
      labelEl: card.querySelector('.data-label'), valueEl: card.querySelector('.data-value'), box: card.querySelector('.data')
    };
  });

  function showData(card) {
    const [label, value] = data[card.kind][card.step % data[card.kind].length];
    card.labelEl.textContent = label;
    card.valueEl.textContent = typeof value === 'function' ? value() : value;
    card.step++;
  }
  cards.forEach((card, i) => {
    showData(card);
    setInterval(() => {
      card.box.classList.add('swap');
      setTimeout(() => { showData(card); card.box.classList.remove('swap'); }, 350);
    }, 2600 + i * 400);
  });

  function sizeCanvas(card) {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = card.canvas.clientWidth, h = card.canvas.clientHeight;
    if (card.canvas.width !== w * dpr) {
      card.canvas.width = w * dpr;
      card.canvas.height = h * dpr;
    }
    card.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return [w, h];
  }

  function draw(time) {
    cards.forEach(card => {
      const [w, h] = sizeCanvas(card), ctx = card.ctx;
      if (!w || !h) return;
      ctx.clearRect(0, 0, w, h);
      const yaw = card.phase + time * .00022, pitch = .3;
      const cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
      const scale = Math.min(w, h) * .46;
      const projected = card.points.map(p => {
        const x = p[0] * cy - p[2] * sy, z1 = p[0] * sy + p[2] * cy;
        const y = p[1] * cp - z1 * sp, z = p[1] * sp + z1 * cp;
        const persp = 1 / (1 - z * .25);
        return { x: w / 2 + x * scale * persp, y: h / 2 - y * scale * persp, z };
      });
      card.edges.forEach(([a, b]) => {
        const p = projected[a], q = projected[b];
        const alpha = .08 + .28 * ((p.z + q.z) / 2 + 1) / 2;
        ctx.strokeStyle = card.accents.has(a) && card.accents.has(b) ? `rgba(${AMBER},${alpha + .2})` : `rgba(${NAVY},${alpha})`;
        ctx.lineWidth = .7;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(q.x, q.y);
        ctx.stroke();
      });
      projected.forEach((p, i) => {
        const alpha = .25 + .65 * (p.z + 1) / 2;
        ctx.fillStyle = card.accents.has(i) ? `rgba(${AMBER},${alpha})` : `rgba(${NAVY},${alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.1 + (p.z + 1) * .5, 0, Math.PI * 2);
        ctx.fill();
      });
    });
    requestAnimationFrame(draw);
  }
  requestAnimationFrame(draw);
})();
