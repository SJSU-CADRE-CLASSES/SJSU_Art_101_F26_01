import * as THREE from 'three';

/**
 * Outskirts landmarks: a data center campus and an almond farm with bamboo grove.
 */
export function createLandmarks(rng) {
  const group = new THREE.Group();
  group.name = 'landmarks';

  const dataCenter = createDataCenter(rng);
  // Far south flats — clear of mountains and suburban clusters
  dataCenter.position.set(4, 0, 28);
  group.add(dataCenter);

  const farm = createAlmondFarmWithBamboo(rng);
  farm.position.set(-22, 0, -14);
  group.add(farm);

  return {
    group,
    points: {
      dataCenter: new THREE.Vector3(4, 0, 28),
      almondFarm: new THREE.Vector3(-22, 0, -14),
    },
  };
}

function createDataCenter(rng) {
  const g = new THREE.Group();

  const slabMat = new THREE.MeshStandardMaterial({
    color: 0xb8bcbc,
    roughness: 0.7,
    metalness: 0.2,
  });
  const darkMat = new THREE.MeshStandardMaterial({
    color: 0x3a4044,
    roughness: 0.85,
  });
  const accentMat = new THREE.MeshStandardMaterial({
    color: 0x4a6a78,
    roughness: 0.4,
    metalness: 0.35,
    emissive: 0x1a3040,
    emissiveIntensity: 0.2,
  });
  const gravelMat = new THREE.MeshStandardMaterial({
    color: 0x6a6860,
    roughness: 1,
  });

  // Campus pad
  const pad = new THREE.Mesh(new THREE.BoxGeometry(14, 0.08, 10), gravelMat);
  pad.position.y = 0.04;
  pad.receiveShadow = true;
  g.add(pad);

  // Main halls
  const halls = [
    { x: -3.2, z: -1.2, w: 5.5, h: 2.2, d: 4.2 },
    { x: 3.5, z: 0.5, w: 4.8, h: 2.0, d: 5.5 },
  ];

  for (const h of halls) {
    const hall = new THREE.Mesh(
      new THREE.BoxGeometry(h.w, h.h, h.d),
      slabMat
    );
    hall.position.set(h.x, h.h / 2, h.z);
    hall.castShadow = true;
    hall.receiveShadow = true;
    g.add(hall);

    // Roof HVAC units
    const units = 3 + Math.floor(rng() * 3);
    for (let i = 0; i < units; i++) {
      const unit = new THREE.Mesh(
        new THREE.BoxGeometry(0.7 + rng() * 0.4, 0.35, 0.55 + rng() * 0.3),
        darkMat
      );
      unit.position.set(
        h.x + (rng() - 0.5) * h.w * 0.7,
        h.h + 0.2,
        h.z + (rng() - 0.5) * h.d * 0.7
      );
      unit.castShadow = true;
      g.add(unit);

      // Fan disc
      const fan = new THREE.Mesh(
        new THREE.CylinderGeometry(0.18, 0.18, 0.06, 10),
        accentMat
      );
      fan.position.copy(unit.position);
      fan.position.y += 0.22;
      g.add(fan);
    }

    // Blue strip windows / LED accent
    const strip = new THREE.Mesh(
      new THREE.BoxGeometry(h.w * 0.92, 0.25, 0.06),
      accentMat
    );
    strip.position.set(h.x, h.h * 0.55, h.z + h.d / 2);
    g.add(strip);
  }

  // Generator / substation boxes
  for (let i = 0; i < 4; i++) {
    const box = new THREE.Mesh(
      new THREE.BoxGeometry(0.9, 0.7, 0.7),
      darkMat
    );
    box.position.set(-6 + i * 1.2, 0.35, 4.2);
    box.castShadow = true;
    g.add(box);
  }

  // Security fence posts
  const fenceMat = new THREE.MeshStandardMaterial({
    color: 0x8a9090,
    roughness: 0.6,
    metalness: 0.4,
  });
  for (let i = 0; i < 12; i++) {
    const t = i / 11;
    const post = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 1.1, 0.08),
      fenceMat
    );
    post.position.set(-7 + t * 14, 0.55, -5.2);
    g.add(post);
  }

  // Parking stripes area
  const lot = new THREE.Mesh(
    new THREE.PlaneGeometry(5, 3),
    new THREE.MeshStandardMaterial({ color: 0x2a3034, roughness: 0.95 })
  );
  lot.rotation.x = -Math.PI / 2;
  lot.position.set(5.5, 0.06, -3.8);
  g.add(lot);

  return g;
}

function createAlmondFarmWithBamboo(rng) {
  const g = new THREE.Group();

  const dirtMat = new THREE.MeshStandardMaterial({
    color: 0x6a5a42,
    roughness: 1,
  });
  const soilMat = new THREE.MeshStandardMaterial({
    color: 0x5a4a38,
    roughness: 1,
  });

  // Orchard ground
  const field = new THREE.Mesh(new THREE.BoxGeometry(12, 0.06, 9), dirtMat);
  field.position.set(0, 0.03, 0);
  field.receiveShadow = true;
  g.add(field);

  // Furrow strips
  for (let i = 0; i < 6; i++) {
    const furrow = new THREE.Mesh(
      new THREE.BoxGeometry(11, 0.04, 0.35),
      soilMat
    );
    furrow.position.set(0, 0.05, -3.5 + i * 1.35);
    g.add(furrow);
  }

  // Almond trees in rows
  const trunkMat = new THREE.MeshStandardMaterial({
    color: 0x6a5040,
    roughness: 1,
  });
  const blossomMat = new THREE.MeshStandardMaterial({
    color: 0xe8d8c8,
    roughness: 0.85,
  });
  const leafMat = new THREE.MeshStandardMaterial({
    color: 0x6a8a48,
    roughness: 0.9,
  });

  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 7; col++) {
      if (rng() < 0.08) continue; // missing tree for organic feel
      const tree = createAlmondTree(rng, trunkMat, blossomMat, leafMat);
      tree.position.set(-4.5 + col * 1.45, 0, -3.2 + row * 1.5);
      tree.rotation.y = rng() * Math.PI;
      g.add(tree);
    }
  }

  // Small farm shed
  const shedMat = new THREE.MeshStandardMaterial({
    color: 0xa89070,
    roughness: 0.9,
  });
  const shed = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.2, 1.4), shedMat);
  shed.position.set(5.2, 0.6, 3.2);
  shed.castShadow = true;
  g.add(shed);
  const roof = new THREE.Mesh(
    new THREE.ConeGeometry(1.3, 0.5, 4),
    new THREE.MeshStandardMaterial({ color: 0x6a5040, flatShading: true })
  );
  roof.position.set(5.2, 1.45, 3.2);
  roof.rotation.y = Math.PI / 4;
  g.add(roof);

  // Bamboo grove beside the almond farm
  const bamboo = createBambooGrove(rng);
  bamboo.position.set(-7.5, 0, 1.5);
  g.add(bamboo);

  return g;
}

function createAlmondTree(rng, trunkMat, blossomMat, leafMat) {
  const g = new THREE.Group();
  const h = 0.7 + rng() * 0.45;
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.05, 0.08, h, 5),
    trunkMat
  );
  trunk.position.y = h / 2;
  trunk.castShadow = true;
  g.add(trunk);

  // Layered canopy — blossom + leaf mix (Valley almonds)
  const canopyMat = rng() > 0.35 ? blossomMat : leafMat;
  for (let i = 0; i < 3; i++) {
    const blob = new THREE.Mesh(
      new THREE.SphereGeometry(0.28 + rng() * 0.15, 6, 5),
      i === 0 ? canopyMat : leafMat
    );
    blob.position.set(
      (rng() - 0.5) * 0.25,
      h + 0.15 + i * 0.12,
      (rng() - 0.5) * 0.25
    );
    blob.scale.y = 0.7 + rng() * 0.25;
    blob.castShadow = true;
    g.add(blob);
  }
  return g;
}

function createBambooGrove(rng) {
  const g = new THREE.Group();
  const culmMat = new THREE.MeshStandardMaterial({
    color: 0x5a8a48,
    roughness: 0.75,
  });
  const tipMat = new THREE.MeshStandardMaterial({
    color: 0x7aaa58,
    roughness: 0.85,
  });
  const groundMat = new THREE.MeshStandardMaterial({
    color: 0x4a6a40,
    roughness: 1,
  });

  const patch = new THREE.Mesh(
    new THREE.CircleGeometry(2.8, 8),
    groundMat
  );
  patch.rotation.x = -Math.PI / 2;
  patch.position.y = 0.05;
  g.add(patch);

  const stalks = 45;
  for (let i = 0; i < stalks; i++) {
    const a = rng() * Math.PI * 2;
    const r = rng() * 2.4;
    const h = 2.2 + rng() * 3.5;
    const rad = 0.04 + rng() * 0.04;

    const stalk = new THREE.Mesh(
      new THREE.CylinderGeometry(rad * 0.85, rad, h, 6),
      culmMat
    );
    stalk.position.set(Math.cos(a) * r, h / 2, Math.sin(a) * r);
    stalk.rotation.x = (rng() - 0.5) * 0.08;
    stalk.rotation.z = (rng() - 0.5) * 0.08;
    stalk.castShadow = true;
    g.add(stalk);

    // Leaf cluster near top
    if (rng() > 0.3) {
      const leaves = new THREE.Mesh(
        new THREE.SphereGeometry(0.25 + rng() * 0.2, 5, 4),
        tipMat
      );
      leaves.position.set(
        stalk.position.x + (rng() - 0.5) * 0.15,
        h * (0.7 + rng() * 0.25),
        stalk.position.z + (rng() - 0.5) * 0.15
      );
      leaves.scale.set(1.4, 0.45, 0.7);
      g.add(leaves);
    }
  }

  return g;
}
