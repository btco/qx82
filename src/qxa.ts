/// MODULE: qxa

// ASYNC API FUNCTIONS 
// These functions must be called with 'await'.
// For example:
//
//    const k = await qxa.key();
//    console.log("The user pressed " + k);

import { inputSys, preflight, textRenderer } from "./internal/main";
import { menu as menuModuleMenu } from "./internal/menu";

import { checkArray, checkNumber, checkObject, checkString } from "./qut";
import { col, locate, print, render, row } from "./qx";
import { CONFIG } from "./config";

/// Waits until the user presses a key and returns it.
/// return:
///   The name of the key that was pressed, like "A", "B",
///   "ArrowUp", etc.
///   This is just the Javascript key name as described
///   <a href="https://developer.mozilla.org/en-US/docs/Web/API/UI_Events/Keyboard_event_key_values">here</a>.
export async function key() {
  preflight("qxa.key");
  return await inputSys.readKeyAsync();
}

/// Waits until the user inputs a line of text, then returns it.
/// initString: string (default = "")
///   The initial string presented for the user to edit.
/// maxLen: integer (default -1)
///   The maximum length of the string the user can type.
///   If this is -1, this means there is no limit.
/// maxWidth: integer (default = -1)
///   The maximum width of the input line, in characters.
///   When the user types more, the text will wrap to the next line.
///   If this is -1, this means it won't wrap at all.
export async function readLine(initString = "", maxLen = -1, maxWidth = -1) {
  preflight("readLine");
  checkString("initString", initString);
  checkNumber("maxLen", maxLen);
  return await inputSys.readLine(initString, maxLen, maxWidth);
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
export async function menu(choices: string[], options = {}) {
  preflight("menu");
  checkArray("choices", choices);
  checkObject("options", options);
  return await menuModuleMenu(choices, options);
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
export async function dialog(prompt: string, choices = ["OK"]) {
  preflight("dialog");
  checkString("prompt", prompt);
  checkArray("choices", choices);
  return menu(choices, { prompt, center: true });
}

/// Waits for a given number of seconds.
/// seconds: number
///   How long to wait for, in seconds.
export async function wait(seconds: number) {
  preflight("wait");
  checkNumber("seconds", seconds);
  render();
  await new Promise(resolve => setTimeout(resolve, Math.round(seconds * 1000)));
}

/// Shows text slowly, character by character, as in a typewriter.
/// text: string
///   The text to print.
/// delay: number (default = 0.05)
///   How long to wait between characters, in seconds. Spaces don't
///   have delay.
export async function typewriter(text: string, delay = 0.05) {
  preflight("typewriter");
  checkString("text", text);
  checkNumber("delay", delay);
  const startCol = col();
  const startRow = row();
  for (let i = 0; i <= text.length; i++) {
    // If this is the start of an escape sequence, skip to the end of it.
    if (CONFIG.PRINT_ESCAPE_START &&
      text.substring(i, i + CONFIG.PRINT_ESCAPE_START.length) === CONFIG.PRINT_ESCAPE_START) {
      const endPos = text.indexOf(CONFIG.PRINT_ESCAPE_END, i + CONFIG.PRINT_ESCAPE_START.length);
      if (endPos >= 0) i = endPos + CONFIG.PRINT_ESCAPE_END.length;
    }

    const c = text.charCodeAt(i);
    locate(startCol, startRow);

    print(text.substring(0, i));

    if (c !== 32) await wait(delay);
  }
}

/// Loads an image from the given URL.
/// url: string
///   The URL from which to load the image. This can be a relative path
///   if the image is located on the same site. Can be a PNG or a JPG.
/// return:
///   An Image object that you can use with qx.drawImage().
export async function loadImage(url: string) {
  preflight("loadImage");
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
export async function loadSound(url: string) {
  preflight("loadSound");
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
export async function loadFont(fontImageFile: string) {
  preflight("loadFont");
  checkString("fontImageFile", fontImageFile);
  const fontName = "FONT@" + fontImageFile;
  await textRenderer.loadFontAsync(fontName, fontImageFile);
  return fontName;
}