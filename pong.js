class Vector {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  get length() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  set length(value) {
    const factor = value / this.length;
    this.x *= factor;
    this.y *= factor;
  }
}

// Rectangle with position getters
class Rectangle {
  constructor(w, h) {
    this.position = new Vector(0, 0);
    this.size = new Vector(w, h);
  }

  get left() { return this.position.x - this.size.x / 2; }
  get right() { return this.position.x + this.size.x / 2; }
  get top() { return this.position.y - this.size.y / 2; }
  get bottom() { return this.position.y + this.size.y / 2; }
}

// Pong ball
class Ball extends Rectangle {
  constructor() {
    super(10, 10);
    this.velocity = new Vector;
  }
}

// Player paddle
class Player extends Rectangle {
  constructor() {
    super(20, 100);
    this.score = 0;
  }
}

// Pong game class
class Pong {
  constructor(canvas) {
    this._canvas = canvas;
    this._context = canvas.getContext("2d"); 

    // Create ball
    this.ball = new Ball;

    // Set initial ball position
    this.ball.position.x = 100;
    this.ball.position.y = 50;

    // Set ball in motion
    this.ball.velocity.x = 300;
    this.ball.velocity.y = 300;

    // Create two player paddles
    this.players = [
      new Player,
      new Player
    ];

    // Initial position for player paddles
    this.players[0].position.x = 40;
    this.players[1].position.x = this._canvas.width - 40;
    this.players.forEach(player => {
      player.position.y = this._canvas.height / 2;
    });

    // Game loop with requestAnimationFrame()
    let lastTime;
    const callback = (milliseconds) => {
      if (lastTime) {
        this.update((milliseconds - lastTime) / 1000);
      }
      lastTime = milliseconds;
      requestAnimationFrame(callback);
    };

    // Initialize the game loop
    callback();

    // Drawing score numbers in needlessly complicated manner
    this.CHAR_PIXEL = 10;
    this.CHARS = [
      "111101101101111",
      "010010010010010",
      "111001111100111",
      "111001111001111",
      "101101111001001",
      "111100111001111",
      "111100111101111",
      "111001001001001",
      "111101111101111",
      "111101111001111"
    ].map(str => {
      const canvas = document.createElement("canvas");
      const s = this.CHAR_PIXEL;
      canvas.height = s * 5;
      canvas.width = s * 3;
      const context = canvas.getContext("2d");
      context.fillStyle = "#fff";
      str.split("").forEach((fill, i) => {
        if (fill === "1") {
          context.fillRect((i % 3) * s, (i / 3 | 0) * s, s, s);
        }
      });
      return canvas;
    });

    this.reset();
  }

  collide(player, ball) {
    if (player.left < ball.right && player.right > ball.left &&
        player.top < ball.bottom && player.bottom > ball.top) {
      const len = ball.velocity.length;

      ball.velocity.x = -ball.velocity.x;
      ball.velocity.y += 300 * (Math.random() - 0.5);
      ball.velocity.length = len * 1.05;
    }
  }

  draw() {
    this._context.fillStyle = "#000";
    this._context.fillRect(0, 0, this._canvas.width, this._canvas.height);

    this.drawRect(this.ball);

    this.players.forEach(player => this.drawRect(player));

    this.drawScore();
  }

  drawRect(rect) {
    this._context.fillStyle = "#fff";
    this._context.fillRect(rect.left, rect.top, rect.size.x, rect.size.y);
  }

  drawScore() {
    const align = this._canvas.width / 3;
    const CHAR_WIDTH = this.CHAR_PIXEL * 4;
    this.players.forEach((player, index) => {
      const chars = player.score.toString().split("");
      const offset = align * (index + 1) - (CHAR_WIDTH * chars.length / 2) + this.CHAR_PIXEL / 2;

      chars.forEach((char, pos) => {
        this._context.drawImage(this.CHARS[char|0], offset + pos * CHAR_WIDTH, 20);
      });
    });
  }

  reset() {
    this.ball.position.x = this._canvas.width / 2;
    this.ball.position.y = this._canvas.height / 2;

    this.ball.velocity.x = 0;
    this.ball.velocity.y = 0;
  }

  start() {
    if (this.ball.velocity.x === 0 && this.ball.velocity.y === 0) {
      this.ball.velocity.x = 300 * (Math.random() > .5 ? 1 : -1);
      this.ball.velocity.y = 300 * (Math.random() * 2 - 1);
      this.ball.velocity.length = 200;
    }
  }

  update(dt) {
    this.ball.position.x += this.ball.velocity.x * dt;
    this.ball.position.y += this.ball.velocity.y * dt;

    // Move ball in opposite direction if it reaches bounds
    if (this.ball.left < 0 || this.ball.right > this._canvas.width) {
      const playerId = this.ball.velocity.x < 0 ? 1 : 0;
      this.players[playerId].score++;
      this.reset();
    }

    if (this.ball.top < 0 || this.ball.bottom > this._canvas.height) {
      this.ball.velocity.y = -this.ball.velocity.y;
    }

    this.players[1].position.y = this.ball.position.y;

    this.players.forEach(player => this.collide(player, this.ball));

    this.draw();
  }

}

// Initialize game canvas
const canvas = document.getElementById("pong");
const pong = new Pong(canvas);

canvas.addEventListener("mousemove", event => {
  const scale = event.offsetY / event.target.getBoundingClientRect().height;
  pong.players[0].position.y = canvas.height * scale;
});

canvas.addEventListener("click", event => {
  pong.start();
});

