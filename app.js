class Game {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.img = new Image();
    this.img.src = "./img/red_ship.png";
    this.player = {
      x: 325,
      y: 500,
      xVel: 40,
      w: 100,
      h: 80,
    };
    this.currentScore = 0;
    this.livesRemaining = 10;
    this.projectiles = [];
    this.enemyCircles = [];
  }

  init = () => {
    this.setCanvas(800, 600);
    this.controlPanel();
    this.img.onload = () => {
      this.gameLoop();
    };
  };

  setCanvas = (w, h) => {
    this.canvas = document.createElement("canvas");
    this.canvas.width = w;
    this.canvas.height = h;
    this.ctx = this.canvas.getContext("2d");
    document.body.appendChild(this.canvas);
  };

  draw = () => {
    this.drawCanvas();
    this.drawSpaceship();
    this.drawProjectiles();
    this.drawEnemyCircles();
    this.drawScore();
  };

  drawCanvas = () => {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = "black";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  };

  drawSpaceship = () => {
    this.ctx.drawImage(
      this.img,
      0,
      0,
      150,
      120,
      this.player.x,
      this.player.y,
      this.player.w,
      this.player.h
    );
  };

  updateScore = () => {
    this.currentScore += 15;
  };

  updateLives = () => {
    this.livesRemaining--;
    this.checkIfGameOver();
  };

  drawScore = () => {
    this.ctx.font = "bold 24px verdana, sans-serif";
    let scoreBoard = `Score: ${this.currentScore} | Lives: ${this.livesRemaining}`;
    this.ctx.textAlign = "start";
    this.ctx.textBaseline = "bottom";
    this.ctx.fillStyle = "white";
    this.ctx.fillText(scoreBoard, 10, 50);
  };

  update = () => {
    this.updateProjectiles();
    this.updateEnemyCircles();
    this.collisionDetectionShots();
    this.collisionWithPlayer();
  };

  createProjectiles = () => {
    if (this.projectiles.length < 3) {
      this.projectiles.push({
        x: this.player.x + this.player.w / 2,
        y: this.player.y,
        yVel: -6,
        r: 5,
      });
    }
  };

  updateProjectiles = () => {
    this.projectiles = this.projectiles.filter(
      (projectile) => projectile.y > 0
    );
    this.projectiles.forEach((projectile) => {
      projectile.y += projectile.yVel;
    });
    this.createEnemies();
  };

  drawProjectiles = () => {
    this.projectiles.forEach((projectile) => {
      this.ctx.fillStyle = "green";
      this.ctx.beginPath();
      this.ctx.arc(projectile.x, projectile.y, projectile.r, 0, 2 * Math.PI);
      this.ctx.fill();
    });
  };

  randomRGB = () => {
    return `rgb(${Math.floor(Math.random() * 256)},
    ${Math.floor(Math.random() * 256)},
    ${Math.floor(Math.random() * 256)})`;
  };

  createEnemies = () => {
    if (this.enemyCircles.length < 5) {
      let x = Math.random() * (this.canvas.width - 200 + 75) + 75;
      let y = Math.random() * (this.canvas.height / 4 - 75) + 75;
      let r = Math.random() * (50 - 10) + 10;
      let random = Math.random() * (6 - 1) + 1;
      let speed = random > 3 ? -1 : 1;
      let color = this.randomRGB();
      this.enemyCircles.push({
        x: x,
        y: y,
        r: r,
        xVel: speed,
        yVel: speed,
        color: color,
      });
    }
  };

  drawEnemyCircles = () => {
    this.enemyCircles.forEach((enemy) => {
      this.ctx.fillStyle = enemy.color;
      this.ctx.beginPath();
      this.ctx.arc(enemy.x, enemy.y, enemy.r, 0, 2 * Math.PI);
      this.ctx.fill();
    });
  };

  updateEnemyCircles = () => {
    this.enemyCircles.forEach((enemy) => {
      enemy.y += enemy.yVel;
      enemy.x += enemy.xVel;
      if (enemy.y - enemy.r <= 0) {
        enemy.yVel *= -1;
      }
      if (enemy.y + enemy.r >= this.canvas.height) {
        this.updateLives();
        this.playPopSound();
        this.removeEnemyCircle(enemy);
      }
      if (enemy.x - enemy.r <= 0 || enemy.x + enemy.r >= this.canvas.width) {
        enemy.xVel *= -1;
      }
    });
  };

  removeEnemyCircle = (enemy) => {
    this.enemyCircles = this.enemyCircles.filter((circle) => circle !== enemy);
  };

  playShotSound = () => {
    if (this.projectiles.length <= 2) {
      document.getElementById("laser3").play();
    }
    if (this.projectiles.length === 3) {
      document.getElementById("laser7").play();
    }
  };

  playPopSound = () => {
    document.getElementById("pop").play();
  };

  collisionDetectionShots = () => {
    // calculate euclidean distance //
    this.projectiles.forEach((projectile) => {
      this.enemyCircles.forEach((circle) => {
        let x1 = projectile.x;
        let y1 = projectile.y;
        let x2 = circle.x;
        let y2 = circle.y;
        let r1 = projectile.r;
        let r2 = circle.r;
        let distance = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);

        if (distance < r1 + r2) {
          const projectileToRemove = projectile;
          this.projectiles = this.projectiles.filter(
            (projectile) => projectile !== projectileToRemove
          );
          this.removeEnemyCircle(circle);
          this.playPopSound();
          this.updateScore();
        }
      });
    });
  };

  collisionWithPlayer = () => {
    this.enemyCircles.forEach((circle) => {
      let closestX = Math.max(
        this.player.x,
        Math.min(circle.x, this.player.x + this.player.w)
      );
      let closestY = Math.max(
        this.player.y,
        Math.min(circle.y, this.player.y + this.player.h)
      );
      let distanceX = circle.x - closestX;
      let distanceY = circle.y - closestY;
      let distanceSquared = distanceX * distanceX + distanceY * distanceY;
      if (distanceSquared <= circle.r * circle.r) {
        this.removeEnemyCircle(circle);
        this.playPopSound();
        this.updateLives();
      }
    });
  };

  controlPanel = () => {
    document.addEventListener("keydown", (e) => {
      if (
        e.code === "KeyD" &&
        this.player.x <= this.canvas.width - this.player.w
      ) {
        this.player.x += this.player.xVel;
      }
      if (e.code === "KeyA" && this.player.x >= 0) {
        this.player.x -= this.player.xVel;
      }
      if (e.code === "KeyS") {
        this.createProjectiles();
        this.playShotSound();
      }
    });
  };

  checkIfGameOver = () => {
    if (this.livesRemaining == 0) {
      alert(`Game Over! Your final score is ${this.currentScore}`);
      window.location.reload(true);
    }
  };

  gameLoop = () => {
    this.update();
    this.draw();
    requestAnimationFrame(this.gameLoop);
  };
}

const game = new Game();
game.init();
