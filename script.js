const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");

let frames = 0;
let score = 0;
let highScore = localStorage.getItem("highScore") || 0;
let gameRunning = false;
const gravity = 0.25;
const jump = 4.6;

// Load images
const birdImg = new Image();
birdImg.src = "bird.png";

const pipeTopImg = new Image();
pipeTopImg.src = "pipe-top.png";

const pipeBottomImg = new Image();
pipeBottomImg.src = "pipe-bottom.png";

// Bird object
const bird = {
  x: 50,
  y: 150,
  width: 40,
  height: 30,
  speed: 0,
  draw() {
    ctx.drawImage(birdImg, this.x, this.y, this.width, this.height);
  },
  update() {
    this.speed += gravity;
    this.y += this.speed;

    if (this.y + this.height >= canvas.height) {
      gameOver();
    }

    if (this.y < 0) {
      this.y = 0;
      this.speed = 0;
    }
  },
  flap() {
    this.speed = -jump;
  },
};

const pipes = [];
const pipeWidth = 52;
const pipeGap = 120;

function createPipe() {
  const topHeight = Math.floor(Math.random() * 200) + 50;
  const bottomY = topHeight + pipeGap;

  pipes.push({
    x: canvas.width,
    topHeight,
    bottomY,
    passed: false,
  });
}

function updatePipes() {
  const speed = 2 + Math.floor(score / 10); // difficulty scaling

  for (let i = 0; i < pipes.length; i++) {
    const pipe = pipes[i];
    pipe.x -= speed;

    // Draw pipe images
    ctx.drawImage(pipeTopImg, pipe.x, 0, pipeWidth, pipe.topHeight);
    ctx.drawImage(pipeBottomImg, pipe.x, pipe.bottomY, pipeWidth, canvas.height - pipe.bottomY);

    // Collision detection
    if (
      bird.x < pipe.x + pipeWidth &&
      bird.x + bird.width > pipe.x &&
      (bird.y < pipe.topHeight || bird.y + bird.height > pipe.bottomY)
    ) {
      gameOver();
    }

    // Score tracking
    if (!pipe.passed && pipe.x + pipeWidth < bird.x) {
      score++;
      pipe.passed = true;
    }
  }

  // Remove off-screen pipes
  if (pipes.length && pipes[0].x + pipeWidth < 0) {
    pipes.shift();
  }
}

function drawScore() {
  ctx.fillStyle = "black";
  ctx.font = "24px Arial";
  ctx.fillText(`Score: ${score}`, 10, 30);
  ctx.fillText(`High Score: ${highScore}`, 10, 60);
}

function gameOver() {
  gameRunning = false;

  // Update and save high score
  if (score > highScore) {
    highScore = score;
    localStorage.setItem("highScore", highScore);
  }

  restartBtn.style.display = "block";
}

document.addEventListener("keydown", () => {
  if (gameRunning) bird.flap();
});

document.addEventListener("touchstart", () => {
  if (gameRunning) bird.flap();
});

startBtn.addEventListener("click", () => {
  startBtn.style.display = "none";
  gameRunning = true;
  loop();
});

restartBtn.addEventListener("click", () => {
  score = 0;
  frames = 0;
  pipes.length = 0;
  bird.y = 150;
  bird.speed = 0;
  restartBtn.style.display = "none";
  gameRunning = true;
  loop();
});

function loop() {
  if (!gameRunning) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  bird.update();
  bird.draw();

  if (frames % 100 === 0) {
    createPipe();
  }

  updatePipes();
  drawScore();

  frames++;
  requestAnimationFrame(loop);
}
