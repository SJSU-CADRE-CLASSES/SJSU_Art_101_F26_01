import * as THREE from 'three';
import { createRng } from './city.js';

/**
 * Mountain ranges flanking a valley — Santa Cruz Mountains (SW) & Diablo Range (NE).
 */
export function createMountains(cityBounds, rng = createRng(201)) {
  const group = new THREE.Group();
  const { halfW, halfD } = cityBounds;

  const west = buildRange({
    rng,
    centerX: -(halfW + 12),
    centerZ: 0,
    length: halfD * 3.2,
    width: 24,
    peakHeight: 18,
    ridgeCount: 8,
    color: 0x4f6350,
    rockColor: 0x627060,
  });
  west.name = 'santaCruzMountains';
  group.add(west);

  const east = buildRange({
    rng,
    centerX: halfW + 13,
    centerZ: 2,
    length: halfD * 3.4,
    width: 28,
    peakHeight: 22,
    ridgeCount: 9,
    color: 0x5c6a52,
    rockColor: 0x6e7a62,
  });
  east.name = 'diabloRange';
  group.add(east);

  // Soft foothills closer to the city (keep clear of south flats for landmarks)
  group.add(
    buildFoothills(-(halfW + 4), halfD * 1.4, 7, 5, 0x4f5f4e, rng, -2)
  );
  group.add(
    buildFoothills(halfW + 6, halfD * 1.4, 8, 6, 0x556354, rng, -2)
  );

  return group;
}

function buildRange({
  rng,
  centerX,
  centerZ,
  length,
  width,
  peakHeight,
  ridgeCount,
  color,
  rockColor,
}) {
  const range = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({
    color,
    roughness: 0.92,
    flatShading: true,
  });
  const rockMat = new THREE.MeshStandardMaterial({
    color: rockColor,
    roughness: 0.95,
    flatShading: true,
  });

  for (let i = 0; i < ridgeCount; i++) {
    const t = i / (ridgeCount - 1);
    const z = centerZ + (t - 0.5) * length;
    const height = peakHeight * (0.45 + Math.sin(t * Math.PI) * 0.55) *
      (0.75 + rng() * 0.4);
    const w = width * (0.55 + rng() * 0.5);
    const d = length / ridgeCount * (1.1 + rng() * 0.6);

    const mountain = createPeak(w, height, d, rng() > 0.55 ? rockMat : mat, rng);
    mountain.position.set(
      centerX + (rng() - 0.5) * 6,
      0,
      z + (rng() - 0.5) * 3
    );
    mountain.rotation.y = (rng() - 0.5) * 0.4;
    range.add(mountain);
  }

  return range;
}

function createPeak(w, h, d, material, rng) {
  const geo = new THREE.ConeGeometry(
    Math.max(w, d) * 0.55,
    h,
    5 + Math.floor(rng() * 3)
  );
  // Flatten base irregularly
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i);
    if (y < -h * 0.35) {
      pos.setY(i, -h * 0.5 + rng() * 0.3);
    } else if (y > h * 0.2) {
      pos.setX(i, pos.getX(i) * (0.85 + rng() * 0.2));
      pos.setZ(i, pos.getZ(i) * (0.85 + rng() * 0.2));
    }
  }
  geo.computeVertexNormals();

  const mesh = new THREE.Mesh(geo, material);
  mesh.position.y = h * 0.45;
  mesh.scale.set(w / Math.max(w, d), 1, d / Math.max(w, d));
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

function buildFoothills(x, length, count, maxH, color, rng, zCenter = 0) {
  const g = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({
    color,
    roughness: 0.95,
    flatShading: true,
  });

  for (let i = 0; i < count; i++) {
    const t = i / (count - 1 || 1);
    const h = maxH * (0.4 + rng() * 0.6);
    const r = 3 + rng() * 4;
    const hill = new THREE.Mesh(
      new THREE.SphereGeometry(r, 6, 5, 0, Math.PI * 2, 0, Math.PI * 0.5),
      mat
    );
    hill.scale.set(1.4 + rng() * 0.6, h / r, 1.2 + rng() * 0.5);
    hill.position.set(
      x + (rng() - 0.5) * 4,
      0,
      zCenter + (t - 0.5) * length
    );
    hill.receiveShadow = true;
    g.add(hill);
  }
  return g;
}
