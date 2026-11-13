// animations.js — pose + idle procedural untuk REMO.
//
// Cara tambah pose baru (buat Claude / siapa pun):
//   1. Tambah entri di POSES: { joints: { sendi: [rx, ry, rz] }, root: [x, y, z] }
//   2. Sendi yang tidak disebut tetap di posisi sekarang.
//   3. Rotasi dalam radian. Patokan: lengan ke depan = shoulder x negatif,
//      lengan ke atas = shoulder z +/- ~2.4 (kiri negatif, kanan positif
//      karena sumbu z berlawanan arah untuk tiap sisi).
// Pose di-lerp halus (damping) — tidak ada snap.
//
// Idle: napas (spine mengembang), goyang kepala, kedip mata tiap
// 2.5–4.5 detik, dan lambaian tangan saat pose dadah.
export const POSES = {
  diam: {
    joints: {
      shoulderL: [-0.75, 0.25, 0.25],
      elbowL: [-1.05, 0, 0],
      shoulderR: [-0.75, -0.25, -0.25],
      elbowR: [-1.05, 0, 0],
      hipL: [0, 0, 0],
      kneeL: [0, 0, 0],
      hipR: [0, 0, 0],
      kneeR: [0, 0, 0],
      spine: [0, 0, 0],
      head: [0.08, 0, 0],
    },
    root: [0, 0, 0],
  },
  dadah: {
    joints: {
      shoulderR: [-0.4, 0, -2.35],
      elbowR: [-0.5, 0, 0],
      shoulderL: [-0.75, 0.25, 0.25],
      elbowL: [-1.05, 0, 0],
      spine: [0, 0, 0.06],
      head: [0, 0, 0.1],
    },
    root: [0, 0, 0],
  },
  duduk: {
    joints: {
      shoulderL: [-0.6, 0.25, 0.25],
      elbowL: [-0.9, 0, 0],
      shoulderR: [-0.6, -0.25, -0.25],
      elbowR: [-0.9, 0, 0],
      hipL: [-1.45, 0, 0],
      kneeL: [1.5, 0, 0],
      hipR: [-1.45, 0, 0],
      kneeR: [1.5, 0, 0],
      spine: [0.08, 0, 0],
      head: [0.12, 0, 0],
    },
    // Duduk di bangku: mundur ke bangku (z -1.15), turun sedikit.
    root: [0, -0.12, -1.15],
  },
  ceria: {
    joints: {
      shoulderL: [-0.3, 0, 2.35],
      elbowL: [-0.3, 0, 0],
      shoulderR: [-0.3, 0, -2.35],
      elbowR: [-0.3, 0, 0],
      spine: [-0.08, 0, 0],
      head: [-0.12, 0, 0],
    },
    root: [0, 0, 0],
  },
};

// Target rotasi aktif — di-lerp tiap frame menuju pose yang dipilih.
const targets = new Map();
let targetRoot = [0, 0, 0];
let currentPose = 'diam';

export function getPose() {
  return currentPose;
}

export function applyPose(rig, name) {
  const pose = POSES[name];
  if (!pose) return;
  currentPose = name;
  targets.clear();
  for (const [joint, rot] of Object.entries(pose.joints)) {
    if (rig[joint]) targets.set(joint, rot);
  }
  targetRoot = pose.root || [0, 0, 0];
}

function damp(current, target, lambda, dt) {
  return current + (target - current) * Math.min(1, lambda * dt);
}

const blink = { next: 2.5, until: 0 };

export function updateIdle(rig, face, t, dt) {
  // Lerp sendi menuju target pose.
  for (const [name, rot] of targets) {
    const j = rig[name];
    j.rotation.x = damp(j.rotation.x, rot[0], 8, dt);
    j.rotation.y = damp(j.rotation.y, rot[1], 8, dt);
    j.rotation.z = damp(j.rotation.z, rot[2], 8, dt);
  }
  // Lerp posisi root.
  rig.root.position.x = damp(rig.root.position.x, targetRoot[0], 8, dt);
  rig.root.position.y = damp(rig.root.position.y, targetRoot[1], 8, dt);
  rig.root.position.z = damp(rig.root.position.z, targetRoot[2], 8, dt);

  // Napas: dada mengembang halus.
  rig.spine.scale.y = 1 + Math.sin(t * 2.0) * 0.012;
  rig.spine.scale.x = 1 + Math.sin(t * 2.0) * 0.008;
  // Goyang kepala pelan + geser berat badan.
  rig.head.rotation.y += Math.sin(t * 0.6) * 0.0006;
  rig.hips.position.x = Math.sin(t * 0.7) * 0.012;
  rig.hips.rotation.z = Math.sin(t * 0.7) * 0.015;

  // Lambaian saat pose dadah: tangan kanan goyang.
  if (currentPose === 'dadah' && rig.handR) {
    rig.handR.rotation.z = Math.sin(t * 9) * 0.45;
  } else if (rig.handR) {
    rig.handR.rotation.z = damp(rig.handR.rotation.z, 0, 8, dt);
  }

  // Kedip: tutup mata 0.12 detik tiap 2.5–4.5 detik.
  if (t > blink.next) {
    blink.until = t + 0.12;
    blink.next = t + 2.5 + Math.random() * 2.0;
  }
  const blinking = t < blink.until;
  face.draw(face.expression, blinking);
}
