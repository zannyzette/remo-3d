# DESIGN.md — Brief Desain REMO (buat Claude / siapa pun yang lanjutin)

Dokumen ini menjelaskan **mau dibawa ke mana desain REMO** — bukan cuma
kodenya. Baca file ini dulu sebelum mengubah apa pun yang kelihatan di
layar. Kalau ada konflik antara ide baru dan dokumen ini, dokumen ini yang
menang kecuali user bilang lain.

## 1. Tujuan desain (satu kalimat)

REMO adalah karakter 3D bergaya game yang **halus, bulat, dan chibi**,
untuk konten fan bertema dunia NULLS — nostalgia gaming akhir 90-an /
awal 2000-an: kereta malam, handheld console, memory card.

## 2. Target visual

- **Semua permukaan melengkung.** Tidak ada siku tajam, tidak ada muka
  datar yang lebar di badan. Kepala, badan, kantong, sepatu — semuanya
  bulat atau membulat. Satu-satunya benda yang boleh agak kotak adalah
  handheld console-nya, karena itu memang perangkat.
- **Rasa yang dikejar:** karakter game 3D yang lembut dan organik —
  seperti karakter yang duduk santai di bangku kereta malam, main
  handheld, dengan cahaya neon redup di sekelilingnya. Hangat tapi
  muram (cozy + moody), bukan cerah dan bukan horor.
- **Proporsi chibi:** kepala besar (sekitar 1/3 tinggi badan), kaki
  pendek, sepatu besar. Total tinggi ~1,9 unit termasuk antena.
  Kaki harus napak lantai (telapak sepatu di y=0) di pose berdiri.

## 3. Siapa REMO

- Robot kecil berkepala **helm bulat** (bukan kotak), wajahnya **layar
  melengkung** (visor) yang menampilkan wajah pixel: mata + mulut,
  bisa ganti ekspresi (santai, senang, kaget, tidur) dan berkedip.
- **Antena** kecil dengan bola ujung sewarna aksen outfit.
- **Penutup telinga bulat** di kedua sisi kepala (seperti headphone).
- Hoodie (mustard / grape / mint), celana pendek teal, sepatu chunky
  bersol warna aksen. Handheld console oranye selalu di tangan kiri.
- Kepribadian visual: santai, penasaran, sedikit mengantuk — bukan
  gagah, bukan imut berlebihan.

## 4. Warna & material

- Bezel kepala krem (`#f2ead8`), rangka charcoal (`#23272e`), aksen
  oranye (`#ff7a1a`). Hoodie: mustard `#e8a020`, grape `#7a5fd0`,
  mint `#3ec98f`. Celana teal `#1f7a6d`.
- Material matte/lembut (roughness 0.5–0.85), bukan plastik mengkilap
  dan bukan logam cermin — kecuali detail kecil (penutup telinga,
  tiang kereta).
- Dunia: kereta malam — bangku teal, tiang kuningan, jendela dengan
  lampu kota, kabut tipis. Cahaya hangat + dingin dicampur.

## 5. Arah gerakan (animasi)

- Gerakan harus terasa **halus dan sedikit membal** (smooth, sedikit
  bouncy), seperti karakter game — bukan kaku seperti mesin, meskipun
  dia robot.
- Idle yang sudah ada: napas (dada mengembang), goyang kepala pelan,
  geser berat badan, kedip tiap 2,5–4,5 detik.
- Pose yang sudah ada: diam, dadah, duduk, ceria. Animasi baru harus
  se-energi itu: santai dan playful.
- Jangan bikin gerakan yang memutar sendi sampai patah secara visual
  (misalnya siku menekuk ke arah yang salah).

## 6. Yang BOLEH dan yang JANGAN

BOLEH:

- Menambah pose, ekspresi, dan animasi baru lewat `src/animations.js`
  (format POSES) dan `drawFace()` di `src/character.js`.
- Menambah detail kecil yang bulat (tombol, lampu, aksesori) selama
  tetap dalam palet warna.
- Mengubah set kereta (bangku, jendela, lampu) selama tetap nuansa
  kereta malam.

JANGAN:

- Jangan mengubah REMO jadi hewan atau meniru karakter NULLS: tanpa
  kuping kucing, ekor, bulu, taring, dan tanpa kacamata goggle sebagai
  mata. REMO adalah robot — itu identitasnya.
- Jangan mengembalikan kepala jadi kotak atau menambah kotak
  bersudut tajam ke badan.
- Jangan mengubah nama sendi rig (`root`, `hips`, `spine`, `head`,
  `shoulderL/R`, `elbowL/R`, `handL/R`, `hipL/R`, `kneeL/R`) —
  namanya dipakai animasi dan pipeline export.
- Jangan menambah file model eksternal (`.glb`, `.fbx`, `.obj`).
  Semua geometri harus tetap dari kode supaya versioned dan
  deterministik.
- Jangan mengubah struktur file (nama file dan tugasnya masing-masing
  ada di README bagian Struktur).

## 7. Pipeline

Kode ini → Claude menambah gerakan/animasi → export GLB → render GPU
(Blender/Cycles) untuk hasil HD. Setiap perubahan harus tetap bisa
dibuka di viewer (`python3 -m http.server 8000`), lolos smoke test
tanpa error console, dan tetap bisa export GLB.

## 8. Cara kerja dengan dokumen ini

- Sebelum mengubah desain: baca dokumen ini dan README.
- Sesudah mengubah: jalankan viewer, cek semua tombol (outfit,
  ekspresi, pose), cek export GLB, dan screenshot hasilnya.
- Kalau user memberi referensi gambar baru, yang diambil adalah
  **rasa dan kualitas bentuknya** (halus, bulat, proporsi) — bukan
  karakternya.
