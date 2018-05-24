// The shark experience gravity continuously
// The shark experiences fluid resistance when in "water"

// Shark
var shark;

// Shark images
var i = 0;
var shimage = [];

// Background
var back;
var back1;
var timecounter = 20;
var scroll = 0;
var scrollcounter = 0;

// Moving coin
var coin;

// Liquid
var liquid;
var index = 0;
var indexfifty = 0;

function preload() {
    mySound = loadSound('Water-splashing-sound-effect.mp3');
    coinSound = loadSound('coin.mp3');
    
    shimage = [1, 2, 3, 4, 5].map(function(i){return loadImage(i + ".png")});
    back = loadImage("back.png");
    back1 = loadImage("back1.png");
}

//has the player started the game
var isPlaying;

var gameOver;

// Track player score
var score;   


function setup() {
    var canvas = createCanvas(640, 540 );
    canvas.parent('myCanvas');
    reset();
    img = loadImage('sharklogo_greencircle_5-9rewor.png');
    
    w = width+16;
    dx = (TWO_PI / period) * xspacing;
    yvalues = new Array(floor(w/xspacing));

    // Create liquid object
    liquid = new Liquid(0, 360, width, height*2/5, 0.1);
}

function draw() {
    background(223, 230, 232);
    
    image(back, -scroll, 0);
    image(back1, -scroll + back.width, 0);
    scrollcounter = scrollcounter + 1;
    if (scrollcounter > 5){
        scrollcounter = 0;
        scroll = scroll + 1;
    }
    
    if (scroll > back.width){
            scroll = 0;
    }

    // Draw water
    liquid.display();

    //draw the score
    drawScore();
    
    //background(0);
    calcWave();
    renderWave();

    //if the game is in progress, run it
    if (isPlaying){
        // Is the Mover in the liquid?
        if (liquid.contains(shark)) {
            // Calculate drag force
            var dragForce = liquid.calculateDrag(shark);
            // Apply drag force to Mover
            shark.applyForce(dragForce);
        }

        // Gravity is scaled by mass here!
        var gravity = createVector(0, 0.1*shark.mass);

        // Apply gravity
        shark.applyForce(gravity);

        // Update and display
        shark.update();
        coin.update();

        shark.display();
        coin.display();

        shark.checkEdges();
        coin.checkColision();
        
        var xCenter = (shark.position.x)/2;
        var yCenter = (shark.position.y)/2;
        
        var d = dist( shark.position.x + 10, shark.position.y + 38, coin.position.x, coin.position.y);
            indexfifty = (indexfifty + 1) % (shimage.length * timecounter);
        
        if( d < 5 + 30) {
            coin = new Coin(600, random(10, 350));
            coinSound.setVolume(0.5);
            coinSound.play();
            score++;
        }
        
        
    }
    //otherwise display the start screen
    else if (gameOver){
        displayGameOver();
    }
    else{
        displayStart();
    }
}

var xspacing = 13;    // Distance between each horizontal location
var w;                // Width of entire wave
var theta = 0.0;      // Start angle at 0
var amplitude = 10.0; // Height of wave
var period = 500.0;   // How many pixels before the wave repeats
var dx;               // Value for incrementing x
var yvalues;  // Using an array to store height values for the wave



function calcWave() {
  // Increment theta (try different values for 
  // 'angular velocity' here
  theta += 0.02;

  // For every x value, calculate a y value with sine function
  var x = theta;
  for (var i = 0; i < yvalues.length; i++) {
    yvalues[i] = sin(x)*amplitude;
    x+=dx;
  }
}

function renderWave() {
  noStroke();
  fill(255);
  // A simple way to draw the wave with an ellipse at each location
  for (var x = 0; x < yvalues.length; x++) {
    ellipse(x*xspacing, 360+yvalues[x], 13, 13);
  }
}

function drawScore(){
    strokeWeight(235, 244, 247);
    fill(020);
    textSize(36);
    text("score: " + score, 50, 50);
}

function displayStart(){
    //draw title & instructions
    strokeWeight(2);
    fill(020);
    textSize(48);
    text("Shark Bait", 200, 100);
    textSize(36);
    text("Press Any Key to Start", 140, 148);
    image(img, 235, 165);
}

function displayGameOver(){
    strokeWeight(2);
    fill(020);
    textSize(48);
    text("Game Over :(", 180, 100);
}

function gameOver(){
    gameOver = true;
    isPlaying = false;
}

function keyPressed() {  
    if (isPlaying){
        var boost;
        if (liquid.contains(shark)) {
            boost = createVector(0, -12*shark.mass);
            shark.applyForce(boost);
        } else {
            boost = createVector(0, -6*shark.mass);
            shark.applyForce(boost);
        }
    }
    else {
        mySound.setVolume(0.1);
        mySound.play();
        isPlaying = true;
    }
}

function mousePressed() {
    if (i > 2) i = 0;
    coin = new Coin(600, random(10, 530));
}

//var intervalHandle = setInterval(makeCoin,1000);

// Restart all the Mover objects randomly
function reset() {
    shark = new Shark(3, 320, 0);
    coin = new Coin(600,random(10, 530));
    score = 0;
    isPlaying = false;
    gameOver = false;
}

var Liquid = function(x, y, w, h, c) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.c = c;
};

// Is the Mover in the Liquid?
Liquid.prototype.contains = function(m) {
    var l = m.position;
    return l.x > this.x && l.x < this.x + this.w &&
         l.y > this.y && l.y < this.y + this.h;
};

// Calculate drag force
Liquid.prototype.calculateDrag = function(m) {
    // Magnitude is coefficient * speed squared
    var speed = m.velocity.mag();
    var dragMagnitude = this.c * speed * speed;

    // Direction is inverse of velocity
    var dragForce = m.velocity.copy();
    dragForce.mult(-1);

    // Scale according to magnitude
    //dragForce.setMag(dragMagnitude);
    dragForce.normalize();
    dragForce.mult(dragMagnitude);
    return dragForce;
};

Liquid.prototype.display = function() {
    noStroke();
    fill(144, 195, 212);
    rect(this.x, this.y, this.w, this.h);
};

function Shark(m,x,y) {
    this.mass = m;
    this.position = createVector(x,y);
    this.velocity = createVector(0,0);
    this.acceleration = createVector(0,0);
}

// Newton's 2nd law: F = M * A
// or A = F / M
Shark.prototype.applyForce = function(force) {
    var f = p5.Vector.div(force,this.mass);
    this.acceleration.add(f);
};

Shark.prototype.update = function() {
    // Velocity changes according to acceleration
    this.velocity.add(this.acceleration);
    // position changes by velocity
    this.position.add(this.velocity);
    // We must clear acceleration each frame
    this.acceleration.mult(0);
};

Shark.prototype.display = function() {
    stroke(0);
    strokeWeight(2);
    fill(200);
    //ellipse(this.position.x + 90,this.position.y + 38, this.mass*16, this.mass*16);
    //rect(this.position.x,this.position.y, 133, 76);
    index = Math.floor(indexfifty/timecounter);
    image(shimage[index], this.position.x-70,this.position.y);
};

function Coin(x,y) {
    this.position = createVector(x,y);
    this.velocity = createVector(0,0);
}

Coin.prototype.update = function() {
    // position changes by velocity
    this.position.sub(4, 0);
};

Coin.prototype.display = function() {
    stroke(0);
    strokeWeight(2);
    fill(255,127);
    ellipse(this.position.x,this.position.y,10,10);
};

// Bounce off bottom of window
Shark.prototype.checkEdges = function() {
    if (this.position.y >= (height - this.mass*8 - 45)) {
        // A little dampening when hitting the bottom
        this.velocity.y *= -0.9;
        this.position.y = (height - this.mass*8 - 45);
    } else
    if (this.position.y <= -5) {
        this.velocity.y *= -0.9;
        this.position.y = -5;
    }
};

Coin.prototype.checkColision = function() {
//    if (Math.abs(shark.postion.x - this.position.x) <= 10 && Math.abs(shark.postion.y - this.position.y) <= 15) {
//        reset();
//    }
    if (this.position.x < 0) {
        coin = new Coin(600,random(10, 530));
    }
//    hit = collideCircleCircle(shark.position.x, shark.position.y, 48, this.position.x, this.position.y, 10);

//    if (hit == 1) {
//        coin = new Coin(600, random(10, 350));
//    }
}
