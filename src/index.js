const game = {
  ctx: undefined,
  platform: undefined,
  ball: undefined,
  bricks: [],
  rows: 8,
  cols: 14,
  sprites: {
    background: undefined,
    platform: undefined,
    ball: undefined,
    brick: undefined
  },
  init: function () {
    const canvas = document.getElementById("gameCanvas");
    this.ctx = canvas.getContext("2d");

    window.addEventListener("keydown", function (event) {
      if (event.keyCode === 37) {
        game.platform.dx = -game.platform.velocity;
      } else if (event.keyCode === 39) {
        game.platform.dx = game.platform.velocity;
      }
    });

    window.addEventListener("keyup", function () {
      game.platform.stop();
    });
  },
  load: function () {
    for (let key in this.sprites) {
      this.sprites[key] = new Image();
      this.sprites[key].src = "./images/" + key + ".png";
    }
  },
  create: function () {
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        this.bricks.push({
          x: 14 + (16 * col),
          y: 14 + (8 * row)
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
    this.ctx.drawImage(this.sprites.background, 0, 0);
    this.ctx.drawImage(this.sprites.platform, this.platform.x, this.platform.y);
    this.ctx.drawImage(this.sprites.ball, this.ball.x, this.ball.y);
    this.bricks.forEach(function (element) {
      this.ctx.drawImage(this.sprites.brick, element.x, element.y);
    }, this);
  },
  update: function () {
    if (this.platform.dx) {
      this.platform.move();
    }
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
  x: 123,
  y: 254
};

game.platform = {
  x: 109,
  y: 259,
  velocity: 6,
  dx: 0,
  ball: game.ball,
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
