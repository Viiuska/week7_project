//help & guidance https://www.youtube.com/watch?v=O6zoZAq86io
//help & guidance https://phaser.io/tutorials/making-your-first-phaser-3-game/part1

import Phaser from "phaser";

var config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: "arcade",
    arcade: {
      gravity: {
        y: 300
      },
      debug: false
    }
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

new Phaser.Game(config);

var player;
var group_stars;
var group_blackStars;
var group_bombs;
var group_plateforms;
var keyboard;
var scoreValue = 0;
var score_text;
var gameOver = false;

function preload() {
  this.load.image("img_sky", "src/assets/sky.png");
  this.load.image("img_platform", "src/assets/platform.png");
  this.load.image("img_star", "src/assets/star.png");
  this.load.image("img_bomb", "src/assets/bomb.png");
  this.load.image("img_starBlack", "src/assets/starBlack.png");
  this.load.spritesheet("img_dude", "src/assets/dude.png", {
    frameWidth: 32,
    frameHeight: 48
  });
}

function create() {
  this.add.image(400, 300, "img_sky");

  group_plateforms = this.physics.add.staticGroup();

  group_plateforms.create(70, 584, "img_platform");
  group_plateforms.create(200, 584, "img_platform");
  group_plateforms.create(350, 584, "img_platform");
  group_plateforms.create(500, 584, "img_platform");
  group_plateforms.create(650, 584, "img_platform");
  group_plateforms.create(800, 584, "img_platform");

  group_plateforms.create(600, 450, "img_platform");
  group_plateforms.create(500, 100, "img_platform");
  group_plateforms.create(60, 300, "img_platform");
  group_plateforms.create(300, 200, "img_platform");
  group_plateforms.create(750, 270, "img_platform");

  player = this.physics.add.sprite(100, 450, "img_dude");

  player.setBounce(0.2);
  player.setCollideWorldBounds(true);

  this.anims.create({
    key: "turn_left",
    frames: this.anims.generateFrameNumbers("img_dude", { start: 0, end: 3 }),
    frameRate: 10,
    repeat: -1
  });

  this.anims.create({
    key: "turn",
    frames: [{ key: "img_dude", frame: 4 }],
    frameRate: 20
  });

  this.anims.create({
    key: "turn_right",
    frames: this.anims.generateFrameNumbers("img_dude", { start: 5, end: 8 }),
    frameRate: 10,
    repeat: -1
  });

  keyboard = this.input.keyboard.createCursorKeys();

  group_stars = this.physics.add.group();
  for (var i = 0; i < 10; i++) {
    var coordX = 70 + 70 * i;
    group_stars.create(coordX, 10, "img_star");
  }

  group_stars.children.iterate(function iterator(star_i) {
    var bounce = Phaser.Math.FloatBetween(0.4, 0.8);
    star_i.setBounceY(bounce);
  });

  group_blackStars = this.physics.add.group();
  for (var n = 0; n < 3; n++) {
    var cordX = 200 + 200 * n;
    group_blackStars.create(cordX, 3, "img_starBlack");
  }

  group_blackStars.children.iterate(function iterator(blackStar_i) {
    var bounce = Phaser.Math.FloatBetween(0.4, 0.8);
    blackStar_i.setBounceY(bounce);
  });

  group_bombs = this.physics.add.group();
  score_text = this.add.text(16, 16, "score: 0", {
    fontSize: "32px",
    fill: "#000"
  });

  this.physics.add.collider(player, group_plateforms);
  this.physics.add.collider(group_stars, group_plateforms);
  this.physics.add.collider(group_blackStars, group_plateforms);
  this.physics.add.collider(group_bombs, group_plateforms);

  this.physics.add.overlap(player, group_stars, collectStars, null, this);
  this.physics.add.overlap(
    player,
    group_blackStars,
    collectBlackStars,
    null,
    this
  );
  this.physics.add.collider(player, group_bombs, bombDamage, null, this);
}

function update() {
  if (gameOver) {
    return;
  }
  if (keyboard.left.isDown) {
    player.setVelocityX(-160);
    player.anims.play("turn_left", true);
  } else if (keyboard.right.isDown) {
    player.setVelocityX(160);
    player.anims.play("turn_right", true);
  } else {
    player.setVelocityX(0);
    player.anims.play("turn");
  }

  if (keyboard.up.isDown && player.body.touching.down) {
    player.setVelocityY(-330);
  }
}

function collectStars(player, star) {
  star.disableBody(true, true);

  scoreValue += 10;
  score_text.setText("Score: " + scoreValue);
  if (group_stars.countActive(true) === 0) {
    group_stars.children.iterate(function iterator(star_i) {
      star_i.enableBody(true, star_i.x, 0, true, true);
    });

    var x;
    if (player.x < 400) {
      x = Phaser.Math.Between(400, 800);
    } else {
      x = Phaser.Math.Between(0, 400);
    }

    var bomb = group_bombs.create(x, 18, "img_bomb");
    bomb.setBounce(1);
    bomb.setCollideWorldBounds(true);
    bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
    bomb.allowGravity = false;
  }
}

function collectBlackStars(player, blackStar) {
  blackStar.disableBody(true, true);
  scoreValue -= 10;
  score_text.setText("Score: " + scoreValue);
  if (group_blackStars.countActive(true) === 0) {
    group_blackStars.children.iterate(function iterator(blackStar_i) {
      blackStar_i.enableBody(true, blackStar_i.y, 0, true, true);
    });

    var y;
    if (player.y < 400) {
      y = Phaser.Math.Between(400, 800);
    } else {
      y = Phaser.Math.Between(0, 400);
    }
  }
}

function bombDamage(player, bomb) {
  this.physics.pause();
  player.setTint(0xff0000);
  player.anims.play("turn");
  gameOver = true;
}
