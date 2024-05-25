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

  async readLine(initString, maxLen, maxWidth = -1) {
    const startCol = main.drawState.cursorCol;
    const startRow = main.drawState.cursorRow;
    let curCol = startCol;
    let curRow = startRow;
    let curStrings = [initString];
    let curPos = 0;
    const cursorWasVisible = main.drawState.cursorVisible;

    main.cursorRenderer.setCursorVisible(true);
    while (true) {
      main.setCursorLocation(curCol, curRow);
      main.textRenderer.print(curStrings[curPos] || "");
      const key = await this.readKeyAsync();
      if (key === "Backspace") {
        if (curStrings[curPos].length === 0) {
          if (curPos === 0) {
            continue;
          }
          curPos--;
          curRow--;
        }
        curStrings[curPos] = curStrings[curPos].length > 0 ? curStrings[curPos].substring(0, curStrings[curPos].length - 1) : curStrings[curPos];
        // Erase the character.
        main.setCursorLocation(curCol + curStrings[curPos].length, curRow);
        main.textRenderer.print(" ");
      } else if (key === "Enter") {
        // Move cursor to start of next line.
        main.setCursorLocation(1, curRow + 1);
        // Restore previous cursor state.
        main.cursorRenderer.setCursorVisible(cursorWasVisible);
        return curStrings.join("");
      } else if (key.length === 1) {
        if (curStrings.join("").length < maxLen || maxLen === -1) {
          curStrings[curPos] += key;

          if (maxWidth !== -1 && curStrings[curPos].length >= maxWidth) {
            main.textRenderer.print(curStrings[curPos].charAt(curStrings[curPos].length-1));
            curCol = startCol;
            curPos++;
            curStrings[curPos] = "";
            curRow++;
          }
        }
      }
    }
  }
}
