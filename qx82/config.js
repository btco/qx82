export const CONFIG = {
  // Enable debug?
  DEBUG: true,
  // Use 3D effect for the screen?
  // Set this to null to disable the 3D effect.
  THREE_SETTINGS: {
    NOISE_SPEED: 4,
    NOISE_INTENSITY: .25,

    SCANLINES_THICKNESS: 0.3,
    SCANLINES_INTENSITY: 0.5,

    BLOOM_ENABLED: true,
    BLOOM_THRESH: 0.30,
    BLOOM_STRENGTH: 0.15,
    BLOOM_RADIUS: 0.05,

    BORDER_THICKNESS: 0.02,
    BORDER_INTENSITY: 0.02,
  },
  // Background color to fill the space not used by the screen.
  // For best results this should be the same as the page's background.
  BG_COLOR: "#000",
  // Characters file
  CHR_FILE: "assets/chr.png",
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
  SCREEN_SCALE: "auto",
  // Maximum fraction of the screen to occupy with the canvas.
  MAX_SCREEN_FRACTION: 0.95,
  // If set, this is the opacity of the "scan lines" effect.
  // If 0 or not set, don't show scan lines.
  SCAN_LINES_OPACITY: 0.2,
  // Color palette. This can be as many colors as you want, but each color requires us to
  // store a scaled copy of the characters image in memory, so more colors = more memory.
  // You can redefine the colors at runtime with qx.redefineColors.
  COLORS: [
    "#000", "#00A", "#A00", "#A0A", "#0A0", "#0AA", "#AA0", "#DDD",
    "#666", "#00F", "#F00", "#F0F", "#0F0", "#0FF", "#FF0", "#FFF"
  ],
  // If this is not null, then we will display a virtual joystick if the user
  // is on a mobile device.
  TOUCH_VJOY: true
};

