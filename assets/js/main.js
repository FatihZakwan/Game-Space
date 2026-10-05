(function () {
  "use strict";

  // ---------- Kartu planet (dibuat dari window.GAMES) ----------
  var wrap = document.getElementById("planets");
  (window.GAMES || []).forEach(function (g) {
    var ready = g.status === "ready";
    var el = document.createElement(ready ? "a" : "div");
    el.className = "planet" + (ready ? "" : " soon");
    el.style.setProperty("--c", g.color);
    if (ready) el.href = g.path; else el.setAttribute("aria-disabled", "true");

    el.innerHTML =
      '<span class="orb" aria-hidden="true"></span>' +
      '<span class="info">' +
        '<span class="name"></span>' +
        '<span class="desc"></span>' +
        '<span class="meta"></span>' +
      '</span>';
    el.querySelector(".name").textContent = g.title;
    el.querySelector(".desc").textContent = g.desc;
    el.querySelector(".meta").textContent =
      ready ? (g.note ? "Main sekarang · " + g.note : "Main sekarang") : "Segera hadir";
    wrap.appendChild(el);
  });

  // ---------- Latar bintang ----------
  var cv = document.getElementById("stars");
  var ctx = cv.getContext("2d");
  var stars = [], W = 0, H = 0;
  var still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function resize() {
    var d = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth; H = window.innerHeight;
    cv.width = W * d; cv.height = H * d;
    ctx.setTransform(d, 0, 0, d, 0, 0);
    var n = Math.round((W * H) / 5500);
    stars = [];
    for (var i = 0; i < n; i++) {
      stars.push({ x: Math.random() * W, y: Math.random() * H,
                   r: Math.random() * 1.2 + 0.2, s: Math.random() * 0.12 + 0.02,
                   a: Math.random() * 0.6 + 0.3 });
    }
    draw();
  }
  function draw() {
    ctx.clearRect(0, 0, W, H);
    for (var i = 0; i < stars.length; i++) {
      var s = stars[i];
      ctx.globalAlpha = s.a;
      ctx.fillStyle = "#dfe6ff";
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, 6.2832); ctx.fill();
    }
  }
  function tick() {
    for (var i = 0; i < stars.length; i++) {
      stars[i].y += stars[i].s;
      if (stars[i].y > H) { stars[i].y = 0; stars[i].x = Math.random() * W; }
    }
    draw();
    requestAnimationFrame(tick);
  }
  window.addEventListener("resize", resize);
  resize();
  if (!still) tick();
})();
