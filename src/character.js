// character.js — REMO, karakter 3D original (bukan karakter NULLS).
//
// Desain: robot kecil berkepala konsol saku — wajahnya layar pixel yang
// bisa ganti ekspresi. Beda total dari karakter NULLS (bukan kucing, tanpa
// kuping/ekor/taring). Dunianya sama-sama nostalgia gaming: kereta malam,
// handheld, memory card — tapi karakternya orisinal.
//
// v1.1: bentuk dibulatkan — kepala chibi lebih besar (radius 0.12), badan
// bola gepeng, kantong lunak, penutup telinga + antena. Rig tidak berubah.
//
// RIG — semua sendi adalah THREE.Group, rotasi dalam radian, sumbu:
//   x = maju/mundur (pitch), y = putar kiri/kanan (yaw), z = miring (roll)
// Setiap mesh anggota tubuh digantung di bawah grup sendinya, jadi rotasi
// grup = rotasi sendi. Nama sendi stabil — animasi baru (termasuk dari
// Claude) cukup keyframe rotasi grup-grup ini:
//
//   root, hips, spine, head,
//   shoulderL, elbowL, handL, shoulderR, elbowR, handR,
//   hipL, kneeL, hipR, kneeR
//
// Posisi default (diam): kaki lurus, kedua tangan di depan memegang
// handheld yang menempel di tangan kiri (handL).
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

export const OUTFITS = {
  mustard: { hoodie: 0xe8a020, accent: 0xff7a1a },
  grape: { hoodie: 0x7a5fd0, accent: 0xb79cff },
  mint: { hoodie: 0x3ec98f, accent: 0x7df9d4 },
};

export const EXPRESSIONS = ['santai', 'senang', 'kaget', 'tidur'];

// ---- Wajah layar (CanvasTexture, 256x192) ----
function drawFace(ctx, expr, blink) {
  const W = 256, H = 192;
  // Layar: gradasi gelap + scanline tipis (nuansa retro).
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#0d1420');
  g.addColorStop(1, '#131c2b');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = 'rgba(255,255,255,0.03)';
  for (let y = 0; y < H; y += 4) ctx.fillRect(0, y, W, 1);

  const eye = '#8ef6ff';
  const eyeL = { x: 82, y: 84 };
  const eyeR = { x: 174, y: 84 };
  ctx.fillStyle = eye;
  ctx.strokeStyle = eye;
  ctx.lineWidth = 9;
  ctx.lineCap = 'round';

  const oval = (x, y, rx, ry) => {
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
  };
  const closed = (x, y) => {
    ctx.beginPath();
    ctx.moveTo(x - 20, y);
    ctx.lineTo(x + 20, y);
    ctx.stroke();
  };

  if (blink || expr === 'tidur') {
    closed(eyeL.x, eyeL.y);
    closed(eyeR.x, eyeR.y);
  } else if (expr === 'senang') {
    // Mata bahagia: busur ^ ^
    for (const e of [eyeL, eyeR]) {
      ctx.beginPath();
      ctx.arc(e.x, e.y + 12, 20, Math.PI * 1.15, Math.PI * 1.85);
      ctx.stroke();
    }
    // Pipi merona.
    ctx.fillStyle = 'rgba(255,120,140,0.35)';
    ctx.beginPath(); ctx.ellipse(52, 118, 14, 9, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(204, 118, 14, 9, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = eye;
  } else if (expr === 'kaget') {
    oval(eyeL.x, eyeL.y, 17, 21);
    oval(eyeR.x, eyeR.y, 17, 21);
    // Kilau kecil.
    ctx.fillStyle = '#ffffff';
    oval(eyeL.x + 5, eyeL.y - 6, 5, 6);
    oval(eyeR.x + 5, eyeR.y - 6, 5, 6);
    ctx.fillStyle = eye;
  } else {
    oval(eyeL.x, eyeL.y, 14, 18);
    oval(eyeR.x, eyeR.y, 14, 18);
    ctx.fillStyle = '#ffffff';
    oval(eyeL.x + 4, eyeL.y - 5, 4, 5);
    oval(eyeR.x + 4, eyeR.y - 5, 4, 5);
    ctx.fillStyle = eye;
  }

  // Mulut.
  ctx.strokeStyle = eye;
  ctx.fillStyle = eye;
  ctx.lineWidth = 7;
  if (expr === 'senang') {
    ctx.beginPath();
    ctx.arc(128, 128, 20, 0.15 * Math.PI, 0.85 * Math.PI);
    ctx.fill();
  } else if (expr === 'kaget') {
    ctx.beginPath();
    ctx.ellipse(128, 140, 10, 13, 0, 0, Math.PI * 2);
    ctx.stroke();
  } else if (expr === 'tidur') {
    ctx.beginPath();
    ctx.moveTo(118, 142);
    ctx.lineTo(138, 142);
    ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.arc(128, 132, 16, 0.2 * Math.PI, 0.8 * Math.PI);
    ctx.stroke();
  }
}

function makeFace() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 192;
  const ctx = canvas.getContext('2d');
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  let current = 'santai';
  const api = {
    texture,
    get expression() { return current; },
    draw(expr, blink = false) {
      current = expr;
      drawFace(ctx, expr, blink);
      texture.needsUpdate = true;
    },
  };
  api.draw('santai');
  return api;
}

// ---- Material bersama (outfit ganti warna lewat sini) ----
function makeMaterials() {
  return {
    bezel: new THREE.MeshStandardMaterial({ color: 0xf2ead8, roughness: 0.55 }),
    frame: new THREE.MeshStandardMaterial({ color: 0x23272e, roughness: 0.6 }),
    hoodie: new THREE.MeshStandardMaterial({ color: OUTFITS.mustard.hoodie, roughness: 0.85 }),
    shorts: new THREE.MeshStandardMaterial({ color: 0x1f7a6d, roughness: 0.8 }),
    shoe: new THREE.MeshStandardMaterial({ color: 0xf5f2ea, roughness: 0.5 }),
    sole: new THREE.MeshStandardMaterial({ color: 0xff7a1a, roughness: 0.6 }),
    handheld: new THREE.MeshStandardMaterial({ color: 0xff7a1a, roughness: 0.45 }),
    button: new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.4 }),
    metal: new THREE.MeshStandardMaterial({ color: 0xb8b0a0, roughness: 0.3, metalness: 0.8 }),
  };
}

function mesh(geo, mat, x = 0, y = 0, z = 0) {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

// ---- Bangun karakter ----
export function buildCharacter() {
  const mat = makeMaterials();
  const face = makeFace();
  const group = new THREE.Group();
  group.name = 'REMO_root';

  const rig = {};
  const joint = (name, parent, x, y, z) => {
    const j = new THREE.Group();
    j.name = name;
    j.position.set(x, y, z);
    parent.add(j);
    rig[name] = j;
    return j;
  };

  // Pinggul — pangkal seluruh tubuh. Kaki 0.62 di bawah pinggul.
  // Celana pendek: kotak super-bulat (radius hampir setengah tinggi).
  const hips = joint('hips', group, 0, 0.62, 0);
  hips.add(mesh(new RoundedBoxGeometry(0.34, 0.2, 0.26, 4, 0.09), mat.shorts, 0, 0, 0));

  // Badan (hoodie): bola gepeng, bukan kotak — perut membulat.
  const spine = joint('spine', hips, 0, 0.18, 0);
  const torso = mesh(new THREE.SphereGeometry(0.28, 28, 20), mat.hoodie, 0, 0.2, 0);
  torso.scale.set(1.0, 0.85, 0.62);
  spine.add(torso);
  // Tudung di belakang leher.
  spine.add(mesh(new RoundedBoxGeometry(0.34, 0.2, 0.12, 3, 0.055), mat.hoodie, 0, 0.36, -0.2));
  // Kantong hoodie: kantong lunak (bola gepeng menempel di perut).
  const pocket = mesh(new THREE.SphereGeometry(0.13, 20, 14), mat.hoodie, 0, 0.06, 0.13);
  pocket.scale.set(1.3, 0.65, 0.45);
  spine.add(pocket);

  // Kepala: bezel konsol saku, chibi — lebih besar dan jauh lebih bulat.
  // Radius 0.12 mentok: layar 0.36x0.27 pas muat di muka datarnya.
  const head = joint('head', spine, 0, 0.5, 0);
  head.add(mesh(new RoundedBoxGeometry(0.62, 0.52, 0.34, 5, 0.12), mat.bezel, 0, 0.14, 0));
  const screen = new THREE.Mesh(
    new THREE.PlaneGeometry(0.36, 0.27),
    new THREE.MeshBasicMaterial({ map: face.texture })
  );
  screen.position.set(0, 0.15, 0.176);
  head.add(screen);
  // Penutup telinga bulat di kedua sisi (seperti headphone).
  head.add(mesh(new THREE.SphereGeometry(0.05, 16, 12), mat.metal, -0.31, 0.14, 0));
  head.add(mesh(new THREE.SphereGeometry(0.05, 16, 12), mat.metal, 0.31, 0.14, 0));
  // Antena + bola ujung (ikut warna aksen outfit).
  head.add(mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.1, 8), mat.metal, 0.18, 0.44, 0));
  head.add(mesh(new THREE.SphereGeometry(0.025, 12, 10), mat.handheld, 0.18, 0.5, 0));
  // Speaker kecil di bawah layar.
  for (let i = 0; i < 3; i++) {
    const dot = mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.02, 8), mat.button, -0.2 + i * 0.03, -0.08, 0.17);
    dot.rotation.x = Math.PI / 2;
    head.add(dot);
  }

  // Lengan: bahu -> siku -> tangan. Mesh digantung ke bawah dari sendi.
  const buildArm = (side) => {
    const s = side === 'L' ? -1 : 1;
    const shoulder = joint('shoulder' + side, spine, s * 0.31, 0.36, 0);
    shoulder.add(mesh(new THREE.CapsuleGeometry(0.07, 0.2, 4, 12), mat.hoodie, 0, -0.14, 0));
    const elbow = joint('elbow' + side, shoulder, 0, -0.28, 0);
    elbow.add(mesh(new THREE.CapsuleGeometry(0.06, 0.18, 4, 12), mat.frame, 0, -0.12, 0));
    const hand = joint('hand' + side, elbow, 0, -0.27, 0);
    hand.add(mesh(new THREE.SphereGeometry(0.075, 16, 12), mat.frame, 0, -0.03, 0));
    return { shoulder, elbow, hand };
  };
  const armL = buildArm('L');
  const armR = buildArm('R');

  // Handheld menempel di tangan kiri: badan + layar + tombol.
  const handheld = new THREE.Group();
  handheld.name = 'handheld';
  handheld.add(mesh(new RoundedBoxGeometry(0.24, 0.32, 0.05, 3, 0.025), mat.handheld, 0, 0, 0));
  const hhScreen = new THREE.Mesh(
    new THREE.PlaneGeometry(0.17, 0.13),
    new THREE.MeshBasicMaterial({ color: 0x0e2a3a })
  );
  hhScreen.position.set(0, 0.05, 0.028);
  handheld.add(hhScreen);
  // D-pad + tombol A/B.
  handheld.add(mesh(new RoundedBoxGeometry(0.05, 0.05, 0.02, 2, 0.008), mat.button, -0.07, -0.09, 0.028));
  const btnA = mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.02, 12), mat.button, 0.07, -0.08, 0.028);
  btnA.rotation.x = Math.PI / 2;
  handheld.add(btnA);
  handheld.position.set(0, -0.02, 0.1);
  handheld.rotation.x = -0.35;
  armL.hand.add(handheld);

  // Kaki: pinggul -> lutut -> sepatu.
  const buildLeg = (side) => {
    const s = side === 'L' ? -1 : 1;
    const hip = joint('hip' + side, hips, s * 0.13, -0.08, 0);
    hip.add(mesh(new THREE.CapsuleGeometry(0.075, 0.2, 4, 12), mat.shorts, 0, -0.15, 0));
    const knee = joint('knee' + side, hip, 0, -0.3, 0);
    knee.add(mesh(new THREE.CapsuleGeometry(0.065, 0.18, 4, 12), mat.frame, 0, -0.13, 0));
    const shoe = new THREE.Group();
    shoe.position.set(0, -0.3, 0.02);
    shoe.add(mesh(new RoundedBoxGeometry(0.16, 0.11, 0.3, 4, 0.05), mat.shoe, 0, 0, 0.03));
    shoe.add(mesh(new RoundedBoxGeometry(0.17, 0.04, 0.31, 2, 0.018), mat.sole, 0, -0.06, 0.03));
    knee.add(shoe);
    return { hip, knee };
  };
  buildLeg('L');
  buildLeg('R');

  rig.root = group;

  // Pose default: tangan di depan, memegang handheld.
  rig.shoulderL.rotation.set(-0.75, 0.25, 0.25);
  rig.elbowL.rotation.set(-1.05, 0, 0);
  rig.shoulderR.rotation.set(-0.75, -0.25, -0.25);
  rig.elbowR.rotation.set(-1.05, 0, 0);

  return {
    group,
    rig,
    face,
    setExpression(expr) {
      if (EXPRESSIONS.includes(expr)) face.draw(expr, false);
    },
    setOutfit(name) {
      const o = OUTFITS[name];
      if (!o) return;
      mat.hoodie.color.setHex(o.hoodie);
      mat.handheld.color.setHex(o.accent);
      mat.sole.color.setHex(o.accent);
    },
  };
}
