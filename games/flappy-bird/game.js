const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const video = document.getElementById("webcam");

let WIDTH = window.innerWidth;
let HEIGHT = window.innerHeight;

function resizeCanvas() {
  WIDTH = window.innerWidth;
  HEIGHT = window.innerHeight;
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Status Game
let birdY = HEIGHT / 2;
const birdX = 180, birdRadius = 22;
let pipes = [];
let clouds = [];
let score = 0;
let level = 1;
let gameSpeed = 4.5; // Kecepatan dasar Level 1
let gameOver = false;

// Variabel Animasi Game Over
let gameOverAnimScale = 0;
let gameOverOpacity = 0;
let gameOverParticles = [];

// Tracking Jari & Partikel Trail
let particles = [];
let fingerX = birdX, fingerY = birdY;
let isFingerDetected = false;

class Cloud {
  constructor(x) {
    this.x = x || Math.random() * WIDTH;
    this.y = Math.random() * (HEIGHT * 0.4);
    this.speed = Math.random() * 0.8 + 0.3;
    this.scale = Math.random() * 0.6 + 0.6;
  }
  update() {
    this.x -= this.speed;
    if (this.x < -200) {
      this.x = WIDTH + 100;
      this.y = Math.random() * (HEIGHT * 0.4);
    }
  }
  draw() {
    ctx.save();
    ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
    ctx.beginPath();
    ctx.arc(this.x, this.y, 30 * this.scale, 0, Math.PI * 2);
    ctx.arc(this.x + 25 * this.scale, this.y - 15 * this.scale, 35 * this.scale, 0, Math.PI * 2);
    ctx.arc(this.x + 60 * this.scale, this.y, 30 * this.scale, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

class TreePipe {
  constructor(x) {
    this.x = x;
    this.width = 85;
    this.gap = Math.max(180, HEIGHT * 0.28);
    this.height = Math.floor(Math.random() * (HEIGHT - this.gap - 200)) + 100;
    this.passed = false;
  }
  update() {
    this.x -= gameSpeed; // Berjalan sesuai kecepatan level saat ini
  }
  draw() {
    const trunkWidth = this.width * 0.5;
    const trunkOffset = (this.width - trunkWidth) / 2;

    // Pohon Atas
    ctx.fillStyle = "#5c3d2e";
    ctx.fillRect(this.x + trunkOffset, 0, trunkWidth, this.height);
    
    ctx.fillStyle = level === 1 ? "#2d6a4f" : "#1e40af"; // Warna mahkota daun berubah di Level 2
    ctx.beginPath();
    ctx.arc(this.x + this.width / 2, this.height, this.width * 0.75, 0, Math.PI * 2);
    ctx.fill();

    // Pohon Bawah
    const bottomTreeY = this.height + this.gap;
    ctx.fillStyle = "#5c3d2e";
    ctx.fillRect(this.x + trunkOffset, bottomTreeY, trunkWidth, HEIGHT - bottomTreeY);

    ctx.fillStyle = level === 1 ? "#1b4332" : "#1e3a8a";
    ctx.beginPath();
    ctx.arc(this.x + this.width / 2, bottomTreeY, this.width * 0.75, 0, Math.PI * 2);
    ctx.fill();
  }
}

function initGame() {
  gameSpeed = 4.5;
  level = 1;
  score = 0;
  pipes = [new TreePipe(WIDTH + 200), new TreePipe(WIDTH + 600), new TreePipe(WIDTH + 1000)];
  clouds = [new Cloud(100), new Cloud(400), new Cloud(800), new Cloud(1200)];
  gameOver = false;
  gameOverAnimScale = 0;
  gameOverOpacity = 0;
  gameOverParticles = [];
  birdY = HEIGHT / 2;
  particles = [];
}

function triggerGameOver() {
  gameOver = true;
  // Membuat ledakan partikel saat Game Over
  for (let i = 0; i < 40; i++) {
    gameOverParticles.push({
      x: birdX,
      y: birdY,
      size: Math.random() * 8 + 4,
      color: `hsl(${Math.random() * 40 + 340}, 100%, 60%)`,
      vx: (Math.random() - 0.5) * 12,
      vy: (Math.random() - 0.5) * 12,
      life: 1.0
    });
  }
}

function drawBird(x, y) {
  ctx.save();
  ctx.translate(x, y);

  ctx.beginPath();
  ctx.arc(0, 0, birdRadius, 0, Math.PI * 2);
  ctx.fillStyle = "#FFD700";
  ctx.fill();
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = "#000";
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(8, -7, 7, 0, Math.PI * 2);
  ctx.fillStyle = "#FFF";
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(10, -7, 3, 0, Math.PI * 2);
  ctx.fillStyle = "#000";
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(14, 0);
  ctx.lineTo(28, 5);
  ctx.lineTo(14, 10);
  ctx.closePath();
  ctx.fillStyle = "#FF5722";
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.ellipse(-8, 3, 10, 6, Math.PI / 4, 0, Math.PI * 2);
  ctx.fillStyle = "#FFF7A0";
  ctx.fill();
  ctx.stroke();

  ctx.restore();
}

function createParticle(x, y) {
  for (let i = 0; i < 2; i++) {
    particles.push({
      x: x + (Math.random() - 0.5) * 12,
      y: y + (Math.random() - 0.5) * 12,
      size: Math.random() * 8 + 3,
      color: `hsl(${Math.random() * 60 + 150}, 100%, 70%)`,
      vx: (Math.random() - 0.5) * 2.5,
      vy: (Math.random() - 0.5) * 2.5,
      life: 1.0
    });
  }
}

function drawParticles() {
  for (let i = particles.length - 1; i >= 0; i--) {
    let p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.life -= 0.04;

    if (p.life <= 0) {
      particles.splice(i, 1);
      continue;
    }

    ctx.save();
    ctx.globalAlpha = p.life;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fillStyle = p.color;
    ctx.shadowBlur = 12;
    ctx.shadowColor = p.color;
    ctx.fill();
    ctx.restore();
  }
}

function onResults(results) {
  if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
    const landmarks = results.multiHandLandmarks[0];
    fingerX = (1 - landmarks[8].x) * WIDTH;
    fingerY = landmarks[8].y * HEIGHT;
    birdY = fingerY;
    isFingerDetected = true;
    createParticle(fingerX, fingerY);
  } else {
    isFingerDetected = false;
  }
  updateAndDraw(results.image);
}

function updateAndDraw(videoFrame) {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);

  // Background Mirror Video
  ctx.save();
  ctx.scale(-1, 1);
  ctx.drawImage(videoFrame, -WIDTH, 0, WIDTH, HEIGHT);
  ctx.restore();

  // Overlay Transparan
  ctx.fillStyle = "rgba(15, 23, 42, 0.45)";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // Awan
  clouds.forEach(cloud => {
    cloud.update();
    cloud.draw();
  });

  drawParticles();

  if (isFingerDetected) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(fingerX, fingerY, 10, 0, Math.PI * 2);
    ctx.fillStyle = "#38bdf8";
    ctx.shadowBlur = 20;
    ctx.shadowColor = "#38bdf8";
    ctx.fill();
    ctx.restore();
  }

  if (!gameOver) {
    pipes.forEach(pipe => {
      pipe.update();
      pipe.draw();

      if (!pipe.passed && pipe.x < birdX) {
        pipe.passed = true;
        score++;

        // Naikkan Level setelah melewati 5 rintangan (Tahap 1 Selesai)
        if (score === 5) {
          level = 2;
          gameSpeed = 7.5; // Percepat permainan secara signifikan!
        }
      }

      // Tabrakan Pipa
      if (birdX + birdRadius > pipe.x && birdX - birdRadius < pipe.x + pipe.width) {
        if (birdY - birdRadius < pipe.height || birdY + birdRadius > pipe.height + pipe.gap) {
          triggerGameOver();
        }
      }
    });

    if (pipes[0].x < -100) {
      pipes.shift();
      pipes.push(new TreePipe(WIDTH + 100));
    }

    if (birdY - birdRadius <= 0 || birdY + birdRadius >= HEIGHT) {
      triggerGameOver();
    }
  }

  drawBird(birdX, birdY);

  // Tampilan HUD Skor & Level
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 32px sans-serif";
  ctx.shadowBlur = 8;
  ctx.shadowColor = "#000";
  ctx.fillText(`Skor: ${score}`, 40, 55);

  ctx.fillStyle = level === 1 ? "#38bdf8" : "#f43f5e";
  ctx.fillText(`Level: ${level} ${level === 2 ? '(CEPAT!)' : ''}`, 40, 95);
  ctx.shadowBlur = 0;

  // Animasi Game Over Interaktif & Modern
  if (gameOver) {
    if (gameOverAnimScale < 1) gameOverAnimScale += 0.08;
    if (gameOverOpacity < 0.75) gameOverOpacity += 0.04;

    ctx.save();
    ctx.fillStyle = `rgba(15, 23, 42, ${gameOverOpacity})`;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    // Animasi Partikel Ledakan Game Over
    for (let i = gameOverParticles.length - 1; i >= 0; i--) {
      let p = gameOverParticles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 0.02;

      if (p.life <= 0) {
        gameOverParticles.splice(i, 1);
        continue;
      }

      ctx.globalAlpha = p.life;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.shadowBlur = 10;
      ctx.shadowColor = p.color;
      ctx.fill();
    }

    // Modal Panel Kartu Pop-Up
    ctx.save();
    ctx.translate(WIDTH / 2, HEIGHT / 2);
    ctx.scale(gameOverAnimScale, gameOverAnimScale);

    ctx.fillStyle = "rgba(30, 41, 59, 0.9)";
    ctx.strokeStyle = "#ef4444";
    ctx.lineWidth = 4;
    ctx.shadowBlur = 30;
    ctx.shadowColor = "rgba(239, 68, 68, 0.5)";

    ctx.beginPath();
    ctx.roundRect(-220, -140, 440, 280, 20);
    ctx.fill();
    ctx.stroke();

    // Teks Header
    ctx.fillStyle = "#ef4444";
    ctx.font = "900 48px sans-serif";
    ctx.textAlign = "center";
    ctx.shadowBlur = 15;
    ctx.shadowColor = "#ef4444";
    ctx.fillText("GAME OVER", 0, -60);

    // Statistik Skor & Level
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 22px sans-serif";
    ctx.shadowBlur = 0;
    ctx.fillText(`Skor Akhir: ${score}`, 0, 0);
    ctx.fillText(`Mencapai: Level ${level}`, 0, 35);

    // Instruksi Restart
    ctx.fillStyle = "#94a3b8";
    ctx.font = "16px sans-serif";
    ctx.fillText("Tekan SPASI / Klik Layar untuk Coba Lagi", 0, 90);

    ctx.restore();
    ctx.restore();
  }
}

const hands = new Hands({
  locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
});
hands.setOptions({
  maxNumHands: 1,
  modelComplexity: 1,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5
});
hands.onResults(onResults);

const camera = new Camera(video, {
  onFrame: async () => {
    await hands.send({ image: video });
  },
  width: 1280,
  height: 720
});
camera.start();

window.addEventListener("keydown", (e) => {
  if (e.code === "Space" && gameOver) initGame();
});
canvas.addEventListener("click", () => {
  if (gameOver) initGame();
});

initGame();