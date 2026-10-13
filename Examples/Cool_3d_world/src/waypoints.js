import * as THREE from 'three';

/**
 * Points of interest inspired by Santa Clara Valley landmarks,
 * placed on the procedural grid.
 */
export function getWaypoints(grid, landmarkPoints = {}) {
  const { originX, originZ, blockSize, roadWidth, cols, rows } = grid;

  const cell = (col, row) => ({
    x: originX + roadWidth + col * (blockSize + roadWidth) + blockSize / 2,
    z: originZ + roadWidth + row * (blockSize + roadWidth) + blockSize / 2,
  });

  const downtown = cell(Math.floor(cols / 2), Math.floor(rows / 2));
  const park = cell(3, 2);
  const creek = {
    x: originX + (cols * (blockSize + roadWidth) + roadWidth) * 0.28,
    z: 0,
  };
  const northEdge = cell(Math.floor(cols / 2), 0);
  const southCampus = cell(cols - 2, rows - 2);
  const westFoothill = cell(0, Math.floor(rows / 2));

  const list = [
    {
      id: 'downtown',
      title: 'Downtown Core',
      category: 'Urban Center',
      body:
        'The densest cluster of mid-rise towers marks the civic and commercial heart of the valley — a compact skyline that echoes San José\'s downtown, where government buildings, offices, and transit hubs meet.',
      position: new THREE.Vector3(downtown.x, 0, downtown.z),
      color: 0xc4784a,
    },
    {
      id: 'plaza',
      title: 'Plaza Park',
      category: 'Green Space',
      body:
        'A leafy block carved into the grid, similar to neighborhood plazas and Guadalupe River Park. These pockets of canopy cool the valley floor and give residents a place to gather under oak and sycamore shade.',
      position: new THREE.Vector3(park.x, 0, park.z),
      color: 0x6a9a6a,
    },
    {
      id: 'creek',
      title: 'Valley Creek',
      category: 'Waterway',
      body:
        'A blue ribbon of water threads the city like Los Gatos Creek or the Guadalupe River. Historically, these channels drained the Santa Clara Valley and still shape where parks and trails run today.',
      position: new THREE.Vector3(creek.x, 0, creek.z),
      color: 0x5a8fa8,
    },
    {
      id: 'tech-campus',
      title: 'Innovation Campus',
      category: 'Industry',
      body:
        'Lower, broader buildings at the city edge nod to Silicon Valley campuses — sprawling offices and research labs that grew among orchards and later filled the flatlands between the two mountain ranges.',
      position: new THREE.Vector3(southCampus.x, 0, southCampus.z),
      color: 0x8a9a78,
    },
    {
      id: 'foothills',
      title: 'West Foothills Gate',
      category: 'Landscape',
      body:
        'Where the grid softens into rolling hills, you face the Santa Cruz Mountains. Cities like Los Gatos and Cupertino sit at this edge — valley floor meeting oak woodland and coastal-range ridges.',
      position: new THREE.Vector3(westFoothill.x, 0, westFoothill.z),
      color: 0xa89060,
    },
    {
      id: 'north-ridge',
      title: 'North Valley Lookout',
      category: 'Viewpoint',
      body:
        'From the north edge of town you can imagine the Diablo Range rising to the east. Santa Clara County cities sit in this long corridor between the Santa Cruz Mountains and the Diablo Range — a classic California valley.',
      position: new THREE.Vector3(northEdge.x, 0, northEdge.z),
      color: 0xb89870,
    },
  ];

  if (landmarkPoints.dataCenter) {
    list.push({
      id: 'data-center',
      title: 'Valley Data Center',
      category: 'Infrastructure',
      body:
        'On the outskirts, a low-slung campus of server halls, HVAC banks, and substations — the quiet engines of cloud computing that have become part of Santa Clara County\'s modern landscape.',
      position: landmarkPoints.dataCenter.clone(),
      color: 0x5a8a9a,
    });
  }

  if (landmarkPoints.almondFarm) {
    list.push({
      id: 'almond-farm',
      title: 'Almond Orchard & Bamboo',
      category: 'Agriculture',
      body:
        'Rows of almond trees recall the Valley of Heart\'s Delight, when orchards covered these flats. A bamboo grove stands beside the farm — a lush green edge where agriculture meets the foothills.',
      position: landmarkPoints.almondFarm.clone(),
      color: 0x8aaa58,
    });
  }

  return list;
}

export function createWaypointMarkers(waypoints) {
  const group = new THREE.Group();
  group.name = 'waypoints';
  const markers = [];

  for (const wp of waypoints) {
    const marker = new THREE.Group();
    marker.userData = { waypointId: wp.id };

    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.08, 2.2, 8),
      new THREE.MeshStandardMaterial({
        color: 0xf2ebe0,
        roughness: 0.5,
        metalness: 0.2,
      })
    );
    pole.position.y = 1.1;
    pole.castShadow = true;
    marker.add(pole);

    const orb = new THREE.Mesh(
      new THREE.SphereGeometry(0.35, 16, 16),
      new THREE.MeshStandardMaterial({
        color: wp.color,
        emissive: wp.color,
        emissiveIntensity: 0.45,
        roughness: 0.35,
        metalness: 0.15,
      })
    );
    orb.position.y = 2.45;
    orb.castShadow = true;
    marker.add(orb);

    const ring = new THREE.Mesh(
      new THREE.RingGeometry(0.5, 0.7, 24),
      new THREE.MeshBasicMaterial({
        color: wp.color,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.75,
      })
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.05;
    marker.add(ring);

    // Invisible hit target for easier clicking
    const hit = new THREE.Mesh(
      new THREE.SphereGeometry(1.2, 8, 8),
      new THREE.MeshBasicMaterial({ visible: false })
    );
    hit.position.y = 2;
    marker.add(hit);

    marker.position.copy(wp.position);
    group.add(marker);
    markers.push({ id: wp.id, marker, orb, ring, waypoint: wp });
  }

  return { group, markers };
}
