var gt = Object.defineProperty;
var Ct = (e, t, o) => t in e ? gt(e, t, { enumerable: !0, configurable: !0, writable: !0, value: o }) : e[t] = o;
var g = (e, t, o) => Ct(e, typeof t != "symbol" ? t + "" : t, o);
const lt = {
  // Enable debug?
  DEBUG: !0,
  // Use 3D effect for the screen?
  // Set THREE_SETTINGS to null to disable the 3D effect.
  THREE_SETTINGS: {
    NOISE_SPEED: 4,
    NOISE_INTENSITY: 0.25,
    SCANLINES_THICKNESS: 0.3,
    SCANLINES_INTENSITY: 0.5,
    BLOOM_ENABLED: !0,
    BLOOM_THRESH: 0.3,
    BLOOM_STRENGTH: 0.15,
    BLOOM_RADIUS: 0.05,
    BORDER_THICKNESS: 0.02,
    BORDER_INTENSITY: 0.02,
    // If this is provided, then this overrides the aspect ratio of the screen.
    // Useful if you want "non-square" pixels like in some systems.
    // eg: ASPECT_OVERRIDE: 1.4,
    ASPECT_OVERRIDE: null
  },
  // Canvas settings
  CANVAS_SETTINGS: {
    // The ID to assign to the QX82 canvas.
    CANVAS_ID: "qx82-canvas",
    // If set, these CSS classes will be added to the QX82 canvas.
    // This is an array of strings, each of which is a class name (without the "."),
    // for example: [ "foo", "bar", "qux" ]
    CANVAS_CLASSES: [],
    // If this is true, then we will automatically position the canvas using absolute positioning
    // to ensure it's centered on the viewport and it's the right size.
    // If this is false, then you are responsible for positioning the canvas to your liking.
    AUTO_POSITION: !0,
    // If this is true, we will resize the canvas automatically to match the screen. If false,
    // you're responsible for sizing the canvas to your liking.
    // NOTE: If you are using 2D mode (THREE_SETTINGS is null) and have AUTO_SIZE set to false,
    // you probably want to specify a fixed scale in SCREEN_SCALE rather than "auto", so you
    // have control over how large the canvas will be.
    AUTO_SIZE: !0,
    // If this is not null, then this is the element under which to create the rendering canvas.
    // This can be the ID of an HTML element, or an HTMLElement reference.
    CONTAINER: null
  },
  // Background color to fill the space not used by the screen.
  // For best results this should be the same as the page's background.
  BG_COLOR: "#000",
  // Characters file
  CHR_FILE: void 0,
  // Character size. The characters file's width must be
  // 16 * CHR_WIDTH and the height must be 16 * CHR_HEIGHT.
  CHR_WIDTH: 8,
  CHR_HEIGHT: 8,
  // Screen width and height in characters.
  SCREEN_ROWS: 24,
  SCREEN_COLS: 32,
  // Pixel scale (magnification). Can be "auto" or an int >= 1.
  // If this is "auto", we'll automatically compute this to be the maximum possible size
  // for the current screen size.
  // NOTE: This setting is only used for 2D style (if THREE_SETTINGS is null).
  SCREEN_SCALE: "auto",
  // Maximum fraction of the screen to occupy with the canvas.
  // NOTE: This setting is only used for 2D style (if THREE_SETTINGS is null).
  MAX_SCREEN_FRACTION: 0.95,
  // If set, this is the opacity of the "scan lines" effect.
  // If 0 or not set, don't show scan lines.
  SCAN_LINES_OPACITY: 0.2,
  // Color palette. This can be as many colors as you want, but each color requires us to
  // store a scaled copy of the characters image in memory, so more colors = more memory.
  // You can redefine the colors at runtime with qx.redefineColors.
  COLORS: [
    "#000",
    "#00A",
    "#A00",
    "#A0A",
    "#0A0",
    "#0AA",
    "#AA0",
    "#DDD",
    "#666",
    "#00F",
    "#F00",
    "#F0F",
    "#0F0",
    "#0FF",
    "#FF0",
    "#FFF"
  ],
  // If this is not null, then we will display a virtual joystick if the user
  // is on a mobile device.
  TOUCH_VJOY: !0,
  // Cursor config:
  CURSOR: {
    // Cursor width, as a fraction of the character width (0 to 1)
    WIDTH_F: 0.8,
    // Cursor height, as a fraction of the character height (0 to 1)
    HEIGHT_F: 0.8,
    // Blink interval in millis.
    BLINK_INTERVAL: 400,
    // Cursor offset (as fraction of, respectively, char width and height). Tweak these if
    // you want to adjust the positioning of the cursor.
    OFFSET_V: 0.1,
    OFFSET_H: 0
  },
  // If set, then special escape sequences can be used when printing (to set colors, etc).
  // These are the sequences that starts and end an escape sequence. See the documentation for
  // qx.print() for more info on escape sequences.
  // If you don't want this, comment out these line, or set them to null.
  PRINT_ESCAPE_START: "{{",
  PRINT_ESCAPE_END: "}}"
};
let r = lt;
const Et = (e) => {
  r = { ...lt, ...e };
};
function C(e) {
  console.error("Fatal error: " + e);
  try {
    Bt(e);
  } catch (t) {
    console.error("Error in main.handleCrash: " + t + " while handling error " + e);
  }
  throw new Error("Error: " + e);
}
function I(e, t) {
  return (!e || e === null || e === void 0) && C(t || "Assertion Failed"), e;
}
function Ut(e, t) {
  return e || (r.DEBUG ? ut("DEBUG ASSERT failed: " + t) : C(t)), e;
}
function Mt(e, t, o) {
  return e !== t && C(`${o}: expected ${e} but got ${t}`), t;
}
function k(e, t, o) {
  return I(e, "checkType: varName must be provided."), I(o, "checkType: varType must be provided."), I(
    typeof t === o,
    `${e} should be of type ${o} but was ${typeof t}: ${t}`
  ), t;
}
function l(e, t, o, n) {
  return k(e, t, "number"), isNaN(t) && C(`${e} should be a number but is NaN`), isFinite(t) || C(`${e} should be a number but is infinite: ${t}`), o !== void 0 && I(t >= o, `${e} should be >= ${o} but is ${t}`), n !== void 0 && I(t <= n, `${e} should be <= ${n} but is ${t}`), t;
}
function y(e, t) {
  return k(e, t, "string");
}
function at(e, t) {
  return k(e, t, "boolean");
}
function St(e, t) {
  return k(e, t, "function");
}
function G(e, t) {
  return t === null && C(`${e} should be an object, but was null`), k(e, t, "object");
}
function ct(e, t, o) {
  return I(
    t instanceof o,
    `${e} should be an instance of ${o} but was not, it's: ${t}`
  ), t;
}
function ot(e, t) {
  return I(Array.isArray(t), `${e} should be an array, but was: ${t}`), t;
}
const b = r.DEBUG ? console.log : () => {
}, ut = console.warn, zt = console.error;
async function At(e) {
  return new Promise((t) => {
    const o = new Image();
    o.onload = () => t(o), o.src = e;
  });
}
function Zt(e) {
  return new Promise((t, o) => {
    const n = new XMLHttpRequest();
    n.addEventListener("load", () => {
      n.status < 200 || n.status > 299 ? o("HTTP request finished with status " + n.status) : t(n.responseText);
    }), n.addEventListener("error", (i) => o(i)), n.open("GET", e), n.send();
  });
}
function nt(e, t, o) {
  return Math.min(Math.max(e, t), o);
}
function ht(e, t) {
  return l("lowInclusive", e), l("highInclusive", t), e = Math.round(e), t = Math.round(t), t <= e ? e : nt(
    Math.floor(
      Math.random() * (t - e + 1)
    ) + e,
    e,
    t
  );
}
function qt(e) {
  return ot("array", e), e.length > 0 ? e[ht(0, e.length - 1)] : null;
}
function Qt(e) {
  ot("array", e), e = e.slice();
  for (let t = 0; t < e.length; t++) {
    const o = ht(0, e.length - 1), n = e[t];
    e[t] = e[o], e[o] = n;
  }
  return e;
}
function $t(e, t, o, n) {
  l("x0", e), l("y0", t), l("x1", o), l("y1", n);
  const i = e - o, a = t - n;
  return Math.sqrt(i * i + a * a);
}
function it(e, t, o, n, i) {
  l("as", e), l("ae", t), l("bs", o), l("be", n), i && G("result", i);
  const a = Math.max(e, o), c = Math.min(t, n);
  return c >= a ? (i && (i.start = a, i.end = c), !0) : !1;
}
const rt = { start: 0, end: 0 };
function Jt(e, t, o = 0, n = 0, i = 0, a = 0, c) {
  G("r1", e), G("r2", t), l("r1.x", e.x), l("r1.y", e.y), l("r1.w", e.w), l("r1.h", e.h), l("r2.x", t.x), l("r2.y", t.y), l("r2.w", t.w), l("r2.h", t.h), l("dx1", o), l("dx2", i), l("dy1", n), l("dy2", a), c && G("result", c);
  const d = { ...rt }, h = { ...rt };
  return !it(
    e.x + o,
    e.x + o + e.w - 1,
    t.x + i,
    t.x + i + t.w - 1,
    d
  ) || !it(
    e.y + n,
    e.y + n + e.h - 1,
    t.y + a,
    t.y + a + t.h - 1,
    h
  ) ? !1 : (c && (c.x = d.start, c.w = d.end - d.start + 1, c.y = h.start, c.h = h.end - h.start + 1), !0);
}
const _t = "data:image/png;base64,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";
class st {
  // Constructs a font. NOTE: after construction, you must call await initAsync() to
  // initialize the font.
  constructor(t, o) {
    g(this, "fontName_");
    g(this, "fontImageFile_");
    g(this, "origImg_");
    g(this, "chrImages_");
    g(this, "charWidth_");
    g(this, "charHeight_");
    g(this, "origFgColor_");
    g(this, "origBgColor_");
    y("fontName", t), y("fontImageFile", o), this.fontName_ = t, this.fontImageFile_ = o, this.origImg_ = null, this.chrImages_ = [], this.charWidth_ = 0, this.charHeight_ = 0, this.origFgColor_ = 0, this.origBgColor_ = 0;
  }
  getCharWidth() {
    return this.charWidth_;
  }
  getCharHeight() {
    return this.charHeight_;
  }
  getImageForColor(t) {
    return this.chrImages_[t];
  }
  // Sets up this font from the given character image file. It's assumed to contain the
  // glyps arranged in a 16x16 grid, so we will deduce the character size by dividing the
  // width and height by 16.
  async initAsync() {
    b(`Building font ${this.fontName_} from image ${this.fontImageFile_}`), this.origImg_ = await At(this.fontImageFile_), I(
      this.origImg_.width % 16 === 0 && this.origImg_.height % 16 === 0,
      `Font ${this.fontName_}: image ${this.fontImageFile_} has dimensions ${this.origImg_.width}x${this.origImg_.height}. It must have dimensions that are multiples of 16 (16x16 grid of characters).`
    ), this.charWidth_ = Math.floor(this.origImg_.width / 16), this.charHeight_ = Math.floor(this.origImg_.height / 16), this.regenColors();
  }
  // Regenerates the color text images.
  regenColors() {
    const t = document.createElement("canvas");
    if (!this.origImg_) {
      C("TextRendererFont.regenColors(): origImg_ is null.");
      return;
    }
    t.width = this.origImg_.width, t.height = this.origImg_.height;
    const o = t.getContext("2d");
    if (!o) {
      C("TextRendererFont.regenColors(): could not get 2D context.");
      return;
    }
    this.chrImages_ = [];
    for (let n = 0; n < r.COLORS.length; n++) {
      b(`Initializing font ${this.fontName_}, color ${n}...`), o.clearRect(0, 0, this.origImg_.width, this.origImg_.height), o.globalCompositeOperation = "source-over", o.drawImage(this.origImg_, 0, 0, this.origImg_.width, this.origImg_.height), o.globalCompositeOperation = "source-in", o.fillStyle = r.COLORS[n], o.fillRect(0, 0, this.origImg_.width, this.origImg_.height);
      const i = new Image();
      i.src = t.toDataURL(), this.chrImages_.push(i);
    }
  }
}
class pt {
  constructor() {
    g(this, "fonts_");
    g(this, "curFont_");
    g(this, "origFgColor_");
    g(this, "origBgColor_");
    this.fonts_ = {}, this.curFont_ = null, this.origFgColor_ = null, this.origBgColor_ = null;
  }
  async initAsync() {
    b("TextRenderer init.");
    const t = new st("default", r.CHR_FILE ?? _t);
    await t.initAsync();
    const o = t.getCharWidth(), n = t.getCharHeight();
    I(
      o === t.getCharWidth() && n === t.getCharHeight(),
      `The character image ${r.CHR_FILE} should be a 16x16 grid of characters with dimensions 16 * CONFIG.CHR_WIDTH, 16 * CONFIG.CHR_HEIGHT = ${16 * r.CHR_WIDTH} x ${16 * r.CHR_HEIGHT}`
    ), this.fonts_.default = t, this.curFont_ = t;
  }
  async loadFontAsync(t, o) {
    y("fontName", t), y("fontImageFile", o);
    const n = new st(t, o);
    await n.initAsync(), this.fonts_[t] = n;
  }
  setFont(t) {
    y("fontName", t);
    const o = this.fonts_[t];
    if (!o) {
      C(`setFont(): font not found: ${t}`);
      return;
    }
    const n = o.getCharWidth(), i = o.getCharHeight();
    if (n % r.CHR_WIDTH !== 0 || i % r.CHR_HEIGHT !== 0) {
      C(`setFont(): font ${t} has character size ${n}x${i}, which is not an integer multiple of CONFIG.CHR_WIDTH x CONFIG.CHR_HEIGHT = ${r.CHR_WIDTH}x${r.CHR_HEIGHT}, so it can't be set as the current font due to the row,column system. However, you can still use it directly with drawText() by passing it as a parameter to that function.`);
      return;
    }
    this.curFont_ = o;
  }
  print(t) {
    y("text", t);
    let o = s.cursorCol, n = s.cursorRow;
    if (this.origFgColor_ = s.fgColor, this.origBgColor_ = s.bgColor, this.curFont_ === null) {
      C("TextRenderer.print(): curFont_ is null.");
      return;
    }
    const i = Math.floor(this.curFont_.getCharWidth() / r.CHR_WIDTH), a = Math.floor(this.curFont_.getCharHeight() / r.CHR_HEIGHT), c = o;
    for (let d = 0; d < t.length; d++) {
      d = this.processEscapeSeq_(t, d);
      const h = t.charCodeAt(d);
      h === 10 ? (o = c, n += a) : (this.put_(h, o, n, s.fgColor, s.bgColor), o += i);
    }
    s.cursorCol = o, s.cursorRow = n, s.fgColor = this.origFgColor_, s.bgColor = this.origBgColor_, V();
  }
  printCentered(t, o) {
    if (y("text", t), l("width", o), t = t.split(`
`)[0], !t) return;
    const n = this.measure(t).cols, i = Math.floor(s.cursorCol + (o - n) / 2);
    s.cursorCol = i, this.print(t);
  }
  printChar(t, o) {
    for ((o === void 0 || isNaN(o)) && (o = 1), l("ch", t), l("n", o); o-- > 0; )
      this.put_(
        t,
        s.cursorCol,
        s.cursorRow,
        s.fgColor,
        s.bgColor
      ), s.cursorCol++;
    V();
  }
  // Prints a character as a "sprite" at a raw x, y position.
  spr(t, o, n) {
    l("ch", t), l("x", o), l("y", n), this.putxy_(t, o, n, s.fgColor, s.bgColor);
  }
  // Draws text at the given pixel coordinates, with no cursor movement.
  drawText(t, o, n, i) {
    l("x", t), l("y", o), y("text", n), i && y("fontName", i);
    const a = t, c = i ? this.fonts_[i] || this.curFont_ : this.curFont_;
    if (!c) {
      ut(`Requested font '${i}' not found: not drawing text.`);
      return;
    }
    for (let d = 0; d < n.length; d++) {
      const h = n.charCodeAt(d);
      h === 10 ? (t = a, o += c.getCharHeight()) : (this.putxy_(h, t, o, s.fgColor, s.bgColor, c), t += c.getCharWidth());
    }
  }
  // Returns {cols, rows}.
  measure(t) {
    if (y("text", t), t === "") return { cols: 0, rows: 0 };
    let o = 1, n = 0, i = 0;
    for (let a = 0; a < t.length; a++)
      a = this.processEscapeSeq_(t, a, !0), t.charCodeAt(a) === 10 ? (o++, n = 0) : (++n, i = Math.max(i, n));
    return { cols: i, rows: o };
  }
  printRect(t, o, n) {
    l("width", t), l("height", o), l("ch", n);
    const i = s.cursorCol, a = s.cursorRow;
    for (let c = 0; c < o; c++)
      s.cursorCol = i, s.cursorRow = a + c, this.printChar(n, t);
    s.cursorCol = i, s.cursorRow = a;
  }
  printBox(t, o, n, i) {
    const a = i, c = i + 1, d = i + 2, h = i + 3, f = i + 4, N = i + 5;
    l("width", t), l("height", o), at("fill", n), l("borderCh", i);
    const _ = s.cursorCol, O = s.cursorRow;
    for (let w = 0; w < o; w++)
      s.cursorCol = _, s.cursorRow = O + w, w === 0 ? (this.printChar(a), this.printChar(N, t - 2), this.printChar(c)) : w === o - 1 ? (this.printChar(d), this.printChar(N, t - 2), this.printChar(h)) : (this.printChar(f), s.cursorCol = _ + t - 1, this.printChar(f));
    n && t > 2 && o > 2 && (s.cursorCol = _ + 1, s.cursorRow = O + 1, this.printRect(t - 2, o - 2, 32)), s.cursorCol = _, s.cursorRow = O;
  }
  put_(t, o, n, i, a) {
    const c = r.CHR_WIDTH, d = r.CHR_HEIGHT, h = Math.round(o * c), f = Math.round(n * d);
    this.putxy_(t, h, f, i, a);
  }
  putxy_(t, o, n, i, a, c) {
    const d = c || this.curFont_;
    if (!d) {
      C("TextRenderer.putxy_: font is null.");
      return;
    }
    const h = d.getCharWidth(), f = d.getCharHeight(), N = Math.floor(t / 16), _ = t % 16;
    o = Math.round(o), n = Math.round(n), a >= 0 && (S.fillStyle = Z(a), S.fillRect(o, n, h, f));
    const O = nt(i, 0, r.COLORS.length - 1), w = d.getImageForColor(O);
    S.drawImage(
      w,
      _ * h,
      N * f,
      h,
      f,
      o,
      n,
      h,
      f
    ), V();
  }
  // Tries to run an escape sequence that starts at text[pos].
  // Returns the position after the escape sequence ends.
  // If pretend is true, then this will only parse but not run it.
  processEscapeSeq_(t, o, n = !1) {
    const i = r.PRINT_ESCAPE_START, a = r.PRINT_ESCAPE_END;
    if (!i || !a || t.substring(o, o + i.length) != i)
      return o;
    const c = t.indexOf(a, o + i.length);
    if (!n) {
      const d = t.substring(o + i.length, c);
      this.runEscapeCommand_(d);
    }
    return c + a.length;
  }
  runEscapeCommand_(t) {
    if (t.indexOf(",") > 0) {
      const a = t.split(",");
      for (const c of a) this.runEscapeCommand_(c);
      return;
    }
    if (t = t.trim(), t === "") return;
    const o = t[0].toLowerCase(), n = t.substring(1), i = 1 * Number(n);
    if (this.origFgColor_ === null)
      throw new Error("TextRenderer: origFgColor_ is null.");
    if (this.origBgColor_ === null)
      throw new Error("TextRenderer: origBgColor_ is null.");
    switch (o) {
      case "f":
      case "c":
        s.fgColor = n !== "" ? i : this.origFgColor_;
        break;
      case "b":
        s.bgColor = n !== "" ? i : this.origBgColor_;
        break;
      case "z":
        s.fgColor = this.origFgColor_, s.bgColor = this.origBgColor_;
        break;
      default:
        console.warn("Unknown QX82 print escape command: " + t);
    }
  }
  regenColors() {
    Object.values(this.fonts_).forEach((t) => t.regenColors());
  }
}
class yt {
  constructor() {
    g(this, "keysHeld_");
    g(this, "keysJustPressed_");
    this.keysHeld_ = /* @__PURE__ */ new Set(), this.keysJustPressed_ = /* @__PURE__ */ new Set(), window.addEventListener("keydown", (t) => this.onKeyDown(t)), window.addEventListener("keyup", (t) => this.onKeyUp(t));
  }
  keyHeld(t) {
    return this.keysHeld_.has(t.toUpperCase());
  }
  // API function
  keyJustPressed(t) {
    return this.keysJustPressed_.has(t.toUpperCase());
  }
  onEndFrame() {
    this.keysJustPressed_.clear();
  }
  onKeyDown(t) {
    this.keysJustPressed_.add(t.key.toUpperCase()), this.keysHeld_.add(t.key.toUpperCase()), vt("qxa.key") && Ft("qxa.key", t.key);
  }
  onKeyUp(t) {
    this.keysHeld_.delete(t.key.toUpperCase());
  }
  readKeyAsync() {
    return new Promise((t) => {
      Nt("qxa.key", t, () => "");
    });
  }
  async readLine(t, o, n = -1) {
    const i = s.cursorCol, a = s.cursorRow;
    let c = i, d = a, h = [t], f = 0;
    const N = s.cursorVisible;
    for (M.setCursorVisible(!0); ; ) {
      W(c, d), H.print(h[f] || "");
      const _ = await this.readKeyAsync();
      if (_ === "Backspace") {
        if (h[f].length === 0) {
          if (f === 0)
            continue;
          f--, d--;
        }
        h[f] = h[f].length > 0 ? h[f].substring(0, h[f].length - 1) : h[f], W(c + h[f].length, d), H.print(" ");
      } else {
        if (_ === "Enter")
          return W(1, d + 1), M.setCursorVisible(N), h.join("");
        _.length === 1 && (h.join("").length < o || o === -1) && (h[f] += _, n !== -1 && h[f].length >= n && (H.print(h[f].charAt(h[f].length - 1)), c = i, f++, h[f] = "", d++));
      }
    }
  }
}
class It {
  constructor() {
    g(this, "blinkCycle_");
    g(this, "toggleBlinkHandle_");
    this.blinkCycle_ = 0, this.toggleBlinkHandle_ = null;
  }
  setCursorVisible(t) {
    at("visible", t), s.cursorVisible !== t && (s.cursorVisible = t, this.blinkCycle_ = 0, m(), this.toggleBlinkHandle_ !== null && (clearInterval(this.toggleBlinkHandle_), this.toggleBlinkHandle_ = null), t && (this.toggleBlinkHandle_ = setInterval(() => this.advanceBlink_(), r.CURSOR.BLINK_INTERVAL)));
  }
  advanceBlink_() {
    this.blinkCycle_ = (this.blinkCycle_ + 1) % 2, m();
  }
  // Called by render() if 3D effect is off.
  // Called by tv3d.updateScreen() if 3D effect is on.
  drawCursor(t, o, n) {
    if (ct("targetCtx", t, CanvasRenderingContext2D), l("canvasWidth", o), l("canvasHeight", n), !s.cursorVisible || this.blinkCycle_ <= 0) return;
    const i = o / p.width, a = Math.round(
      (s.cursorCol + 0.5 - r.CURSOR.WIDTH_F / 2 + r.CURSOR.OFFSET_H) * r.CHR_WIDTH * i
    ), c = Math.round(
      (s.cursorRow + 1 - r.CURSOR.HEIGHT_F - r.CURSOR.OFFSET_V) * r.CHR_HEIGHT * i
    );
    t.fillStyle = Z(s.fgColor), t.fillRect(
      a,
      c,
      Math.round(r.CURSOR.WIDTH_F * r.CHR_WIDTH * i),
      Math.round(r.CURSOR.HEIGHT_F * r.CHR_HEIGHT * i)
    );
  }
}
const bt = `
  <div id='vjoy-button-up' class='vjoy-button'></div>
  <div id='vjoy-button-down' class='vjoy-button'></div>
  <div id='vjoy-button-left' class='vjoy-button'></div>
  <div id='vjoy-button-right' class='vjoy-button'></div>
`, mt = `
  <div id='vjoy-button-pri' class='vjoy-button'>A</div>
  <div id='vjoy-button-sec' class='vjoy-button'>B</div>
  <div id='vjoy-button-ter' class='vjoy-button'>=</div>
`, wt = `
  * {
    user-select: none;
    -webkit-user-select: none;
    -webkit-touch-callout: none;
  }

  #vjoy-scrim {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    top: 0;
    pointer-events: all;
  }

  #vjoy-container-left {
    box-sizing: border-box;
    position: fixed;
    bottom: 16px;
    left: 16px;
    width: 40vmin;
    height: 40vmin;
    user-select: none;
    touch-callout: none;
    -webkit-user-select: none;
    -webkit-touch-callout: none;
  }

  #vjoy-container-right {
    box-sizing: border-box;
    position: fixed;
    bottom: 16px;
    right: 16px;
    width: 40vmin;
    height: 40vmin;
    user-select: none;
    touch-callout: none;
    -webkit-user-select: none;
    -webkit-touch-callout: none;
  }

  .vjoy-button {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    background: #444;
    border: none;
    font: bold 14px monospace;
    color: #888;
    user-select: none;
    touch-callout: none;
    -webkit-user-select: none;
    -webkit-touch-callout: none;
  }
  .vjoy-button:active {
    background: #888;
  }

  #vjoy-button-up {
    position: absolute;
    left: 30%;
    top: 0px;
    width: 40%;
    height: 45%;
    border-radius: 0px 0px 50% 50%;
  }

  #vjoy-button-down {
    position: absolute;
    left: 30%;
    bottom: 0px;
    width: 40%;
    height: 45%;
    border-radius: 50% 50% 0px 0px;
  }

  #vjoy-button-left {
    position: absolute;
    left: 0px;
    bottom: 30%;
    width: 45%;
    height: 40%;
    border-radius: 0px 50% 50% 0px;
  }

  #vjoy-button-right {
    position: absolute;
    right: 0px;
    bottom: 30%;
    width: 45%;
    height: 40%;
    border-radius: 50% 0px 0px 50%;
  }

  #vjoy-button-pri {
    position: absolute;
    right: 0px;
    top: 30%;
    width: 50%;
    height: 50%;
    border-radius: 50%;
  }

  #vjoy-button-sec {
    position: absolute;
    left: 0px;
    top: 30%;
    width: 50%;
    height: 50%;
    border-radius: 50%;
  }

  #vjoy-button-ter {
    position: fixed;
    right: 0px;
    bottom: 0px;
    width: 10vw;
    height: 8vmin;
    border-radius: 8px;
    opacity: 0.5;
  }
`;
function Tt() {
  b("Setting up virtual joystick...");
  const e = document.createElement("style");
  e.setAttribute("type", "text/css"), e.innerText = wt, document.body.appendChild(e);
  const t = document.createElement("div");
  t.setAttribute("id", "vjoy-scrim"), t.addEventListener("touchstart", (i) => i.preventDefault()), document.body.appendChild(t);
  const o = document.createElement("div");
  o.setAttribute("id", "vjoy-container-left"), o.innerHTML = bt, document.body.appendChild(o);
  const n = document.createElement("div");
  n.setAttribute("id", "vjoy-container-right"), n.innerHTML = mt, document.body.appendChild(n), setTimeout(Rt, 10);
}
function Rt() {
  T("vjoy-button-up", "ArrowUp"), T("vjoy-button-down", "ArrowDown"), T("vjoy-button-left", "ArrowLeft"), T("vjoy-button-right", "ArrowRight"), T("vjoy-button-pri", "ButtonA"), T("vjoy-button-sec", "ButtonB"), T("vjoy-button-ter", "Escape"), document.body.addEventListener("touchstart", (e) => e.preventDefault());
}
function T(e, t) {
  const o = I(
    document.getElementById(e),
    "Could not find button ID " + e
  );
  if (t === null) {
    o.style.display = "none";
    return;
  }
  o.addEventListener(
    "mousedown",
    (n) => L(t, !0, n)
  ), o.addEventListener(
    "touchstart",
    (n) => L(t, !0, n)
  ), o.addEventListener(
    "mouseup",
    (n) => L(t, !1, n)
  ), o.addEventListener(
    "touchend",
    (n) => L(t, !1, n)
  ), o.addEventListener("contextmenu", (n) => n.preventDefault());
}
function L(e, t, o) {
  t ? U.onKeyDown({ key: e }) : U.onKeyUp({ key: e }), o.preventDefault();
}
let R, H, U, M, u, v, p, S, q = null, z = !1, D = 0;
const s = {
  fgColor: 7,
  bgColor: 0,
  // -1 means transparent
  cursorCol: 0,
  cursorRow: 0,
  cursorVisible: !1
  // Don't change this directly, use cursorRenderer.setCursorVisible()
};
let dt = !1, B = null, j = null, J = !1, P = 0, A = null, E = null, X = !1;
function Xt(e, t) {
  St("callback", e), t && Et(t), b(`Using config:, ${JSON.stringify(r)}`), Ht(e);
}
const F = r.SCREEN_COLS * r.CHR_WIDTH, x = r.SCREEN_ROWS * r.CHR_HEIGHT;
let K = 0, Y = 0, tt = 0, et = 0;
async function Ht(e) {
  if (b("Sys init."), r.THREE_SETTINGS && (b("Initializing 3D."), R = await import("./tv3d-BmfpDlXo.js"), b("3D module loaded.")), u = document.createElement("canvas"), r.CANVAS_SETTINGS && r.CANVAS_SETTINGS.CANVAS_ID && u.setAttribute("id", r.CANVAS_SETTINGS.CANVAS_ID), r.CANVAS_SETTINGS && r.CANVAS_SETTINGS.CANVAS_CLASSES)
    for (const o of r.CANVAS_SETTINGS.CANVAS_CLASSES)
      u.classList.add(o);
  u.addEventListener("touchstart", (o) => o.preventDefault());
  let t = document.body;
  if (r.CANVAS_SETTINGS && r.CANVAS_SETTINGS.CONTAINER) {
    const o = r.CANVAS_SETTINGS.CONTAINER;
    typeof o == "string" ? (t = document.getElementById(o), t || (console.error("QX82: Could not find container element with ID: " + o), t = document.body)) : o instanceof HTMLElement ? t = o : (console.error("QX82: CONFIG.CANVAS_SETTINGS.CONTAINER must be either an ID of an HTMLElement."), t = document.body);
  }
  t.appendChild(u), p = document.createElement("canvas"), p.width = F, p.height = x, p.style.width = F + "px", p.style.height = x + "px", S = p.getContext("2d"), S.imageSmoothingEnabled = !1, H = new pt(), U = new yt(), M = new It(), await H.initAsync(), Q(!1), window.addEventListener("resize", () => Q(!0)), R && (R.setup(u, p), Q(!1)), jt() && Tt(), dt = !0, await new Promise((o) => setTimeout(o, 1)), await e(), m();
}
function Kt(e) {
  if (z)
    throw new Error(`Can't call API method ${e}() because the engine has crashed.`);
  dt || C(`Can't call API method ${e}(): API not initialized. Call initAsync() wait until it finishes before calling API methods.`), E && C(`Can't call API method ${e}() because there is a pending async call to ${E.name}() that hasn't finished running yet. Are you missing an 'await' keyword to wait for the async method? Use 'await ${E.name}()',not just '${E.name}()'`);
}
function Nt(e, t, o) {
  if (E)
    throw new Error("Internal bug: startAsync called while pendingAsync is not null. Missing preflight() call?");
  E = {
    name: e,
    resolve: t,
    reject: o
  }, m();
}
function vt(e) {
  return E && E.name === e;
}
function Ot(e, t, o) {
  if (!E)
    throw new Error(`Internal bug: endAsync(${e}) called with no pendingAsync`);
  if (E.name !== e)
    throw new Error(`Internal bug: endAsync(${e}) called but pendingAsync.name is ${E.name}`);
  const n = E.resolve;
  E = null, n(o);
}
function Ft(e, t) {
  Ot(e, !1, t);
}
function Yt(e, t) {
  B = e, j = 1 / (t || 30), P = 0, J || window.requestAnimationFrame(ft);
}
function m() {
  if (!z) {
    if (R) {
      R.updateScreen();
      return;
    }
    v.imageSmoothingEnabled = !1, v.clearRect(0, 0, u.width, u.height), v.drawImage(
      p,
      0,
      0,
      u.width,
      u.height
    ), X = !1, M.drawCursor(v, u.width, u.height);
  }
}
function V() {
  X || (X = !0, setTimeout(m, 1));
}
function xt() {
  S.fillStyle = Z(s.bgColor), S.fillRect(0, 0, p.width, p.height), W(0, 0), V();
}
function te(e) {
  ot("colors", e), r.COLORS = e.slice(), H.regenColors();
}
function kt(e, t) {
  l("fg", e), s.fgColor = Math.round(e), t !== void 0 && (l("bg", t), s.bgColor = Math.round(t));
}
function W(e, t) {
  l("col", e), t !== void 0 && l("row", t), s.cursorCol = Math.round(e), t !== void 0 && (s.cursorRow = Math.round(t));
}
function Z(e) {
  return typeof e != "number" ? "#f0f" : e < 0 ? "#000" : (e = nt(Math.round(e), 0, r.COLORS.length - 1), r.COLORS[e]);
}
function Lt() {
  return window.performance.now ? window.performance.now() : (/* @__PURE__ */ new Date()).getTime();
}
function ee(e, t, o, n, i, a, c) {
  ct("img", e, HTMLImageElement), l("x", t), l("y", o), n !== void 0 && l("srcX", n), i !== void 0 && l("srcY", i), a !== void 0 && l("width", a), c !== void 0 && l("height", c), n !== void 0 && i !== void 0 && a !== void 0 && c !== void 0 ? S.drawImage(e, n, i, a, c, t, o, a, c) : S.drawImage(e, t, o);
}
function oe(e, t, o, n) {
  l("x", e), l("y", t), l("width", o), l("height", n);
  let i = S.strokeStyle;
  S.strokeStyle = Z(s.fgColor), S.strokeRect(
    Math.round(e) + 0.5,
    Math.round(t) + 0.5,
    Math.round(o) - 1,
    Math.round(n) - 1
  ), S.strokeStyle = i;
}
async function ft() {
  J = !1;
  const e = Lt();
  D = q !== null ? 1e-3 * (e - q) : 1 / 60, D = Math.min(D, 0.05), q = e, P += D;
  let t = 0;
  if (!j)
    throw new Error("Internal bug: frameHandlerTargetInterval is null");
  for (; B && t < 4 && P > j; )
    await B(), U.onEndFrame(), P -= j, ++t;
  m(), B && (J = !0, window.requestAnimationFrame(ft));
}
function Q(e) {
  r.THREE_SETTINGS ? Dt() : Gt(), e && m();
}
function Dt() {
  const e = !r.CANVAS_SETTINGS || r.CANVAS_SETTINGS.AUTO_SIZE, t = !r.CANVAS_SETTINGS || r.CANVAS_SETTINGS.AUTO_POSITION;
  if (!R)
    throw new Error("Internal bug: updateLayout3d() called but 3D effect is disabled.");
  const o = R.getDesiredCanvasSize(u);
  K = o.width, Y = o.height, tt = o.width, et = o.height, e && (u.style.width = o.width + "px", u.style.height = o.height + "px"), t && (u.style.position = "absolute", u.style.left = "0px", u.style.top = "0px");
}
function Gt() {
  const e = !r.CANVAS_SETTINGS || r.CANVAS_SETTINGS.AUTO_SIZE, t = !r.CANVAS_SETTINGS || r.CANVAS_SETTINGS.AUTO_POSITION;
  let o = typeof r.SCREEN_SCALE != "number", n;
  if (o) {
    const a = r.MAX_SCREEN_FRACTION || 0.8, c = e ? { width: a * window.innerWidth, height: a * window.innerHeight } : u.getBoundingClientRect();
    n = Math.floor(Math.min(
      c.width / F,
      c.height / x
    )), n = Math.min(Math.max(n, 1), 5), b(`Auto-scale: available size ${c.width} x ${c.height}, scale ${n}, dpr ${window.devicePixelRatio}`);
  } else
    n = r.SCREEN_SCALE;
  if (K = F * n, Y = x * n, tt = F * n, et = x * n, e)
    u.style.width = K + "px", u.style.height = Y + "px", u.width = tt, u.height = et;
  else {
    const a = u.getBoundingClientRect();
    u.width = a.width, u.height = a.height;
  }
  v = u.getContext("2d"), v.imageSmoothingEnabled = !1, t && (u.style.position = "absolute", u.style.left = Math.round((window.innerWidth - u.width) / 2) + "px", u.style.top = Math.round((window.innerHeight - u.height) / 2) + "px");
  const i = r.SCAN_LINES_OPACITY || 0;
  i > 0 && (t && e ? (A || (A = document.createElement("div"), document.body.appendChild(A)), A.style.background = "linear-gradient(rgba(0, 0, 0, 0) 50%, rgba(0, 0, 0, 1) 50%), linear-gradient(90deg, rgba(255, 0, 0, .6), rgba(0, 255, 0, .2), rgba(0, 0, 255, .6))", A.style.backgroundSize = "100% 4px, 3px 100%", A.style.opacity = `${i}`, A.style.position = "absolute", A.style.left = u.style.left, A.style.top = u.style.top, A.style.width = u.style.width, A.style.height = u.style.height, A.style.zIndex = "1") : console.error("QX82: 2D scanlines effect only works if CONFIG.CANVAS_SETTINGS.AUTO_POS and AUTO_SIZE are both on."));
}
let $ = !1;
function Bt(e = "Fatal error") {
  z || $ || ($ = !0, kt(r.COLORS.length - 1, 0), xt(), s.cursorCol = s.cursorRow = 1, H.print(`*** CRASH ***:
` + e), m(), $ = !1, z = !0);
}
function jt() {
  return Pt() || Vt();
}
function Pt() {
  return /(ipad|ipod|iphone)/i.test(navigator.userAgent);
}
function Vt() {
  return /android/i.test(navigator.userAgent);
}
export {
  k as A,
  ut as B,
  r as C,
  lt as D,
  zt as E,
  At as F,
  Zt as G,
  nt as H,
  ht as I,
  qt as J,
  Qt as K,
  $t as L,
  it as M,
  Jt as N,
  G as a,
  y as b,
  ot as c,
  s as d,
  l as e,
  Xt as f,
  St as g,
  Yt as h,
  U as i,
  xt as j,
  W as k,
  at as l,
  M as m,
  ct as n,
  ee as o,
  Kt as p,
  oe as q,
  m as r,
  kt as s,
  H as t,
  te as u,
  b as v,
  C as w,
  I as x,
  Ut as y,
  Mt as z
};
