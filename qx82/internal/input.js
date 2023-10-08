import * as main from "./main.js";

export class InputSys {
  constructor() {
    // Keys currently held down (array of strings).
    this.keysHeld_ = new Set();
    // Keys that were just pressed on this frame.
    this.keysJustPressed_ = new Set();

    window.addEventListener("keydown", e => this.onKeyDown(e));
    window.addEventListener("keyup", e => this.onKeyUp(e));
  }

  keyHeld(keyName) { 
    return this.keysHeld_.has(keyName.toUpperCase());
  }
  // API function
  keyJustPressed(keyName) { return this.keysJustPressed_.has(keyName.toUpperCase()); }

  onEndFrame() {
    this.keysJustPressed_.clear();
  }

  onKeyDown(e) {
    this.keysJustPressed_.add(e.key.toUpperCase());
    this.keysHeld_.add(e.key.toUpperCase());

    if (main.hasPendingAsync("qxa.key")) {
      main.resolveAsync("qxa.key", e.key);
    }
  }

  onKeyUp(e) {
    this.keysHeld_.delete(e.key.toUpperCase());
  }

  readKeyAsync() {
    return new Promise((resolve, reject) => {
      main.startAsync("qxa.key", resolve, reject);
    });
  }

  async readLine(initString, maxLen) {
    const startCol = main.drawState.cursorCol;
    const startRow = main.drawState.cursorRow;
    let curString = initString;
    const cursorWasVisible = main.drawState.cursorVisible;

    main.cursorRenderer.setCursorVisible(true);

    while (true) {
      main.setCursorLocation(startCol, startRow);
      main.textRenderer.print(curString);
      const key = await this.readKeyAsync();
      if (key === "Backspace") {
        curString = curString.length > 0 ? curString.substring(0, curString.length - 1) : curString;
        // Erase the character.
        main.setCursorLocation(startCol + curString.length, startRow);
        main.textRenderer.print(" ");
      } else if (key === "Enter") {
        // Move cursor to start of next line.
        main.setCursorLocation(1, startRow + 1);
        // Restore previous cursor state.
        main.cursorRenderer.setCursorVisible(cursorWasVisible);
        return curString;
      } else if (key.length === 1) {
        curString += key;
      }
    }
  }
}
