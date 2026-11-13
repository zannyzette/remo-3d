# REMO — Karakter 3D Original (Rig Siap Animasi)

REMO adalah karakter 3D original yang dibangun murni dari kode (Three.js,
tanpa file model eksternal). Dibuat sebagai karakter "player" untuk konten
fan bertema dunia NULLS — tapi desainnya orisinal: robot kecil berkepala
helm bulat dengan wajah layar melengkung (visor). **Bukan karakter NULLS,
bukan tiruan karakter NULLS.** Three.js di-vendor lokal di `vendor/`
(v0.160.0) — tidak butuh CDN, jalan offline, dan versinya ke-pin di repo.

Kenapa dari kode, bukan dari gambar/AI:
- **Konsisten & deterministik** — hasil yang sama setiap kali dibuka.
- **Versioned di Git** — tiap revisi ke-track.
- **Siap dianimasikan** — rig sendi bernama, tinggal keyframe rotasi.
- **Bisa di-export ke GLB** — buka di Blender, render pakai GPU (Cycles)
  buat hasil HD.

## Jalankan

ES module + import map butuh HTTP — jangan buka `index.html` langsung
dengan `file://` (browser bakal blokir module karena CORS). Jalankan
server lokal:

```bash
cd remo-3d
python3 -m http.server 8000
# buka http://localhost:8000
```

Atau deploy ke GitHub Pages (Settings → Pages → Deploy from branch).

## Struktur

```
index.html          viewer + UI (outfit, ekspresi, pose, rotate, export)
src/
  main.js           renderer, kamera, OrbitControls, loop animasi, wiring UI
  character.js      bangun karakter + rig + wajah layar + outfit
  scene.js          set kereta malam (bangku, jendela kota, lampu lewat)
  animations.js     data pose + idle procedural (napas, kedip, lambaian)
  exporter.js       export GLB (jembatan ke Blender / render GPU)
```

## Rig — sendi yang bisa dianimasikan

Semua sendi adalah `THREE.Group`; animasi = keyframe `rotation` (radian).

| Sendi | Fungsi |
|---|---|
| `root` | Posisi/rotasi seluruh karakter |
| `hips` | Pinggul (geser berat badan) |
| `spine` | Badan (napas, membungkuk) |
| `head` | Kepala layar |
| `shoulderL` / `shoulderR` | Bahu kiri/kanan |
| `elbowL` / `elbowR` | Siku kiri/kanan |
| `handL` / `handR` | Tangan (handheld menempel di `handL`) |
| `hipL` / `hipR` | Paha kiri/kanan |
| `kneeL` / `kneeR` | Lutut kiri/kanan |

Patokan rotasi: sumbu x = maju/mundur, y = putar kiri/kanan,
z = miring. Lengan ke depan = `shoulder.x` negatif; lengan ke atas =
`shoulder.z` ±2.4 (kiri positif, kanan negatif).

## Tambah pose baru

Di `src/animations.js`, tambah entri di `POSES`:

```js
lompat: {
  joints: {
    shoulderL: [-0.3, 0, 2.35],
    shoulderR: [-0.3, 0, -2.35],
    hipL: [-0.5, 0, 0],
    kneeL: [0.8, 0, 0],
    hipR: [-0.5, 0, 0],
    kneeR: [0.8, 0, 0],
  },
  root: [0, 0.25, 0], // lompat 0.25 ke atas
},
```

Lalu tambah tombol di `index.html` (`data-pose="lompat"`). Pose di-lerp
halus otomatis — tidak ada snap.

## Tambah ekspresi baru

Di `src/character.js`, tambah cabang di `drawFace()` dan nama di
`EXPRESSIONS`, lalu tambah tombol di `index.html`
(`data-expr="nama_baru"`). Wajah digambar di canvas 256×192, jadi
ekspresi apa pun tinggal gambar: mata, mulut, pipi.

## Export GLB → render GPU (Blender)

1. Klik **Download GLB** di viewer (atau panggil
   `exportGLB(character.group)`).
2. Buka Blender → File → Import → glTF 2.0 (`.glb`).
3. Render engine Cycles, Device GPU Compute — render still image atau
   animasi keyframe. Rig ikut ter-export sebagai hierarki objek (bukan
   armature), jadi animasi di Blender bisa keyframe rotasi objek sendi
   yang sama.

## Handoff ke Claude (Fable / Opus)

Repo ini dirancang supaya bisa langsung dilempar ke Claude untuk
nambah gerakan: strukturnya kecil, tiap file punya satu tugas, dan rig
terdokumentasi di atas. Contoh prompt:

> Ini repo karakter 3D Three.js (REMO). Tambahkan 3 animasi baru
> (jalan, duduk-main-handheld, menari) sebagai fungsi di
> `src/animations.js` dengan keyframe rotasi sendi yang sudah ada.
> Jangan ubah desain karakternya. Tambahkan tombolnya di `index.html`.

## Lisensi

Kode dan karakter REMO di repo ini orisinal, bebas dipakai untuk konten
fan non-komersial. NULLS dan karakternya adalah milik project NULLS
(nulls.world) — repo ini tidak mengandung dan tidak meniru aset mereka.
