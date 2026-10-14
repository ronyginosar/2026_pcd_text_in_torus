let infobartext = "למה אתה תמיד יושב על נקודות";

let bg_message = "29.10 × 18:00 × פרוססינג דיי ת״א × ";
let backgroundColor = "#F2F3FF";
let backgroundTextColor = "#291B85";
let textBgSize = 100;
let zPushback = -180; // pushes the background plane away from the camera

let img_size = 450;
let margins = 50;

const BG_FONT_WEIGHT = 500;
const BG_SCROLL_SPEED_X = 1;  // pixels per frame for background rows
const BG_LINE_GAP_PX = 12;    // vertical space between background rows
const BG_TOP_MARGIN_PX = 5;  // y of the first background row
const BG_TILE_GAP_PX = 0;     // extra space between repeated bg_message tiles

const INFO_BAR_WIDTH = 450;   // blue name bar under the profile image
const INFO_BAR_HEIGHT = 200;
const INFO_TEXT_SIZE = 50;
const INFO_TEXT_Z_OFFSET = 1; // lifts the text slightly in front of the bar to avoid z-fighting

let myFont;
let profile_img;
let backgroundGraphics; // offscreen buffer for the scrolling background rows
let infoGraphics;       // offscreen buffer for the info bar text

/** Loads the fonts and the profile image; "Gottlieb" is registered as a CSS variable font by p5.variableFont. */
function preload() {

  myFont = loadFont("BBHBartle-Regular.ttf");

  loadFont(
        "rag_typeface_/RAG_GottliebVF.ttf",
        () => {},
        () => {},
        "Gottlieb"
    );

  profile_img = loadImage('presenter_images/eyal.jpg');
}

/** Creates the canvas and the offscreen buffers for the background and info bar. */
function setup() {
  let screenScale = 2;
  createCanvas(1080/screenScale, 1350/screenScale, WEBGL);
  // always export at 1080×1350 (Instagram feed), whatever the display's pixel density
  if (typeof Recorder !== "undefined") Recorder.configure({ exportPixelDensity: screenScale });

  // resize once here instead of every frame
  profile_img.resize(img_size, 0);

  backgroundGraphics = createGraphics(width*3, height*3);
  backgroundGraphics.textAlign(LEFT, TOP);
  backgroundGraphics.fill(backgroundTextColor);

  // buffer matches the bar so the text can be centered on it
  infoGraphics = createGraphics(INFO_BAR_WIDTH, INFO_BAR_HEIGHT);
  infoGraphics.textAlign(CENTER, CENTER);
}

/** Draws the scrolling background plane, then the profile image and the info bar on top. */
function draw() {
  noStroke();
  background(backgroundColor);
  drawInterleavedBackgroundRows(backgroundGraphics);

  push();
  translate(0, 0, zPushback);
  texture(backgroundGraphics);
  plane(width*2, height*2);
  pop();

  
  // center the graphics on canvas
  translate(-(width-img_size) / 2 , -(height-img_size)/2 , 0);

  imageMode(CENTER);
  profile_img.resize(img_size, 0);
  image(profile_img, margins, margins);

  const infoBarY = height - img_size + margins*1.8 ;
  rectMode(CENTER);
  fill(backgroundTextColor);
  rect(margins, infoBarY, INFO_BAR_WIDTH, INFO_BAR_HEIGHT);

  // redraw the label fresh each frame (clear() keeps the buffer transparent)
  infoGraphics.clear();
  infoGraphics.textFont("Gottlieb", INFO_TEXT_SIZE, { wght: 900 });
  // infoGraphics.textFont(myFont, INFO_TEXT_SIZE);
  infoGraphics.fill("white");
  infoGraphics.textLeading(45);
  // text box spans the whole bar: p5 wraps inside it and CENTER/CENTER centers the block
  infoGraphics.text(infobartext, 0, 5, INFO_BAR_WIDTH, INFO_BAR_HEIGHT);

  // small label centered in the top quarter of the bar
  infoGraphics.textFont("Gottlieb", 20, { wght: 300 });
  infoGraphics.text("הרצאה", 0, 0, INFO_BAR_WIDTH, INFO_BAR_HEIGHT/4); //3
  infoGraphics.textAlign(CENTER, CENTER);

  // same center as the bar, nudged toward the camera so it renders on top
  push();
  translate(0, 0, INFO_TEXT_Z_OFFSET);
  image(infoGraphics, margins, infoBarY, INFO_BAR_WIDTH, INFO_BAR_HEIGHT);
  pop();

}

/** Fills the buffer top-to-bottom with rows of bg_message; even rows scroll left, odd rows scroll right. */
function drawInterleavedBackgroundRows(graphics) {
  graphics.background(backgroundColor);
  graphics.textFont("Gottlieb", textBgSize, { wght: BG_FONT_WEIGHT });

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
