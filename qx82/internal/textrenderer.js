import {CONFIG} from "../config.js";
import * as qut from "../qut.js";
import * as main from "./main.js";

export class TextRenderer {
  constructor() {
    // Original text image, in case we need to regenerate the color images.
    this.origImg_ = null;

    // One image for each color.
    this.chrImages_ = [];
  }

  async initAsync() {
    qut.log("TextRenderer init.");
    // Load the base image. We will then colorize it with each color.
    this.origImg_ = await qut.loadImageAsync(CONFIG.CHR_FILE);
    this.regenColors();
  }

  // Regenerates the color text images.
  regenColors() {
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = this.origImg_.width;
    tempCanvas.height = this.origImg_.height;
    const ctx = tempCanvas.getContext('2d');
    this.chrImages_ = [];
    for (let c = 0; c < CONFIG.COLORS.length; c++) {
      qut.log(`Initializing text color ${c}...`);

      // Draw the font image to the temp canvas (white over transparent background).
      ctx.clearRect(0, 0, this.origImg_.width, this.origImg_.height);
      ctx.globalCompositeOperation = 'source-over';
      ctx.drawImage(this.origImg_, 0, 0, this.origImg_.width, this.origImg_.height);

      // Now draw a filled rect with the desired color using the 'source-in' pixel
      // operation, which will tint the white pixels to that color. I think.
      ctx.globalCompositeOperation = 'source-in';
      ctx.fillStyle = CONFIG.COLORS[c];
      ctx.fillRect(0, 0, this.origImg_.width, this.origImg_.height);

      // Now extract the canvas contents as an image.
      const thisImg = new Image();
      thisImg.src = tempCanvas.toDataURL();
      this.chrImages_.push(thisImg);
    }
  }

  print(text) {
    qut.checkString("text", text);

    let col = main.drawState.cursorCol;
    let row = main.drawState.cursorRow;

    const initialCol = col;

    for (let i = 0; i < text.length; i++) {
      const ch = text.charCodeAt(i);
      if (ch === 10) {
        col = initialCol;
        row++;
      } else {
        this.put_(ch, col, row, main.drawState.fgColor, main.drawState.bgColor);
        col++;
      }
    }

    main.drawState.cursorCol = col;
    main.drawState.cursorRow = row;
    main.markDirty();
  }

  printChar(ch, n) {
    if (n === undefined || isNaN(n)) n = 1;
    qut.checkNumber("ch", ch);
    qut.checkNumber("n", n);
    while (n-- > 0) {
      this.put_(ch, main.drawState.cursorCol,
        main.drawState.cursorRow, main.drawState.fgColor, main.drawState.bgColor);
      main.drawState.cursorCol++;
    }
    main.markDirty();
  }

  // Prints a character as a "sprite" at a raw x, y position.
  spr(ch, x, y) {
    qut.checkNumber("ch", ch);
    qut.checkNumber("x", x);
    qut.checkNumber("y", y);
    this.putxy_(ch, x, y, main.drawState.fgColor, main.drawState.bgColor);
  }

  // Returns {cols, rows}.
  measure(text) {
    qut.checkString("text", text);
    if (text === "") return {cols: 0, rows: 0};  // Special case
    let rows = 1;
    let thisLineWidth = 0;
    let cols = 0;
    for (let i = 0; i < text.length; i++) {
      const ch = text.charCodeAt(i);
      if (ch === 10) {
        rows++;
        thisLineWidth = 0;
      } else {
        ++thisLineWidth;
        cols = Math.max(cols, thisLineWidth);
      }
    }
    return { cols, rows };
  }

  printRect(width, height, ch) {
    qut.checkNumber("width", width);
    qut.checkNumber("height", height);
    qut.checkNumber("ch", ch);
    const startCol = main.drawState.cursorCol;
    const startRow = main.drawState.cursorRow;
    for (let i = 0; i < height; i++) {
      main.drawState.cursorCol = startCol;
      main.drawState.cursorRow = startRow + i;
      this.printChar(ch, width);
    }
    main.drawState.cursorCol = startCol;
    main.drawState.cursorRow = startRow;
  }

  printBox(width, height, fill, borderCh) {
    const borderNW = borderCh;
    const borderNE = borderCh + 1;
    const borderSW = borderCh + 2;
    const borderSE = borderCh + 3;
    const borderV = borderCh + 4;
    const borderH = borderCh + 5;

    qut.checkNumber("width", width);
    qut.checkNumber("height", height);
    qut.checkBoolean("fill", fill);
    qut.checkNumber("borderCh", borderCh);
    const startCol = main.drawState.cursorCol;
    const startRow = main.drawState.cursorRow;
    for (let i = 0; i < height; i++) {
      main.drawState.cursorCol = startCol;
      main.drawState.cursorRow = startRow + i;
      if (i === 0) {
        // Top border
        this.printChar(borderNW);
        this.printChar(borderH, width - 2);
        this.printChar(borderNE);
      } else if (i === height - 1) {
        // Bottom border.
        this.printChar(borderSW);
        this.printChar(borderH, width - 2);
        this.printChar(borderSE);
      } else {
        // Middle.
        this.printChar(borderV);
        main.drawState.cursorCol = startCol + width - 1;
        this.printChar(borderV);
      }
    }
    if (fill && width > 2 && height > 2) {
      main.drawState.cursorCol = startCol + 1;
      main.drawState.cursorRow = startRow + 1;
      this.printRect(width - 2, height - 2, 32);
    }
    main.drawState.cursorCol = startCol;
    main.drawState.cursorRow = startRow;
  }

  put_(ch, col, row, fgColor, bgColor) {
    const chrW = CONFIG.CHR_WIDTH;
    const chrH = CONFIG.CHR_HEIGHT;
    const x = Math.round(col * chrW);
    const y = Math.round(row * chrH);
    this.putxy_(ch, x, y, fgColor, bgColor);
  }

  putxy_(ch, x, y, fgColor, bgColor) {
    const chrW = CONFIG.CHR_WIDTH;
    const chrH = CONFIG.CHR_HEIGHT;
    const fontRow = Math.floor(ch / 16);
    const fontCol = ch % 16;

    x = Math.round(x);
    y = Math.round(y);

    if (bgColor >= 0) {
      main.ctx.fillStyle = main.getColorHex(bgColor);
      main.ctx.fillRect(x, y, chrW, chrH);
    }

    main.ctx.drawImage(
      this.chrImages_[qut.clamp(fgColor, 0, this.chrImages_.length - 1)],
      fontCol * chrW, fontRow * chrH, chrW, chrH, x, y, chrW, chrH);
    main.markDirty();
  }
}
