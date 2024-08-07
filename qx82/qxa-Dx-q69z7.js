import { d as a, c as m, a as E, t as p, C as d, i as y, s as S, p as l, b as w, e as R } from "./main-b7_1VyY-.js";
import { r as P, c as T, a as N, l as I, p as M } from "./qx-WwCuLWFC.js";
async function O(r, t) {
  const o = {
    title: "",
    prompt: "",
    selBgColor: a.fgColor,
    // reverse video as default sel color
    selFgColor: a.bgColor,
    bgChar: 32,
    borderChar: 128,
    center: !1,
    centerH: !1,
    centerV: !1,
    padding: 1,
    selIndex: 0,
    cancelable: !1,
    ...t
  };
  m("choices", r), E("options", o);
  let s = a.cursorCol, n = a.cursorRow;
  const e = p.measure(o.prompt), i = o.prompt ? 1 : 0, f = o.borderChar ? 1 : 0;
  let C = 0;
  const _ = r.length;
  r.forEach((c) => C = Math.max(C, c.length));
  const u = Math.max(e.cols, C) + 2 * o.padding + 2 * f, h = i * (e.rows + 1) + _ + 2 * o.padding + 2 * f;
  if ((o.centerH || o.center) && (s = Math.round((d.SCREEN_COLS - u) / 2)), (o.centerV || o.center) && (n = Math.round((d.SCREEN_ROWS - h) / 2)), a.cursorCol = s, a.cursorRow = n, p.printRect(u, h, o.bgChar), o.borderChar && (p.printBox(u, h, !1, o.borderChar), o.title)) {
    const c = " " + o.title + " ";
    a.cursorCol = s + Math.round((u - c.length) / 2), p.print(c);
  }
  o.prompt && (a.cursorCol = e.cols <= u ? s + f + o.padding : s + Math.round((u - e.cols) / 2), a.cursorRow = n + f + o.padding, p.print(o.prompt));
  let g = o.selIndex;
  for (; ; ) {
    a.cursorRow = n + f + o.padding + i * (e.rows + 1), a.cursorCol = e.cols <= C ? s + f + o.padding : s + Math.round((u - C) / 2), k(r, g, o);
    const c = await y.readKeyAsync();
    if (c === "ArrowUp")
      g = g > 0 ? g - 1 : r.length - 1;
    else if (c === "ArrowDown")
      g = (g + 1) % r.length;
    else {
      if (c === "Enter" || c === "ButtonA")
        return g;
      if ((c === "Escape" || c === "ButtonB") && o.cancelable)
        return -1;
    }
  }
}
function k(r, t, o) {
  const s = a.bgColor, n = a.fgColor;
  for (let e = 0; e < r.length; e++) {
    const i = e === t;
    S(i ? o.selFgColor : n, i ? o.selBgColor : s), p.print(r[e] + `
`);
  }
  S(n, s);
}
async function x() {
  return l("qxa.key"), await y.readKeyAsync();
}
async function B(r = "", t = -1, o = -1) {
  return l("readLine"), w("initString", r), R("maxLen", t), await y.readLine(r, t, o);
}
async function b(r, t = {}) {
  return l("menu"), m("choices", r), E("options", t), await O(r, t);
}
async function F(r, t = ["OK"]) {
  return l("dialog"), w("prompt", r), m("choices", t), b(t, { prompt: r, center: !0 });
}
async function A(r) {
  l("wait"), R("seconds", r), P(), await new Promise((t) => setTimeout(t, Math.round(r * 1e3)));
}
async function L(r, t = 0.05) {
  l("typewriter"), w("text", r), R("delay", t);
  const o = T(), s = N();
  for (let n = 0; n <= r.length; n++) {
    if (d.PRINT_ESCAPE_START && r.substring(n, n + d.PRINT_ESCAPE_START.length) === d.PRINT_ESCAPE_START) {
      const i = r.indexOf(d.PRINT_ESCAPE_END, n + d.PRINT_ESCAPE_START.length);
      i >= 0 && (n = i + d.PRINT_ESCAPE_END.length);
    }
    const e = r.charCodeAt(n);
    I(o, s), M(r.substring(0, n)), e !== 32 && await A(t);
  }
}
async function j(r) {
  return l("loadImage"), new Promise((t) => {
    const o = new Image();
    o.onload = () => t(o), o.src = r;
  });
}
async function q(r) {
  return l("loadSound"), new Promise((t) => {
    const o = new Audio();
    o.oncanplaythrough = () => t(o), o.src = r, o.load();
  });
}
async function D(r) {
  l("loadFont"), w("fontImageFile", r);
  const t = "FONT@" + r;
  return await p.loadFontAsync(t, r), t;
}
const H = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  dialog: F,
  key: x,
  loadFont: D,
  loadImage: j,
  loadSound: q,
  menu: b,
  readLine: B,
  typewriter: L,
  wait: A
}, Symbol.toStringTag, { value: "Module" }));
export {
  q as a,
  D as b,
  F as d,
  x as k,
  j as l,
  b as m,
  H as q,
  B as r,
  L as t,
  A as w
};
