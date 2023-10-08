/// MODULE: qut

import {CONFIG} from "./config.js";
import * as main from "./internal/main.js";

/// Shows a fatal error and throws an exception.
/// error: string
///   The error to show.
export function fatal(error) {
  console.error("Fatal error: " + error);
  try {
    main.handleCrash(error);
  } catch (e) {
    console.error("Error in main.handleCrash: " + e + " while handling error " + error);
  }
  throw new Error("Error: " + error);
}

/// Asserts that the given condition is true, else shows a fatal error.
/// cond: boolean
///   The condition that you fervently hope will be true.
/// msg: string
///   The error message to show if the condition is false.
/// return:
///   For convenience, this function returns the 'cond' parameter.
export function assert(cond, msg) {
  if (!cond) fatal(msg || "Assertion Failed");
  return cond;
}

/// Same as qut.assert() but only asserts if CONFIG.DEBUG is true.
/// cond: boolean
///   The condition that you fervently hope will be true.
/// msg: string
///   The error message to show if the condition is false.
export function assertDebug(cond, msg) {
  if (!cond) {
    if (CONFIG.DEBUG) {
      warn("DEBUG ASSERT failed: " + msg);
    } else {
      fatal(msg);
    }
  }
  return cond;
}

/// Asserts that two values are equal.
/// expected: any
///   What you expect the value to be.
/// actual: any
///   What the value actually is.
/// what: string
///   A description of what the value is, like "dragon's position",
///   "magician's spell state" or something like that.
export function assertEquals(expected, actual, what) {
  if (expected !== actual) {
    fatal(`${what}: expected ${expected} but got ${actual}`);
  }
  return actual;
}

/// Checks the type of something and throws an exception if
/// it's in the incorrect type. You can also use the convenience
/// functions qut.checkNumber(), qut.checkString() etc as those
/// are more practical to use.
/// varName: string
///   The name of the variable, like "levelName" or something.
/// varValue: any
///   The value of the variable.
/// varType:
///   The expected type of the variable like "string".
export function checkType(varName, varValue, varType) {
  assert(varName, "checkType: varName must be provided.");
  assert(varType, "checkType: varType must be provided.");
  assert(typeof(varValue) === varType,
    `${varName} should be of type ${varType} but was ${typeof(varValue)}: ${varValue}`);
  return varValue;
}

/// Checks that something you expect to be a number actually is a number,
/// and throws an exception otherwise. This also considers it an error
/// if the value is NaN.
/// varName: string
///   The name of the variable.
/// varValue: any
///   The value of the variable.
/// optMin: integer (optional)
///   If present, this is the minimum acceptable value for the variable.
/// optMax: integer (optional)
///   If present, this is the maximum acceptable value for the variable.
export function checkNumber(varName, varValue, optMin, optMax) {
  checkType(varName, varValue, "number");
  if (isNaN(varValue)) {
    fatal(`${varName} should be a number but is NaN`);
  }
  if (!isFinite(varValue)) {
    fatal(`${varName} should be a number but is infinite: ${varValue}`);
  }
  if (optMin !== undefined) {
    assert(varValue >= optMin, `${varName} should be >= ${optMin} but is ${varValue}`);
  }
  if (optMax !== undefined) {
    assert(varValue <= optMax, `${varName} should be <= ${optMax} but is ${varValue}`);
  }
  return varValue;
}

/// Checks that a variable is a string, throwing an exception otherwise.
/// varName: string
///   The name of the variable.
/// varValue: any
///   The value of the variable.
export function checkString(varName, varValue) { return checkType(varName, varValue, "string"); }

/// Checks that a variable is a boolean, throwing an exception otherwise.
/// varName: string
///   The name of the variable.
/// varValue: any
///   The value of the variable.
export function checkBoolean(varName, varValue) { return checkType(varName, varValue, "boolean"); }

/// Checks that a variable is a function, throwing an exception otherwise.
/// varName: string
///   The name of the variable.
/// varValue: any
///   The value of the variable.
export function checkFunction(varName, varValue) { return checkType(varName, varValue, "function"); }

/// Checks that a variable is an object, throwing an exception otherwise.
/// Also throws an error if the value is null.
/// varName: string
///   The name of the variable.
/// varValue: any
///   The value of the variable.
export function checkObject(varName, varValue) {
  if (varValue === null) {
    // null is an "object" but we don't want that.
    fatal(`${varName} should be an object, but was null`);
  }
  return checkType(varName, varValue, "object");
}

/// Checks that a variable is an instance of a given class,
/// throwing an exception otherwise.
/// varName: string
///   The name of the variable.
/// varValue: any
///   The value of the variable.
/// expectedClass: type
///   The expected class. This is the actual class, not a string
///   with the class name.
export function checkInstanceOf(varName, varValue, expectedClass) {
  assert(varValue instanceof expectedClass,
    `${varName} should be an instance of ${expectedClass} but was not, it's: ${varValue}`);
  return varValue;
}

/// Checks that a variable is an array, throwing an exception otherwise.
/// varName: string
///   The name of the variable.
/// varValue: any
///   The value of the variable.
export function checkArray(varName, varValue) {
  assert(Array.isArray(varValue), `${varName} should be an array, but was: ${varValue}`);
  return varValue;
}

/// Prints a log to the Javascript console if CONFIG.DEBUG is true.
/// msg:
///   The message to print.
//DOC-PSEUDO-DECL:export function log(msg) {
export const log = CONFIG.DEBUG ? console.log : (() => {});

/// Prints a warning to the Javascript console.
/// msg:
///   The message to print.
//DOC-PSEUDO-DECL:export function warn(msg) {
export const warn = console.warn;

/// Prints an error to the Javascript console.
/// msg:
///   The message to print.
//DOC-PSEUDO-DECL:export function error(msg) {
export const error = console.error;

export async function loadImageAsync(src) {
  return new Promise(resolver => {
    const img = new Image();
    img.onload = () => resolver(img);
    img.src = src;
  });
}

export function loadFileAsync(url) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.sta
    xhr.addEventListener("load", () => {
      if (xhr.status < 200 || xhr.status > 299) {
        reject("HTTP request finished with status " + xhr.status);
      } else {
        resolve(xhr.responseText);
      }
    });
    xhr.addEventListener("error", e => reject(e));
    xhr.open("GET", url);
    xhr.send();
  });
}

/// Clamps a number, ensuring it's between a minimum and a maximum.
/// x: number
///   The number to clamp.
/// lo: number
///   The minimum.
/// hi: number
///   The maximum.
/// return:
///   The clamped number.
export function clamp(x, lo, hi) {
  return Math.min(Math.max(x, lo), hi);
}

/// Returns a random integer in the given closed interval.
/// lowInclusive: integer
///   The minimum (inclusive).
/// highInclusive: integer
///   The maximum (inclusive).
export function randomInt(lowInclusive, highInclusive) {
  checkNumber("lowInclusive", lowInclusive);
  checkNumber("highInclusive", highInclusive);
  lowInclusive = Math.round(lowInclusive);
  highInclusive = Math.round(highInclusive);
  if (highInclusive <= lowInclusive) return lowInclusive;
  return clamp(
    Math.floor(
      Math.random() * (highInclusive - lowInclusive + 1)) + lowInclusive,
    lowInclusive, highInclusive);
}

/// Returns a randomly picked element of the given array.
/// array: array
///   The array to pick from.
/// return:
///   A randomly picked element of the given array, or null if
///   the array is empty.
export function randomPick(array) {
  checkArray("array", array);
  return array.length > 0 ? array[randomInt(0, array.length - 1)] : null;
}


/// Shuffles an array, that is, randomly reorder the elements.
/// Does not modify the original array. Returns the shuffled array.
/// array: array
///   The array to shuffle.
/// return:
///   The shuffled array.
export function shuffleArray(array) {
  checkArray("array", array);
  array = array.slice();
  for (let i = 0; i < array.length; i++) {
    const j = randomInt(0, array.length - 1);
    const tmp = array[i];
    array[i] = array[j];
    array[j] = tmp;
  }
  return array;
}

/// Calculates a 2D distance between points (x0, y0) and (x1, y1).
export function dist2d(x0, y0, x1, y1) {
  checkNumber("x0", x0);
  checkNumber("y0", y0);
  checkNumber("x1", x1);
  checkNumber("y1", y1);
  const dx = x0 - x1;
  const dy = y0 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}

/// Calculates the intersection between two integer number intervals
/// [as, ae] and [bs, be], both endpoints are inclusive.
/// as: number
///   The start of the first interval, inclusive.
/// ae: number
///   The end of the first interval, inclusive.
/// bs: number
///   The start of the second interval, inclusive.
/// be: number
///   The end of the second interval, inclusive.
/// result: Object (default = null)
///   If provided, this is used to return the intersection (see below).
/// return:
///   If there is an intersection, returns true. If there is no
///   intersection (the segments don't overlap), returns false.
///   If this returns true and a 'result' object was provided, then
///   result.start is set to the interval's start, and result.end
///   is set to the interval's end.
export function intersectIntervals(as, ae, bs, be, result = null) {
  checkNumber("as", as);
  checkNumber("ae", ae);
  checkNumber("bs", bs);
  checkNumber("be", be);
  if (result) checkObject("result", result);
  const start = Math.max(as, bs);
  const end = Math.min(ae, be);
  if (end >= start) {
    if (result) {
      result.start = start;
      result.end = end;
    }
    return true;
  }
  return false;
}

/// Calculates the intersection of two rectangles.
/// r1: Rectangle
///   A rectangle, an object with {x,y,w,h}.
/// r2: Rectangle
///   The other rectangle, an object with {x,y,w,h}.
/// dx1: number (default = 0)
///   The delta X to add to the first rectangle for the purposes of
///   the calculation.
/// dy1: number (default = 0)
///   The delta Y to add to the first rectangle for the purposes of
///   the calculation.
/// dx2: number (default = 0)
///   The delta X to add to the second rectangle for the purposes of
///   the calculation.
/// dy2: number (default = 0)
///   The delta Y to add to the second rectangle for the purposes of
///   the calculation.
/// result: object (default = null)
///   If provided, this is used to return the intersection information
///   (see below).
/// return:
///   Returns true if there is a non-empty intersection, false if there
///   isn't. If this returns true and the 'result' object was provided,
///   then sets result.x, result.y, result.w, result.h to represent
///   the intersection rectangle.
export function intersectRects(r1, r2, dx1 = 0, dy1 = 0, dx2 = 0, dy2 = 0, result = null) {
  checkObject("r1", r1);
  checkObject("r2", r2);
  checkNumber("r1.x", r1.x);
  checkNumber("r1.y", r1.y);
  checkNumber("r1.w", r1.w);
  checkNumber("r1.h", r1.h);
  checkNumber("r2.x", r2.x);
  checkNumber("r2.y", r2.y);
  checkNumber("r2.w", r2.w);
  checkNumber("r2.h", r2.h);
  checkNumber("dx1", dx1);
  checkNumber("dx2", dx2);
  checkNumber("dy1", dy1);
  checkNumber("dy2", dy2);
  if (result) checkObject("result", result);

  const xint = intersectRects_xint;
  const yint = intersectRects_yint;
  if (!intersectIntervals(
    r1.x + dx1,
    r1.x + dx1 + r1.w - 1,
    r2.x + dx2,
    r2.x + dx2 + r2.w - 1, xint)) return false;
  if (!intersectIntervals(
    r1.y + dy1,
    r1.y + dy1 + r1.h - 1,
    r2.y + dy2,
    r2.y + dy2 + r2.h - 1, yint)) return false;
  if (result) {
    result.x = xint.start;
    result.w = xint.end - xint.start + 1;
    result.y = yint.start;
    result.h = yint.end - yint.start + 1;
  }
  return true;
}
const intersectRects_xint = {};
const intersectRects_yint = {};
