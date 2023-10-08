import * as qut from "../qut.js";
import {CONFIG} from "../config.js";
import { inputSys } from "./main.js";

const LEFT_VJOY_HTML = `
  <button id='vjoy-button-up' class='vjoy-button'></button>
  <button id='vjoy-button-down' class='vjoy-button'></button>
  <button id='vjoy-button-left' class='vjoy-button'></button>
  <button id='vjoy-button-right' class='vjoy-button'></button>
`;

const RIGHT_VJOY_HTML = `
  <button id='vjoy-button-pri' class='vjoy-button'>A</button>
  <button id='vjoy-button-sec' class='vjoy-button'>B</button>
  <button id='vjoy-button-ter' class='vjoy-button'>=</button>
`;

const VJOY_CSS = `
  #vjoy-container-left {
    position: fixed;
    bottom: 64px;
    left: 64px;
    width: 30vmin;
    height: 30vmin;
  }

  #vjoy-container-right {
    position: fixed;
    bottom: 64px;
    right: 64px;
    width: 30vmin;
    height: 30vmin;
  }

  .vjoy-button {
    background: #eee;
    border: none;
    font: bold 14px monospace;
    text-align: center;
    color: #888;
  }
  .vjoy-button:active {
    background: #888;
  }

  #vjoy-button-up {
    position: absolute;
    left: 35%;
    top: 0px;
    width: 30%;
    height: 45%;
    border-radius: 0px 0px 50% 50%;
  }

  #vjoy-button-down {
    position: absolute;
    left: 35%;
    bottom: 0px;
    width: 30%;
    height: 45%;
    border-radius: 50% 50% 0px 0px;
  }

  #vjoy-button-left {
    position: absolute;
    left: 0px;
    bottom: 35%;
    width: 45%;
    height: 30%;
    border-radius: 0px 50% 50% 0px;
  }

  #vjoy-button-right {
    position: absolute;
    right: 0px;
    bottom: 35%;
    width: 45%;
    height: 30%;
    border-radius: 50% 0px 0px 50%;
  }

  #vjoy-button-pri {
    position: absolute;
    right: 0px;
    top: 35%;
    width: 45%;
    height: 45%;
    border-radius: 50%;
  }

  #vjoy-button-sec {
    position: absolute;
    left: 0px;
    top: 35%;
    width: 45%;
    height: 45%;
    border-radius: 50%;
  }

  #vjoy-button-ter {
    position: fixed;
    right: 5vw;
    bottom: 5vw;
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
}

function setUpButton(buttonId, buttonKeyName) {
  const button = qut.assert(document.getElementById(buttonId),
    "Could not find button ID " + buttonId);
  if (buttonKeyName === null) {
    // This means the user wants to hide the button.
    button.style.display = "none";
    return;
  }
  button.addEventListener("mousedown", () => handleButtonEvent(buttonKeyName, true));
  button.addEventListener("touchdown", () => handleButtonEvent(buttonKeyName, true));
  button.addEventListener("mouseup", () => handleButtonEvent(buttonKeyName, false));
  button.addEventListener("touchup", () => handleButtonEvent(buttonKeyName, false));
}

function handleButtonEvent(buttonKeyName, down) {
  if (down) inputSys.onKeyDown({ key: buttonKeyName });
  else inputSys.onKeyUp({ key: buttonKeyName });
}

