let screenWidth = 800;
let screenHeight = 650;

let assets = {};

let ship;
let asteroids;
let stars;
let lasers;

let score = 0;
let lives = 3;
let gameOver = false;
let gameStart = true;

function preload() {
    // images
    assets.ship = loadImage("assets/space/playerShip1_blue.png");
    assets.bigAsteroid = loadImage("assets/space/asteroid_big1.png");
    assets.star1 = loadImage("assets/space/star2.png");
    assets.laser = loadImage("assets/space/laserBlue02.png");
    assets.background = loadImage("assets/space/starfield.png");
    
    // animations
    assets.shipExplosion = loadAnimation(
        "assets/space/sonicExplosion00.png", "assets/space/sonicExplosion08.png");
    assets.asteroidExplosion = loadAnimation(
        "assets/space/regularExplosion00.png", "assets/space/regularExplosion08.png");
    assets.laserHit = loadAnimation(
        "assets/space/laserBlue08.png", "assets/space/laserBlue11.png");
  
    // sounds
    //assets.laserSound = loadSound("assets/space/laser.wav");
    //assets.asteroidExplosionSound = loadSound("assets/space/regular-explosion.wav");
    //assets.bigExplosionSound = loadSound("assets/space/big-explosion.wav");
}

function setup() {
    createCanvas(screenWidth, screenHeight);
    
    ship = createSprite(assets.ship);
    ship.bottom = screenHeight - 20;
    ship.centerX = screenWidth / 2;
    ship.setCollider("circle");
    ship.addAnimation("shipBoom", assets.shipExplosion);
    
    
    // Add a custom property to tell if the ship is exploding
    ship.isExploding = false;
    
    // create the sprite group for asteroids
    asteroids = createGroup();
  
    //create the sprite group for stars
    stars = createGroup();
    
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

    //add laser animation
    laser.addAnimation("bam", assets.laserHit);
}


function createAsteroid() {
    let asteroid = createSprite(assets.bigAsteroid);
    //randomize size of the asteroid
    asteroid.scale = random(0.7, 1.5);
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
    asteroid.addAnimation("asteroidBoom", assets.asteroidExplosion);
}

function createStar() {
    let star = createSprite(assets.star1);
    star.bottom = 0;
    star.centerX = random(0, screenWidth);
    star.setSpeed(random(1, 10));
    star.setDirection(90);

    stars.add(star);

}

function shipFinishedExploding() {
    ship.changeAnimation("normal");
    ship.isExploding = false;
    lives--;
    score = score - 100;
    if (lives === 0) {
        gameOver = true;
    }
}

function asteroidFinishedExploding(animation) {
    let asteroid = animation.sprite;
    asteroid.remove();
}

function laserHitAsteroid(animation) {
    let laser = animation.sprite;
    laser.remove();
}

function handleLaserAsteroidCollision(laser, asteroid) {
    // Don't collide if the asteroid is exploding
    if (asteroid.isExploding === false) {
        
        asteroid.changeAnimation("asteroidBoom");
        asteroid.isExploding = true;
        asteroid.animation.onComplete = asteroidFinishedExploding;

        laser.changeAnimation("bam");
        laser.animation.onComplete = laserHitAsteroid;
        //laser.remove();

        score = score +10;
        //assets.asteroidExplosionSound.play();
    }
}

function handleShipAsteroidCollision(ship, asteroid) {
    // only explode the ship if the asteroid is not exploding
    if (asteroid.isExploding === false) {
        asteroid.remove();
        ship.changeAnimation("shipBoom");
        ship.isExploding = true;
        ship.animation.onComplete = shipFinishedExploding;
        //assets.bigExplosionSound.play();
    }
}

function updateShip() {
    //below if statement prevents movement if ship is exploding
    if (ship.isExploding === false) {
      //below if statements define movement
        //move LEFT
        if (keyIsDown(KEY.D)) {
            ship.centerX += 10;
        }
        //move RIGHT
        if (keyIsDown(KEY.A)) {
            ship.centerX -= 10;
        }
        //move UP
        if (keyIsDown(KEY.W)) {
            ship.bottom -= 10;
        }
        //move DOWN
        if (keyIsDown(KEY.S)) {
            ship.bottom += 10;
        }


        // don't allow the ship to go out of bounds
        if (ship.left < 0) {
            ship.left = 0;
        }
        if (ship.right > screenWidth) {
            ship.right = screenWidth;
        }
        if (ship.top < 0) {
            ship.top = 0;
        }
        if (ship.bottom > screenHeight) {
            ship.bottom = screenHeight;
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

function updateStars() {
if (frameCount % 30 === 0) {
        createStar();
    }
    
    // Remove stars that go off-screen
    for (let star of stars) {
        if (star.top > screenHeight) {
            star.remove();
        }
    }
}

function updateAsteroids() {
    // Create an asteroid every 60th frame
    if (frameCount % 60 === 0) {
        createAsteroid();
    }
    
    // Remove asteroids that go off-screen
    for (let asteroid of asteroids) {
        if (asteroid.top > screenHeight) {
            asteroid.remove();
            score++;
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

function drawStartScreen() {
  background("black");
  textAlign(CENTER);
  fill("white");
  textSize(20);
  text("Shoot Asteroids to score points!",screenWidth/2, screenHeight/2 - 100);
  textSize(30);
  text("Move with A and D keys",screenWidth/2, screenHeight/2);
  textSize(30);
  text("Press SPACE to shoot",screenWidth/2, screenHeight/2 + 100);
  textSize(40);
  text("Press SPACE to begin!", screenWidth/2, screenHeight/2 + 200);
  
    
    if (keyWentDown(KEY.SPACE)) {
        resetGame();
        gameOver = false;
        gameStart = false;
    }
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
    updateStars();
    updateLasers();
    
    drawSprites();
    drawScoreBoard();
    
    showSpriteCount();
}


function draw() {
  if (gameOver === true) {
        drawGameOverScreen();  
  } else if (gameStart === true) {
        drawStartScreen();
  } else {
        drawGame();
    }
}