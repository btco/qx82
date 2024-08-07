import { Vector2 as _, WebGLRenderer as z, PerspectiveCamera as D, Scene as M, Color as y, CanvasTexture as O, UVMapping as L, ClampToEdgeWrapping as C, LinearFilter as H, LinearMipmapLinearFilter as G, PlaneGeometry as B, ShaderMaterial as V, Mesh as F, Vector3 as U } from "three";
import { RenderPass as W } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass as X } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass as $ } from "three/addons/postprocessing/OutputPass.js";
import { EffectComposer as k } from "three/addons/postprocessing/EffectComposer.js";
import { C as t, n as N, v as u, m as j } from "./main-b7_1VyY-.js";
const q = 75, Q = 0.1, Y = 100, R = 50, f = 0.8, E = 2, K = 11;
let h, a, s, p = new _(), m, v, S, w, T, r, l;
const Z = t.SCREEN_ROWS * t.CHR_HEIGHT;
let x;
const I = Date.now();
function ve(e, i) {
  if (N("canvasToRenderTo", e, HTMLCanvasElement), N("canvasWithScreenContents", i, HTMLCanvasElement), u("TV3D: setting up..."), h = e, v = i, a = new z({ canvas: h, antialias: !0, alpha: !0, premultipliedAlpha: !1 }), !a)
    throw new Error("QX82: Could not create WebGL renderer.");
  A(), p.set(0, 0);
  const o = g();
  if (s = new D(q, o.width / o.height, Q, Y), s.position.z = f, m = new M(), a.setClearColor(new y("black"), 0), m.background = null, r = document.createElement("canvas"), r.width = v.width * E, r.height = v.height * E, r.style.width = v.width * E + "px", r.style.height = v.height * E + "px", l = r.getContext("2d"), !l)
    throw new Error("QX82: Could not get 2D context for texture canvas.");
  l.imageSmoothingEnabled = !1, S = new O(r, L, C, C, H, G);
  const c = Math.round(
    t.SCREEN_COLS / t.SCREEN_ROWS * R
  ), n = new B(1, 1, c, R);
  te(n), T = new V({
    uniforms: {
      tex: { value: S },
      time: { value: Date.now() - I }
    },
    vertexShader: oe,
    fragmentShader: ne + re
  }), w = new F(n, T), m.add(w), ee(), requestAnimationFrame(P), console.log("Renderer clear color:", a.getClearColor(new y())), console.log("Renderer clear alpha:", a.getClearAlpha()), console.log("Scene background:", m.background), u("TV3D: setup done");
}
function g(e = null) {
  if (e = e || h, !e)
    throw new Error("QX82: tv3d.getDesiredCanvasSize() called without a targetCanvas");
  return !t.CANVAS_SETTINGS || t.CANVAS_SETTINGS.AUTO_SIZE ? {
    width: window.innerWidth,
    // Don't let the canvas be taller than it's wide.
    height: Math.min(window.innerHeight, window.innerWidth)
  } : {
    // If auto-size is off, the desired canvas size is what the canvas size currently is.
    width: e.getBoundingClientRect().width,
    height: e.getBoundingClientRect().height
  };
}
function A() {
  const e = g(h);
  h.width = e.width, h.height = e.height, a.setSize(e.width, e.height), a.setPixelRatio(window.devicePixelRatio);
}
function J() {
  return 1e-3 * (Date.now() - I);
}
function me() {
  if (!v)
    throw new Error("QX82: tv3d.updateScreen() called before setup()");
  if (!r)
    throw new Error("QX82: tv3d.updateScreen() called before setup()");
  if (!l)
    throw new Error("QX82: tv3d.updateScreen() called before setup()");
  l.imageSmoothingEnabled = !1, l.clearRect(0, 0, r.width, r.height), l.drawImage(v, 0, 0, r.width, r.height), j.drawCursor(l, r.width, r.height), S.needsUpdate = !0;
}
function P() {
  requestAnimationFrame(P), T.uniforms.time.value = J(), x ? x.render() : a.render(m, s);
}
function ee() {
  const e = g();
  if (e.width === p.x && e.height === p.y) return;
  p.set(e.width, e.height), A(), s.aspect = e.width / e.height, s.updateProjectionMatrix();
  let i = t.SCREEN_COLS / t.SCREEN_ROWS;
  if (t.THREE_SETTINGS && t.THREE_SETTINGS.ASPECT_OVERRIDE && (i = t.THREE_SETTINGS.ASPECT_OVERRIDE), s.aspect >= i)
    s.position.z = f;
  else {
    const o = s.aspect / i;
    s.position.z = f + (-1 + 1 / o) * 0.65;
  }
  if (w.scale.x = i, t.THREE_SETTINGS.BLOOM_ENABLED) {
    u("TV3D: setting up post-processing.");
    const o = new W(m, s, null, null, 0), c = new X(
      new _(e.width, e.height),
      t.THREE_SETTINGS.BLOOM_STRENGTH,
      t.THREE_SETTINGS.BLOOM_RADIUS,
      t.THREE_SETTINGS.BLOOM_THRESH
    ), n = new $();
    x = new k(a), x.addPass(o), x.addPass(c), x.addPass(n);
  }
}
function te(e) {
  const i = e.getAttribute("position"), o = e.getAttribute("position").array, c = new U();
  for (let n = 0; n + 2 < o.length; n += 3) {
    c.set(o[n], o[n + 1], o[n + 2]);
    const b = c.length();
    o[n] = c.x, o[n + 1] = c.y, o[n + 2] = -Math.pow(b, K);
  }
  i.needsUpdate = !0;
}
const d = t.THREE_SETTINGS, oe = `
  varying vec3 modelPos;
  varying vec2 varUv;

  void main() {
    modelPos = position;
    varUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`, re = `
  varying vec3 modelPos;
  varying vec2 varUv;
  uniform sampler2D tex;
  uniform float time;

  float timedNoise(vec3 modelPos, float t) {
    return snoise(vec3(modelPos.x * 500.0, modelPos.y * 500.0, t));
  }

  vec4 addScanLines(vec3 modelPos, vec4 color) {
    // Add 10 so we don't have to deal with negative numbers.
    float t = 10.0 + modelPos.y * float(${Z});
    
    float distToFloor = fract(t);
    float distToCeil = 1.0 - distToFloor;
    float distToNearestInt = min(distToFloor, distToCeil);

    // Integers are the black bands, so we want the scanline intensity to
    // be 1 there, and quickly fall towards 0 as we get away from them:
    float intensity = 1.0 - smoothstep(0.0, float(${d.SCANLINES_THICKNESS}), distToNearestInt);
    float factor = max(0.0, 1.0 - intensity * float(${d.SCANLINES_INTENSITY}));
    return color * factor;
  }

  vec4 addNoise(vec3 modelPos, vec4 color) {
    float t = time * float(${d.NOISE_SPEED});
    float factor1 = 1.0 - timedNoise(modelPos, t) * float(${d.NOISE_INTENSITY});
    vec4 baseColor = vec4(
      timedNoise(modelPos, t),
      timedNoise(modelPos, t * 2.0),
      timedNoise(modelPos, t * 3.0), 1.0) * .1 * float(${d.NOISE_INTENSITY});
    
    return baseColor + color * factor1;
  }

  vec4 addTVBorder(vec3 modelPos, vec4 color) {
    float distToBorderH = abs(abs(modelPos.x) - 0.5);
    float distToBorderV = abs(abs(modelPos.y) - 0.5);
    float distToBorder = min(distToBorderH, distToBorderV);
    float f = 1.0 -
      smoothstep(0.0, float(${d.BORDER_THICKNESS}), distToBorder);
    return color + vec4(f, f, f, 1.0) * float(${d.BORDER_INTENSITY});
  }

  void main() {
    vec4 color = texture2D(tex, varUv);

    color = addScanLines(modelPos, color);
    color = addNoise(modelPos, color);
    color = addTVBorder(modelPos, color);

    gl_FragColor = color;
  }
`, ne = `
//
// Description : Array and textureless GLSL 2D/3D/4D simplex 
//               noise functions.
//      Author : Ian McEwan, Ashima Arts.
//  Maintainer : stegu
//     Lastmod : 20201014 (stegu)
//     License : Copyright (C) 2011 Ashima Arts. All rights reserved.
//               Distributed under the MIT License. See LICENSE file.
//               https://github.com/ashima/webgl-noise
//               https://github.com/stegu/webgl-noise
// 

vec3 mod289(vec3 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 mod289(vec4 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 permute(vec4 x) {
     return mod289(((x*34.0)+10.0)*x);
}

vec4 taylorInvSqrt(vec4 r)
{
  return 1.79284291400159 - 0.85373472095314 * r;
}

float snoise(vec3 v)
  { 
  const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
  const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

// First corner
  vec3 i  = floor(v + dot(v, C.yyy) );
  vec3 x0 =   v - i + dot(i, C.xxx) ;

// Other corners
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min( g.xyz, l.zxy );
  vec3 i2 = max( g.xyz, l.zxy );

  //   x0 = x0 - 0.0 + 0.0 * C.xxx;
  //   x1 = x0 - i1  + 1.0 * C.xxx;
  //   x2 = x0 - i2  + 2.0 * C.xxx;
  //   x3 = x0 - 1.0 + 3.0 * C.xxx;
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy; // 2.0*C.x = 1/3 = C.y
  vec3 x3 = x0 - D.yyy;      // -1.0+3.0*C.x = -0.5 = -D.y

// Permutations
  i = mod289(i); 
  vec4 p = permute( permute( permute( 
             i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) 
           + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

// Gradients: 7x7 points over a square, mapped onto an octahedron.
// The ring size 17*17 = 289 is close to a multiple of 49 (49*6 = 294)
  float n_ = 0.142857142857; // 1.0/7.0
  vec3  ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);  //  mod(p,7*7)

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)

  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4( x.xy, y.xy );
  vec4 b1 = vec4( x.zw, y.zw );

  //vec4 s0 = vec4(lessThan(b0,0.0))*2.0 - 1.0;
  //vec4 s1 = vec4(lessThan(b1,0.0))*2.0 - 1.0;
  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

  vec3 p0 = vec3(a0.xy,h.x);
  vec3 p1 = vec3(a0.zw,h.y);
  vec3 p2 = vec3(a1.xy,h.z);
  vec3 p3 = vec3(a1.zw,h.w);

//Normalise gradients
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

// Mix final noise value
  vec4 m = max(0.5 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 105.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), 
                                dot(p2,x2), dot(p3,x3) ) );
  }
`;
export {
  g as getDesiredCanvasSize,
  ve as setup,
  me as updateScreen
};
