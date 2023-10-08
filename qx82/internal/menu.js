import * as qut from "../qut.js";
import * as main from "./main.js";
import { CONFIG } from "../config.js";

// For documentation, see the menu() function in qxa.js.
export async function menu(choices, options) {
  options = options || {};
  qut.checkArray("choices", choices);
  qut.checkObject("options", options);

  options = Object.assign({
    title: "",
    prompt: "",
    selBgColor: main.drawState.fgColor, // reverse video as default sel color
    selFgColor: main.drawState.bgColor,
    bgChar: 32,
    borderChar: 0x80,
    center: false,
    centerH: false,
    centerV: false,
    padding: 1,
    selIndex: 0,
    cancelable: false,
  }, options);

  let startCol = main.drawState.cursorCol;
  let startRow = main.drawState.cursorRow;

  const promptSize = main.textRenderer.measure(options.prompt);
  const prompt01 = options.prompt ? 1 : 0;
  const border01 = options.borderChar ? 1 : 0;
  let choicesCols = 0;
  const choicesRows = choices.length;
  choices.forEach(choice => choicesCols = Math.max(choicesCols, choice.length));

  const totalCols =
    Math.max(promptSize.cols, choicesCols) + 2 * options.padding + 2 * border01;
  const totalRows =
    prompt01 * (promptSize.rows + 1) + choicesRows + 2 * options.padding + 2 * border01;

  if (options.centerH || options.center) {
    startCol = Math.round((CONFIG.SCREEN_COLS - totalCols)/2);
  }
  if (options.centerV || options.center) {
    startRow = Math.round((CONFIG.SCREEN_ROWS - totalRows)/2);
  }
  main.drawState.cursorCol = startCol;
  main.drawState.cursorRow = startRow;
  
  // Print the background.
  main.textRenderer.printRect(totalCols, totalRows, options.bgChar);
  // Print the border.
  if (options.borderChar) {
    main.textRenderer.printBox(totalCols, totalRows, false, options.borderChar);
    // Print title at the top of the border.
    if (options.title) {
      const t = " " + options.title + " ";
      main.drawState.cursorCol = startCol + Math.round((totalCols - t.length) / 2);
      main.textRenderer.print(t);
    }
  }
  if (options.prompt) {
    main.drawState.cursorCol = promptSize.cols <= totalCols ?
      (startCol + border01 + options.padding) :
      (startCol + Math.round((totalCols - promptSize.cols)/2));
    main.drawState.cursorRow = startRow + border01 + options.padding;
    main.textRenderer.print(options.prompt);
  }

  // TODO: save the screen image before showing the menu and restore it later.

  let selIndex = options.selIndex;

  while (true) {
    // Draw choices.
    main.drawState.cursorRow =
      startRow + border01 + options.padding + prompt01 * (promptSize.rows + 1);
    main.drawState.cursorCol = (promptSize.cols <= choicesCols) ? 
      (startCol + border01 + options.padding) :
      (startCol + Math.round((totalCols - choicesCols) / 2));
    printChoices(choices, selIndex, options);

    const k = await main.inputSys.readKeyAsync();
    if (k === "ArrowUp") {
      selIndex = selIndex > 0 ? selIndex - 1 : choices.length - 1;
    } else if (k === "ArrowDown") {
      selIndex = (selIndex + 1) % choices.length;
    } else if (k === "Enter" || k === "ButtonA") {
      // TODO: erase menu
      return selIndex;
    } else if ((k === "Escape" || k === "ButtonB") && options.cancelable) {
      return -1;
    }
  }
}

function printChoices(choices, selIndex, options) {
  const origBg = main.drawState.bgColor;
  const origFg = main.drawState.fgColor;
  for (let i = 0; i < choices.length; i++) {
    const isSel = i === selIndex;
    main.setColor(isSel ? options.selFgColor : origFg, isSel ? options.selBgColor : origBg);
    main.textRenderer.print(choices[i] + "\n");
  }
  main.setColor(origFg, origBg);
}
