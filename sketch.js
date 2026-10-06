// based on https://openprocessing.org/sketch/924707

let torusTexture;
let message = " PCD@TLV@29.10@18:00@ ";
let messageWidth;
// const CYCLE = 20; // higher is slower
let textColor = "#D4B2FE";
let torusColor = "#2B13C5";
let backgroundColor = "#5501A4";
let textPtSize = 40;
// let leading = 9.2;
let radius = 135;
let tubeRadius = 75;

const SCROLL_SPEED_X = 1.7;  // pixels per frame
const SCROLL_SPEED_Y = 1.5;
const ROW_COUNT = 9; // choose so rows fill height evenly

function preload() {
  myFont = loadFont("BBHBartle-Regular.ttf");
  bg = loadImage("bg.png");
  

}

function setup() {
  // createCanvas(windowWidth, windowHeight,WEBGL);
  // 1080 x 1350
  let screenScale = 1;
  createCanvas(1080/screenScale, 1350/screenScale, WEBGL);
  // torusTexture = createGraphics(width,height); // this looks better on a plane
  torusTexture = createGraphics(2 * PI * radius, 2 * PI * tubeRadius); // this looks better on the torus
  // note: if i use radius & tubeRadius, i probably need to adapt r as well
  texture(torusTexture);
  textSize(textPtSize);
  textFont(myFont);

  bg.resize(width*2,height*2);

  messageWidth = textWidth(message);
  // note: If messageWidth is measured in the main canvas but text is drawn on torusTexture, or if it’s undefined on early frames, column spacing can be wrong and make jumps worse.
}

function draw() {
  noStroke();
  background(backgroundColor);
  push();
  translate(0, 0, -180);
  image(bg,-width,-height);
  
  pop();
  
  pixelDensity(4); // this gives even more resolution

  let r = min(width, height) * 0.2;

  // plane(width,height); // for debug i used this

  // 'camera' angle
  // debugMode();
  orbitControl()
  // or - sliders...
  // or - https://stackoverflow.com/questions/68242398/how-to-return-the-camera-position-in-p5js
  rotateX(-PI / 4);
  rotateY(-PI / 8);
  rotateZ(-PI / 8);

  // center the graphics on canvas
  translate(-r / 2, 0, 0);


  // 1st torus
  textTexture(torusTexture, true); // true is animate inwards

  push();
  rotateZ(1.1);
  torus(r, r * 0.5, 100, 100);
  // torus(radius, tubeRadius);
  pop();

  // 2nd torus
  translate(r, 0, 0);
  
  // push();
  // rotateZ(1.00001);
  textTexture(torusTexture, false);
  // pop();
  // separateGrid(10, 10, 100, 100, 10, torusTexture);

  rotateX(PI / 4); // create the interlock position
  // fill('blue'); // see what happens when uncommented - why?

  torus(r, r * 0.45, 100, 100);
  // torus(radius, tubeRadius);

  resetMatrix(); // Reset transformation matrix to draw 2D elements
}

// function textTexture(graphics, offX) {
  function textTexture(graphics, animateBothAxes) {
  // offX true is animate inwards, false is animate along torus
  
  let xstep = messageWidth; // using text width output

  // let ystep = (graphics.height-textPtSize)/leading;
    let ystep = graphics.height / ROW_COUNT; // exact vertical period
  // or
  // let ystep = textPtSize*0.9;
  // console.log(textPtSize*0.9)

  // let frameRatio = (frameCount % CYCLE) / CYCLE;
  // note: When frameCount hits a multiple of CYCLE, frameRatio snaps from ~1 back to 0. The texture offset jumps in one frame — that’s the visible jump.
  // let offsetX = offX == true ? -frameRatio * xstep/4 : 0; // /4 for slower animation
  // // Note: Moving only xstep/4 per cycle means you never scroll one full tile width. The pattern doesn’t line up with itself at the end of the cycle, so the reset is more obvious.
  // let offsetY = offX == false ? -frameRatio * ystep : 0;


  // test to fix snap:
  // Continuous scroll — no frameCount % CYCLE reset
  let offsetX = animateBothAxes ? -(frameCount * SCROLL_SPEED_X) : 0;
  let offsetY = animateBothAxes ? -(frameCount * SCROLL_SPEED_Y) : -(frameCount * SCROLL_SPEED_Y);
    
  offsetX = offsetX % xstep;
  offsetY = offsetY % ystep;
  if (offsetX > 0) offsetX -= xstep;
  if (offsetY > 0) offsetY -= ystep;

  
  graphics.background(torusColor); // see what happens when uncommented - why?
      graphics.textAlign(LEFT, TOP); // avoids baseline clipping at y = 0


// text on torus
  let count = 0;
  for (let x = offsetX; x < graphics.width; x += xstep) {
    for (let y = offsetY; y <= graphics.height; y += ystep) {
      graphics.fill(textColor);
      graphics.textSize(textPtSize);
      graphics.textFont(myFont);
      graphics.text(message, x, y);
      // console.log(textWidth(message)) // debug

      // torus seam wrap: off-top rows reappear at bottom, and vice versa
      if (y < 0) {
        graphics.text(message, x, y + graphics.height);
      }
      if (y + textPtSize > graphics.height) {
        graphics.text(message, x, y - graphics.height);
      }
    }
    count++;
  }
}

function keyTyped() {
  // see example: https://editor.p5js.org/ronyginosar/sketches/mjLit_67t
  if (key === "s") {
    saveCanvas("myPoster.png");
  }

  if (key == "g") {
    saveGif("myGif.gif", 1);
  }
}
