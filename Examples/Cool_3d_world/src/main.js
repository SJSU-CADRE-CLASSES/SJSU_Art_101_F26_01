import * as THREE from 'three';
import { createCity, createRng, updateCars } from './city.js';
import { createMountains } from './mountains.js';
import { getWaypoints, createWaypointMarkers } from './waypoints.js';
import { createEyeTowers, updateEyeTowers } from './eyeTowers.js';
import { updatePedestrians } from './pedestrians.js';

const canvas = document.getElementById('canvas');
const poiPanel = document.getElementById('poi-panel');
const poiTitle = document.getElementById('poi-title');
const poiBody = document.getElementById('poi-body');
const poiCategory = document.getElementById('poi-category');
const poiClose = document.getElementById('poi-close');
const waypointList = document.getElementById('waypoint-list');

// --- Renderer & scene ---
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  powerPreference: 'high-performance',
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xb8cfd9);
scene.fog = new THREE.FogExp2(0xb8cfd9, 0.007);

const camera = new THREE.PerspectiveCamera(
  42,
  window.innerWidth / window.innerHeight,
  0.5,
  200
);

// Bird's-eye orbit target
const target = new THREE.Vector3(0, 0, 0);
const camState = {
  theta: Math.PI * 0.08,
  phi: Math.PI * 0.28,
  radius: 58,
  minRadius: 18,
  maxRadius: 95,
  minPhi: 0.15,
  maxPhi: Math.PI * 0.45,
};

function updateCamera() {
  const { theta, phi, radius } = camState;
  camera.position.set(
    target.x + radius * Math.sin(phi) * Math.sin(theta),
    target.y + radius * Math.cos(phi),
    target.z + radius * Math.sin(phi) * Math.cos(theta)
  );
  camera.lookAt(target);
}
updateCamera();

// --- Lights ---
const hemi = new THREE.HemisphereLight(0xdde8ef, 0x4a5548, 0.85);
scene.add(hemi);

const sun = new THREE.DirectionalLight(0xfff0dd, 1.35);
sun.position.set(-30, 45, 20);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.near = 5;
sun.shadow.camera.far = 120;
sun.shadow.camera.left = -50;
sun.shadow.camera.right = 50;
sun.shadow.camera.top = 50;
sun.shadow.camera.bottom = -50;
sun.shadow.bias = -0.0002;
scene.add(sun);

const fill = new THREE.DirectionalLight(0xa8c4d4, 0.35);
fill.position.set(25, 20, -30);
scene.add(fill);

// --- World ---
const rng = createRng(77);
const {
  group: city,
  cars,
  pedestrians,
  landmarks,
  waterZones,
  bounds,
  mountainBounds,
  grid,
} = createCity(rng);
scene.add(city);
if (cars?.group) scene.add(cars.group);
if (pedestrians?.group) scene.add(pedestrians.group);
scene.add(createMountains(mountainBounds || bounds, createRng(201)));

const { group: eyeTowerGroup, towers: eyeTowers } = createEyeTowers();
scene.add(eyeTowerGroup);

const waypoints = getWaypoints(grid, landmarks?.points);
const { group: markerGroup, markers } = createWaypointMarkers(waypoints);
scene.add(markerGroup);

// Soft ground beyond city
const valleyFloor = new THREE.Mesh(
  new THREE.CircleGeometry(70, 48),
  new THREE.MeshStandardMaterial({
    color: 0x4a5848,
    roughness: 1,
  })
);
valleyFloor.rotation.x = -Math.PI / 2;
valleyFloor.position.y = -0.05;
valleyFloor.receiveShadow = true;
scene.add(valleyFloor);

// --- UI: waypoint list ---
let activeId = null;

function setActiveWaypoint(id, fly = true) {
  activeId = id;
  const wp = waypoints.find((w) => w.id === id);
  if (!wp) return;

  poiCategory.textContent = wp.category;
  poiTitle.textContent = wp.title;
  poiBody.textContent = wp.body;
  poiPanel.hidden = false;

  document.querySelectorAll('.waypoint-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.id === id);
  });

  if (fly) {
    flyTo(wp.position);
  }
}

function closePanel() {
  activeId = null;
  poiPanel.hidden = true;
  document.querySelectorAll('.waypoint-btn').forEach((btn) => {
    btn.classList.remove('active');
  });
}

poiClose.addEventListener('click', closePanel);

for (const wp of waypoints) {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'waypoint-btn';
  btn.dataset.id = wp.id;
  btn.innerHTML = `<span class="dot" style="background: #${wp.color.toString(16).padStart(6, '0')}"></span>${wp.title}`;
  btn.addEventListener('click', () => setActiveWaypoint(wp.id));
  waypointList.appendChild(btn);
}

// Smooth camera fly
const fly = {
  active: false,
  startTarget: new THREE.Vector3(),
  endTarget: new THREE.Vector3(),
  startRadius: 0,
  endRadius: 0,
  t: 0,
  duration: 1.1,
};

function flyTo(pos) {
  fly.active = true;
  fly.t = 0;
  fly.startTarget.copy(target);
  fly.endTarget.set(pos.x, 0, pos.z);
  fly.startRadius = camState.radius;
  fly.endRadius = THREE.MathUtils.clamp(camState.radius, 28, 40);
}

function easeInOut(t) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

// --- Pointer controls (bird's-eye pan / orbit / zoom) ---
const pointer = {
  down: false,
  rotating: false,
  button: 0,
  x: 0,
  y: 0,
  moved: false,
};

const panSpeed = 0.045;
const rotateSpeed = 0.0055;

canvas.addEventListener('pointerdown', (e) => {
  pointer.down = true;
  pointer.button = e.button;
  pointer.rotating = e.button === 2 || e.shiftKey;
  pointer.x = e.clientX;
  pointer.y = e.clientY;
  pointer.moved = false;
  canvas.setPointerCapture(e.pointerId);
});

canvas.addEventListener('pointermove', (e) => {
  if (!pointer.down) return;
  const dx = e.clientX - pointer.x;
  const dy = e.clientY - pointer.y;
  if (Math.abs(dx) + Math.abs(dy) > 3) pointer.moved = true;
  pointer.x = e.clientX;
  pointer.y = e.clientY;

  // Right mouse held (buttons bit 2) or started with right-click / Shift
  const rotating =
    pointer.rotating || (e.buttons & 2) === 2 || e.shiftKey;

  if (rotating) {
    camState.theta -= dx * rotateSpeed;
    camState.phi = THREE.MathUtils.clamp(
      camState.phi - dy * rotateSpeed,
      camState.minPhi,
      camState.maxPhi
    );
  } else if ((e.buttons & 1) === 1 || pointer.button === 0) {
    // Pan in ground plane relative to camera facing
    const forward = new THREE.Vector3(
      Math.sin(camState.theta),
      0,
      Math.cos(camState.theta)
    );
    const right = new THREE.Vector3(
      Math.cos(camState.theta),
      0,
      -Math.sin(camState.theta)
    );
    const scale = camState.radius * panSpeed * 0.04;
    target.addScaledVector(right, -dx * scale);
    target.addScaledVector(forward, dy * scale);
    target.x = THREE.MathUtils.clamp(target.x, -bounds.halfW - 14, bounds.halfW + 14);
    target.z = THREE.MathUtils.clamp(target.z, -bounds.halfD - 14, bounds.halfD + 14);
  }
  updateCamera();
});

canvas.addEventListener('pointerup', (e) => {
  if (!pointer.moved && pointer.button === 0) {
    pickWaypoint(e.clientX, e.clientY);
  }
  pointer.down = false;
  pointer.rotating = false;
});

canvas.addEventListener('pointercancel', () => {
  pointer.down = false;
  pointer.rotating = false;
});

canvas.addEventListener('contextmenu', (e) => e.preventDefault());

canvas.addEventListener(
  'wheel',
  (e) => {
    e.preventDefault();
    camState.radius = THREE.MathUtils.clamp(
      camState.radius + e.deltaY * 0.04,
      camState.minRadius,
      camState.maxRadius
    );
    updateCamera();
  },
  { passive: false }
);

// Raycasting for markers
const raycaster = new THREE.Raycaster();
const ndc = new THREE.Vector2();

function pickWaypoint(clientX, clientY) {
  ndc.x = (clientX / window.innerWidth) * 2 - 1;
  ndc.y = -(clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(ndc, camera);
  const hits = raycaster.intersectObjects(markerGroup.children, true);
  if (!hits.length) return;

  let obj = hits[0].object;
  while (obj && !obj.userData.waypointId) obj = obj.parent;
  if (obj?.userData.waypointId) {
    setActiveWaypoint(obj.userData.waypointId);
  }
}

// --- Resize ---
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// --- Animate ---
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 0.05);
  const t = clock.elapsedTime;

  if (fly.active) {
    fly.t += dt / fly.duration;
    const k = easeInOut(Math.min(fly.t, 1));
    target.lerpVectors(fly.startTarget, fly.endTarget, k);
    camState.radius = THREE.MathUtils.lerp(fly.startRadius, fly.endRadius, k);
    updateCamera();
    if (fly.t >= 1) fly.active = false;
  }

  updateCars(cars, dt, waterZones);
  updatePedestrians(pedestrians, cars, dt, t, Math.random, waterZones);
  updateEyeTowers(eyeTowers, camera.position, t);

  // Gentle marker pulse
  for (const m of markers) {
    const pulse = 1 + Math.sin(t * 2.4 + m.orb.position.x) * 0.08;
    m.orb.scale.setScalar(activeId === m.id ? 1.25 : pulse);
    m.ring.material.opacity =
      activeId === m.id ? 0.95 : 0.55 + Math.sin(t * 2 + m.id.length) * 0.15;
    m.ring.rotation.z = t * 0.4;
  }

  renderer.render(scene, camera);
}

animate();
