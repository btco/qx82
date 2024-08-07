import { cursorRenderer, drawState, hasPendingAsync, resolveAsync, setCursorLocation, startAsync, textRenderer } from "./main";

export class InputSys {
  keysHeld_: Set<string>;
  keysJustPressed_: Set<string>;

  constructor() {
    // Keys currently held down (array of strings).
    this.keysHeld_ = new Set();
    // Keys that were just pressed on this frame.
    this.keysJustPressed_ = new Set();

    window.addEventListener("keydown", e => this.onKeyDown(e));
    window.addEventListener("keyup", e => this.onKeyUp(e));
  }

  keyHeld(keyName: string) {
    return this.keysHeld_.has(keyName.toUpperCase());
  }
  // API function
  keyJustPressed(keyName: string) { return this.keysJustPressed_.has(keyName.toUpperCase()); }

  onEndFrame() {
    this.keysJustPressed_.clear();
  }

  onKeyDown(e: { key: string }) {
    this.keysJustPressed_.add(e.key.toUpperCase());
    this.keysHeld_.add(e.key.toUpperCase());

    if (hasPendingAsync("qxa.key")) {
      resolveAsync("qxa.key", e.key);
    }
  }

  onKeyUp(e: { key: string }) {
    this.keysHeld_.delete(e.key.toUpperCase());
  }

  readKeyAsync() {
    return new Promise<string>((resolve) => {
      startAsync("qxa.key", resolve as () => string, () => '');
    });
  }

  async readLine(initString: string, maxLen: number, maxWidth = -1) {
    const startCol = drawState.cursorCol;
    const startRow = drawState.cursorRow;
    let curCol = startCol;
    let curRow = startRow;
    let curStrings = [initString];
    let curPos = 0;
    const cursorWasVisible = drawState.cursorVisible;

    cursorRenderer.setCursorVisible(true);
    while (true) {
      setCursorLocation(curCol, curRow);
      textRenderer.print(curStrings[curPos] || "");
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
        setCursorLocation(curCol + curStrings[curPos].length, curRow);
        textRenderer.print(" ");
      } else if (key === "Enter") {
        // Move cursor to start of next line.
        setCursorLocation(1, curRow + 1);
        // Restore previous cursor state.
        cursorRenderer.setCursorVisible(cursorWasVisible);
        return curStrings.join("");
      } else if (key.length === 1) {
        if (curStrings.join("").length < maxLen || maxLen === -1) {
          curStrings[curPos] += key;

          if (maxWidth !== -1 && curStrings[curPos].length >= maxWidth) {
            textRenderer.print(curStrings[curPos].charAt(curStrings[curPos].length - 1));
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
