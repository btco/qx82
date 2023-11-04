import { CONFIG } from "../config.js";
import { TextRenderer } from "./textrenderer.js";
import { InputSys } from "./input.js";
import { CursorRenderer } from "./cursorrenderer.js";
import * as qut from "../qut.js";
import * as vjoy from "./vjoy.js";

// This is the tv3d module, which we import on init, only if this effect is enabled.
let tv3d = null;

export let textRenderer = null;
export let inputSys = null;
export let cursorRenderer = null;
export let realCanvas = null;
export let realCtx = null;  // Will always be null if THREE_SETTINGS is on.

export let canvas = null;
export let ctx = null;

let lastFrameTime = null;
let crashed = false;

export let deltaTime = 0;  // Time elapsed since last frame.

export const drawState = {
  fgColor: 7,
  bgColor: 0,  // -1 means transparent

  cursorCol: 0,
  cursorRow: 0,

  cursorVisible: false, // Don't change this directly, use cursorRenderer.setCursorVisible()
};

// If set, initialization has successfully concluded.
let initDone = false;
// If set, this is the callback to call on every animation frame.
let frameHandler = null;
// If frameHandler is set, this is the target interval at which to call it.
// This is the reciprocal of the FPS, so if FPS is 30, this will be 1/30.
let frameHandlerTargetInterval = null;
// If true, there's an animation frame pending run (it was requested but not run yet).
let animFrameRequested = false;
// Time remaining in seconds to call the next frame handler.
let timeToNextFrame = 0;

// HTML element for the "scan lines" effect, if created.
let scanLinesEl = null;

// If this is not null, then there is currently an async API call in progress,
// which means other API calls can't be called. If not null, this is an object with:
// {
//   name: the name of the async function that was called.
//   resolve: the promise resolve function to call.
//   reject: the reject function to call if there is an error.
// }
let pendingAsync = null; 

// If this is true, then the screen is "dirty" and needs to render.
let dirty = false;

export function init(callback) {
  qut.checkFunction("callback", callback);
  asyncInit(callback);
}

async function asyncInit(callback) {
  qut.log("Sys init.");

  if (CONFIG.THREE_SETTINGS) {
    qut.log("Initializing 3D.");
    tv3d = await import("./tv3d.js");
    qut.log("3D module loaded.");
  }

  // Computed values: width and height of screen in virtual pixels.
  CONFIG.SCREEN_WIDTH = CONFIG.SCREEN_COLS * CONFIG.CHR_WIDTH;
  CONFIG.SCREEN_HEIGHT = CONFIG.SCREEN_ROWS * CONFIG.CHR_HEIGHT;

  // Set up the real canvas (the one that really exists onscreen).
  realCanvas = document.createElement("canvas");
  realCanvas.addEventListener("touchstart", e => e.preventDefault());
  document.body.appendChild(realCanvas);

  // Set up the virtual canvas (the one we render to).
  canvas = document.createElement("canvas");
  canvas.width = CONFIG.SCREEN_WIDTH;
  canvas.height = CONFIG.SCREEN_HEIGHT;
  canvas.style.width = CONFIG.SCREEN_WIDTH + "px";
  canvas.style.height = CONFIG.SCREEN_HEIGHT + "px";
  ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = false;

  // Initialize subsystems
  textRenderer = new TextRenderer();
  inputSys = new InputSys();
  cursorRenderer = new CursorRenderer();

  await textRenderer.initAsync();

  // Update the positioning and size of the canvas.
  updateLayout(false);
  window.addEventListener("resize", () => updateLayout(true));

  if (tv3d) {
    tv3d.setup(realCanvas, canvas);
    // Needs to update again because THREE.js messes around with the canvas. I think.
    updateLayout(false);
  }

  if (isMobile()) {
    vjoy.setup();
  }

  initDone = true;

  // Work around an init bug where text would initially not render
  // on Firefox. I'm not entirely sure I understand why, but this seems
  // to fix it (perhaps waiting 1 frame gives the canvas time to initialize).
  await new Promise(resolve => setTimeout(resolve, 1));

  await callback();
  render();
}

export function getContext() {
  return ctx;
}

export function preflight(apiMethod) {
  if (crashed) {
    throw new Error(`Can't call API method ${apiMethod}() because the engine has crashed.`);
  }
  if (!initDone) {
    qut.fatal(`Can't call API method ${apiMethod}(): API not initialized. ` +
      `Call initAsync() wait until it finishes before calling API methods.`);
  }
  if (pendingAsync) {
    qut.fatal(`Can't call API method ${apiMethod}() because there is a pending async ` + 
      `call to ${pendingAsync.name}() that hasn't finished running yet. Are you missing ` +
      `an 'await' keyword to wait for the async method? Use 'await ${pendingAsync.name}()',` +
      `not just '${pendingAsync.name}()'`);
  }
}

export function startAsync(asyncMethodName, resolve, reject) {
  if (pendingAsync) {
    throw new Error("Internal bug: startAsync called while pendingAsync is not null. " +
      "Missing preflight() call?");
  }
  pendingAsync = {
    name: asyncMethodName,
    resolve,
    reject,
  }
  this.render();
}

export function hasPendingAsync(asyncMethodName) {
  return pendingAsync && pendingAsync.name === asyncMethodName;
}

function endAsyncImpl(asyncMethodName, isError, result) {
  if (!pendingAsync) {
    throw new Error(`Internal bug: endAsync(${asyncMethodName}) called with no pendingAsync`);
  }
  if (pendingAsync.name !== asyncMethodName) {
    throw new Error(`Internal bug: endAsync(${asyncMethodName}) called but pendingAsync.name ` +
      `is ${pendingAsync.name}`);
  }
  const fun = isError ? pendingAsync.reject : pendingAsync.resolve;
  pendingAsync = null;
  fun(result);
}

export function resolveAsync(asyncMethodName, result) {
  endAsyncImpl(asyncMethodName, false, result);
}

export function failAsync(asyncMethodName, error) {
  endAsyncImpl(asyncMethodName, true, error);
}

export function setFrameHandler(callback, targetFps) {
  frameHandler = callback;
  frameHandlerTargetInterval = 1.0 / (targetFps || 30);
  timeToNextFrame = 0;
  // If we didn't already, request an animation frame.
  if (!animFrameRequested) {
    window.requestAnimationFrame(doFrame);
  }
}

export function render() {
  if (crashed) return;
  if (tv3d) {
    tv3d.updateScreen();
    return;
  }
  realCtx.imageSmoothingEnabled = false;
  realCtx.clearRect(0, 0, realCanvas.width, realCanvas.height);
  realCtx.drawImage(canvas,
    0, 0, realCanvas.width, realCanvas.height)
  dirty = false;
  cursorRenderer.drawCursor();
}

// Marks the screen as dirty and renders it at the next available opportunity.
export function markDirty() {
  if (dirty) return;
  dirty = true;
  // Render at the next available opportunity. Note that we never schedule more than one
  // of these calls because we only schedule when dirty was false and becomes true.
  setTimeout(render, 1);
}

export function cls() {
  ctx.fillStyle = getColorHex(drawState.bgColor);
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  this.setCursorLocation(0, 0);
  markDirty();
}

export function defineColors(colors) {
  qut.checkArray("colors", colors);
  CONFIG.COLORS = colors.slice();
  textRenderer.regenColors();
}

export function setColor(fg, bg) {
  qut.checkNumber("fg", fg);
  drawState.fgColor = Math.round(fg);
  if (bg !== undefined) {
    qut.checkNumber("bg", bg);
    drawState.bgColor = Math.round(bg);
  }
}

export function setCursorLocation(col, row) {
  qut.checkNumber("col", col);
  if (row !== undefined) qut.checkNumber("row", row);
  drawState.cursorCol = Math.round(col);
  if (row !== undefined) drawState.cursorRow = Math.round(row);
}

export function getColorHex(c) {
  if (typeof(c) !== "number") return "#f0f";
  if (c < 0) return "#000";
  c = qut.clamp(Math.round(c), 0, CONFIG.COLORS.length - 1);
  return CONFIG.COLORS[c];
}

export function getNow() {
  return window.performance.now ?
    window.performance.now() : (new Date()).getTime();
}

export function drawImage(img, x, y, srcX, srcY, width, height) {
  qut.checkInstanceOf("img", img, HTMLImageElement);
  qut.checkNumber("x", x);
  qut.checkNumber("y", y);
  if (srcX !== undefined) qut.checkNumber("srcX", srcX);
  if (srcY !== undefined) qut.checkNumber("srcY", srcY);
  if (width !== undefined) qut.checkNumber("width", width);
  if (height !== undefined) qut.checkNumber("height", height);
  if (srcX !== undefined && srcY !== undefined &&
      width !== undefined && height !== undefined) {
    ctx.drawImage(img, srcX, srcY, width, height, x, y, width, height);
  } else {
    ctx.drawImage(img, x, y);
  }
}

export function drawRect(x, y, width, height) {
  qut.checkNumber("x", x);
  qut.checkNumber("y", y);
  qut.checkNumber("width", width);
  qut.checkNumber("height", height);
  let oldStrokeStyle = ctx.strokeStyle;
  ctx.strokeStyle = getColorHex(drawState.fgColor);
  // Must add 0.5 to x and y so we draw in the "middle"
  // of the pixel. Weird canvas floating-point coords.
  ctx.strokeRect(Math.round(x) + 0.5, Math.round(y) + 0.5,
    Math.round(width) - 1, Math.round(height) - 1);
  ctx.strokeStyle = oldStrokeStyle;
}

export function fillRect(x, y, width, height) {
  qut.checkNumber("x", x);
  qut.checkNumber("y", y);
  qut.checkNumber("width", width);
  qut.checkNumber("height", height);
  ctx.fillStyle = getColorHex(drawState.fgColor);
  // Must add 0.5 to x and y so we draw in the "middle"
  // of the pixel. Weird canvas floating-point coords.
  ctx.fillRect(Math.round(x) + 0.5, Math.round(y) + 0.5,
    Math.round(width) - 1, Math.round(height) - 1);
}

async function doFrame() {
  animFrameRequested = false;

  const now = getNow();
  deltaTime = lastFrameTime !== null ?  0.001 * (now - lastFrameTime) : (1/60.0);
  deltaTime = Math.min(deltaTime, 0.05);
  lastFrameTime = now;

  timeToNextFrame += deltaTime;

  let numFramesDone = 0;
  while (frameHandler && numFramesDone < 4 && timeToNextFrame > frameHandlerTargetInterval) {
    await frameHandler();
    inputSys.onEndFrame();
    timeToNextFrame -= frameHandlerTargetInterval;
    ++numFramesDone;
  }
  render();

  // If we still have a frame handler, request the next animation frame.
  if (frameHandler) {
    animFrameRequested = true;
    window.requestAnimationFrame(doFrame);
  }
}

function updateLayout(renderNow) {
  if (CONFIG.THREE_SETTINGS) updateLayout3d();
  else updateLayout2d();
  if (renderNow) render();
}

function updateLayout3d() {
  const size = tv3d.getDesiredCanvasSize();
  // Width and height of screen as displayed in HTML.
  CONFIG.SCREEN_EL_WIDTH = size.width;
  CONFIG.SCREEN_EL_HEIGHT = size.height;
  // Real width and height of screen.
  CONFIG.SCREEN_REAL_WIDTH = size.width;
  CONFIG.SCREEN_REAL_HEIGHT = size.height;
  realCanvas.style.width = size.width + "px";
  realCanvas.style.height = size.height + "px";
  realCanvas.style.position = "absolute";
  realCanvas.style.left = "0px";
  realCanvas.style.top = "0px";
}

function updateLayout2d() {
  const frac = CONFIG.MAX_SCREEN_FRACTION || 0.8;
  const effWidth = Math.round(window.innerWidth * frac);
  const effHeight = Math.round(window.innerHeight * frac);

  // Find the biggest pixel scale we can make fit on the page.
  let useAutoScale = CONFIG.THREE_SETTINGS || typeof(CONFIG.SCREEN_SCALE) !== 'number';
  let scale;

  if (useAutoScale) {
    // Auto scale.
    scale = Math.floor(Math.min(
      effWidth / CONFIG.SCREEN_WIDTH,
      effHeight / CONFIG.SCREEN_HEIGHT));
    scale = Math.min(Math.max(scale, 1), 5);
    console.warn(`Window size ${window.innerWidth} x ${window.innerHeight}, scale ${scale}, dpr ${window.devicePixelRatio}`);
  } else {
    scale = CONFIG.SCREEN_SCALE;
  }

  // Width and height of screen as displayed in HTML.
  CONFIG.SCREEN_EL_WIDTH = CONFIG.SCREEN_WIDTH * scale;
  CONFIG.SCREEN_EL_HEIGHT = CONFIG.SCREEN_HEIGHT * scale;
  // Real width and height of screen.
  CONFIG.SCREEN_REAL_WIDTH = CONFIG.SCREEN_WIDTH * scale;
  CONFIG.SCREEN_REAL_HEIGHT = CONFIG.SCREEN_HEIGHT * scale;

  realCanvas.style.width = CONFIG.SCREEN_EL_WIDTH + "px";
  realCanvas.style.height = CONFIG.SCREEN_EL_HEIGHT + "px";
  if (!CONFIG.THREE_SETTINGS) {
    realCanvas.width = CONFIG.SCREEN_REAL_WIDTH;
    realCanvas.height = CONFIG.SCREEN_REAL_HEIGHT;
    realCtx = realCanvas.getContext("2d");
    realCtx.imageSmoothingEnabled = false;
  }

  realCanvas.style.position = "absolute";
  realCanvas.style.left = Math.round((window.innerWidth - CONFIG.SCREEN_EL_WIDTH) / 2) + "px";
  realCanvas.style.top = Math.round((window.innerHeight - CONFIG.SCREEN_EL_HEIGHT) / 2) + "px";

  const scanLinesOp = CONFIG.SCAN_LINES_OPACITY || 0;
  if (scanLinesOp > 0 && !tv3d) {
    if (!scanLinesEl) {
      scanLinesEl = document.createElement("div");
      document.body.appendChild(scanLinesEl);
    }
    scanLinesEl.style.background =
      "linear-gradient(rgba(0, 0, 0, 0) 50%, rgba(0, 0, 0, 1) 50%), " +
      "linear-gradient(90deg, rgba(255, 0, 0, .6), rgba(0, 255, 0, .2), rgba(0, 0, 255, .6))";
    scanLinesEl.style.backgroundSize = `100% 4px, 3px 100%`;
    scanLinesEl.style.opacity = scanLinesOp;
    scanLinesEl.style.position = "absolute";
    scanLinesEl.style.left = realCanvas.style.left;
    scanLinesEl.style.top = realCanvas.style.top;
    scanLinesEl.style.width = realCanvas.style.width;
    scanLinesEl.style.height = realCanvas.style.height;
    scanLinesEl.style.zIndex = 1;
  }
}

let crashing = false;
export function handleCrash(errorMessage = "Fatal error") {
  if (crashed || crashing) return;
  crashing = true;
  setColor(CONFIG.COLORS.length - 1, 0);
  cls();
  drawState.cursorCol = drawState.cursorRow = 1;
  textRenderer.print("*** CRASH ***:\n" + errorMessage);
  render();
  crashing = false;
  crashed = true;
}

function isMobile() {
  return isIOS() || isAndroid();
}

function isIOS() {
  return /(ipad|ipod|iphone)/i.test(navigator.userAgent);
}

function isAndroid() {
  return /android/i.test(navigator.userAgent);
}

