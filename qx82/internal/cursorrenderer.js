import * as main from "./main.js";
import {CONFIG} from "../config.js";
import * as qut from "../qut.js";

const CURSOR_HEIGHT_FRAC = 0.2;
const CURSOR_WIDTH_FRAC = 0.8;

const CURSOR_BLINK_INTERVAL_MS = 400;

export class CursorRenderer {
  constructor() {
    this.blinkCycle_ = 0;
    this.toggleBlinkHandle_ = null;
  }

  setCursorVisible(visible) {
    qut.checkBoolean("visible", visible);
    if (main.drawState.cursorVisible === visible) return;

    main.drawState.cursorVisible = visible;
    this.blinkCycle_ = 0;
    main.render();

    if (this.toggleBlinkHandle_ !== null) {
      clearInterval(this.toggleBlinkHandle_);
      this.toggleBlinkHandle_ = null;
    }

    if (visible) {
      this.toggleBlinkHandle_ = setInterval(() => this.advanceBlink_(), CURSOR_BLINK_INTERVAL_MS);
    }
  }

  advanceBlink_() {
    this.blinkCycle_ = (this.blinkCycle_ + 1) % 2;
    main.render();
  }

  // Called by main.render
  drawCursor() {
    if (!main.drawState.cursorVisible) return;
    const ratio = main.realCanvas.width / main.canvas.width;
    const realX = Math.round(
      (main.drawState.cursorCol + 0.5 - CURSOR_WIDTH_FRAC/2) * CONFIG.CHR_WIDTH * ratio);
    const realY = Math.round(
      (main.drawState.cursorRow + 1 - CURSOR_HEIGHT_FRAC) * CONFIG.CHR_HEIGHT * ratio);

    main.realCtx.fillStyle = main.getColorHex(this.blinkCycle_ > 0 ? main.drawState.fgColor : 0);

    main.realCtx.fillRect(realX, realY,
      Math.round(CURSOR_WIDTH_FRAC * CONFIG.CHR_WIDTH * ratio),
      Math.round(CURSOR_HEIGHT_FRAC * CONFIG.CHR_HEIGHT * ratio));
  }
}