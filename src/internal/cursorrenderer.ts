import { canvas, drawState, getColorHex, render } from "./main";
import { CONFIG } from "../config";
import { checkBoolean, checkInstanceOf, checkNumber } from "../qut";

export class CursorRenderer {
  blinkCycle_: number;
  toggleBlinkHandle_: number | null;

  constructor() {
    this.blinkCycle_ = 0;
    this.toggleBlinkHandle_ = null;
  }

  setCursorVisible(visible: boolean) {
    checkBoolean("visible", visible);
    if (drawState.cursorVisible === visible) return;

    drawState.cursorVisible = visible;
    this.blinkCycle_ = 0;
    render();

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
    render();
  }

  // Called by render() if 3D effect is off.
  // Called by tv3d.updateScreen() if 3D effect is on.
  drawCursor(targetCtx: CanvasRenderingContext2D, canvasWidth: number, canvasHeight: number) {
    checkInstanceOf("targetCtx", targetCtx, CanvasRenderingContext2D);
    checkNumber("canvasWidth", canvasWidth);
    checkNumber("canvasHeight", canvasHeight);

    if (!drawState.cursorVisible || this.blinkCycle_ <= 0) return;
    const ratio = canvasWidth / canvas.width;
    const realX = Math.round(
      (drawState.cursorCol + 0.5 - CONFIG.CURSOR.WIDTH_F / 2 + CONFIG.CURSOR.OFFSET_H) *
      CONFIG.CHR_WIDTH * ratio);
    const realY = Math.round(
      (drawState.cursorRow + 1 - CONFIG.CURSOR.HEIGHT_F - CONFIG.CURSOR.OFFSET_V) *
      CONFIG.CHR_HEIGHT * ratio);

    targetCtx.fillStyle = getColorHex(drawState.fgColor);

    targetCtx.fillRect(realX, realY,
      Math.round(CONFIG.CURSOR.WIDTH_F * CONFIG.CHR_WIDTH * ratio),
      Math.round(CONFIG.CURSOR.HEIGHT_F * CONFIG.CHR_HEIGHT * ratio));
  }
}
