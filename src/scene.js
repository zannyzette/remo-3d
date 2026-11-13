// scene.js — set kereta malam (stylised, low-poly).
// Bukan tiruan scene NULLS: bangku hijau teal + tiang kuningan + jendela
// kota, palet gelap hangat. Lampu kota "lewat" di jendela biar kereta
// terasa jalan.
import * as THREE from 'three';

function cityTexture() {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 256;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#0a0d1a';
  ctx.fillRect(0, 0, 512, 256);
  // Jendela gedung acak: kuning hangat + putih dingin.
  for (let i = 0; i < 140; i++) {
    const x = Math.random() * 512;
    const y = 20 + Math.random() * 200;
    const w = 4 + Math.random() * 10;
    const h = 4 + Math.random() * 8;
    ctx.fillStyle = Math.random() > 0.5
      ? `rgba(255,190,90,${0.5 + Math.random() * 0.5})`
      : `rgba(180,220,255,${0.4 + Math.random() * 0.5})`;
    ctx.fillRect(x, y, w, h);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function buildSet(scene) {
  const group = new THREE.Group();
  group.name = 'train_set';

  const dark = new THREE.MeshStandardMaterial({ color: 0x14161c, roughness: 0.9 });
  const wallMat = new THREE.MeshStandardMaterial({ color: 0x0d0f14, roughness: 0.95 });
  const benchMat = new THREE.MeshStandardMaterial({ color: 0x14473f, roughness: 0.8 });
  const brassMat = new THREE.MeshStandardMaterial({ color: 0xc9a24b, roughness: 0.35, metalness: 0.85 });

  // Lantai.
  const floor = new THREE.Mesh(new THREE.CircleGeometry(7, 48), dark);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  group.add(floor);

  // Dinding belakang.
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(14, 5), wallMat);
  wall.position.set(0, 2.5, -2.4);
  wall.receiveShadow = true;
  group.add(wall);

  // Bangku: dudukan + sandaran + kaki.
  const seat = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.12, 0.62), benchMat);
  seat.position.set(0, 0.45, -1.35);
  seat.castShadow = true;
  seat.receiveShadow = true;
  group.add(seat);
  const back = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.7, 0.1), benchMat);
  back.position.set(0, 0.85, -1.62);
  back.castShadow = true;
  group.add(back);
  for (const x of [-1.0, 1.0]) {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.45, 0.5), dark);
    leg.position.set(x, 0.22, -1.35);
    group.add(leg);
  }

  // Tiang kuningan.
  for (const x of [-1.35, 1.35]) {
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 2.6, 12), brassMat);
    pole.position.set(x, 1.3, -1.0);
    pole.castShadow = true;
    group.add(pole);
  }
  const rail = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 2.7, 12), brassMat);
  rail.rotation.z = Math.PI / 2;
  rail.position.set(0, 2.55, -1.0);
  group.add(rail);

  // Jendela: 3 bingkai dengan tekstur kota.
  const city = cityTexture();
  const winMat = new THREE.MeshBasicMaterial({ map: city });
  const frameMat = new THREE.MeshStandardMaterial({ color: 0x1c1f26, roughness: 0.7 });
  for (let i = 0; i < 3; i++) {
    const x = -2.2 + i * 2.2;
    const frame = new THREE.Mesh(new THREE.BoxGeometry(1.7, 1.3, 0.06), frameMat);
    frame.position.set(x, 2.0, -2.36);
    group.add(frame);
    const win = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 1.1), winMat);
    win.position.set(x, 2.0, -2.32);
    group.add(win);
  }

  // Lampu kota yang "lewat": kotak emissive bergerak menyamping.
  const passers = new THREE.Group();
  const passMat = new THREE.MeshBasicMaterial({ color: 0xffc46b });
  for (let i = 0; i < 8; i++) {
    const p = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.5 + Math.random(), 0.05), passMat);
    p.position.set(-5 + Math.random() * 10, 1.2 + Math.random() * 1.6, -2.2);
    passers.add(p);
  }
  group.add(passers);

  // Cahaya: hangat dari dalam kereta + dingin dari jendela.
  const warm = new THREE.PointLight(0xffb45e, 12, 8, 1.8);
  warm.position.set(0, 2.6, 0.6);
  warm.castShadow = true;
  group.add(warm);
  const cool = new THREE.DirectionalLight(0x7fb4ff, 1.2);
  cool.position.set(-3, 3, -1);
  group.add(cool);
  group.add(new THREE.HemisphereLight(0x2a3550, 0x0b0c10, 0.7));

  scene.fog = new THREE.Fog(0x0c0e12, 9, 20);

  return {
    group,
    update(t) {
      // Lampu lewat: geser ke kanan, bungkus di ujung.
      for (const p of passers.children) {
        p.position.x += 0.02;
        if (p.position.x > 5.5) p.position.x = -5.5;
      }
      // Kerlip halus lampu hangat.
      warm.intensity = 12 + Math.sin(t * 7.3) * 0.4;
    },
  };
}
