//---- MAIN OBJECTS
var fishy; // our player variable
var pinks; // will hold pink enemy fish
var jellies; // will hold jellyfish

//---- SEFCONDARY OBJECTS
var kelp1; //
var kelp2;
var bubbles; 

//---- GAME LOGISTICS + UI
var collectibles; // fish food for points ; 250 points = new heart ?
var diamonds; // powerup points
var lives = 3; // will hold lives --- did not use in final 
var score; // will hold score
var scene; // end game scene
var gameUi; // will load score on top of this

//---- GAME "PHYSICS"
var buffer = 30; // just a constant
var dy; // default y-coordinate
var jx; // jellyfish x
var px; // pink fish x
var py; // pink fish y
var cx; // coin x
var cy; // coin y

//---- Colors for background (https://p5js.org/examples/color-linear-gradient.html)
var b1, b2, c1, c2; // defined below

//----  SOUNDS
var collectsound; // sound when colect coin
var collectjewel; // sound when colect diamond
var zappy; // sound on death 
var delay; // to delay zapp sound
var pool; // underwater pool

//--- NEXT STEPS
// STATE CHANGE + DURATION IN A frame
// IF NOT OVERLAPPING BEFORE - Life
// ELSE NO CHANGE 

function preload() {
  //--- static images
  gameUi = loadImage("assets/Score.png"); 
  kelp1 = loadImage("assets/BGkelp.png"); 
  kelp2 = loadImage("assets/FGkelp.png"); 
  bubbles = loadImage("assets/bubbles.png"); 
  bubbles2 = loadImage("assets/bubbles2.png"); 
  heart = loadImage("assets/Life.png")
  //--- mp3 files
  soundFormats('ogg', 'mp3', 'wav');
  zappy = loadSound("sounds/electric.wav");
  pool = loadSound("sounds/pool.wav");  
  collectjewel = loadSound("sounds/ching.wav");
  collectsound = loadSound("sounds/coins.ogg"); // https://gamesounds.xyz/?dir=Kenney%27s%20Sound%20Pack/RPG%20Sounds/OGG  
}

//---- REQUIRED TO PLAY AUDIO
document.querySelector('button').addEventListener('click', function() {
  context.resume().then(() => {
    console.log('Playback resumed successfully');
  });
});

//---- SETUP
function setup() {
  createCanvas(600, 400);

  //-- sounds
  pool.loop();
  
  zappy.disconnect(); 
  delay = new p5.Delay();
  delay.process(zappy, .12, .7, 2300);
  delay.setType('lowpass'); // a stereo effect
  
  // setting BG gradient colors
  b1 = color(140, 237, 255);
  b2 = color(43, 110, 148);

  c1 = color(77, 98, 201);
  c2 = color(6, 10, 16);
  
  // setting score + scene
  score = 0;
  scene = 0; // defaults to start screen
  dy = -buffer;
  
  // create empty groups
  lives = new Group();
  pinks = new Group();
  jellies = new Group();
  collectibles = new Group();
  diamonds = new Group();

  // create player/ fishy
  resetSketch();
}

//---- RESETS SKETCH
function resetSketch(){
  scene = 0;
  // create player/ fishy
  fishy = createSprite(400,150);
  fishy.setDefaultCollider();
  fishy.addAnimation('swim','assets/Fishy1.png', 'assets/Fishy2.png','assets/Fishy1.png','assets/Fishy3.png');
}

//---- SWITCH BETWEEN GAME STATES
function draw() {
	if(scene == 0){
    startScreen();
  }else if(scene == 1){
  	gameOn();
  }else if(scene == 2){
  	gameOver()
  }	
}

//---- SET GRADIENT BACKGROUND
function setGradient(x, y, w, h, b1, b2) { // function will make gradient
  noFill();
  // Top to bottom gradient
  for (var i = y; i <= y + h; i++) {
      var inter = map(i, y, y + h, 0, 1);
      var b = lerpColor(b1, b2, inter);
      stroke(b);
      line(x, i, x + w, i);
    }
}

//---- START SCREEN
function startScreen(){
  setGradient(0, 0, windowWidth, 400, b1, b2); // Default BG
  image(bubbles, 0,0); 
  
  fill(255);
  textSize(36);
  textFont("Anton");
  textAlign(CENTER);
  text('WELCOME TO MY FISHY GAME', width / 2, height / 2);

  textSize(16);
  text('click to start', width / 2, height / 2 + 40);
  //resetSketch();
}

//---- GAME ON
function gameOn(){
  // Default BG if you do not collide with enemy
  setGradient(0, 0, windowWidth, 400, b1, b2); // setGradient(0, 0, windowWidth, 400, c1, c2, Y_AXIS); 
  // continuously create new jellyfish every random(50,200) frames
  if(frameCount%int(random(50,200))==0) { 
    jx = random(0,width-buffer);
    createJelly(jx, dy);
  }
  // continuously create new pink fish every random(100,150) frames
  if(frameCount%int(random(100,150))==0) {  
    px = random(-100,0);
    py = random(-height, height);
    createPinky(px, py); // pinks going to the right
  }
  // continuously create new pink fish every random(100,150) frames
  if(frameCount%int(random(200,350))==0) {  
    px = random(width,width+buffer);
    py = random(-height, height);
    createPinky2(px, py); // pinks going to the left
  }
  // generate coins for points!!!!!!!!!
  if(frameCount%int(random(100,290))==0) {  
    cx = random(0,width);   
    cy = random(0,-50);
    createCoin(cx, cy); // creating coints/fish food randomly all over screen
  }
  // generate diamonds for points!!!!!!!!!
  if(frameCount%int(random(500,1000))==0) {  
    cx = random(0,width);   
    cy = random(-10,-100);
    createDiamond(cx, cy); // creating coints/fish food randomly all over screen
  }
  // Player Movement on X-Axis
  if(mouseX < fishy.position.x - 10) {
    fishy.changeAnimation('swim');
    // flip horizontally
    fishy.mirrorX(-1);
    // negative x velocity: move left
    fishy.velocity.x = -2;
  } else if(mouseX > fishy.position.x + 10) {
    fishy.changeAnimation('swim');
    // unflip
    fishy.mirrorX(1);
    fishy.velocity.x = 2;
  } else {
    // if close to the mouse, don't move
    fishy.changeAnimation('swim');
    fishy.velocity.x = 0;
    fishy.velocity.y = 0;
  }
  // Player Movement on Y-Axis
  if(mouseY < fishy.position.y) {
    fishy.velocity.y = -2;
  } else {
    (mouseY > fishy.position.y) 
    fishy.velocity.y = 2;
  }

  //----INTERACTIONS----//
  //fishy.bounce(pinks); // fish bounces of pink fish
  fishy.overlap(jellies, Zap); 
  fishy.overlap(pinks, Push); 
  fishy.overlap(collectibles, coinCollect);
  fishy.overlap(diamonds, jewelCollect);

  //drawing the sprites
  image(bubbles, 0,0);
  image(kelp1, 14, 254);
  drawSprites();
  image(kelp2, 254, 245);

  // just for show --shrugs
  image(heart, 15, 15);
  image(heart, 40, 15);
  image(heart, 65, 15);

  // draw game UI at top of screen + draw score on top
  image(gameUi, 209, 0);
  fill(0);
  textSize(40);
  textFont("Nanum Pen Script");
  text(score, width/2, 30);
}
    
//---- GAME OVER
function gameOver(){ //----GAME OVER SCENE----//
  setGradient(0, 0, windowWidth, 400, c1, c2); 
  image(bubbles, 0,0);
  pool.pause(); // stop music
  textAlign(CENTER);

  fill(255);
  textSize(36);
  textFont("Anton");
  text('GAME OVER', width/2, 60);

  textSize(60);
  fill(194,251,255);
  textFont("Nanum Pen Script");
  text('You Got Zapped!', width/2, 150);

  fill(255);
  noStroke();
  textSize(32);
  textFont("Anton");
  text(' ' + score + ' ', width/2,200);
  textSize(20);
  text('score', width/2,220);
  //text('You scored '+ score + " points!" , width/2, 150);
  textSize(16);
  text('click to play again', width / 2, height / 2 + 60);
} 

//---- GO BETWEEN GAME SCREENS
function mousePressed(){
	if(scene==0){
  	scene = 1;
  }else if(scene==2){
    scene = 1;
    score = 0;
  }
}

//----INTERACTION FUNCTIONS----//
function Zap(Jelly, fish) {
  fill(255);
  zappy.play();
  //console.log("YOU GOT ZAPPED!");
  scene = 2; 
}

function Push(Pink, fish) { // lose coins when interacting with fat fish
  fill(255);
  score = score - 1;
  console.log("You lost some coins!" + score);
  //scene += 2; 
}

function coinCollect(fishy, Coin) {
  Coin.remove();
  collectsound.play();
  score +=1;
  console.log(score);  
}

function jewelCollect(fishy, Diamond) { // score multiplier x 2
  Diamond.remove();
  collectjewel.play();
  score = (score + 20);
  console.log(score);  
}
//----OBJECT CREATION----//
function createDiamond(x,y) { // create powerup
  var newJewel = createSprite(x,y);
  newJewel.addAnimation('floating', 'assets/Diamond1.png', 'assets/Diamond2.png', 'assets/Diamond1.png');
  // speed intervals 
  newJewel.setSpeed(0.08); 
  newJewel.setVelocity(random(-.5,.5), random(1,.5)); 
  // collision box
  newJewel.setDefaultCollider();
  // add to group
  diamonds.add(newJewel);
}

function createCoin(x, y) { // create coin at given X,Y 
  var newCoin = createSprite(x,y);
  newCoin.addAnimation('floating', 'assets/food1.png', 'assets/food2.png');
  // speed intervals 
  newCoin.setSpeed(0.05); 
  newCoin.setVelocity(random(-0.5,0.3), random(0,.5)); 
  // collision box
  newCoin.setDefaultCollider();
  // add to group
  collectibles.add(newCoin);
  //return newCoin
}

function createJelly(x, y) { // create Jellyish at given X,Y
  var newJelly = createSprite(x,y);
  newJelly.addAnimation('floating','assets/Jelly2.png','assets/Jelly1.png');
  // speed intervals 
  newJelly.setSpeed(0.25); 
  newJelly.setVelocity(random(-0.8,1), random(1.2,1.8)); 
  // collision box
  newJelly.setDefaultCollider();
  // add to group
  newJelly.addToGroup(jellies);  
  //console.log("There are" + jellies.length + "jellies");
  // return newJelly;
}

function createPinky(x, y) { // create pink fish at given X,Y going right
  var newPink = createSprite(x,y);
  newPink.addAnimation('assets/Pinky1.png', 'assets/Pinky2.png','assets/Pinky3.png');
  // speed intervals 
  newPink.setSpeed(0.8); 
  newPink.setVelocity(random(0.6,0.8), random(1.2,0.8)); 
  // collider
  newPink.setDefaultCollider();
  // add to group
  pinks.add(newPink); 
  return newPink;
}

function createPinky2(x, y) { // create pink fish at given X,Y going left
  var newPink = createSprite(x,y);
  newPink.addAnimation('assets/Pinky1.png', 'assets/Pinky2.png','assets/Pinky3.png');
  //flip horizontally
  newPink.mirrorX(-1);
  // speed intervals -- becomes update
  newPink.setSpeed(0.05); 
  newPink.setVelocity(random(-1,-2), random(-1.2,-1.8)); 
  // collider
  newPink.setDefaultCollider();
  // add to group
  pinks.add(newPink); 
  return newPink;
}