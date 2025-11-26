let socket;
let dots = [];

function setup() {
  createCanvas(windowWidth, windowHeight);
  background(255); // white background
  socket = io();
  socket.on("paint", (data) => {
    dots.push({ 
      x: data.x * width, 
      y: data.y * height, 
      life: 255 
    });
  });
}

function draw() {
  background(255, 230); // white with slight fade
  
  noStroke();
  
  // Draw black dots
  for (let i = dots.length - 1; i >= 0; i--) {
    let d = dots[i];
    fill(0, 0, 0, d.life); // black paint
    ellipse(d.x, d.y, 30, 30);
    
    d.life -= 2; // fade out
    if (d.life <= 0) {
      dots.splice(i, 1); // remove faded dots
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}