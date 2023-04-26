const game = {
  width: 250,
  height: 267,
  ctx: undefined,
  platform: undefined,
  ball: undefined,
  bricks: [],
  rows: 7,
  cols: 14,
  running: true,
  score: 0,
  life: 3,
  images: {
    background: undefined,
    platform: undefined,
    ball: undefined,
    brickblue: undefined,
    brickgold: undefined,
    brickgreen: undefined,
    brickorange: undefined,
    bricklightblue: undefined,
    brickpink: undefined,
    brickred: undefined,
    life: undefined
  },

  init: function () {
    const canvas = document.getElementById("gameCanvas");
    this.ctx = canvas.getContext("2d");
    this.ctx.font = "10px Arial";
    this.ctx.fillStyle = "#FFFFFF";

    window.addEventListener("keydown", function (event) {
      if (event.keyCode === 37) {
        game.platform.dx = -game.platform.velocity;
      } else if (event.keyCode === 39) {
        game.platform.dx = game.platform.velocity;
      } else if (event.keyCode === 32) {
        if (game.life > 0) {
          game.platform.releaseBall();
        }
      }
    });

    window.addEventListener("keyup", function () {
      game.platform.stop();
    });
  },

  load: function () {
    for (let key in this.images) {
      this.images[key] = new Image();
      this.images[key].src = `./images/${key}.png`;
    }
  },

  create: function () {
    const brickColors = Object.keys(this.images).filter((key) =>
      key.startsWith("brick")
    );

    for (let row = 0; row < this.rows; row++) {
      const color = brickColors[row % brickColors.length];

      for (let col = 0; col < this.cols; col++) {
        this.bricks.push({
          x: 14 + 16 * col,
          y: 31 + 8 * row,
          width: 16,
          height: 8,
          color: color,
          isAlive: true
        })
      }
    }
  },

  start: function () {
    this.init();
    this.load();
    this.create();
    this.run();
  },

  render: function () {
    this.ctx.clearRect(0, 0, this.width, this.height);

    this.ctx.drawImage(this.images.background, 0, 0);
    this.ctx.drawImage(this.images.platform, this.platform.x, this.platform.y);
    this.ctx.drawImage(this.images.ball, this.ball.x, this.ball.y);
    this.bricks.forEach(function (brick) {
      if (brick.isAlive) {
        const brickSprite = this.images[brick.color];
        this.ctx.drawImage(brickSprite, brick.x, brick.y);
      }
    }, this);

    this.ctx.fillText("SCORE: " + this.score, 14, 24);
    for (let i = 0; i < this.life; i++) {
      this.ctx.drawImage(this.images.life, 220 - (i * 17), 13);
    }
  },

  update: function () {
    if (this.ball.collide(this.platform)) {
      this.ball.bumpPlatform(this.platform);
    }

    if (this.platform.dx) {
      this.platform.move();
      if (!this.ball.dx && !this.ball.dy) {
        this.ball.x = this.platform.x + this.platform.width / 2;
        this.ball.y = this.platform.y - this.ball.height;
      }
    }
    if (this.ball.dx || this.ball.dy) {
      this.ball.move();
    }


    this.bricks.forEach(function (brick) {
      if (brick.isAlive) {
        if (this.ball.collide(brick)) {
          this.ball.bumpBrick(brick);
        }
      }
    }, this);

    this.ball.checkBounds();

    if (this.platform.x < 10) {
      this.platform.x = 10;
      this.platform.stop();
    } else if (this.platform.x + this.platform.width > this.width - 10) {
      this.platform.x = this.width - this.platform.width - 10;
      this.platform.stop();
    }
  },

  run: function () {
    this.update();
    this.render();

    if (this.running) {
      window.requestAnimationFrame(function () {
        game.run();
      });
    }
  },

  over: function (message) {
    alert(message)
    this.running = false;
    window.location.reload();
  }
};

game.ball = {
  width: 4,
  height: 5,
  x: 123,
  y: 254,
  dx: 0,
  dy: 0,
  velocity: 1,

  jump: function () {
    this.dx = -this.velocity;
    this.dy = -this.velocity;
  },

  move: function () {
    this.x += this.dx;
    this.y += this.dy;
  },

  collide: function (brick) {
    let x = this.x + this.dx;
    let y = this.y + this.dy;

    if (x + this.width > brick.x &&
      x < brick.x + brick.width &&
      y + this.height > brick.y &&
      y < brick.y + brick.height
    ) {
      return true;
    }
    return false;
  },

  bumpBrick: function (brick) {
    this.dy *= -1;
    brick.isAlive = false;
    ++game.score;

    if (game.score >= game.bricks.length) {
      game.over("You win")
    }
  },

  bumpPlatform: function () {
    this.dy = -this.velocity;
  },

  checkBounds: function () {
    let x = this.x + this.dx;
    let y = this.y + this.dy;

    if (x < 10) {
      this.x = 10;
      this.dx = this.velocity;
    } else if (x + this.width > game.width - 10) {
      this.x = game.width - this.width - 10;
      this.dx = -this.velocity;

    } else if (y < 10) {
      this.y = 10;
      this.dy = this.velocity;
    } else if (y + this.height > game.height) {
      game.life--;

      if (game.life > 0) {
        this.x = 123;
        this.y = 254;
        this.dx = 0;
        this.dy = 0;
        game.platform.x = 109;
        game.platform.y = 259;
      } else {
        game.over("You lose");
      }
    }
  }
};

game.platform = {
  width: 32,
  height: 8,
  x: 109,
  y: 259,
  dx: 0,
  velocity: 5,
  ball: game.ball,

  releaseBall: function () {
    if (game.life > 0) {
      game.ball.jump();
      this.ball = false;
    }
  },

  move: function () {
    this.x += this.dx;

    if (this.ball) {
      this.ball.x += this.dx;
    }
  },

  stop: function () {
    this.dx = 0;

    if (this.ball) {
      this.ball.dx = 0;
    }
  }
};

window.addEventListener("load", function () {
  game.start();
});
