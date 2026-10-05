# Game Space

Portal game: satu halaman utama berisi kartu "planet" untuk tiap game.
Murni HTML/CSS/JS, tanpa build step.

## Struktur

```
game-space/
├── index.html              # halaman utama (daftar game)
├── assets/
│   ├── css/style.css       # tampilan halaman utama
│   └── js/
│       ├── games.js        # DAFTAR GAME — edit file ini untuk tambah game
│       └── main.js         # membuat kartu dari games.js + latar bintang
└── games/
    ├── _template/          # salinan kosong untuk game baru
    │   └── index.html
    └── 3d-shape/           # game pertama (gesture tangan, Three.js + MediaPipe)
        ├── index.html
        ├── vendor/         # three.min.js & MediaPipe (offline)
        └── models/hand_landmarker.task
```

## Menjalankan

```bash
cd game-space
python -m http.server 8666
```
Buka http://localhost:8666/ di Chrome/Edge. (Kamera untuk 3D Shape butuh
`http://localhost`, tidak jalan lewat `file://`.)

## Menambah game baru

1. Salin template: `cp -r games/_template games/tic-tac-toe`
2. Isi `games/tic-tac-toe/index.html` (boleh tambah file JS/CSS di foldernya).
3. Di `assets/js/games.js`, ubah `status` entri game itu dari `"soon"` ke `"ready"`
   (atau tambahkan entri baru kalau belum ada).

Tic Tac Toe dan Ninja Samurai sudah terdaftar di `games.js` dengan status
`"soon"`, jadi tinggal isi foldernya.

## Catatan 3D Shape

Cara main: pinch untuk ambil/geser bentuk, tahan pinch di ruang kosong untuk
membuat bentuk baru, dua tangan untuk resize & putar, gesture "V" untuk ganti
jenis bentuk, lepas di ikon tempat sampah untuk menghapus, tombol `C` untuk
bersihkan semua. Konstanta sensitivitas ada di bagian atas `<script>` pada
`games/3d-shape/index.html`.
