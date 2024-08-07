declare global {
  type Rectangle = {
    x: number;
    y: number;
    w: number;
    h: number;
  }

  type IntersectInterval = {
    start: number;
    end: number;
  }

  type Config = {
    DEBUG: boolean;
    THREE_SETTINGS: {
      NOISE_SPEED: number;
      NOISE_INTENSITY: number;
      SCANLINES_THICKNESS: number;
      SCANLINES_INTENSITY: number;
      BLOOM_ENABLED: boolean;
      BLOOM_THRESH: number;
      BLOOM_STRENGTH: number;
      BLOOM_RADIUS: number;
      BORDER_THICKNESS: number;
      BORDER_INTENSITY: number;
      ASPECT_OVERRIDE: number | null;
    };
    CANVAS_SETTINGS: {
      CANVAS_ID: string;
      CANVAS_CLASSES: string[];
      AUTO_POSITION: boolean;
      AUTO_SIZE: boolean;
      CONTAINER: string | HTMLElement | null;
    };
    BG_COLOR: string;
    CHR_FILE?: string;
    CHR_WIDTH: number;
    CHR_HEIGHT: number;
    SCREEN_ROWS: number;
    SCREEN_COLS: number;
    SCREEN_SCALE: "auto" | number;
    MAX_SCREEN_FRACTION: number;
    SCAN_LINES_OPACITY: number;
    COLORS: string[],
    TOUCH_VJOY: boolean;
    CURSOR: {
      WIDTH_F: number;
      HEIGHT_F: number;
      BLINK_INTERVAL: number;
      OFFSET_V: number;
      OFFSET_H: number;
    }
    PRINT_ESCAPE_START: string;
    PRINT_ESCAPE_END: string;
  }
}

export { }