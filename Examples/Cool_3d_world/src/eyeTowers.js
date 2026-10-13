import * as THREE from 'three';

/**
 * Two colossal "watcher" towers with eyes that track a look target (usually the camera).
 */
export function createEyeTowers() {
  const group = new THREE.Group();
  group.name = 'eyeTowers';

  const towers = [
    createEyeTower({
      x: -5.5,
      z: 3.2,
      height: 22,
      width: 2.4,
      depth: 2.2,
      bodyColor: 0xc4b49a,
      accentColor: 0x6a8fa0,
      irisColor: 0x2a5a8a,
      phase: 0,
    }),
    createEyeTower({
      x: 6.2,
      z: -2.4,
      height: 26,
      width: 2.8,
      depth: 2.5,
      bodyColor: 0x9aa8a4,
      accentColor: 0xa89078,
      irisColor: 0x3a6a48,
      phase: 1.7,
    }),
  ];

  for (const t of towers) {
    group.add(t.group);
  }

  return { group, towers };
}

function createEyeTower({
  x,
  z,
  height,
  width,
  depth,
  bodyColor,
  accentColor,
  irisColor,
  phase,
}) {
  const group = new THREE.Group();
  group.position.set(x, 0, z);

  const bodyMat = new THREE.MeshStandardMaterial({
    color: bodyColor,
    roughness: 0.72,
    metalness: 0.12,
  });
  const accentMat = new THREE.MeshStandardMaterial({
    color: accentColor,
    roughness: 0.45,
    metalness: 0.25,
  });

  // Tiered shaft
  const baseH = height * 0.22;
  const midH = height * 0.48;
  const topH = height * 0.22;
  const crownH = height * 0.08;

  const base = box(width * 1.25, baseH, depth * 1.25, bodyMat);
  base.position.y = baseH / 2;
  group.add(base);

  const mid = box(width, midH, depth, bodyMat);
  mid.position.y = baseH + midH / 2;
  group.add(mid);

  // Window bands
  for (let i = 0; i < 5; i++) {
    const band = box(
      width * 1.02,
      0.35,
      0.06,
      new THREE.MeshStandardMaterial({
        color: 0x5a7a88,
        roughness: 0.3,
        metalness: 0.4,
        emissive: 0x152028,
        emissiveIntensity: 0.2,
      })
    );
    band.position.set(0, baseH + midH * ((i + 1) / 6), depth / 2);
    group.add(band);
  }

  const top = box(width * 0.85, topH, depth * 0.85, accentMat);
  top.position.y = baseH + midH + topH / 2;
  group.add(top);

  const crown = box(width * 1.05, crownH, depth * 1.05, bodyMat);
  crown.position.y = baseH + midH + topH + crownH / 2;
  group.add(crown);

  // Eye platform near the top
  const eyeY = baseH + midH + topH * 0.55;
  const eyeScale = Math.min(width, depth) * 0.55;

  const scleraMat = new THREE.MeshStandardMaterial({
    color: 0xf2ebe0,
    roughness: 0.35,
    metalness: 0.05,
  });
  const irisMat = new THREE.MeshStandardMaterial({
    color: irisColor,
    roughness: 0.4,
    metalness: 0.15,
    emissive: irisColor,
    emissiveIntensity: 0.25,
  });
  const pupilMat = new THREE.MeshStandardMaterial({
    color: 0x0a0c10,
    roughness: 0.6,
  });
  const lidMat = new THREE.MeshStandardMaterial({
    color: bodyColor,
    roughness: 0.8,
  });

  // Brow / socket
  const socket = box(eyeScale * 2.4, eyeScale * 1.6, eyeScale * 0.45, lidMat);
  socket.position.set(0, eyeY, depth * 0.42);
  group.add(socket);

  const eyePivot = new THREE.Group();
  eyePivot.position.set(0, eyeY, depth * 0.55);
  group.add(eyePivot);

  const sclera = new THREE.Mesh(
    new THREE.SphereGeometry(eyeScale, 24, 18),
    scleraMat
  );
  sclera.scale.set(1.15, 1, 0.85);
  sclera.castShadow = true;
  eyePivot.add(sclera);

  const iris = new THREE.Mesh(
    new THREE.SphereGeometry(eyeScale * 0.48, 20, 16),
    irisMat
  );
  iris.position.z = eyeScale * 0.55;
  eyePivot.add(iris);

  const pupil = new THREE.Mesh(
    new THREE.SphereGeometry(eyeScale * 0.22, 16, 12),
    pupilMat
  );
  pupil.position.z = eyeScale * 0.85;
  eyePivot.add(pupil);

  // Highlight
  const glint = new THREE.Mesh(
    new THREE.SphereGeometry(eyeScale * 0.1, 8, 8),
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xffffff,
      emissiveIntensity: 0.8,
      roughness: 0.2,
    })
  );
  glint.position.set(eyeScale * 0.18, eyeScale * 0.2, eyeScale * 0.95);
  eyePivot.add(glint);

  // Upper lid hint
  const lid = box(eyeScale * 2.2, eyeScale * 0.35, eyeScale * 0.5, lidMat);
  lid.position.set(0, eyeY + eyeScale * 0.75, depth * 0.5);
  group.add(lid);

  return {
    group,
    eyePivot,
    phase,
    blinkUntil: 0,
  };
}

function box(w, h, d, mat) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

const _look = new THREE.Vector3();
const _world = new THREE.Vector3();

/** Make each tower eye look toward a world-space point (e.g. camera). */
export function updateEyeTowers(towers, lookAt, time) {
  for (const tower of towers) {
    // Occasional blink by squashing the eye
    const blinkCycle = (time + tower.phase) % 4.5;
    const blinking = blinkCycle > 4.2;
    const squash = blinking ? 0.12 : 1;
    tower.eyePivot.scale.y = THREE.MathUtils.lerp(tower.eyePivot.scale.y, squash, 0.35);

    tower.eyePivot.getWorldPosition(_world);
    _look.copy(lookAt).sub(_world);

    // Limit how far the eye can swivel
    const yaw = Math.atan2(_look.x, _look.z);
    const pitch = Math.atan2(_look.y, Math.hypot(_look.x, _look.z));
    const maxYaw = 0.85;
    const maxPitch = 0.55;

    const targetYaw = THREE.MathUtils.clamp(yaw, -maxYaw, maxYaw);
    const targetPitch = THREE.MathUtils.clamp(pitch, -maxPitch, maxPitch);

    tower.eyePivot.rotation.y = THREE.MathUtils.lerp(
      tower.eyePivot.rotation.y,
      targetYaw,
      0.08
    );
    tower.eyePivot.rotation.x = THREE.MathUtils.lerp(
      tower.eyePivot.rotation.x,
      -targetPitch,
      0.08
    );
  }
}
