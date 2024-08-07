import { f as w, p as o, g as R, e as t, h as T, r as S, s as F, d as u, j as v, k as B, l as m, m as H, b as i, t as a, n as c, o as x, q as b, i as g, c as A, u as E } from "./main-b7_1VyY-.js";
function I(e, n) {
  return w(e, n);
}
function L(e, n = 30) {
  return o("qx.frame"), e !== null && R("handler", e), t("fps", n), T(e, n);
}
function M() {
  return o("qx.render"), S();
}
function $(e, n) {
  o("qx.color"), t("fg", e), n !== void 0 && t("bg", n), F(e, n);
}
function j() {
  return o("getFgColor"), u.fgColor;
}
function _() {
  return o("getBgColor"), u.bgColor;
}
function h() {
  o("qx.cls"), v();
}
function O(e, n) {
  o("qx.locate"), t("col", e), n !== void 0 && t("row", n), B(e, n);
}
function z() {
  return o("col"), u.cursorCol;
}
function D() {
  return o("row"), u.cursorRow;
}
function P(e) {
  o("cursor"), m("visible", e), H.setCursorVisible(e);
}
function G(e) {
  o("qx.text"), i("text", e), a.print(e);
}
function J(e, n) {
  o("qx.printCentered"), i("text", e), t("width", n), a.printCentered(e, n);
}
function N(e, n, r, s) {
  o("qx.drawText"), t("x", e), t("y", n), i("text", r), s && i("fontId", s), a.drawText(e, n, r, s);
}
function V(e) {
  return o("measure"), i("text", e), a.measure(e);
}
function K(e, n = 1) {
  o("qx.printChar"), e = f(e), t("charCode", e), t("numTimes", n), a.printChar(e, n);
}
function Q(e, n, r = 32) {
  o("qx.printRect"), r = f(r), t("widthCols", e), t("heightRows", n), t("charCode", r), a.printRect(e, n, r);
}
function U(e, n, r = !0, s = 128) {
  o("qx.printBox"), s = f(s), t("widthCols", e), t("heightRows", n), m("fill", r), t("borderChar", s), a.printBox(e, n, r, s);
}
function W(e, n, r) {
  c("image", r, HTMLImageElement), t("x", e), t("y", n), x(r, e, n);
}
function X(e, n, r, s, l, p, d) {
  c("image", r, HTMLImageElement), t("x", e), t("y", n), t("srcX", s), t("srcY", l), t("width", p), t("height", d), x(r, e, n, s, l, p, d);
}
function Y(e, n, r, s) {
  t("x", e), t("y", n), t("width", r), t("height", s), b(e, n, r, s);
}
function q(e, n, r, s) {
  t("x", e), t("y", n), t("width", r), t("height", s), q(e, n, r, s);
}
function Z(e, n = 1, r = !1) {
  c("sfx", e, HTMLAudioElement), e.currentTime = 0, e.volume = n, e.loop = r, e.play();
}
function ee(e, n, r) {
  e = f(e), t("ch", e), t("x", n), t("y", r), a.spr(e, n, r);
}
function ne(e) {
  return o("qx.key"), i("keyName", e), g.keyHeld(e);
}
function te(e) {
  return o("qx.keyp"), i("keyName", e), g.keyJustPressed(e);
}
function re(e) {
  o("qx.redefineColors"), A("colors", e), E(e);
}
function oe(e = "default") {
  o("qx.setFont"), i("fontId", e), a.setFont(e);
}
function f(e) {
  return typeof e == "string" ? e.charCodeAt(0) : e;
}
function se(e) {
  c("sfx", e, HTMLAudioElement), e.currentTime = 0, e.pause();
}
function C() {
  return C();
}
function k() {
  return k();
}
function y(e) {
  return y();
}
const ie = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  cls: h,
  col: z,
  color: $,
  cursor: P,
  drawImage: W,
  drawImageRect: X,
  drawRect: Y,
  drawText: N,
  fillRect: q,
  frame: L,
  getBgColor: _,
  getContext: C,
  getFgColor: j,
  init: I,
  key: ne,
  keyp: te,
  locate: O,
  measure: V,
  playSound: Z,
  print: G,
  printBox: U,
  printCentered: J,
  printChar: K,
  printRect: Q,
  redefineColors: re,
  render: M,
  restoreScreen: y,
  row: D,
  saveScreen: k,
  setFont: oe,
  spr: ee,
  stopSound: se
}, Symbol.toStringTag, { value: "Module" }));
export {
  te as A,
  re as B,
  oe as C,
  se as D,
  C as E,
  k as F,
  y as G,
  D as a,
  $ as b,
  z as c,
  _ as d,
  h as e,
  L as f,
  j as g,
  P as h,
  I as i,
  J as j,
  N as k,
  O as l,
  V as m,
  K as n,
  Q as o,
  G as p,
  ie as q,
  M as r,
  U as s,
  W as t,
  X as u,
  Y as v,
  q as w,
  Z as x,
  ee as y,
  ne as z
};
