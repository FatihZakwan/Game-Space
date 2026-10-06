/* DAFTAR GAME — satu-satunya file yang diedit saat menambah game baru.
   status: "ready" = bisa dimainkan, "soon" = tampil redup "Segera hadir".
   path  : lokasi index.html game di dalam folder games/                  */
window.GAMES = [
  {
    id: "3d-shape",
    title: "3D Shape",
    desc: "Pegang, geser, dan besarkan bentuk 3D memakai tanganmu lewat webcam.",
    note: "Butuh webcam",
    path: "games/3d-shape/index.html",
    color: "#59d9c4",
    status: "ready"
  },
  {
    id: "kiem-than",
    title: "Kiem Than",
    desc: "Mainkan permainan Kiem Than dengan tanganmu.",
    note: "Butuh webcam",
    path: "games/kiem-than/dist/index.html",
    color: "#59d9c4",
    status: "ready"
  },
  {
    id: "tic-tac-toe",
    title: "Tic Tac Toe",
    desc: "Susun tiga tanda berurutan sebelum lawanmu.",
    note: "",
    path: "games/tic-tac-toe/index.html",
    color: "#e8a23b",
    status: "soon"
  },
  {
    id: "ninja-samurai",
    title: "Ninja Samurai",
    desc: "Tebas, tangkis, dan bertahan hidup di dunia ninja.",
    note: "",
    path: "games/ninja-samurai/index.html",
    color: "#c0563f",
    status: "soon"
  },
];
