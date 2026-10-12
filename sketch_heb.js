// based on https://openprocessing.org/sketch/924707

let torusTexture;
// let message = "PCD@TLV@29.10@18:00@";
let message = "@PCD@TLV";
let bg_message = "× פרוססינג דיי ת״א × פרוססינג דיי ת״א";
// let bg_message = "ABC";
let messageWidth;
// const CYCLE = 20; // higher is slower
let textColor = "#D4B2FE";
let torusColor = "#2B13C5";
// let backgroundColor = "#5501A4";
let textPtSize = 50;
let textBgSize = 100;
let radius = 135;
let tubeRadius = 75;

const SCROLL_SPEED_X = 1.7;  // pixels per frame
const SCROLL_SPEED_Y = 1.5;
const ROW_COUNT = 9; // choose so rows fill height evenly
const TORUS_FONT_WEIGHT = 700;
const COLUMN_GAP_PX = 0; // extra space between repeated message tiles

const BG_FONT_WEIGHT = 500;
const BG_SCROLL_SPEED_X = 1;  // pixels per frame for background rows
const BG_LINE_GAP_PX = 12;    // vertical space between background rows
const BG_TOP_MARGIN_PX = 5;  // y of the first background row
const BG_TILE_GAP_PX = 0;     // extra space between repeated bg_message tiles

function preload() {
  // myFont = loadFont("rag_typeface_/RAG_GottliebVF.ttf");

  loadFont(
        "rag_typeface_/RAG_GottliebVF.ttf",
        () => {},
        () => {},
        "Gottlieb"
    );

    loadFont(
      "rag_typeface_/RAG_GottliebVF.ttf",
      () => {},
      () => {},
      "GottliebBG"
  );

  bg = loadImage("bg.png");
}

function setup() {
  // createCanvas(windowWidth, windowHeight,WEBGL);
  // 1080 x 1350
  let screenScale = 2;
  createCanvas(1080/screenScale, 1350/screenScale, WEBGL);
  pixelDensity(4); // set once here: saveGif() drops to density 1 while recording, so draw() must not reset it
  // torusTexture = createGraphics(width,height); // this looks better on a plane
  torusTexture = createGraphics(2 * PI * radius, 2 * PI * tubeRadius); // this looks better on the torus
  torusTexture.fill(textColor);
  // note: if i use radius & tubeRadius, i probably need to adapt r as well
  

  backgroundGraphics = createGraphics(width, height);
  backgroundGraphics.textAlign(LEFT, TOP);
  backgroundGraphics.fill(255);
  



}

function draw() {
  noStroke();
  background(242, 243, 255);
  
  drawInterleavedBackgroundRows(backgroundGraphics);



  push();
  translate(0, 0, -180);
  texture(backgroundGraphics);
  plane(width, height);
  pop();


  // 'camera' angle
  // debugMode();
  orbitControl()
  // or - sliders...
  // or - https://stackoverflow.com/questions/68242398/how-to-return-the-camera-position-in-p5js
  rotateX(-PI / 4);
  rotateY(-PI / 8);
  rotateZ(-PI / 8);

  let r = min(width, height) * 0.2;
  // center the graphics on canvas
  translate(-r / 2, 0, 0);

  texture(torusTexture);
  // 1st torus
  textTexture(torusTexture, true); // true is animate inwards

  push();
  rotateZ(1.1);
  torus(r, r * 0.5, 100, 100);
  pop();

  // 2nd torus
  translate(r, 0, 0);
  textTexture(torusTexture, false);
  rotateX(PI / 4); // create the interlock position
  torus(r, r * 0.45, 100, 100);

  resetMatrix(); // Reset transformation matrix to draw 2D elements
}

/** Fills the buffer top-to-bottom with rows of bg_message; even rows scroll left, odd rows scroll right. */
function drawInterleavedBackgroundRows(graphics) {
  graphics.background(0);
  graphics.textFont("GottliebBG", textBgSize, { wght: BG_FONT_WEIGHT });

  const tileWidth = graphics.textWidth(bg_message) + BG_TILE_GAP_PX;
  if (!tileWidth) return; // font not ready yet
  const rowHeight = textBgSize + BG_LINE_GAP_PX;

  for (let rowIndex = 0; BG_TOP_MARGIN_PX + rowIndex * rowHeight < graphics.height; rowIndex++) {
    const isEvenRow = rowIndex % 2 === 0;
    const direction = isEvenRow ? -1 : 1;
    const phaseOffset = isEvenRow ? 0 : tileWidth / 2; // stagger odd rows by half a tile
    const rowY = BG_TOP_MARGIN_PX + rowIndex * rowHeight;

    // wrap into [-tileWidth, 0] so tiles always cover the left edge
    let startX = (direction * frameCount * BG_SCROLL_SPEED_X - phaseOffset) % tileWidth;
    if (startX > 0) startX -= tileWidth;

    // repeat the message until the row reaches the right edge
    for (let tileX = startX; tileX < graphics.width; tileX += tileWidth) {
      graphics.text(bg_message, tileX, rowY);
    }
  }
}

/** Applies Gottlieb + color on the 2D texture buffer (must match measure + draw). */
function applyTorusTextStyle(graphics) {
  graphics.textAlign(LEFT, TOP);
  // graphics.textFont("Gottlieb", textPtSize, { wght: TORUS_FONT_WEIGHT });
  
}

/** Horizontal tile period for the scrolling grid (measure after font is active). */
function measureMessageStepPx(graphics) {
  applyTorusTextStyle(graphics);
  const advanceWidth =
    graphics.textWidth(message) || graphics.measureText(message).width;
  return Math.ceil(advanceWidth + COLUMN_GAP_PX);
}


  function textTexture(graphics, animateBothAxes) {
  let xstep = measureMessageStepPx(graphics);
  messageWidth = xstep;
  if (!xstep) console.warn("message step is 0 — font may not be loaded yet");
  let ystep = graphics.height / ROW_COUNT; // exact vertical period

  let offsetX = animateBothAxes ? -(frameCount * SCROLL_SPEED_X) : 0;
  let offsetY = animateBothAxes ? -(frameCount * SCROLL_SPEED_Y) : -(frameCount * SCROLL_SPEED_Y);
    
  offsetX = offsetX % xstep;
  offsetY = offsetY % ystep;
  if (offsetX > 0) offsetX -= xstep;
  if (offsetY > 0) offsetY -= ystep;

  graphics.background(torusColor);
  applyTorusTextStyle(graphics);

// text on torus
  let count = 0;
  for (let x = offsetX; x < graphics.width; x += xstep) {
    for (let y = offsetY; y <= graphics.height; y += ystep) {
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
