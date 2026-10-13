(function () {
  const canvas = document.getElementById('c');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const readout = document.getElementById('readout');
  const scene = document.body.dataset.scene;
  const isDeck = scene === 'deck';
  const NAVY = '11,31,77', GREY = '105,112,122', AMBER = '226,114,26';
  const configs = {
    wellbeing: {
      title: 'NEURAL ATLAS',
      metric: 'WELLBEING INDEX',
      nodes: 260,
      shape: 'body',
      labels: [
        ['CORTEX', 'CORTICAL RHYTHM / ACTIVE', 30, 24, 20, 'right'],
        ['LIMBIC CORE', 'AFFECT / ACTIVE', 0, 0, 4, 'right'],
        ['CEREBELLUM', 'RECOVERY / SYNCHRONIZED', -20, -28, -34, 'left'],
        ['BRAINSTEM', 'AUTONOMIC SIGNAL / ACTIVE', 0, -40, -10, 'right'],
        ['TADPOLE', 'BRAINSTEM + SPINE / BONDED', 0, -50, -13, 'left']
      ]
    },
    collective: {
      title: 'SHARED MIND',
      metric: 'EMPATHIC RESONANCE / 81.6%',
      nodes: 300,
      shape: 'sphere',
      labels: [
        ['SHARED ATTENTION', 'GLOBAL FIELD / ACTIVE', 0, 76, 0],
        ['EMPATHY RELAY', 'EMOTIONAL SIGNAL / ACTIVE', 76, 0, 0],
        ['PRIVATE THOUGHT', 'BOUNDARY / PRESERVED', -88, -30, 0]
      ]
    },
    biosphere: {
      title: 'BIOSPHERE LINK',
      metric: 'SIMULATED SPECIES CHANNELS / 184,092',
      nodes: 300,
      shape: 'clusters',
      labels: [
        ['HUMAN COLLECTIVE', 'TADPOLE / 8.4B NODES', -125, 88, 0],
        ['CEPHALOPOD ASSEMBLY', 'COASTAL EXCHANGE / ACTIVE', 125, 88, 0],
        ['PRIMATE SANCTUARY', 'CONSENSUAL LINK / ACTIVE', 0, -132, 0]
      ]
    }
  };
  configs.deck = {
    title: 'ILLITHID',
    metric: 'TADPOLE / BONDED',
    nodes: 0,
    shape: 'tadpole',
    labels: [
      ['SENSORY LIMBS', 'DISTRIBUTED SIGNAL / ACTIVE', -42, 48, 0, 'right'],
      ['NEURAL BODY', 'TADPOLE / BONDED', 0, 0, 0, 'left'],
      ['SIGNAL TAIL', 'OUTBOUND LINK / ACTIVE', 112, -24, 0, 'left']
    ]
  };
  const config = configs[scene] || configs.wellbeing;
  let width = 0, height = 0, dpr = 1, frame = 0;
  let drag = null, pinch = 0;
  const pointers = new Map();
  const isBrain = config.shape === 'body';
  const focusY = isBrain ? -34 : 0;
  let yaw = isBrain ? .9 : .45, pitch = isBrain ? .12 : .14, distance = isBrain ? 250 : 490;
  const nodes = [], edges = [], packets = [];
  let seed = 173;
  const random = () => (seed = seed * 16807 % 2147483647) / 2147483647;

  function addNode(x, y, z, group, size, bci) {
    nodes.push({ x, y, z, group, bci: !!bci, size: size || .8 + random() * 1.5 });
    return nodes.length - 1;
  }

  function sphereDirection() {
    const v = random() * 2 - 1, a = random() * Math.PI * 2, r = Math.sqrt(1 - v * v);
    return [Math.cos(a) * r, v, Math.sin(a) * r];
  }

  const distanceBetween = (a, b) => Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);

  // Brain web: a folded cortex shell around a navy core, with cerebellum, brainstem and the BCI symbiont.
  function createBody() {
    const golden = Math.PI * (3 - Math.sqrt(5));
    const lerp = (a, b, t) => a + (b - a) * t;
    const shell = (c, r, n, group, fold, size, cleft) => {
      for (let i = 0; i < n; i++) {
        const v = 1 - (i + .5) / n * 2, s = Math.sqrt(1 - v * v), a = i * golden;
        const f = 1 + (fold || 0) * Math.sin(v * 13 + a * 4) * Math.cos(a * 6 + v * 5);
        const x = Math.cos(a) * s * r[0] * f, y = v * r[1] * f, z = Math.sin(a) * s * r[2] * f;
        const cut = cleft ? Math.exp(-(x * x) / 14) * 5 * Math.max(0, v) : 0;
        addNode(c[0] + x, c[1] + y - cut, c[2] + z, group, size);
      }
    };
    const chain = (points, group, size) => {
      const ids = points.map(p => addNode(p[0], p[1], p[2], group, size));
      for (let i = 1; i < ids.length; i++) edges.push([ids[i - 1], ids[i], true]);
      return ids;
    };

    shell([0, 0, 0], [40, 34, 52], 1500, 0, .09, .55, true);
    shell([0, 0, 0], [28, 23, 38], 360, 1, .08, .6);
    shell([0, -2, 4], [11, 9, 14], 70, 1, 0, .7);
    shell([0, -26, -34], [24, 11, 17], 260, 1, .1, .6);

    const stem = chain(Array.from({ length: 14 }, (_, i) => [Math.sin(i * .5) * .8, lerp(-14, -64, i / 13), lerp(-6, -18, i / 13)]), 1, .9);
    const axis = chain(Array.from({ length: 16 }, (_, i) => [Math.sin(i * .6) * 1.5, lerp(-66, -112, i / 15), -19 - i * .3]), 1, .8);
    edges.push([stem[13], axis[0], true]);

    const bci = (x, y, z, size) => addNode(x, y, z, 3, size, true);
    const link = (a, b) => edges.push([a, b, 2]);
    const bulb = [];
    for (let i = 0; i < 18; i++) {
      const v = 1 - (i + .5) / 9, s = Math.sqrt(Math.max(0, 1 - v * v)), a = i * golden;
      bulb.push(bci(Math.cos(a) * s * 5, -50 + v * 5, -13 + Math.sin(a) * s * 4, 1.1 + random() * .4));
    }
    bulb.forEach(index => {
      bulb.map(other => [distanceBetween(nodes[index], nodes[other]), other])
        .sort((a, b) => a[0] - b[0]).slice(1, 4)
        .forEach(([, other]) => { if (index < other) link(index, other); });
    });
    const tail = [];
    for (let i = 0; i < 18; i++) {
      const s = i / 17, p = nodes[axis[Math.min(15, Math.round(s * 15))]];
      tail.push(bci(p.x + 2.5, p.y, p.z - 3, 1.5 - s * .7));
    }
    tail.forEach((index, i) => link(i ? tail[i - 1] : bulb[0], index));
    link(bulb[0], stem[7]);
    [4, 8, 12, 16].forEach(i => link(tail[i], axis[Math.round(i / 17 * 15)]));
  }

  // Standalone symbiont: bulb body, curving tail, and a fan of limbs reaching out to the left.
  function createTadpole() {
    const bci = (x, y, z, size) => addNode(x, y, z, 3, size, true);
    const link = (a, b) => edges.push([a, b, 2]);
    const body = [];
    for (let i = 0; i < 60; i++) {
      const [ux, uy, uz] = sphereDirection();
      body.push(bci(ux * 40, uy * 27, uz * 27, 2 + random()));
    }
    body.forEach(index => {
      body.map(other => [distanceBetween(nodes[index], nodes[other]), other])
        .sort((a, b) => a[0] - b[0]).slice(1, 4)
        .forEach(([, other]) => { if (index < other) link(index, other); });
    });
    let previous = body.reduce((best, other) => nodes[other].x > nodes[best].x ? other : best);
    for (let i = 0; i < 22; i++) {
      const s = (i + 1) / 22;
      const index = bci(40 + s * 130, -s * s * 40 + Math.sin(s * 6) * 9, Math.sin(s * 5) * 14, 3 - s * 2.3);
      link(previous, index);
      previous = index;
    }
    const front = body.filter(i => nodes[i].x < -8);
    for (let k = 0; k < 34; k++) {
      const start = front[(random() * front.length) | 0];
      const from = nodes[start], a = random() * Math.PI * 2, reach = 110 + random() * 80;
      const end = [-60 - Math.abs(Math.cos(a)) * reach * .8, Math.sin(a) * reach * .75, Math.cos(a + 1) * reach * .6];
      const control = [(from.x + end[0]) / 2 - 30, (from.y + end[1]) / 2 + (random() - .5) * 90, (from.z + end[2]) / 2 + (random() - .5) * 90];
      let last = start;
      for (let j = 1; j <= 10; j++) {
        const u = j / 10, v = 1 - u;
        const p = [from.x, from.y, from.z].map((c, n) => v * v * c + 2 * v * u * control[n] + u * u * end[n]);
        const index = bci(p[0], p[1], p[2], 1.4 - u * .8);
        link(last, index);
        last = index;
      }
    }
  }
  const clusterCenters = [[-125, 38, 0], [125, 38, 0], [0, -82, 0]];
  const clusterRadius = 50;

  // A double helix joining two clusters: two twisting strands with cross-rungs, anchored to each shell.
  function createHelix(g, h, turns) {
    const from = clusterCenters[g], to = clusterCenters[h];
    const axis = [to[0] - from[0], to[1] - from[1], to[2] - from[2]];
    const length = Math.hypot(...axis);
    const dir = axis.map(c => c / length);
    const start = from.map((c, i) => c + dir[i] * clusterRadius);
    const span = length - clusterRadius * 2;
    const ref = Math.abs(dir[2]) < .9 ? [0, 0, 1] : [1, 0, 0];
    const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
    let u = cross(dir, ref);
    const ul = Math.hypot(...u);
    u = u.map(c => c / ul);
    const w = cross(dir, u);
    const steps = Math.max(16, Math.round(span / 5));
    const strands = [[], []];
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const radius = 8 * Math.min(1, t * 6, (1 - t) * 6);
      for (let k = 0; k < 2; k++) {
        const angle = t * turns * Math.PI * 2 + k * Math.PI;
        const point = [0, 1, 2].map(n => start[n] + dir[n] * span * t +
          (u[n] * Math.cos(angle) + w[n] * Math.sin(angle)) * radius);
        strands[k].push(addNode(point[0], point[1], point[2], 9, 1.5));
      }
    }
    strands.forEach(strand => strand.forEach((index, i) => { if (i) edges.push([strand[i - 1], index, true]); }));
    for (let i = 1; i < steps; i += 2) edges.push([strands[0][i], strands[1][i], true]);
    [[0, g], [steps, h]].forEach(([i, group]) => {
      strands.forEach(strand => {
        let anchor = -1, best = Infinity;
        nodes.forEach((n, index) => {
          if (n.group !== group) return;
          const d = Math.hypot(n.x - nodes[strand[i]].x, n.y - nodes[strand[i]].y, n.z - nodes[strand[i]].z);
          if (d < best) { best = d; anchor = index; }
        });
        if (anchor >= 0) edges.push([anchor, strand[i], true]);
      });
    });
  }

  function createNodes() {
    if (config.shape === 'tadpole') {
      createTadpole();
    } else if (config.shape === 'body') {
      createBody();
    } else if (config.shape === 'clusters') {
      // Three evenly meshed shells, one per community, tied together by a few bridge links.
      const centers = clusterCenters;
      const perCluster = Math.round(config.nodes / centers.length);
      const golden = Math.PI * (3 - Math.sqrt(5));
      centers.forEach((center, group) => {
        for (let i = 0; i < perCluster; i++) {
          const v = 1 - (i + .5) / perCluster * 2, r = Math.sqrt(1 - v * v), angle = i * golden;
          const radius = 50 + (random() - .5) * 4;
          addNode(center[0] + Math.cos(angle) * r * radius,
            center[1] + v * radius, center[2] + Math.sin(angle) * r * radius, group);
        }
      });
    } else {
      for (let i = 0; i < config.nodes; i++) {
        const angle = random() * Math.PI * 2, v = random() * 2 - 1;
        const r = Math.sqrt(1 - v * v), radius = 156 + random() * 13;
        addNode(Math.cos(angle) * r * radius, v * radius, Math.sin(angle) * r * radius, 0);
      }
    }
  }

  function createEdges() {
    const networkNodes = nodes
      .map((node, index) => node.bci ? -1 : index)
      .filter(index => index >= 0);
    nodes.forEach((node, index) => {
      if (node.bci) return;
      const nearest = [];
      nodes.forEach((other, otherIndex) => {
        if (index === otherIndex || other.bci) return;
        if (config.shape === 'clusters' && other.group !== node.group) return;
        const dx = node.x - other.x, dy = node.y - other.y, dz = node.z - other.z;
        nearest.push([dx * dx + dy * dy + dz * dz, otherIndex]);
      });
      nearest.sort((a, b) => a[0] - b[0]);
      nearest.slice(0, 3).forEach(([, otherIndex]) => {
        if (index < otherIndex) edges.push([index, otherIndex]);
      });
    });
    if (config.shape === 'clusters') {
      for (let g = 0; g < 3; g++) createHelix(g, (g + 1) % 3, 4);
    }
    for (let i = 0; i < 42 && networkNodes.length > 1 && config.shape !== 'clusters' && config.shape !== 'body'; i++) {
      const first = networkNodes[(random() * networkNodes.length) | 0];
      let second = networkNodes[(random() * networkNodes.length) | 0];
      if (config.shape === 'body') {
        second = nodes.findIndex((node, index) => index !== first && !node.bci &&
          node.group !== nodes[first].group &&
          Math.hypot(node.x - nodes[first].x, node.y - nodes[first].y, node.z - nodes[first].z) < 28);
      }
      if (second >= 0 && first !== second) edges.push([first, second, true]);
    }
    if (config.shape === 'body') {
      // Join any disconnected pieces to the nearest part of the main mesh.
      for (let guard = 0; guard < 40; guard++) {
        const parent = nodes.map((_, i) => i);
        const find = i => { while (parent[i] !== i) i = parent[i] = parent[parent[i]]; return i; };
        edges.forEach(([a, b]) => { parent[find(a)] = find(b); });
        const roots = new Map();
        nodes.forEach((_, i) => { const r = find(i); roots.set(r, (roots.get(r) || 0) + 1); });
        if (roots.size < 2) break;
        const small = [...roots.entries()].sort((a, b) => a[1] - b[1])[0][0];
        let best = [Infinity, -1, -1];
        nodes.forEach((n, i) => {
          if (find(i) !== small) return;
          nodes.forEach((m, j) => {
            if (find(j) === small) return;
            const d = distanceBetween(n, m);
            if (d < best[0]) best = [d, i, j];
          });
        });
        edges.push([best[1], best[2], true]);
      }
    }
    for (let i = 0; i < 64; i++) packets.push({ edge: (random() * edges.length) | 0, t: random(), speed: .0018 + random() * .004 });
    const linkEdges = edges.map((edge, index) => edge[2] === 2 ? index : -1).filter(index => index >= 0);
    for (let i = 0; i < 40 && linkEdges.length; i++) {
      packets.push({ edge: linkEdges[(random() * linkEdges.length) | 0], t: random(), speed: .004 + random() * .006 });
    }
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function project(point) {
    const cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
    const x = point.x * cy - point.z * sy;
    const z1 = point.x * sy + point.z * cy;
    const py = point.y - focusY;
    const y = py * cp - z1 * sp;
    const z = py * sp + z1 * cp + distance;
    if (z < 8) return null;
    const scale = vb.size * (isDeck ? .65 : .82) / z;
    return { x: vb.cx + x * scale, y: vb.cy - y * scale, z, scale };
  }

  // The wellbeing brain sits in the space left of the data panel (above it on narrow screens).
  const dataPanel = scene === 'wellbeing' ? document.getElementById('data-panel') : null;
  let vb = { size: 600, cx: 0, cy: 0, maxX: 0 };
  function computeView() {
    const centerShare = isDeck ? .58 : scene === 'biosphere' && width > 1200 ? .64 : .51;
    vb = { size: Math.min(width, height), cx: width * centerShare, cy: height * .51,
      maxX: isDeck ? width - Math.min(360, width * .31) - 12 : width - 12 };
    if (!dataPanel) return;
    const r = dataPanel.getBoundingClientRect();
    if (r.width >= width * .9) vb = { size: Math.min(width, r.top), cx: width / 2, cy: r.top * .52, maxX: width - 12 };
    else vb = { size: Math.min(r.left, height), cx: r.left / 2, cy: height * .51, maxX: r.left - 12 };
  }

  // Ripples travel along the links. Biosphere: from each community in turn.
  // Wellbeing: each live data stream pulses from the region that senses it, in its own colour and rhythm.
  const ripples = [];
  const mixCache = new Map();
  const distCache = new Map();
  let glowCol = [];
  let rippleAdjacency = null, nextRippleGroup = 0, rippleClock = 0;
  const rippleStyle = scene === 'wellbeing'
    ? { color: [217, 70, 239], speed: 2.1, trail: 26 }
    : { color: [34, 197, 94], speed: 2.4, trail: 70 };
  const RIPPLE_SPEED = rippleStyle.speed, RIPPLE_TRAIL = rippleStyle.trail, RIPPLE_GAP = 260;
  const MAX_RIPPLES = 12;

  function rippleDistances(source) {
    if (!rippleAdjacency) {
      rippleAdjacency = nodes.map(() => []);
      edges.forEach(([a, b]) => {
        const d = distanceBetween(nodes[a], nodes[b]);
        rippleAdjacency[a].push([b, d]);
        rippleAdjacency[b].push([a, d]);
      });
    }
    const dist = new Array(nodes.length).fill(Infinity), done = new Array(nodes.length).fill(false);
    dist[source] = 0;
    for (let step = 0; step < nodes.length; step++) {
      let u = -1;
      for (let i = 0; i < nodes.length; i++) if (!done[i] && (u < 0 || dist[i] < dist[u])) u = i;
      if (u < 0 || dist[u] === Infinity) break;
      done[u] = true;
      rippleAdjacency[u].forEach(([v, d]) => { if (dist[u] + d < dist[v]) dist[v] = dist[u] + d; });
    }
    return dist;
  }

  function spawnRipple(stream) {
    let source = 0;
    if (stream) {
      if (stream.node === undefined) {
        let best = Infinity;
        nodes.forEach((n, i) => {
          if (!!n.bci !== !!stream.bci) return;
          const d = Math.hypot(n.x - stream.anchor[0], n.y - stream.anchor[1], n.z - stream.anchor[2]);
          if (d < best) { best = d; stream.node = i; }
        });
      }
      source = stream.node;
    } else {
      const group = nextRippleGroup++ % clusterCenters.length, c = clusterCenters[group];
      let best = Infinity;
      nodes.forEach((n, i) => {
        if (n.group !== group) return;
        const d = Math.hypot(n.x - c[0], n.y - c[1], n.z - c[2]);
        if (d < best) { best = d; source = i; }
      });
    }
    let entry = distCache.get(source);
    if (!entry) {
      const dist = rippleDistances(source);
      entry = { dist, reach: dist.reduce((m, d) => d === Infinity ? m : Math.max(m, d), 0) };
      distCache.set(source, entry);
    }
    const trail = stream ? stream.trail : RIPPLE_TRAIL;
    ripples.push({
      dist: entry.dist, front: 0, end: entry.reach + trail * 3, trail,
      speed: stream ? stream.speed : RIPPLE_SPEED, color: stream ? stream.color : rippleStyle.color,
      id: stream ? stream.id : null, strength: stream ? .6 + .4 * stream.norm : 1
    });
    if (stream) stream.lastAt = performance.now();
  }

  function rippleGlow() {
    const state = window.WellbeingState;
    if (scene === 'wellbeing') {
      const now = performance.now();
      (window.WellbeingStreams || []).forEach(s => {
        if (s.nextAt === undefined) s.nextAt = now + 300 + Math.random() * 1800;
        if (!s.pulse && (now < s.nextAt || ripples.length >= MAX_RIPPLES)) return;
        s.pulse = false;
        s.nextAt = now + s.period * (1.15 - .3 * s.norm) * (.92 + Math.random() * .16);
        spawnRipple(s);
      });
    } else if (scene === 'biosphere') {
      if (rippleClock++ % RIPPLE_GAP === 0) spawnRipple();
    } else {
      return null;
    }
    const glow = new Array(nodes.length).fill(0);
    glowCol = new Array(nodes.length);
    for (let r = ripples.length - 1; r >= 0; r--) {
      const ripple = ripples[r];
      ripple.front += ripple.speed;
      if (ripple.front > ripple.end) { ripples.splice(r, 1); continue; }
      // A focused stream stays vivid while the others recede.
      const k = ripple.strength * (state && state.focus && state.focus !== ripple.id ? .3 : 1);
      for (let i = 0; i < nodes.length; i++) {
        const behind = ripple.front - ripple.dist[i];
        if (behind < 0) continue;
        const w = (behind < 8 ? behind / 8 : Math.exp(-(behind - 8) / ripple.trail)) * k;
        if (w > glow[i]) { glow[i] = w; glowCol[i] = ripple.color; }
      }
    }
    return glow;
  }

  function draw() {
    frame++;
    computeView();
    ctx.clearRect(0, 0, width, height);
    const projected = nodes.map(project);
    const glow = rippleGlow();
    const GREEN = rippleStyle.color;
    const greenMix = (csv, w, alpha, target) => {
      const col = target || GREEN;
      const wq = Math.round(Math.min(1, w * 1.2) * 16), aq = Math.round(Math.min(1, alpha + w * .45) * 32);
      const key = csv + '|' + wq + '|' + aq + '|' + col;
      let style = mixCache.get(key);
      if (style === undefined) {
        const c = csv.split(',').map((v, i) => Math.round(+v + (col[i] - v) * wq / 16));
        style = `rgba(${c},${aq / 32})`;
        mixCache.set(key, style);
      }
      return style;
    };
    const chromatic = scene === 'collective';
    // Hue drifts with time and position so colour waves travel across the sphere.
    const hueAt = (p, phase) => (frame * .6 + (p.x * .9 + p.y * .6 + p.z * .8) + (phase || 0)) % 360;
    const tint = (p, alpha, fallback, phase) => chromatic
      ? `hsla(${(hueAt(p, phase) + 360) % 360},85%,52%,${alpha})`
      : `rgba(${fallback},${alpha})`;
    for (const [a, b, backbone] of edges) {
      const first = projected[a], second = projected[b];
      if (!first || !second) continue;
      const alpha = Math.max(.035, Math.min(backbone === 2 ? .6 : .28, 1.1 - (first.z + second.z) / 1400));
      const edgeColor = backbone === 2 ? AMBER : backbone || nodes[a].group === nodes[b].group ? NAVY : GREY;
      if (chromatic) {
        const gradient = ctx.createLinearGradient(first.x, first.y, second.x, second.y);
        gradient.addColorStop(0, tint(nodes[a], Math.min(.6, alpha * 1.6)));
        gradient.addColorStop(1, tint(nodes[b], Math.min(.6, alpha * 1.6)));
        ctx.strokeStyle = gradient;
      } else if (glow) {
        const lead = glow[a] >= glow[b] ? a : b;
        ctx.strokeStyle = greenMix(edgeColor, glow[lead], alpha, glowCol[lead]);
      } else {
        ctx.strokeStyle = `rgba(${edgeColor},${alpha})`;
      }
      ctx.lineWidth = (backbone === 2 ? 1.2 : backbone ? 1 : .65) + (glow ? Math.max(glow[a], glow[b]) * .9 : 0);
      ctx.beginPath();
      ctx.moveTo(first.x, first.y);
      ctx.lineTo(second.x, second.y);
      ctx.stroke();
    }
    packets.forEach(packet => {
      packet.t += packet.speed;
      if (packet.t >= 1) {
        packet.t = 0;
        packet.edge = (Math.random() * edges.length) | 0;
      }
      const [a, b] = edges[packet.edge], first = projected[a], second = projected[b];
      if (!first || !second) return;
      const x = first.x + (second.x - first.x) * packet.t;
      const y = first.y + (second.y - first.y) * packet.t;
      ctx.fillStyle = tint(nodes[a], .95, edges[packet.edge][2] === 2 ? AMBER : NAVY, 90);
      ctx.beginPath();
      ctx.arc(x, y, 1.5, 0, Math.PI * 2);
      ctx.fill();
    });
    nodes.forEach((node, index) => {
      const point = projected[index];
      if (!point) return;
      const alpha = Math.max(.2, Math.min(.95, 1.2 - point.z / 850));
      const w = glow ? glow[index] : 0;
      ctx.fillStyle = glow ? greenMix(node.bci ? AMBER : node.group ? NAVY : GREY, w, alpha, glowCol[index])
        : tint(node, alpha, node.bci ? AMBER : node.group ? NAVY : GREY);
      const size = Math.max(1, node.size * point.scale * 2) * (1 + w * .9);
      ctx.beginPath();
      ctx.arc(point.x, point.y, size / 2, 0, Math.PI * 2);
      ctx.fill();
    });
    if (scene === 'wellbeing') drawSources(projected);
    // Labels are pushed radially past the projected silhouette so text never overlaps the web.
    const visible = projected.filter(Boolean);
    const centerX = visible.reduce((sum, p) => sum + p.x, 0) / (visible.length || 1);
    const centerY = visible.reduce((sum, p) => sum + p.y, 0) / (visible.length || 1);
    const outerRadius = visible.reduce((max, p) => Math.max(max, Math.hypot(p.x - centerX, p.y - centerY)), 0);
    const maxX = vb.maxX;
    const textSpan = 118;
    config.labels.forEach(([title, detail, x, y, z, bodySide]) => {
      const point = project({ x, y, z });
      if (!point) return;
      if (scene === 'wellbeing') {
        const xs = visible.map(p => p.x), dir = bodySide === 'right' ? 1 : -1;
        const edgeX = dir > 0 ? Math.max(...xs) + 46 : Math.min(...xs) - 46;
        ctx.strokeStyle = 'rgba(11,31,77,.48)';
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(point.x, point.y); ctx.lineTo(edgeX, point.y); ctx.lineTo(edgeX + dir * 110, point.y); ctx.stroke();
        ctx.fillStyle = 'rgba(11,31,77,.85)';
        ctx.beginPath(); ctx.arc(point.x, point.y, 2, 0, Math.PI * 2); ctx.fill();
        ctx.textAlign = dir < 0 ? 'right' : 'left';
        ctx.font = '600 12px "Barlow","Segoe UI",sans-serif';
        ctx.fillText(title, edgeX + dir * 4, point.y - 5);
        ctx.fillStyle = 'rgba(105,112,122,.9)';
        ctx.font = '500 10px "Barlow","Segoe UI",sans-serif';
        ctx.fillText(detail, edgeX + dir * 4, point.y + 9);
        return;
      }
      let dx = point.x - centerX, dy = point.y - centerY;
      const length = Math.hypot(dx, dy) || 1;
      dx /= length; dy /= length;
      let direction = dx < 0 ? -1 : 1;
      const reach = outerRadius + 26;
      const endX = Math.min(maxX - 4, Math.max(12, centerX + dx * reach));
      const endY = centerY + dy * reach;
      if (endX + direction * textSpan > maxX || endX + direction * textSpan < 8) direction = -direction;
      const side = direction < 0 ? 'left' : 'right';
      ctx.strokeStyle = 'rgba(11,31,77,.48)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(point.x, point.y);
      ctx.lineTo(endX, endY);
      ctx.lineTo(endX + direction * 110, endY);
      ctx.stroke();
      ctx.fillStyle = 'rgba(11,31,77,.85)';
      ctx.beginPath();
      ctx.arc(point.x, point.y, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = '600 12px "Barlow","Segoe UI",sans-serif';
      ctx.textAlign = side === 'left' ? 'right' : 'left';
      ctx.fillText(title, endX + direction * 4, endY - 5);
      ctx.fillStyle = 'rgba(105,112,122,.9)';
      ctx.font = '500 10px "Barlow","Segoe UI",sans-serif';
      ctx.fillText(detail, endX + direction * 4, endY + 9);
    });
    if (readout && frame % 8 === 0) {
      const metric = scene === 'wellbeing' && window.WellbeingState
        ? `WELLBEING INDEX / ${window.WellbeingState.index.toFixed(1)}%` : config.metric;
      readout.innerHTML = `${metric}<br>RANGE ${distance.toFixed(0)} &nbsp; NODES ${nodes.length}<br>ROTATION ${(yaw * 57.3 % 360).toFixed(0)}&deg;`;
    }
    requestAnimationFrame(draw);
  }

  // Rings mark where each data stream is sensed; the ring expands with every pulse.
  function drawSources(projected) {
    const state = window.WellbeingState, now = performance.now();
    (window.WellbeingStreams || []).forEach(s => {
      const p = projected[s.node];
      if (!p) return;
      const rgb = s.color.join(','), focused = state && state.focus === s.id;
      const dim = state && state.focus && !focused ? .35 : 1;
      const age = Math.min(1, (now - (s.lastAt || 0)) / 1100);
      ctx.strokeStyle = `rgba(${rgb},${.8 * dim})`;
      ctx.lineWidth = focused ? 2 : 1.2;
      ctx.beginPath(); ctx.arc(p.x, p.y, focused ? 6 : 4, 0, Math.PI * 2); ctx.stroke();
      if (age < 1) {
        ctx.strokeStyle = `rgba(${rgb},${(1 - age) * .6 * dim})`;
        ctx.beginPath(); ctx.arc(p.x, p.y, 5 + age * 20, 0, Math.PI * 2); ctx.stroke();
      }
      if (focused) {
        ctx.fillStyle = `rgb(${rgb})`;
        ctx.font = '600 11px "Barlow","Segoe UI",sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(s.name.toUpperCase(), p.x + 12, p.y - 8);
      }
    });
  }

  canvas.addEventListener('pointerdown', event => {
    canvas.setPointerCapture(event.pointerId);
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pointers.size === 1) drag = { x: event.clientX, y: event.clientY };
  });
  canvas.addEventListener('pointermove', event => {
    if (!pointers.has(event.pointerId)) return;
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pointers.size === 2) {
      const [first, second] = [...pointers.values()];
      const currentPinch = Math.hypot(first.x - second.x, first.y - second.y);
      if (pinch) distance = Math.max(280, Math.min(1300, distance * pinch / currentPinch));
      pinch = currentPinch;
      return;
    }
    if (!drag) return;
    yaw -= (event.clientX - drag.x) * .006;
    pitch = Math.max(-1.35, Math.min(1.35, pitch + (event.clientY - drag.y) * .006));
    drag = { x: event.clientX, y: event.clientY };
  });
  const stopDrag = event => {
    pointers.delete(event.pointerId);
    pinch = 0;
    drag = pointers.size ? [...pointers.values()][0] : null;
  };
  canvas.addEventListener('pointerup', stopDrag);
  canvas.addEventListener('pointercancel', stopDrag);
  canvas.addEventListener('wheel', event => {
    event.preventDefault();
    distance = Math.max(280, Math.min(1300, distance * Math.exp(event.deltaY * .001)));
  }, { passive: false });
  window.addEventListener('resize', resize);
  createNodes();
  createEdges();
  resize();
  requestAnimationFrame(draw);
})();
