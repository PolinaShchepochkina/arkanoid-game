const game = {
  width: 250,
  height: 267,
  ctx: undefined,
  platform: undefined,
  ball: undefined,
  bricks: [],
  rows: 8,
  cols: 14,
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
    brickwhite: undefined
  },
  init: function () {
    const canvas = document.getElementById("gameCanvas");
    this.ctx = canvas.getContext("2d");

    window.addEventListener("keydown", function (event) {
      if (event.keyCode == 37) {
        game.platform.dx = -game.platform.velocity;
      } else if (event.keyCode == 39) {
        game.platform.dx = game.platform.velocity;
      } else if (event.keyCode == 32) {
        game.platform.releaseBall();
      }
    });

    window.addEventListener("keyup", function () {
      game.platform.stop();
    });
  },
  load: function () {
    for (let key in this.images) {
      this.images[key] = new Image();
      this.images[key].src = "./images/" + key + ".png";
    }
  },
  create: function () {
    const brickColors = Object.keys(this.images).filter(key => key.startsWith("brick"));

    for (let row = 0; row < this.rows; row++) {
      const color = brickColors[row % brickColors.length];

      for (let col = 0; col < this.cols; col++) {
        this.bricks.push({
          x: 14 + (16 * col),
          y: 14 + (8 * row),
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
  },
  update: function () {
    if (this.ball.collide(this.platform)) {
      this.ball.bumpPlatform(this.platform);
    }

    if (this.platform.dx) {
      this.platform.move();
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
  },
  run: function () {
    this.update();
    this.render();

    window.requestAnimationFrame(function () {
      game.run();
    });
  },
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
  },
  bumpPlatform: function () {
    this.dy = -this.velocity;

  },
  checkBounds: function () {
    let x = this.x + this.dx;
    let y = this.y + this.dy;

    if (x < 0) {
      this.x = 0;
      this.dx = this.velocity;
    } else if (x + this.width > game.width) {
      this.x = game.width - this.width;
      this.dx = -this.velocity;
    } else if (y < 0) {
      this.y = 0;
      this.dy = this.velocity;
    } else if (y + this.height > game.height) {
      game.over();
    }
  }
};

game.platform = {
  width: 32,
  height: 8,
  x: 109,
  y: 259,
  dx: 0,
  velocity: 6,
  ball: game.ball,
  releaseBall: function () {
    if (this.ball) {
      this.ball.jump();
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
  },
  over: function () {
    console.log('game over :(')
  }
};

window.addEventListener("load", function () {
  game.start();
});
