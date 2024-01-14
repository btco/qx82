import {CONFIG} from "../config.js";
import * as qut from "../qut.js";
import * as main from "./main.js";

// Represents an individual font that can be used with TextRenderer.
export class TextRendererFont {
  // Constructs a font. NOTE: after construction, you must call await initAsync() to
  // initialize the font.
  constructor(fontName, fontImageFile) {
    qut.checkString("fontName", fontName);
    qut.checkString("fontImageFile", fontImageFile);
    // Name of the font.
    this.fontName_ = fontName;
    // URL of the image file for the font.
    this.fontImageFile_ = fontImageFile;
    // Original text image, in case we need to regenerate the color images.
    this.origImg_ = null;
    // One image for each color.
    this.chrImages_ = [];
    // Width and height of each character, in pixels.
    this.charWidth_ = 0;
    this.charHeight_ = 0;

    // When we are printing something, we store a backup of the drawing context's
    // original foreground and background colors, in case we change it during printing
    // as a result of escape sequences.
    this.origFgColor_ = 0;
    this.origBgColor_ = 0;
  }

  getCharWidth() { return this.charWidth_ }
  getCharHeight() { return this.charHeight_ }
  getImageForColor(colorNumber) { return this.chrImages_[colorNumber]; }

  // Sets up this font from the given character image file. It's assumed to contain the
  // glyps arranged in a 16x16 grid, so we will deduce the character size by dividing the
  // width and height by 16.
  async initAsync() {
    qut.log(`Building font ${this.fontName_} from image ${this.fontImageFile_}`);
    this.origImg_ = await qut.loadImageAsync(this.fontImageFile_);
    qut.assert(this.origImg_.width % 16 === 0 && this.origImg_.height % 16 === 0,
      `Font ${this.fontName_}: image ${this.fontImageFile_} has dimensions ` +
      `${this.origImg_.width}x${this.origImg_.height}. It must ` +
      `have dimensions that are multiples of 16 (16x16 grid of characters).`);
    this.charWidth_ = Math.floor(this.origImg_.width / 16);
    this.charHeight_ = Math.floor(this.origImg_.height / 16);
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
      qut.log(`Initializing font ${this.fontName_}, color ${c}...`);

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
}

export class TextRenderer {
  constructor() {
    // TextRendererFont for each font, keyed by font name. The default font is called "default".
    this.fonts_ = {};

    // Current font. This is never null after initialization. This is a reference
    // to a TextRendererFont object. For a font to be set as current, it must have a
    // character width and height that are INTEGER MULTIPLES of CONFIG.CHR_WIDTH and
    // CONFIG.CHR_HEIGHT, respectively, to ensure the row/column system continues to work.
    this.curFont_ = null;
  }

  async initAsync() {
    qut.log("TextRenderer init.");

    const defaultFont = new TextRendererFont("default", CONFIG.CHR_FILE);
    await defaultFont.initAsync();

    const actualCharWidth = defaultFont.getCharWidth();
    const actualCharHeight = defaultFont.getCharHeight();

    qut.assert(
      actualCharWidth === defaultFont.getCharWidth() &&
      actualCharHeight === defaultFont.getCharHeight(),
      `The character image ${CONFIG.CHR_FILE} should be a 16x16 grid of characters with ` +
      `dimensions 16 * CONFIG.CHR_WIDTH, 16 * CONFIG.CHR_HEIGHT = ` +
      `${16 * CONFIG.CHR_WIDTH} x ${16 * CONFIG.CHR_HEIGHT}`);
    
    this.fonts_["default"] = defaultFont;
    this.curFont_ = defaultFont;
  }

  async loadFontAsync(fontName, fontImageFile) {
    qut.checkString("fontName", fontName);
    qut.checkString("fontImageFile", fontImageFile);
    const font = new TextRendererFont(fontName, fontImageFile);
    await font.initAsync();
    this.fonts_[fontName] = font;
  }

  setFont(fontName) {
    qut.checkString("fontName", fontName);
    const font = this.fonts_[fontName];
    if (!font) {
      qut.fatal(`setFont(): font not found: ${fontName}`);
      return;
    }
    const cw = font.getCharWidth();
    const ch = font.getCharHeight();
    if (cw % CONFIG.CHR_WIDTH !== 0 || ch % CONFIG.CHR_HEIGHT !== 0) {
      qut.fatal(`setFont(): font ${fontName} has character size ${cw}x${ch}, ` +
        `which is not an integer multiple of CONFIG.CHR_WIDTH x CONFIG.CHR_HEIGHT = ` + 
        `${CONFIG.CHR_WIDTH}x${CONFIG.CHR_HEIGHT}, so it can't be set as the ` +
        `current font due to the row,column system. However, you can still use it ` +
        `directly with drawText() by passing it as a parameter to that function.`);
      return;
    }
    this.curFont_ = font;
  }

  print(text) {
    qut.checkString("text", text);

    let col = main.drawState.cursorCol;
    let row = main.drawState.cursorRow;

    // Store a backup of foreground/background colors, in case we change them during
    // the print operation as a result of escape sequences.
    this.origFgColor_ = main.drawState.fgColor;
    this.origBgColor_ = main.drawState.bgColor;

    // Note: We know (because this is enforced in setFont) that the current font's character size
    // is a multiple of CONFIG.CHR_WIDTH x CONFIG.CHR_HEIGHT.
    const colInc = Math.floor(this.curFont_.getCharWidth() / CONFIG.CHR_WIDTH);
    const rowInc = Math.floor(this.curFont_.getCharHeight() / CONFIG.CHR_HEIGHT);

    const initialCol = col;

    for (let i = 0; i < text.length; i++) {
      i = this.processEscapeSeq_(text, i);
      const ch = text.charCodeAt(i);
      if (ch === 10) {
        col = initialCol;
        row += rowInc;
      } else {
        this.put_(ch, col, row, main.drawState.fgColor, main.drawState.bgColor);
        col += colInc;
      }
    }

    main.drawState.cursorCol = col;
    main.drawState.cursorRow = row;
    main.drawState.fgColor = this.origFgColor_;
    main.drawState.bgColor = this.origBgColor_;
    main.markDirty();
  }
  
  printCentered(text, width) {
    qut.checkString("text", text);
    qut.checkNumber("width", width);
    text = text.split("\n")[0];
    if (!text) return;
    const textWidth = this.measure(text).cols;
    const col = Math.floor(main.drawState.cursorCol + (width - textWidth) / 2);
    main.drawState.cursorCol = col;
    this.print(text);
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

  // Draws text at the given pixel coordinates, with no cursor movement.
  drawText(x, y, text, fontName) {
    qut.checkNumber("x", x);
    qut.checkNumber("y", y);
    qut.checkString("text", text);
    if (fontName) qut.checkString("fontName", fontName);

    const x0 = x;
    const font = fontName ? (this.fonts_[fontName] || this.curFont_) : this.curFont_;
    if (!font) {
      qut.warn(`Requested font '${fontName}' not found: not drawing text.`);
      return;
    }
    for (let i = 0; i < text.length; i++) {
      const ch = text.charCodeAt(i);
      if (ch === 10) { x = x0; y += font.getCharHeight(); }
      else {
        this.putxy_(ch, x, y, main.drawState.fgColor, main.drawState.bgColor, font);
        x += font.getCharWidth();
      }
    }
  }

  // Returns {cols, rows}.
  measure(text) {
    qut.checkString("text", text);
    if (text === "") return {cols: 0, rows: 0};  // Special case
    let rows = 1;
    let thisLineWidth = 0;
    let cols = 0;
    for (let i = 0; i < text.length; i++) {
      i = this.processEscapeSeq_(text, i, true);
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

  putxy_(ch, x, y, fgColor, bgColor, font = null) {
    font = font || this.curFont_;
    const chrW = font.getCharWidth();
    const chrH = font.getCharHeight();
    const fontRow = Math.floor(ch / 16);
    const fontCol = ch % 16;

    x = Math.round(x);
    y = Math.round(y);

    if (bgColor >= 0) {
      main.ctx.fillStyle = main.getColorHex(bgColor);
      main.ctx.fillRect(x, y, chrW, chrH);
    }

    const color = qut.clamp(fgColor, 0, CONFIG.COLORS.length - 1);
    const img = font.getImageForColor(color);

    main.ctx.drawImage(img, 
      fontCol * chrW, fontRow * chrH, chrW, chrH, x, y, chrW, chrH);
    main.markDirty();
  }

  // Tries to run an escape sequence that starts at text[pos].
  // Returns the position after the escape sequence ends.
  // If pretend is true, then this will only parse but not run it.
  processEscapeSeq_(text, startPos, pretend = false) {
    // Shorthand.
    const startSeq = CONFIG.PRINT_ESCAPE_START;
    const endSeq = CONFIG.PRINT_ESCAPE_END;
    // If no escape sequences are configured in CONFIG, stop.
    if (!startSeq || !endSeq) return startPos;
    // Check that the start sequence is there.
    if (text.substring(startPos, startPos + startSeq.length) != startSeq) {
      return startPos;
    }
    // Where does it end?
    const endPos = text.indexOf(endSeq, startPos + startSeq.length);
    if (!pretend) {
      // Get the contents of the sequence.
      const command = text.substring(startPos + startSeq.length, endPos);
      this.runEscapeCommand_(command);
    }
    return endPos + endSeq.length;
  }

  runEscapeCommand_(command) {
    // If it contains colons, it's a compound command.
    if (command.indexOf(',') > 0) {
      const parts = command.split(',');
      for (const part of parts) this.runEscapeCommand_(part);
      return;
    }
    command = command.trim();
    if (command === "") return;
    // The first character is the command's verb. The rest is the argument.
    const verb = command[0].toLowerCase();
    const arg = command.substring(1);
    const argNum = 1 * arg;
    switch (verb) {
      case "f": case "c": // Set foreground color.
        main.drawState.fgColor = arg !== "" ? argNum : this.origFgColor_;
        break;
      case "b": // Set background color.
        main.drawState.bgColor = arg !== "" ? argNum : this.origBgColor_;
        break;
      case "z": // Reset state.
        main.drawState.fgColor = this.origFgColor_;
        main.drawState.bgColor = this.origBgColor_;
        break;
      default:
        console.warn("Unknown QX82 print escape command: " + command);
    }
  }

  regenColors() {
    // Tell all the fonts to regenerate their glyph images.
    Object.values(this.fonts_).forEach(f => f.regenColors());
  }
}
