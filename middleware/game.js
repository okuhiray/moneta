import p5 from "p5";

const runner = ({ store, router, read }) => p5 => {
  const HEIGHT = 100;

  class Bullet {
    constructor() {
      this.x = 0;
      this.y = 0;
      this.w = 0;
      this.v = 0;
      this.exist = false;
    }
    draw() {
      if (this.exist) {
        if (p5.windowWidth < this.x) {
          this.exist = false;
        }
        this.v++;
        if (this.w < 100) {
          this.w += this.v;
        } else {
          this.x += this.v;
        }
        p5.rect(this.x, this.y, this.w, 2);
      }
    }
    line(x, y) {
      rect();
    }
    create() {
      this.x = 30;
      this.y = p5.mouseY - 1;
      this.w = 1;
      this.v = 0;
      this.exist = true;
    }
  }

  class Ship {
    constructor() {
      this.score = 0;
    }
    draw() {
      const y = p5.constrain(p5.mouseY, 20, HEIGHT - 20);
      const x = 20;
      p5.triangle(x, y - 5, x + 20, y, x, y + 5);
      p5.textSize(24);
      p5.text("SCORE:" + this.score, p5.windowWidth - 100, 24);
    }
  }

  class Enemy {
    constructor() {
      this.t = 0;
      this.exist = true;
      this.gameover = false;
      this.count = 720;
    }
    get x() {
      return p5.windowWidth - this.t ** 1.2;
    }
    get y() {
      return (p5.sin(this.t / 20) + 1) * (HEIGHT / 2);
    }
    draw() {
      if (this.exist) {
        this.t++;
        if (this.x < 0) {
          this.gameover = true;
          this.destroy();
        }
        p5.textSize(36);
        p5.text("✷", this.x, this.y);
      }
    }
    create() {
      this.t = 0;
      this.exist = true;
    }
    destroy() {
      this.t = 0;
      this.exist = false;
    }
  }

  let bullet = new Bullet();
  let ship = new Ship();
  let enemy = new Enemy();

  p5.setup = () => {
    const canvas = p5.createCanvas(p5.windowWidth, HEIGHT);
    canvas.parent("p5");
    p5.fill(0);
    p5.stroke(255);
    p5.textAlign(p5.CENTER, p5.CENTER);
  };

  p5.draw = () => {
    p5.background(0);
    if (enemy.gameover) {
      enemy.count--;
      if (enemy.count === 0) {
        const id = p5.random(read("accounts")).id;
        store.dispatch("session/id", id);
        store.dispatch("accounts/modify", {
          id,
          data: { total: (ship.score + 1) * 1000000 },
        });
        router.push("/balance");
      } else if (enemy.count > 360) {
        const size = enemy.count - 360;
        p5.textSize(size);
        p5.text("GAME OVER", p5.windowWidth / 2, HEIGHT / 2);
      } else {
        const size = (enemy.count % 36) * 10;
        p5.textSize(size);
        p5.text(Math.floor(enemy.count / 36), p5.windowWidth / 2, HEIGHT / 2);
      }
      return;
    }
    if (p5.dist(bullet.x + bullet.w, bullet.y, enemy.x, enemy.y) < 10) {
      enemy.destroy();
      ship.score++;
    }
    if (!enemy.exist && p5.random() < 0.01) {
      enemy.create();
    }
    bullet.draw();
    ship.draw();
    enemy.draw();
  };

  p5.mouseClicked = () => {
    bullet.create();
    // 画面中央付近をクリックしたらゲーム再開
    if (p5.dist(p5.windowWidth / 2, HEIGHT / 2, p5.mouseX, p5.mouseY) < 100) {
      enemy.gameover = false;
    }
  };
};

export default function(context) {
  new p5(runner(context));
}
