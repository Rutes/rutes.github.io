let screenWidth = 800;
const screenHeight = 600;

let assets = {};

let ship;
let asteroids;
let lasers;

let score = 0;
let lives = 3;
let gameOver = false;

function preload() {
    // images
    assets.ship = loadImage("assets/space/playerShip1_blue.png");
    assets.bigAsteroid = loadImage("assets/space/asteroid_big1.png");
    assets.laser = loadImage("assets/space/laserBlue01.png");
    assets.background = loadImage("assets/space/starfield.png");
    
    // animations
    assets.sonicExplosion = loadAnimation(
        "assets/space/sonicExplosion00.png", "assets/space/sonicExplosion08.png");
    assets.regularExplosion = loadAnimation(
        "assets/space/regularExplosion00.png", "assets/space/regularExplosion08.png");
    
    // sounds
    //assets.laserSound = loadSound("assets/space/laser.wav");
    //assets.regularExplosionSound = loadSound("assets/space/regular-explosion.wav");
    //assets.bigExplosionSound = loadSound("assets/space/big-explosion.wav");
}

function setup() {
    createCanvas(screenWidth, screenHeight);
    
    ship = createSprite(assets.ship);
    ship.bottom = screenHeight - 20;
    ship.centerX = screenWidth / 2;
    ship.setCollider("circle");
    ship.addAnimation("explosion", assets.sonicExplosion);
    
    // Add a custom property to tell if the ship is exploding
    ship.isExploding = false;
    
    // create the sprite group for asteroids
    asteroids = createGroup();
    
    // create the sprite group for lasers
    lasers = createGroup();
}

function resetGame() {
    // re-set score, lives, and ship position
    score = 0;
    lives = 3;
    ship.centerX = screenWidth / 2;
    
    // remove all asteroids
    asteroids.removeAll();
}

function createLaser() {
    let laser = createSprite(assets.laser);
    lasers.add(laser);
    
    // position the bottom of the laser at the top of the ship
    laser.bottom = ship.top;
    laser.centerX = ship.centerX;
    
    // make the laser shoot straight up
    laser.setSpeed(20);
    laser.setDirection(270);
    
    //assets.laserSound.play();
}

function createAsteroid() {
    let asteroid = createSprite(assets.bigAsteroid);
    asteroid.bottom = 0;
    asteroid.centerX = random(0, screenWidth);
    asteroid.setSpeed(random(1, 10));
    asteroid.setDirection(random(60, 120));
    asteroid.rotationSpeed = random(-2, 2);
    asteroid.setCollider("circle");
    
    // Add a custom property to tell if the asteroid is exploding
    asteroid.isExploding = false;
    
    // Add the newly created asteroid to the sprite group
    asteroids.add(asteroid);
    
    // Add the explosion animation
    asteroid.addAnimation("explosion", assets.regularExplosion);
}

function shipFinishedExploding() {
    ship.changeAnimation("normal");
    ship.isExploding = false;
    lives--;
    if (lives === 0) {
        gameOver = true;
    }
}

function asteroidFinishedExploding(animation) {
    let asteroid = animation.sprite;
    asteroid.remove();
}

function handleLaserAsteroidCollision(laser, asteroid) {
    // Don't collide if the asteroid is exploding
    if (asteroid.isExploding === false) {
        laser.remove();
        asteroid.changeAnimation("explosion");
        asteroid.isExploding = true;
        asteroid.animation.onComplete = asteroidFinishedExploding;
        score++;
        //assets.regularExplosionSound.play();
    }
}

function handleShipAsteroidCollision(ship, asteroid) {
    // only explode the ship if the asteroid is not exploding
    if (asteroid.isExploding === false) {
        asteroid.remove();
        ship.changeAnimation("explosion");
        ship.isExploding = true;
        ship.animation.onComplete = shipFinishedExploding;
        //assets.bigExplosionSound.play();
    }
}


function updateShip() {
    // don't allow ship control or collisions while it is exploding
    if (ship.isExploding === false) {
        if (keyIsDown(KEY.D)) {
            ship.centerX += 10;
        }
        if (keyIsDown(KEY.A)) {
            ship.centerX -= 10;
        }

        // don't allow the ship to go out of bounds
        if (ship.left < 0) {
            ship.left = 0;
        }
        if (ship.right > screenWidth) {
            ship.right = screenWidth;
        }

        // Check for collisions between the ship and asteroids
        ship.overlap(asteroids, handleShipAsteroidCollision);
    }
}

function updateLasers() {
    // fire a laser if the space key went down
    if (keyWentDown(KEY.SPACE) && ship.isExploding === false) {
        createLaser();
    }
    
    // check each laser and remove if it goes off screen
    for (let laser of lasers) {
        if (laser.bottom < 0) {
            laser.remove();
        }
    }
    
    // Check for collisions between lasers and asteroids
    lasers.overlap(asteroids, handleLaserAsteroidCollision);
}

function updateAsteroids() {
    // Create an asteroid every 60th frame
    if (frameCount % 60 == 0) {
        createAsteroid();
    }
    
    // Remove asteroids that go off-screen
    for (let asteroid of asteroids) {
        if (asteroid.top > screenHeight) {
            asteroid.remove();
        }
    }
}

function showSpriteCount() {
     textSize(24);
     fill("white");
     text(`sprite count: ${allSprites.length}`, 10, screenHeight - 10);
}

function drawScoreBoard() {
    textSize(24);
    fill("white");
    text(`Score: ${score} / Lives: ${lives}`, 24, 40);
}

function drawGameOverScreen() {
    background("black");
    textAlign(CENTER);
    fill("white");
    textSize(40);
    text("GAME OVER", screenWidth/2, screenHeight/2);
    textSize(20);
    text("Press SPACE to try again!", screenWidth/2, screenHeight/2 + 100);
    
    if (keyWentDown(KEY.SPACE)) {
        resetGame();
        gameOver = false;
    }
}

function drawGame() {
    image(assets.background, 0, 0, screenWidth, screenHeight);
    
    // update sprites
    updateShip();
    updateAsteroids();
    updateLasers();
    
    drawSprites();
    drawScoreBoard();
    
    showSpriteCount();
}

function draw() {
    if (gameOver === true) {
        drawGameOverScreen();
    } else {
        drawGame();
    }
}
