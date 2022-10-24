let screenWidth = 1024;
let screenHeight = 600;

let assets = {};

let viking;



let score = 0;
let lives = 3;
let gameOver = false;
let gameStart = false;

let gravity = 4;

function preload() {
    // starting sprite images
    assets.viking = loadImage("assets/viking/walk_1.png")
    assets.bigAsteroid = loadImage("assets/spaceShooter/asteroid_big1.png");
    assets.laser = loadImage("assets/spaceShooter/laserBlue02.png");
    assets.background = loadImage("assets/Background/sky_cloud.png");
    
    // animations
    assets.vikingReady = loadAnimation(
        "assets/viking/ready_1.png", "assets/viking/ready_6.png");
    assets.vikingWalking = loadAnimation(
        "assets/viking/walk_1.png", "assets/viking/walk_6.png");
    assets.vikingJumping = loadAnimation(
        "assets/viking/jump_1.png", "assets/viking/jump_5.png");
    assets.vikingDeath = loadAnimation(
        "assets/viking/dead_1.png", 
        "assets/viking/dead_1.png", 
        "assets/viking/dead_1.png", 
        "assets/viking/dead_2.png", 
        "assets/viking/dead_2.png", 
        "assets/viking/dead_1.png", 
        "assets/viking/dead_2.png", 
        "assets/viking/dead_2.png", 
        "assets/viking/dead_4.png",
        "assets/viking/dead_4.png", 
        "assets/viking/dead_4.png",
        "assets/viking/dead_4.png", 
        "assets/viking/dead_4.png", 
        "assets/viking/dead_4.png", 
        "assets/viking/dead_4.png", 
        "assets/viking/dead_4.png",
        "assets/viking/dead_4.png", 
        "assets/viking/dead_4.png", 
        "assets/viking/dead_4.png",
        "assets/viking/dead_4.png");
  
    // sounds
    //assets.laserSound = loadSound("assets/spaceShooter/laser.wav");
    //assets.regularExplosionSound = loadSound("assets/spaceShooter/regular-explosion.wav");
    //assets.bigExplosionSound = loadSound("assets/spaceShooter/big-explosion.wav");
}


function setup() {
    createCanvas(screenWidth, screenHeight);
    
    viking = createSprite(assets.viking);
    viking.scale = 3;
    viking.bottom = screenHeight/2;
    viking.centerX = 100;
    viking.setSpeed(gravity);
    viking.setDirection(90);
    
    viking.setCollider("rectangle");
    
    viking.addAnimation("idle", assets.vikingReady);
    viking.addAnimation("walking", assets.vikingWalking);
    viking.addAnimation("jumping", assets.vikingJumping);
    viking.addAnimation("dying", assets.vikingDeath);

    viking.isDying = false;
    viking.isJumping = false;
    
    
    // predefine sprite Groups
    asteroids = createGroup();
    stars = createGroup();
    lasers = createGroup();
} //end setup

function resetGame() {
    score = 0;
    lives = 3;
    viking.centerX = screenWidth / 2;
    viking.isReady = true;
    asteroids.removeAll();
} //end resetGame




function vikingFinishedDying() {
    viking.changeAnimation("idle");
    viking.isDying = false;
    viking.isReady = true;
    lives--;
    if (lives === 0) {
        gameOver = true;
    }
}


function updateViking() {
    if (viking.isDying === false) {
        
        //movement
        if (keyIsDown(KEY.D)) {
            viking.isWalking = true;
            viking.changeAnimation("walking");
            viking.mirrorX(1);
            viking.centerX += 10;
        }
        else {
            viking.isWalking = false;
            viking.changeAnimation("idle");
        }
        if (keyIsDown(KEY.A)) {
            viking.changeAnimation("walking");
            viking.mirrorX(-1);
            viking.centerX -= 10;
        }
        else {
            viking.isWalking = false;
            viking.changeAnimation("idle");
        }
        //if (keyIsDown(KEY.W)) {
        //    viking.bottom -= 10;
        //}
        //if (keyIsDown(KEY.S)) {
        //    viking.bottom += 10;
        //}

        //jumping
        if (keyWentDown(KEY.SPACE)) {
            viking.changeAnimation("jumping");
            viking.setSpeed(0);
            viking.bottom -= 100;
        }


        //prevent going off-screen
        if (viking.left < 0) {
            viking.left = 0;
        }
        if (viking.right > screenWidth) {
            viking.right = screenWidth;
        }
        if (viking.top < 0) {
            viking.top = 0;
        }
        if (viking.bottom > screenHeight - 100) {
            viking.bottom = screenHeight - 100;
        }

        viking.overlap(asteroids, handleVikingAsteroidCollision);
    }
}



function cooldown(milliseconds) {
   var start = new Date().getTime();
   for (var i = 0; i < 1e7; i++) {
     if ((new Date().getTime() - start) > milliseconds){
       break;
     }
   }
}



function updateAsteroids() {
    if (frameCount % 60 === 0) {
        createAsteroid();
    }
    for (let asteroid of asteroids) {
        if (asteroid.top > screenHeight) {
            asteroid.remove();
        }
    }
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
  textSize(40);
  text("Press SPACE to begin!", screenWidth/2, screenHeight/2 + 100);
    
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

    updateViking();
    updateAsteroids();
    updateLasers();
    
    drawSprites();
    drawScoreBoard();
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

//END
