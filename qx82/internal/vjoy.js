import * as qut from "../qut.js";
import {CONFIG} from "../config.js";
import { inputSys } from "./main.js";

const LEFT_VJOY_HTML = `
  <div id='vjoy-button-up' class='vjoy-button'></div>
  <div id='vjoy-button-down' class='vjoy-button'></div>
  <div id='vjoy-button-left' class='vjoy-button'></div>
  <div id='vjoy-button-right' class='vjoy-button'></div>
`;

const RIGHT_VJOY_HTML = `
  <div id='vjoy-button-pri' class='vjoy-button'>A</div>
  <div id='vjoy-button-sec' class='vjoy-button'>B</div>
  <div id='vjoy-button-ter' class='vjoy-button'>=</div>
`;

const VJOY_CSS = `
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


// Adds the virtual joystick to the screen and sets it up.
export function setup() {
  qut.log("Setting up virtual joystick...");

  const styleEl = document.createElement("style");
  styleEl.setAttribute("type", "text/css");
  styleEl.innerText = VJOY_CSS;
  document.body.appendChild(styleEl);

  const scrim = document.createElement("div");
  scrim.setAttribute("id", "vjoy-scrim");
  scrim.addEventListener("touchstart", e => e.preventDefault());
  document.body.appendChild(scrim);

  const leftContainer = document.createElement("div");
  leftContainer.setAttribute("id", "vjoy-container-left");
  leftContainer.innerHTML = LEFT_VJOY_HTML;
  document.body.appendChild(leftContainer);

  const rightContainer = document.createElement("div");
  rightContainer.setAttribute("id", "vjoy-container-right");
  rightContainer.innerHTML = RIGHT_VJOY_HTML;
  document.body.appendChild(rightContainer);

  setTimeout(continueSetup, 10);
}

function continueSetup() {
  setUpButton("vjoy-button-up", "ArrowUp");
  setUpButton("vjoy-button-down", "ArrowDown");
  setUpButton("vjoy-button-left", "ArrowLeft");
  setUpButton("vjoy-button-right", "ArrowRight");
  setUpButton("vjoy-button-pri", "ButtonA");
  setUpButton("vjoy-button-sec", "ButtonB");
  setUpButton("vjoy-button-ter", "Escape");

  // Prevent touches on the document body from doing what they usually do (opening
  // context menus, selecting stuff, etc).
  document.body.addEventListener("touchstart", e => e.preventDefault());
}

function setUpButton(buttonId, buttonKeyName) {
  const button = qut.assert(document.getElementById(buttonId),
    "Could not find button ID " + buttonId);
  if (buttonKeyName === null) {
    // This means the user wants to hide the button.
    button.style.display = "none";
    return;
  }
  button.addEventListener("mousedown",
    (e) => handleButtonEvent(buttonKeyName, true, e));
  button.addEventListener("touchstart",
    (e) => handleButtonEvent(buttonKeyName, true, e));
  button.addEventListener("mouseup",
    (e) => handleButtonEvent(buttonKeyName, false, e));
  button.addEventListener("touchend",
    (e) => handleButtonEvent(buttonKeyName, false, e));
  button.addEventListener("contextmenu", e => e.preventDefault());
}

function handleButtonEvent(buttonKeyName, down, evt) {
  if (down) inputSys.onKeyDown({ key: buttonKeyName });
  else inputSys.onKeyUp({ key: buttonKeyName });
  evt.preventDefault();
}

