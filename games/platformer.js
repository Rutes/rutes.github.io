//**
//example pulled from
// - https://boldideainc.github.io/p5.game/examples/index.html?fileName=platformer.js
// */



let screenWidth = 800;
let screenHeight = 600;
let assets = {};
let platforms;
let player;

// physics settings -- feel free to tweak these values!
let GRAVITY = 0.5;
let RESISTANCE = 0.8;
let ACCELERATION = 1.5;
let JUMP_FORCE = 12;

function preload() {
  // Note: you will also need to customize your player's collider box in the createPlayer() function
  assets.playerStanding = loadImage("assets/platformer/p1_stand.png");
  assets.playerJumping = loadImage("assets/platformer/p1_jump.png");
  assets.playerWalking = loadAnimation("assets/platformer/p1_walk01.png", "assets/platformer/p1_walk11.png");
  assets.platform = loadImage("assets/platformer/platform.png");
}

function createPlatform(x, y) {
  // Create a platform and position at the given x/y coordinates
  let platform = createSprite(assets.platform);
  platform.centerX = x;
  platform.centerY = y;

  // Add the created platform to the `platforms` group
  platforms.add(platform);
}

function createPlayer() {
  // Create the player sprite, add animations, and position on screen
  player = createSprite(assets.playerStanding);
  player.addImage("jumping", assets.playerJumping);
  player.addAnimation("walking", assets.playerWalking);
  player.centerX = 300;
  player.centerY = 300;

  // The player images (stand/jump/walk) are different sizes, which can make
  // collision checking more difficult. To make this easier, we define our
  // own collider box.
  player.setCollider("rectangle", 0, 0, 46, 92);

  // Set debug = true to show the player's collider box
  player.debug = false;

  // Add some custom properties on `player` to keep track of its physics:
  player.horizontalSpeed = 0;   // change in X position each frame
  player.verticalSpeed = 0;     // change in Y position each frame
  player.airtime = 0;           // how long the player has been in the air
}

function setup() {
  createCanvas(screenWidth, screenHeight);

  // call createPlayer() which sets up the player sprite
  createPlayer();

  // Turn on the camera so we can scroll
  camera.on();
  camera.position.x = player.centerX;

  // create `platforms` sprite group (this makes collision detections easier)
  platforms = createGroup();

  // call createPlatform() which also adds the created sprite to the group
  createPlatform(300, 460);
  createPlatform(450, 350);
  createPlatform(600, 460);
  createPlatform(810, 460);
}

function updatePlayerMovement() {
  /*
  For proper collision handling with our platforms, it's important to
  perform the following steps in order:

  1. Update horizontal/vertical speed when control keys are pressed
  2. Apply gravity and resistance
  3. Update horizontal position
  4. If touching a platform, stop horizontal movement
  5. Update vertical position
  6. If touching a platform, stop vertical movement

  It's important to update horizontal position and collision-checking
  BEFORE updating vertical movement. Otherwise the sprite will get "stuck"
  inside the platform.
  */

  // Step 1: Update horizontal/vertical speed when control keys are pressed
  if (keyIsDown(KEY.D)) {
    player.horizontalSpeed += ACCELERATION;
  }
  if (keyIsDown(KEY.A)) {
    player.horizontalSpeed -= ACCELERATION;
  }
  if (keyIsDown(KEY.SPACE) && player.airtime === 0) {
    player.verticalSpeed -= JUMP_FORCE;
  }

  // Step 2: apply gravity & resistance
  player.verticalSpeed += GRAVITY;
  player.horizontalSpeed *= RESISTANCE;

  // If horizontal speed is less than 1, set it to 0 to fully stop the player.
  // We use Math.abs() to get the absolute value, since it could be negative.
  if (Math.abs(player.horizontalSpeed) < 1) {
    player.horizontalSpeed = 0;
  }

  // Step 3: Update horizontal movement
  player.lastX = player.centerX;
  player.centerX += player.horizontalSpeed;

  // Step 4: If we're touching a platform, move sprite back to last
  //         X position and stop horizontal movement.
  if (player.isTouching(platforms)) {
    player.centerX = player.lastX;
    player.horizontalSpeed = 0;
  }

  // Step 5: Update vertical movement and check for platform collision
  player.airtime += 1;
  player.lastY = player.centerY;
  player.centerY += player.verticalSpeed;

  // Step 6: If we're touching a platform, move sprite back to last
  //         Y position and stop vertical movement.
  if (player.isTouching(platforms)) {
    player.centerY = player.lastY;
    player.verticalSpeed = 0;
    player.airtime = 0;
  }
}

function updatePlayerAppearance() {
  // Here we update the player's image/animation depending on its current state
  if (player.airtime > 0) {
    // If the player is in the air, use the jumping animation
    player.changeAnimation("jumping");
  } else if (player.horizontalSpeed !== 0) {
    // Otherwise, if the player has horizontal speed, use the walking animation
    player.changeAnimation("walking");
  } else {
    // Otherwise, use the normal (default) animation.
    player.changeAnimation("normal");
  }

  // Flip the sprite horizontally depending on our movement
  if (player.horizontalSpeed > 0) {
    player.mirrorX(1);
  } else if (player.horizontalSpeed < 0) {
    player.mirrorX(-1);
  }
}

function updateCamera() {
  /*
  Here we implement the simplest form of camera movement: player-locked.
  The camera is always positioned on the player.

  See the following links for some great articles on camera movement in 2D platformers:

  - https://www.samjhhu.com/2d-platformer-camera/
  - http://www.imake-games.com/cameras-in-2d-platformers/
  */

  camera.position.x = player.centerX;

  // if you have more height in your levels, you can also lock camera to the player vertically:
  //camera.position.y = player.centerY;
}

function draw() {
  background("darkblue");
  updatePlayerMovement();
  updatePlayerAppearance();
  updateCamera();
  drawSprites();
}
