// main.js — wiring: renderer, kamera, kontrol UI, loop animasi.
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { buildCharacter } from './character.js';
import { buildSet } from './scene.js';
import { applyPose, updateIdle } from './animations.js';
import { exportGLB } from './exporter.js';

const stage = document.getElementById('stage');
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(stage.clientWidth, stage.clientHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
stage.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0c0e12);

const camera = new THREE.PerspectiveCamera(
  40,
  stage.clientWidth / stage.clientHeight,
  0.1,
  100
);
camera.position.set(1.7, 1.15, 3.4);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0.8, 0);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.minDistance = 1.4;
controls.maxDistance = 7;
controls.maxPolarAngle = Math.PI * 0.55;
controls.autoRotate = true;
controls.autoRotateSpeed = 0.9;

const character = buildCharacter();
scene.add(character.group);
const set = buildSet(scene);
scene.add(set.group);
applyPose(character.rig, 'diam');

// ---- UI ----
const wireGroup = (id, attr, fn) => {
  const el = document.getElementById(id);
  el.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    el.querySelectorAll('button').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    fn(btn.dataset[attr]);
  });
};
wireGroup('outfitBtns', 'outfit', (v) => character.setOutfit(v));
wireGroup('exprBtns', 'expr', (v) => character.setExpression(v));
wireGroup('poseBtns', 'pose', (v) => applyPose(character.rig, v));

const rotBtn = document.getElementById('rotBtn');
rotBtn.addEventListener('click', () => {
  controls.autoRotate = !controls.autoRotate;
  rotBtn.classList.toggle('active', controls.autoRotate);
});

document.getElementById('glbBtn').addEventListener('click', () => {
  exportGLB(character.group, 'remo.glb');
});

// ---- Loop ----
const clock = new THREE.Clock();
function tick() {
  requestAnimationFrame(tick);
  const dt = Math.min(clock.getDelta(), 0.05);
  const t = clock.elapsedTime;
  updateIdle(character.rig, character.face, t, dt);
  set.update(t);
  controls.update();
  renderer.render(scene, camera);
}
tick();

window.addEventListener('resize', () => {
  camera.aspect = stage.clientWidth / stage.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(stage.clientWidth, stage.clientHeight);
});
