/// MODULE: qxa

// ASYNC API FUNCTIONS 
// These functions must be called with 'await'.
// For example:
//
//    const k = await qxa.key();
//    console.log("The user pressed " + k);

import * as main from "./internal/main.js";
import * as menuMod from "./internal/menu.js";

import * as qut from "./qut.js";
import * as qx from "./qx.js";
import { CONFIG } from "./config.js";

/// Waits until the user presses a key and returns it.
/// return:
///   The name of the key that was pressed, like "A", "B",
///   "ArrowUp", etc.
///   This is just the Javascript key name as described
///   <a href="https://developer.mozilla.org/en-US/docs/Web/API/UI_Events/Keyboard_event_key_values">here</a>.
export async function key() {
  main.preflight("qxa.key");
  return await main.inputSys.readKeyAsync();
}

/// Waits until the user inputs a line of text, then returns it.
/// initString: string (default = "")
///   The initial string presented for the user to edit.
/// maxLen: integer (default -1)
///   The maximum length of the string the user can type.
///   If this is -1, this means there is no limit.
export async function readLine(initString = "", maxLen = -1) {
  main.preflight("readLine");
  qut.checkString("initString", initString);
  qut.checkNumber("maxLen", maxLen);
  return await main.inputSys.readLine(initString, maxLen);
}

/// Shows a menu of choices and waits for the user to pick an option.
/// choices: array
///   An array of choices, for example ["Foo", "Bar", "Qux"]
/// options: Object (default = {})
///   Additional options, as a dictionary. These are the available options:
///   <ul>
///   * title: the title to show on the window
///   * prompt: the prompt to show. Can be multiple lines (use \n)
///   * selFgColor: foreground color of selected item
///   * selBgColor: background color of selected item
///   * bgChar: character to use for the background of the window
///   * borderChar: border character to use for the window
///   * centerH: if true, center the menu horizontally on the screen
///   * centerV: if true, center the menu vertically on the screen
///   * center: if true, equivalent to centerH and centerV
///   * padding: padding between window borders and contents, default 1.
///   * selIndex: initially selected index, default 0.
///   * cancelable: if true, the user can cancel the menu with ESC, in which
///   case the return value will be -1.
///   </ul>
/// return:
///   Returns the index of the item selected by the user, or -1 if the
///   menu was cancelable and the user cancelled it.
export async function menu(choices, options = {}) {
  main.preflight("menu");
  qut.checkArray("choices", choices);
  qut.checkObject("options", options);
  return await menuMod.menu(choices, options);
}

/// Displays a dialog with the given prompt and choices.
/// This is a syntactical convenience to menu().
/// prompt: string
///   The text to show like "Error reticulating splines."
/// choices: array (default = ["OK"])
///   The choices to present to the user. If omitted, this will
///   just show "OK". You can use for example ["No","Yes"] if you
///   want the user to be able to choose one of those options to
///   confirm something.
export async function dialog(prompt, choices = ["OK"]) {
  main.preflight("dialog");
  qut.checkString("prompt", prompt);
  qut.checkArray("choices", choices);
  return menu(choices, { prompt, center: true });
}

/// Waits for a given number of seconds.
/// seconds: number
///   How long to wait for, in seconds.
export async function wait(seconds) {
  main.preflight("wait");
  qut.checkNumber("seconds", seconds);
  qx.render();
  await new Promise(resolve => setTimeout(resolve, Math.round(seconds * 1000)));
}

/// Shows text slowly, character by character, as in a typewriter.
/// text: string
///   The text to print.
/// delay: number (default = 0.05)
///   How long to wait between characters, in seconds. Spaces don't
///   have delay.
export async function typewriter(text, delay = 0.05) {
  main.preflight("typewriter");
  qut.checkString("text", text);
  qut.checkNumber("delay", delay);
  const startCol = qx.col();
  const startRow = qx.row();
  for (let i = 0; i <= text.length; i++) {
    // If this is the start of an escape sequence, skip to the end of it.
    if (CONFIG.PRINT_ESCAPE_START &&
        text.substring(i, i + CONFIG.PRINT_ESCAPE_START.length) === CONFIG.PRINT_ESCAPE_START) {
      const endPos = text.indexOf(CONFIG.PRINT_ESCAPE_END, i + CONFIG.PRINT_ESCAPE_START.length);
      if (endPos >= 0) i = endPos + CONFIG.PRINT_ESCAPE_END.length;
    }

    const c = text.charCodeAt(i);
    qx.locate(startCol, startRow);

    qx.print(text.substring(0, i));

    if (c !== 32) await wait(delay);
  }
}

/// Loads an image from the given URL.
/// url: string
///   The URL from which to load the image. This can be a relative path
///   if the image is located on the same site. Can be a PNG or a JPG.
/// return:
///   An Image object that you can use with qx.drawImage().
export async function loadImage(url) {
  main.preflight("loadImage");
  return new Promise(resolver => {
    const img = new Image();
    img.onload = () => resolver(img);
    img.src = url;
  });
}

/// Loads a sound file from the given URL.
/// url: string
///   The URL from which to load the sound. This can be a relative path
///   if the image is located on the same site. Can be a WAV or MP3.
/// return:
///   A Sound object that you can use with qx.playSound().
export async function loadSound(url) {
  main.preflight("loadSound");
  return new Promise(resolver => {
    const audio = new Audio();
    audio.oncanplaythrough = () => resolver(audio);
    audio.src = url;
    audio.load();
  });
}

/// Loads a font for later use in drawing text.
/// fontImageFile: string
///   The URL to an image file containing the font. This image file should be
///   a grid of the font's character laid out in a 16x16 grid. The character width
///   and height will be deduced from the image size by dividing the width and height
///   by 16, respectively. Therefore, the image's dimensions must both be a multiple of 16.
/// return:
///   A font ID that you can later use in functions that take a font like
///   qx.setFont() and qx.drawText().
export async function loadFont(fontImageFile) {
  main.preflight("loadFont");
  qut.checkString("fontImageFile", fontImageFile);
  const fontName = "FONT@" + fontImageFile;
  await main.textRenderer.loadFontAsync(fontName, fontImageFile);
  return fontName;
}