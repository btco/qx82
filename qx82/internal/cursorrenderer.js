import * as main from "./main.js";
import {CONFIG} from "../config.js";
import * as qut from "../qut.js";

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
      this.toggleBlinkHandle_ =
        setInterval(() => this.advanceBlink_(), CONFIG.CURSOR.BLINK_INTERVAL);
    }
  }

  advanceBlink_() {
    this.blinkCycle_ = (this.blinkCycle_ + 1) % 2;
    main.render();
  }

  // Called by main.render() if 3D effect is off.
  // Called by tv3d.updateScreen() if 3D effect is on.
  drawCursor(targetCtx, canvasWidth, canvasHeight) {
    qut.checkInstanceOf("targetCtx", targetCtx, CanvasRenderingContext2D);
    qut.checkNumber("canvasWidth", canvasWidth);
    qut.checkNumber("canvasHeight", canvasHeight);

    if (!main.drawState.cursorVisible || this.blinkCycle_ <= 0) return;
    const ratio = canvasWidth / main.canvas.width;
    const realX = Math.round(
      (main.drawState.cursorCol + 0.5 - CONFIG.CURSOR.WIDTH_F/2 + CONFIG.CURSOR.OFFSET_H) *
        CONFIG.CHR_WIDTH * ratio);
    const realY = Math.round(
      (main.drawState.cursorRow + 1 - CONFIG.CURSOR.HEIGHT_F - CONFIG.CURSOR.OFFSET_V) *
        CONFIG.CHR_HEIGHT * ratio);

    targetCtx.fillStyle = main.getColorHex(main.drawState.fgColor);

    targetCtx.fillRect(realX, realY,
      Math.round(CONFIG.CURSOR.WIDTH_F * CONFIG.CHR_WIDTH * ratio),
      Math.round(CONFIG.CURSOR.HEIGHT_F * CONFIG.CHR_HEIGHT * ratio));
  }
}
