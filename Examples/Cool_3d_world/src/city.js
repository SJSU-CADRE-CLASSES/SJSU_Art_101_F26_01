import * as THREE from 'three';
import { createLandmarks } from './landmarks.js';
import { createPedestrians } from './pedestrians.js';
import { isInWater } from './water.js';

/** Seeded PRNG for repeatable layouts */
export function createRng(seed = 42) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

const COMMERCIAL_PALETTE = [
  0xb8a892, 0x9aa8a4, 0xc4b49a, 0x8e9b96, 0xd0c4b0, 0x7d8f88, 0xa89078,
  0x6e7f8a, 0xc9b8a0, 0x95a09a,
];

const HOUSE_PALETTE = [
  0xe8dcc8, 0xd4c4a8, 0xc8b8a0, 0xf0e6d4, 0xb8a888, 0xd8c8b0,
  0xe0d0b8, 0xc0b098, 0xdcc8b4, 0xe8e0d0,
];

const ROOF_PALETTE = [0x6a5040, 0x5a4840, 0x7a5a48, 0x4a5850, 0x8a6048, 0x555050];

const CAR_COLORS = [
  0xc45c3a, 0x3a5a8a, 0xe8e0d0, 0x2a2a2a, 0xd4a84a, 0x4a7a5a, 0x8a4a6a,
];

/**
 * Compact valley city with organic edges, suburban houses, and road paths for traffic.
 */
export function createCity(rng = createRng(77)) {
  const group = new THREE.Group();
  group.name = 'city';

  const cityWidth = 48;
  const cityDepth = 36;
  const blockSize = 4;
  const roadWidth = 1.2;
  const halfW = cityWidth / 2;
  const halfD = cityDepth / 2;

  const materials = {
    park: new THREE.MeshStandardMaterial({ color: 0x4a6b4e, roughness: 1 }),
    lawn: new THREE.MeshStandardMaterial({ color: 0x5a7a52, roughness: 1 }),
    trunk: new THREE.MeshStandardMaterial({ color: 0x5c4033, roughness: 1 }),
    canopy: new THREE.MeshStandardMaterial({ color: 0x3d6b45, roughness: 0.85 }),
    canopyAlt: new THREE.MeshStandardMaterial({ color: 0x4a7a48, roughness: 0.85 }),
    road: new THREE.MeshStandardMaterial({
      color: 0x2a3034,
      roughness: 0.9,
      metalness: 0.1,
    }),
    sidewalk: new THREE.MeshStandardMaterial({
      color: 0x8a8680,
      roughness: 0.95,
    }),
    glass: new THREE.MeshStandardMaterial({
      color: 0x6a8fa0,
      roughness: 0.28,
      metalness: 0.45,
      emissive: 0x1a2830,
      emissiveIntensity: 0.12,
    }),
    ground: new THREE.MeshStandardMaterial({
      color: 0x3d4a42,
      roughness: 0.95,
      metalness: 0.05,
    }),
  };

  // Soft, irregular valley floor (not a hard rectangle)
  const ground = new THREE.Mesh(
    new THREE.CircleGeometry(58, 64),
    materials.ground
  );
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  group.add(ground);

  // Scattered meadow patches to break the hard edge
  for (let i = 0; i < 28; i++) {
    const angle = rng() * Math.PI * 2;
    const rad = 22 + rng() * 28;
    const patch = new THREE.Mesh(
      new THREE.CircleGeometry(1.5 + rng() * 3.5, 7 + Math.floor(rng() * 4)),
      rng() > 0.5 ? materials.lawn : materials.park
    );
    patch.rotation.x = -Math.PI / 2;
    patch.position.set(
      Math.cos(angle) * rad + (rng() - 0.5) * 4,
      0.01,
      Math.sin(angle) * rad * 0.75 + (rng() - 0.5) * 3
    );
    patch.receiveShadow = true;
    group.add(patch);
  }

  const cols = Math.floor(cityWidth / (blockSize + roadWidth));
  const rows = Math.floor(cityDepth / (blockSize + roadWidth));
  const gridW = cols * blockSize + (cols + 1) * roadWidth;
  const gridD = rows * blockSize + (rows + 1) * roadWidth;
  const originX = -gridW / 2;
  const originZ = -gridD / 2;

  // Road lengths vary slightly at edges for a softer silhouette
  const hRoadLens = [];
  const vRoadLens = [];
  for (let r = 0; r <= rows; r++) {
    hRoadLens.push(gridW * (0.82 + rng() * 0.22) + (rng() - 0.5) * 4);
  }
  for (let c = 0; c <= cols; c++) {
    vRoadLens.push(gridD * (0.82 + rng() * 0.22) + (rng() - 0.5) * 3);
  }

  const roadSegments = [];

  for (let r = 0; r <= rows; r++) {
    const z = originZ + r * (blockSize + roadWidth) + roadWidth / 2;
    const len = hRoadLens[r];
    const offsetX = (rng() - 0.5) * 2.5;
    const road = new THREE.Mesh(
      new THREE.PlaneGeometry(len, roadWidth * (0.85 + rng() * 0.2)),
      materials.road
    );
    road.rotation.x = -Math.PI / 2;
    road.position.set(offsetX, 0.02, z);
    road.receiveShadow = true;
    group.add(road);

    roadSegments.push({
      axis: 'x',
      z,
      x0: offsetX - len / 2,
      x1: offsetX + len / 2,
      lane: roadWidth * 0.22,
    });
  }

  for (let c = 0; c <= cols; c++) {
    const x = originX + c * (blockSize + roadWidth) + roadWidth / 2;
    const len = vRoadLens[c];
    const offsetZ = (rng() - 0.5) * 2;
    const road = new THREE.Mesh(
      new THREE.PlaneGeometry(roadWidth * (0.85 + rng() * 0.2), len),
      materials.road
    );
    road.rotation.x = -Math.PI / 2;
    road.position.set(x, 0.02, offsetZ);
    road.receiveShadow = true;
    group.add(road);

    roadSegments.push({
      axis: 'z',
      x,
      z0: offsetZ - len / 2,
      z1: offsetZ + len / 2,
      lane: roadWidth * 0.22,
    });
  }

  const buildings = new THREE.Group();
  buildings.name = 'buildings';
  group.add(buildings);

  // Density mask: denser downtown, sparse/organic at edges
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const cx =
        originX + roadWidth + col * (blockSize + roadWidth) + blockSize / 2;
      const cz =
        originZ + roadWidth + row * (blockSize + roadWidth) + blockSize / 2;

      // Jitter blocks off the perfect grid
      const jx = (rng() - 0.5) * 0.55;
      const jz = (rng() - 0.5) * 0.55;
      const bx = cx + jx;
      const bz = cz + jz;

      const nx = cx / halfW;
      const nz = cz / halfD;
      const dist = Math.hypot(nx, nz);
      // Soft falloff — dense core, porous edges
      const keepChance =
        dist < 0.4
          ? 0.98
          : Math.max(0.2, 1.05 - dist * 0.85 - rng() * 0.15);
      if (rng() > keepChance) {
        // Occasional lone tree or empty lot in gaps
        if (rng() > 0.55) {
          const tree = createTree(rng, materials);
          tree.position.set(bx + (rng() - 0.5), 0, bz + (rng() - 0.5));
          group.add(tree);
        }
        continue;
      }

      const isEdge =
        dist > 0.58 ||
        col <= 1 ||
        row <= 0 ||
        col >= cols - 2 ||
        row >= rows - 1;
      const isPark = (!isEdge && rng() < 0.08) || (row === 2 && col === 3);

      if (isPark) {
        addPark(group, bx, bz, blockSize * (0.7 + rng() * 0.25), rng, materials);
        continue;
      }

      if (isEdge || dist > 0.55) {
        // Residential / low-rise on the fringe
        addResidentialCluster(buildings, group, bx, bz, blockSize, dist, rng, materials);
      } else {
        addCommercialBlock(buildings, bx, bz, blockSize, dist, rng, materials);
      }
    }
  }

  // Suburban ring outside the main grid
  addSuburbs(group, buildings, gridW, gridD, rng, materials, roadSegments);

  // Organic creek (slightly bent polyline)
  const waterZones = addCreek(group, originX, gridW, gridD, rng);

  // Outskirts: data center + almond farm with bamboo
  const landmarks = createLandmarks(rng);
  group.add(landmarks.group);

  // Scattered outer trees for soft boundary
  for (let i = 0; i < 55; i++) {
    const angle = rng() * Math.PI * 2;
    const rad = 20 + rng() * 22;
    const tree = createTree(rng, materials);
    tree.position.set(
      Math.cos(angle) * rad,
      0,
      Math.sin(angle) * rad * 0.72
    );
    // Keep clear of dense downtown and landmarks
    if (Math.hypot(tree.position.x / halfW, tree.position.z / halfD) < 0.75) continue;
    if (tree.position.distanceTo(landmarks.points.dataCenter) < 10) continue;
    if (tree.position.distanceTo(landmarks.points.almondFarm) < 10) continue;
    group.add(tree);
  }

  const cars = createCars(roadSegments, rng);
  const pedestrians = createPedestrians(roadSegments, rng);

  return {
    group,
    cars,
    pedestrians,
    landmarks,
    waterZones,
    bounds: { width: cityWidth + 20, depth: cityDepth + 16, halfW: halfW + 10, halfD: halfD + 8 },
    mountainBounds: { halfW, halfD },
    grid: { cols, rows, originX, originZ, blockSize, roadWidth, gridW, gridD },
  };
}

function addPark(group, cx, cz, size, rng, materials) {
  const sides = 5 + Math.floor(rng() * 4);
  const park = new THREE.Mesh(
    new THREE.CircleGeometry(size * 0.48, sides),
    materials.park
  );
  park.rotation.x = -Math.PI / 2;
  park.position.set(cx, 0.06, cz);
  park.scale.set(1 + rng() * 0.3, 1, 0.85 + rng() * 0.35);
  park.receiveShadow = true;
  group.add(park);

  const treeCount = 3 + Math.floor(rng() * 5);
  for (let t = 0; t < treeCount; t++) {
    const tree = createTree(rng, materials);
    const a = rng() * Math.PI * 2;
    const r = rng() * size * 0.35;
    tree.position.set(cx + Math.cos(a) * r, 0, cz + Math.sin(a) * r);
    group.add(tree);
  }
}

function addCommercialBlock(buildings, cx, cz, blockSize, dist, rng, materials) {
  const footprints = subdivideBlock(rng, blockSize * (0.78 + rng() * 0.12));
  const heightBias = Math.max(0, 1 - dist * 1.15);

  for (const fp of footprints) {
    const floors = Math.floor(2 + rng() * 4 + heightBias * 11);
    const height = floors * (0.48 + rng() * 0.12);
    const color = COMMERCIAL_PALETTE[Math.floor(rng() * COMMERCIAL_PALETTE.length)];
    const style = pickCommercialStyle(floors, rng);

    const building = createCommercialBuilding(fp, height, floors, color, style, rng, materials);
    building.position.set(cx + fp.x, 0, cz + fp.z);
    // Slight rotation for less rigid feel
    building.rotation.y = (rng() - 0.5) * 0.08;
    buildings.add(building);
  }
}

function pickCommercialStyle(floors, rng) {
  if (floors >= 8) return rng() > 0.45 ? 'tower' : 'glass';
  if (floors >= 5) return ['setback', 'slab', 'glass', 'L'][Math.floor(rng() * 4)];
  return ['slab', 'warehouse', 'lowrise'][Math.floor(rng() * 3)];
}

function createCommercialBuilding(fp, height, floors, color, style, rng, materials) {
  const g = new THREE.Group();
  const bodyMat = new THREE.MeshStandardMaterial({
    color,
    roughness: 0.7 + rng() * 0.25,
    metalness: 0.05 + rng() * 0.18,
  });

  if (style === 'tower') {
    const baseH = height * 0.28;
    const midH = height * 0.42;
    const topH = height * 0.3;
    addBox(g, fp.w, baseH, fp.d, 0, baseH / 2, 0, bodyMat);
    addBox(g, fp.w * 0.82, midH, fp.d * 0.82, 0, baseH + midH / 2, 0, bodyMat);
    addBox(g, fp.w * 0.62, topH, fp.d * 0.62, 0, baseH + midH + topH / 2, 0, bodyMat);
    if (rng() > 0.4) {
      addBox(g, fp.w * 0.55, height * 0.55, 0.04, 0, height * 0.5, fp.d * 0.41, materials.glass);
    }
  } else if (style === 'setback') {
    const h1 = height * 0.55;
    const h2 = height * 0.45;
    addBox(g, fp.w, h1, fp.d, 0, h1 / 2, 0, bodyMat);
    addBox(g, fp.w * 0.72, h2, fp.d * 0.72, 0, h1 + h2 / 2, 0, bodyMat);
  } else if (style === 'glass') {
    addBox(g, fp.w, height, fp.d, 0, height / 2, 0, bodyMat);
    addBox(g, fp.w * 0.9, height * 0.82, 0.05, 0, height * 0.5, fp.d / 2, materials.glass);
    addBox(g, 0.05, height * 0.82, fp.d * 0.9, fp.w / 2, height * 0.5, 0, materials.glass);
  } else if (style === 'L') {
    const t = 0.38 + rng() * 0.15;
    addBox(g, fp.w, height, fp.d * t, 0, height / 2, -fp.d * (0.5 - t / 2), bodyMat);
    addBox(g, fp.w * t, height * (0.7 + rng() * 0.3), fp.d, -fp.w * (0.5 - t / 2), height * 0.4, 0, bodyMat);
  } else if (style === 'warehouse') {
    const h = height * (0.55 + rng() * 0.25);
    addBox(g, fp.w * 1.05, h, fp.d * 1.05, 0, h / 2, 0, bodyMat);
    // Flat roof lip
    addBox(
      g,
      fp.w * 1.1,
      0.08,
      fp.d * 1.1,
      0,
      h + 0.04,
      0,
      new THREE.MeshStandardMaterial({ color: 0x5a5550, roughness: 0.9 })
    );
  } else {
    // slab / lowrise
    addBox(g, fp.w, height, fp.d, 0, height / 2, 0, bodyMat);
    if (floors >= 4 && rng() > 0.5) {
      addBox(g, fp.w * 0.88, height * 0.65, 0.04, 0, height * 0.48, fp.d / 2, materials.glass);
    }
    // Rooftop mechanical box
    if (rng() > 0.55) {
      addBox(
        g,
        fp.w * 0.25,
        0.25 + rng() * 0.2,
        fp.d * 0.25,
        (rng() - 0.5) * fp.w * 0.3,
        height + 0.15,
        (rng() - 0.5) * fp.d * 0.3,
        new THREE.MeshStandardMaterial({ color: 0x666660, roughness: 0.85 })
      );
    }
  }

  return g;
}

function addResidentialCluster(buildings, group, cx, cz, blockSize, dist, rng, materials) {
  const count = dist > 0.75 ? 2 + Math.floor(rng() * 2) : 2 + Math.floor(rng() * 3);
  for (let i = 0; i < count; i++) {
    const house = createHouse(rng, materials);
    const ox = (rng() - 0.5) * blockSize * 0.65;
    const oz = (rng() - 0.5) * blockSize * 0.65;
    house.position.set(cx + ox, 0, cz + oz);
    house.rotation.y = (rng() - 0.5) * 0.5 + Math.floor(rng() * 4) * (Math.PI / 2) * (rng() > 0.6 ? 1 : 0);
    buildings.add(house);

    if (rng() > 0.45) {
      const tree = createTree(rng, materials);
      tree.position.set(
        cx + ox + (rng() - 0.5) * 1.2,
        0,
        cz + oz + (rng() - 0.5) * 1.2
      );
      group.add(tree);
    }
  }

  // Yard patch
  if (rng() > 0.35) {
    const yard = new THREE.Mesh(
      new THREE.CircleGeometry(blockSize * (0.25 + rng() * 0.2), 6),
      materials.lawn
    );
    yard.rotation.x = -Math.PI / 2;
    yard.position.set(cx + (rng() - 0.5), 0.05, cz + (rng() - 0.5));
    group.add(yard);
  }
}

function createHouse(rng, materials) {
  const g = new THREE.Group();
  const w = 0.9 + rng() * 0.7;
  const d = 0.75 + rng() * 0.55;
  const h = 0.55 + rng() * 0.35;
  const wallColor = HOUSE_PALETTE[Math.floor(rng() * HOUSE_PALETTE.length)];
  const roofColor = ROOF_PALETTE[Math.floor(rng() * ROOF_PALETTE.length)];
  const wallMat = new THREE.MeshStandardMaterial({
    color: wallColor,
    roughness: 0.9,
  });
  const roofMat = new THREE.MeshStandardMaterial({
    color: roofColor,
    roughness: 0.85,
    flatShading: true,
  });

  const style = ['ranch', 'gable', 'split', 'bungalow'][Math.floor(rng() * 4)];

  if (style === 'split') {
    addBox(g, w, h, d * 0.55, 0, h / 2, -d * 0.2, wallMat);
    const h2 = h * (1.15 + rng() * 0.3);
    addBox(g, w * 0.65, h2, d * 0.55, w * 0.1, h2 / 2, d * 0.22, wallMat);
    addRoof(g, w * 1.05, d * 0.65, h + 0.02, 0, -d * 0.2, roofMat, rng);
    addRoof(g, w * 0.75, d * 0.65, h2 + 0.02, w * 0.1, d * 0.22, roofMat, rng);
  } else if (style === 'bungalow') {
    addBox(g, w * 1.1, h * 0.85, d * 1.1, 0, h * 0.42, 0, wallMat);
    // Porch
    addBox(
      g,
      w * 0.5,
      0.08,
      0.35,
      0,
      0.08,
      d * 0.55,
      new THREE.MeshStandardMaterial({ color: 0xa09080, roughness: 0.95 })
    );
    addRoof(g, w * 1.25, d * 1.25, h * 0.85, 0, 0, roofMat, rng);
  } else if (style === 'ranch') {
    addBox(g, w * 1.35, h * 0.75, d * 0.85, 0, h * 0.38, 0, wallMat);
    // Garage bump
    if (rng() > 0.4) {
      addBox(g, w * 0.45, h * 0.65, d * 0.7, -w * 0.55, h * 0.32, 0, wallMat);
    }
    addRoof(g, w * 1.5, d, h * 0.75, 0, 0, roofMat, rng);
  } else {
    // classic gable
    addBox(g, w, h, d, 0, h / 2, 0, wallMat);
    addRoof(g, w * 1.12, d * 1.12, h, 0, 0, roofMat, rng);
    // Chimney
    if (rng() > 0.5) {
      addBox(
        g,
        0.12,
        0.35,
        0.12,
        w * 0.25,
        h + 0.35,
        0,
        new THREE.MeshStandardMaterial({ color: 0x8a6050, roughness: 0.9 })
      );
    }
  }

  return g;
}

function addRoof(group, w, d, baseY, x, z, mat, rng) {
  const roofH = 0.28 + rng() * 0.22;
  const geo = new THREE.ConeGeometry(Math.max(w, d) * 0.62, roofH, 4);
  const roof = new THREE.Mesh(geo, mat);
  roof.position.set(x, baseY + roofH * 0.45, z);
  roof.rotation.y = Math.PI / 4;
  roof.scale.set(w / Math.max(w, d), 1, d / Math.max(w, d));
  roof.castShadow = true;
  group.add(roof);
}

function addSuburbs(group, buildings, gridW, gridD, rng, materials, roadSegments) {
  const clusters = [
    { x: -gridW * 0.55, z: 0, count: 14 },
    { x: gridW * 0.55, z: 0, count: 12 },
    { x: 0, z: -gridD * 0.55, count: 10 },
    { x: -10, z: gridD * 0.55, count: 11 },
    { x: -gridW * 0.4, z: -gridD * 0.4, count: 8 },
    { x: gridW * 0.42, z: gridD * 0.38, count: 9 },
    { x: -gridW * 0.38, z: gridD * 0.42, count: 7 },
    { x: gridW * 0.4, z: -gridD * 0.4, count: 8 },
  ];

  for (const cluster of clusters) {
    const cx = cluster.x + (rng() - 0.5) * 4;
    const cz = cluster.z + (rng() - 0.5) * 4;

    // Winding suburban lane
    const laneLen = 6 + rng() * 8;
    const laneAngle = rng() * Math.PI * 2;
    const lane = new THREE.Mesh(
      new THREE.PlaneGeometry(laneLen, 0.7 + rng() * 0.25),
      materials.road
    );
    lane.rotation.x = -Math.PI / 2;
    lane.rotation.z = laneAngle;
    lane.position.set(cx, 0.025, cz);
    lane.receiveShadow = true;
    group.add(lane);

    // Approximate axis-aligned segment for cars on suburb lanes
    const dx = Math.cos(laneAngle) * laneLen * 0.5;
    const dz = Math.sin(laneAngle) * laneLen * 0.5;
    if (Math.abs(dx) > Math.abs(dz)) {
      roadSegments.push({
        axis: 'x',
        z: cz,
        x0: cx - Math.abs(dx),
        x1: cx + Math.abs(dx),
        lane: 0.18,
      });
    } else {
      roadSegments.push({
        axis: 'z',
        x: cx,
        z0: cz - Math.abs(dz),
        z1: cz + Math.abs(dz),
        lane: 0.18,
      });
    }

    for (let i = 0; i < cluster.count; i++) {
      const a = (i / cluster.count) * Math.PI * 2 + rng() * 0.4;
      const r = 2.2 + rng() * 5.5;
      const hx = cx + Math.cos(a) * r * (0.7 + rng() * 0.5);
      const hz = cz + Math.sin(a) * r * (0.55 + rng() * 0.55);

      const house = createHouse(rng, materials);
      house.position.set(hx, 0, hz);
      house.rotation.y = a + Math.PI + (rng() - 0.5) * 0.6;
      buildings.add(house);

      if (rng() > 0.4) {
        const tree = createTree(rng, materials);
        tree.position.set(
          hx + Math.cos(a + 0.5) * 1.1,
          0,
          hz + Math.sin(a + 0.5) * 1.1
        );
        group.add(tree);
      }

      if (rng() > 0.6) {
        const yard = new THREE.Mesh(
          new THREE.CircleGeometry(0.6 + rng() * 0.5, 5),
          materials.lawn
        );
        yard.rotation.x = -Math.PI / 2;
        yard.position.set(hx, 0.04, hz);
        group.add(yard);
      }
    }
  }
}

function addCreek(group, originX, gridW, gridD, rng) {
  const creekGroup = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({
    color: 0x4a7a8a,
    roughness: 0.35,
    metalness: 0.2,
  });

  const waterZones = [];
  const baseX = originX + gridW * 0.28;
  const segments = 8;
  const segDepth = (gridD / segments) * 1.15;

  for (let i = 0; i < segments; i++) {
    const t = i / (segments - 1);
    const z = (t - 0.5) * gridD * 0.9;
    const x = baseX + Math.sin(t * Math.PI * 2.2) * 2.2 + (rng() - 0.5) * 0.4;
    const width = 1.35 + rng() * 0.55;
    const piece = new THREE.Mesh(
      new THREE.PlaneGeometry(width, segDepth),
      mat
    );
    piece.rotation.x = -Math.PI / 2;
    piece.position.set(x, 0.04, z);
    creekGroup.add(piece);

    waterZones.push({
      x,
      z,
      halfW: width * 0.55,
      halfD: segDepth * 0.55,
    });
  }
  group.add(creekGroup);
  return waterZones;
}

function addBox(group, w, h, d, x, y, z, mat) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  group.add(mesh);
  return mesh;
}

function subdivideBlock(rng, size) {
  const parts = [];
  const roll = rng();
  if (roll < 0.3) {
    parts.push({
      x: (rng() - 0.5) * 0.2,
      z: (rng() - 0.5) * 0.2,
      w: size * (0.7 + rng() * 0.2),
      d: size * (0.7 + rng() * 0.2),
    });
    return parts;
  }

  if (roll < 0.55) {
    // Three irregular parcels
    parts.push({
      x: -size * 0.22,
      z: -size * 0.18,
      w: size * (0.4 + rng() * 0.15),
      d: size * (0.4 + rng() * 0.2),
    });
    parts.push({
      x: size * 0.22,
      z: -size * 0.1,
      w: size * (0.35 + rng() * 0.15),
      d: size * (0.45 + rng() * 0.2),
    });
    parts.push({
      x: (rng() - 0.5) * 0.15,
      z: size * 0.22,
      w: size * (0.55 + rng() * 0.2),
      d: size * (0.3 + rng() * 0.15),
    });
    return parts;
  }

  const splitX = rng() > 0.5;
  if (splitX) {
    const w1 = size * (0.32 + rng() * 0.28);
    const gap = 0.12 + rng() * 0.1;
    parts.push({
      x: -size / 2 + w1 / 2,
      z: (rng() - 0.5) * 0.35,
      w: w1 * 0.9,
      d: size * (0.5 + rng() * 0.35),
    });
    parts.push({
      x: size / 2 - (size - w1 - gap) / 2,
      z: (rng() - 0.5) * 0.45,
      w: (size - w1 - gap) * 0.88,
      d: size * (0.45 + rng() * 0.38),
    });
  } else {
    const d1 = size * (0.32 + rng() * 0.28);
    const gap = 0.12 + rng() * 0.1;
    parts.push({
      x: (rng() - 0.5) * 0.35,
      z: -size / 2 + d1 / 2,
      w: size * (0.5 + rng() * 0.35),
      d: d1 * 0.9,
    });
    parts.push({
      x: (rng() - 0.5) * 0.45,
      z: size / 2 - (size - d1 - gap) / 2,
      w: size * (0.45 + rng() * 0.38),
      d: (size - d1 - gap) * 0.88,
    });
  }
  return parts;
}

function createTree(rng, materials) {
  const g = new THREE.Group();
  const h = 0.5 + rng() * 0.7;
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.05, 0.08, h, 5),
    materials.trunk
  );
  trunk.position.y = h / 2;
  trunk.castShadow = true;
  g.add(trunk);

  const canopyMat = rng() > 0.5 ? materials.canopy : materials.canopyAlt;
  const kind = rng();
  if (kind > 0.55) {
    const canopy = new THREE.Mesh(
      new THREE.SphereGeometry(0.35 + rng() * 0.25, 6, 5),
      canopyMat
    );
    canopy.position.y = h + 0.2;
    canopy.scale.y = 0.75 + rng() * 0.3;
    canopy.castShadow = true;
    g.add(canopy);
  } else {
    const canopy = new THREE.Mesh(
      new THREE.ConeGeometry(0.3 + rng() * 0.25, 0.65 + rng() * 0.45, 6),
      canopyMat
    );
    canopy.position.y = h + 0.22;
    canopy.castShadow = true;
    g.add(canopy);
  }
  g.scale.setScalar(0.85 + rng() * 0.4);
  return g;
}

function createCars(roadSegments, rng) {
  const group = new THREE.Group();
  group.name = 'cars';
  const cars = [];
  const count = Math.min(42, Math.max(18, roadSegments.length * 1.2));

  for (let i = 0; i < count; i++) {
    const seg = roadSegments[Math.floor(rng() * roadSegments.length)];
    const car = createCarMesh(rng);
    group.add(car);

    const dir = rng() > 0.5 ? 1 : -1;
    const speed = 2.2 + rng() * 3.5;
    const t = rng();

    cars.push({
      mesh: car,
      seg,
      t,
      dir,
      speed,
      baseSpeed: speed,
      alive: true,
      drowning: false,
      wrecked: false,
      crashTimer: 0,
      drownTimer: 0,
      spin: 0,
      cooldown: 0,
    });
    placeCar(cars[cars.length - 1]);
  }

  return { group, cars };
}

function createCarMesh(rng) {
  const g = new THREE.Group();
  const color = CAR_COLORS[Math.floor(rng() * CAR_COLORS.length)];
  const bodyMat = new THREE.MeshStandardMaterial({
    color,
    roughness: 0.45,
    metalness: 0.35,
  });
  const cabinMat = new THREE.MeshStandardMaterial({
    color: 0x2a3540,
    roughness: 0.3,
    metalness: 0.4,
  });

  const body = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.18, 0.3), bodyMat);
  body.position.y = 0.14;
  body.castShadow = true;
  g.add(body);

  const cabin = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.14, 0.26), cabinMat);
  cabin.position.set(-0.02, 0.28, 0);
  cabin.castShadow = true;
  g.add(cabin);

  return g;
}

function placeCar(car, y = 0.05) {
  const { mesh, seg, t, dir } = car;
  const lane = seg.lane * (dir > 0 ? 1 : -1);

  if (seg.axis === 'x') {
    const x = THREE.MathUtils.lerp(seg.x0, seg.x1, t);
    mesh.position.set(x, y, seg.z + lane);
    mesh.rotation.y = (dir > 0 ? 0 : Math.PI) + (car.spin || 0);
  } else {
    const z = THREE.MathUtils.lerp(seg.z0, seg.z1, t);
    mesh.position.set(seg.x + lane, y, z);
    mesh.rotation.y =
      (dir > 0 ? -Math.PI / 2 : Math.PI / 2) + (car.spin || 0);
  }
}

function respawnCar(car, rng = Math.random) {
  car.alive = true;
  car.drowning = false;
  car.wrecked = false;
  car.crashTimer = 0;
  car.drownTimer = 0;
  car.spin = 0;
  car.cooldown = 0;
  car.speed = car.baseSpeed;
  car.t = typeof rng === 'function' ? rng() : Math.random();
  car.dir = (typeof rng === 'function' ? rng() : Math.random()) > 0.5 ? 1 : -1;
  car.mesh.visible = true;
  car.mesh.rotation.z = 0;
  car.mesh.rotation.x = 0;
  placeCar(car, 0.05);
}

/**
 * Drive cars, resolve car-car crashes, drown in creek water.
 */
export function updateCars(carSystem, dt, waterZones) {
  if (!carSystem) return;
  const cars = carSystem.cars;
  const crashRadius = 0.65;

  for (let i = 0; i < cars.length; i++) {
    const car = cars[i];

    if (car.drowning) {
      car.drownTimer += dt;
      car.mesh.position.y = THREE.MathUtils.lerp(car.mesh.position.y, -0.55, 0.06);
      car.mesh.rotation.z += dt * 1.2;
      car.mesh.rotation.x = THREE.MathUtils.lerp(car.mesh.rotation.x, 0.4, 0.05);
      if (car.drownTimer > 3.5) {
        respawnCar(car);
      }
      continue;
    }

    if (car.wrecked) {
      car.crashTimer += dt;
      car.spin += dt * 6;
      car.mesh.rotation.y += dt * 4;
      car.mesh.position.y = 0.05;
      if (car.crashTimer > 1.4) {
        car.wrecked = false;
        car.spin = 0;
        car.speed = car.baseSpeed;
        car.cooldown = 0.8;
        placeCar(car);
      }
      continue;
    }

    if (car.cooldown > 0) car.cooldown -= dt;

    const { seg } = car;
    const length =
      seg.axis === 'x' ? Math.abs(seg.x1 - seg.x0) : Math.abs(seg.z1 - seg.z0);
    if (length > 0.1) {
      car.t += ((car.speed * car.dir) / length) * dt;
      if (car.t > 1) car.t = 0;
      else if (car.t < 0) car.t = 1;
    }
    placeCar(car);

    // Drown in water
    if (isInWater(car.mesh.position.x, car.mesh.position.z, waterZones)) {
      car.drowning = true;
      car.alive = false;
      car.drownTimer = 0;
      continue;
    }

    // Car-car collisions
    if (car.cooldown > 0) continue;
    for (let j = i + 1; j < cars.length; j++) {
      const other = cars[j];
      if (!other.alive || other.drowning || other.wrecked || other.cooldown > 0) {
        continue;
      }
      const dx = car.mesh.position.x - other.mesh.position.x;
      const dz = car.mesh.position.z - other.mesh.position.z;
      const distSq = dx * dx + dz * dz;
      if (distSq < crashRadius * crashRadius) {
        crashCars(car, other);
        break;
      }
    }
  }
}

function crashCars(a, b) {
  // Bounce apart along road parameter
  a.dir *= -1;
  b.dir *= -1;
  a.t = THREE.MathUtils.clamp(a.t + a.dir * 0.04, 0, 1);
  b.t = THREE.MathUtils.clamp(b.t + b.dir * 0.04, 0, 1);

  a.wrecked = true;
  b.wrecked = true;
  a.crashTimer = 0;
  b.crashTimer = 0;
  a.speed = a.baseSpeed * 0.4;
  b.speed = b.baseSpeed * 0.4;
  a.spin = 0;
  b.spin = 0;

  // Nudge sideways so they don't stick
  const nx = a.mesh.position.x - b.mesh.position.x;
  const nz = a.mesh.position.z - b.mesh.position.z;
  const len = Math.hypot(nx, nz) || 1;
  a.mesh.position.x += (nx / len) * 0.25;
  a.mesh.position.z += (nz / len) * 0.25;
  b.mesh.position.x -= (nx / len) * 0.25;
  b.mesh.position.z -= (nz / len) * 0.25;
}
