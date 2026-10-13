import * as THREE from 'three';
import { isInWater } from './water.js';

const SKIN = [0xe8c4a8, 0xc4a078, 0x8a6048, 0xd4b090, 0x5c4030];
const SHIRT = [0xc45c3a, 0x3a5a8a, 0xd4a84a, 0x4a7a5a, 0x8a4a6a, 0xe8e0d0, 0x2a4a6a];
const PANTS = [0x3a4048, 0x4a5540, 0x2a3038, 0x5a5048];

/**
 * Pedestrians walk sidewalks beside road segments.
 * If a car gets too close, they get flattened (then eventually respawn).
 */
export function createPedestrians(roadSegments, rng) {
  const group = new THREE.Group();
  group.name = 'pedestrians';
  const people = [];

  // Sidewalk paths parallel to main roads — some hug the curb (danger zone)
  const walks = [];
  for (const seg of roadSegments) {
    if (rng() > 0.5) continue;
    const side = rng() > 0.5 ? 1 : -1;
    // Closer offset = more likely to get hit
    const curb = rng() > 0.35;
    const offset = curb
      ? (seg.lane || 0.22) * 1.15 * side
      : (seg.lane || 0.22) * 2.6 * side + 0.4 * side;

    if (seg.axis === 'x') {
      walks.push({
        axis: 'x',
        z: seg.z + offset,
        a0: seg.x0,
        a1: seg.x1,
        onRoad: curb,
      });
    } else {
      walks.push({
        axis: 'z',
        x: seg.x + offset,
        a0: seg.z0,
        a1: seg.z1,
        onRoad: curb,
      });
    }

    // Dedicated crosswalk: pedestrians walk across the road
    if (rng() > 0.7 && seg.axis === 'x') {
      const crossX = THREE.MathUtils.lerp(seg.x0, seg.x1, 0.2 + rng() * 0.6);
      walks.push({
        axis: 'z',
        x: crossX,
        a0: seg.z - 1.2,
        a1: seg.z + 1.2,
        onRoad: true,
      });
    } else if (rng() > 0.7 && seg.axis === 'z') {
      const crossZ = THREE.MathUtils.lerp(seg.z0, seg.z1, 0.2 + rng() * 0.6);
      walks.push({
        axis: 'x',
        z: crossZ,
        a0: seg.x - 1.2,
        a1: seg.x + 1.2,
        onRoad: true,
      });
    }
  }

  // Extra plaza-style wander loops near downtown
  walks.push(
    { axis: 'x', z: 2.5, a0: -8, a1: 8 },
    { axis: 'z', x: -3, a0: -6, a1: 6 },
    { axis: 'x', z: -4, a0: -10, a1: 5 }
  );

  const count = 36;
  for (let i = 0; i < count; i++) {
    const walk = walks[Math.floor(rng() * walks.length)];
    const person = createPerson(rng);
    group.add(person.mesh);

    const dir = rng() > 0.5 ? 1 : -1;
    const speed = 0.55 + rng() * 0.7;
    const t = rng();

    const p = {
      mesh: person.mesh,
      body: person.body,
      walk,
      t,
      dir,
      speed,
      alive: true,
      drowning: false,
      deathTimer: 0,
      respawnDelay: 4 + rng() * 5,
      bobPhase: rng() * Math.PI * 2,
    };
    placePedestrian(p);
    people.push(p);
  }

  return { group, people };
}

function createPerson(rng) {
  const mesh = new THREE.Group();
  const skin = SKIN[Math.floor(rng() * SKIN.length)];
  const shirt = SHIRT[Math.floor(rng() * SHIRT.length)];
  const pants = PANTS[Math.floor(rng() * PANTS.length)];

  const body = new THREE.Group();
  mesh.add(body);

  const legMat = new THREE.MeshStandardMaterial({ color: pants, roughness: 0.9 });
  const shirtMat = new THREE.MeshStandardMaterial({ color: shirt, roughness: 0.85 });
  const skinMat = new THREE.MeshStandardMaterial({ color: skin, roughness: 0.8 });

  const leftLeg = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.28, 0.08), legMat);
  leftLeg.position.set(-0.06, 0.14, 0);
  body.add(leftLeg);

  const rightLeg = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.28, 0.08), legMat);
  rightLeg.position.set(0.06, 0.14, 0);
  body.add(rightLeg);

  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.28, 0.14), shirtMat);
  torso.position.y = 0.42;
  body.add(torso);

  const head = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.14, 0.14), skinMat);
  head.position.y = 0.64;
  body.add(head);

  const armL = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.24, 0.06), shirtMat);
  armL.position.set(-0.16, 0.4, 0);
  body.add(armL);

  const armR = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.24, 0.06), shirtMat);
  armR.position.set(0.16, 0.4, 0);
  body.add(armR);

  mesh.userData.legs = [leftLeg, rightLeg];
  mesh.userData.arms = [armL, armR];

  return { mesh, body };
}

function placePedestrian(p) {
  const { mesh, walk, t, dir } = p;
  if (walk.axis === 'x') {
    const x = THREE.MathUtils.lerp(walk.a0, walk.a1, t);
    mesh.position.set(x, 0, walk.z);
    mesh.rotation.y = dir > 0 ? Math.PI / 2 : -Math.PI / 2;
  } else {
    const z = THREE.MathUtils.lerp(walk.a0, walk.a1, t);
    mesh.position.set(walk.x, 0, z);
    mesh.rotation.y = dir > 0 ? 0 : Math.PI;
  }
}

function respawnPedestrian(p, rng) {
  p.alive = true;
  p.drowning = false;
  p.deathTimer = 0;
  p.t = rng();
  p.dir = rng() > 0.5 ? 1 : -1;
  p.body.rotation.set(0, 0, 0);
  p.body.position.y = 0;
  p.mesh.position.y = 0;
  p.mesh.rotation.x = 0;
  p.mesh.rotation.z = 0;
  p.mesh.visible = true;
  placePedestrian(p);
}

/**
 * Move pedestrians; flatten on car hits; drown in creek water.
 */
export function updatePedestrians(
  pedSystem,
  carSystem,
  dt,
  time,
  rng = Math.random,
  waterZones
) {
  if (!pedSystem) return;

  const cars = carSystem?.cars || [];
  const hitRadius = 0.72;
  const rand = typeof rng === 'function' ? rng : Math.random;

  for (const p of pedSystem.people) {
    if (!p.alive) {
      p.deathTimer += dt;
      if (p.drowning) {
        p.mesh.position.y = THREE.MathUtils.lerp(p.mesh.position.y, -0.7, 0.05);
        p.mesh.rotation.z += dt * 1.5;
      } else {
        p.body.position.y = THREE.MathUtils.lerp(p.body.position.y, -0.02, 0.1);
      }
      if (p.deathTimer > p.respawnDelay) {
        respawnPedestrian(p, rand);
      }
      continue;
    }

    const length = Math.abs(p.walk.a1 - p.walk.a0);
    if (length > 0.1) {
      p.t += ((p.speed * p.dir) / length) * dt;
      if (p.t > 1) {
        p.t = 1;
        p.dir *= -1;
      } else if (p.t < 0) {
        p.t = 0;
        p.dir *= -1;
      }
      placePedestrian(p);
    }

    // Walk bob / limb swing
    const swing = Math.sin(time * 8 + p.bobPhase) * 0.35;
    const legs = p.mesh.userData.legs;
    const arms = p.mesh.userData.arms;
    if (legs) {
      legs[0].rotation.x = swing;
      legs[1].rotation.x = -swing;
    }
    if (arms) {
      arms[0].rotation.x = -swing * 0.8;
      arms[1].rotation.x = swing * 0.8;
    }

    const px = p.mesh.position.x;
    const pz = p.mesh.position.z;

    // Drown in water
    if (isInWater(px, pz, waterZones)) {
      drownPedestrian(p);
      continue;
    }

    // Car collision (ignore drowning/wrecked cars)
    for (const car of cars) {
      if (!car.alive || car.drowning) continue;
      const dx = car.mesh.position.x - px;
      const dz = car.mesh.position.z - pz;
      if (dx * dx + dz * dz < hitRadius * hitRadius) {
        killPedestrian(p, car);
        break;
      }
    }
  }
}

function drownPedestrian(p) {
  p.alive = false;
  p.drowning = true;
  p.deathTimer = 0;
  p.respawnDelay = 3.5 + Math.random() * 2;
  p.body.rotation.x = Math.PI / 2;
}

function killPedestrian(p, car) {
  p.alive = false;
  p.drowning = false;
  p.deathTimer = 0;
  // Flatten in the direction of impact
  const awayX = p.mesh.position.x - car.mesh.position.x;
  const awayZ = p.mesh.position.z - car.mesh.position.z;
  const ang = Math.atan2(awayX, awayZ);
  p.body.rotation.x = Math.PI / 2;
  p.body.rotation.z = ang * 0.15;
  p.body.position.y = 0.06;
  // Nudge slightly
  p.mesh.position.x += awayX * 0.15;
  p.mesh.position.z += awayZ * 0.15;
}
