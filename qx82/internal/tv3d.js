import * as THREE from "three";
import {RenderPass} from "three/addons/postprocessing/RenderPass.js";
import {UnrealBloomPass} from "three/addons/postprocessing/UnrealBloomPass.js";
import {OutputPass} from "three/addons/postprocessing/OutputPass.js";
import {EffectComposer} from "three/addons/postprocessing/EffectComposer.js";

import * as qut from "../qut.js";
import * as main from "./main.js";
import {CONFIG} from "../config.js";

const CAMERA_FOV = 75;
const CAMERA_NEAR = 0.1;
const CAMERA_FAR = 100;
const GEOM_HEIGHT_SEGMENTS = 50;
const CAMERA_Z = 0.8;
const SCREEN_TEX_UPSCALE = 2;
// The bigger this number is, the flatter the screen will be.
const SCREEN_CURVATURE_EXP = 11;

// The canvas that we render to.
let realCanvas = null;
let renderer = null;
let camera = null;
let lastCanvasSize = new THREE.Vector2();
let scene = null;

// The canvas with the screen contents.
let screenCanvas = null;

// The texture that renders the screen canvas.
let canvasTexture = null;

// The mesh that represents the screen.
let screenMesh = null;
// Material used to render the screen.
let screenMat = null;

// Texture canvas (a scaled up version of the screen canvas).
let texCanvas = null;
let texCtx = null;

// Scan line density.
const SCANLINE_DENSITY = (CONFIG.SCREEN_ROWS * CONFIG.CHR_HEIGHT);

// If we're using post-processing, this is the effect composer. If not, this is null.
let effectComposer = null;

const initTime = Date.now();

export function setup(canvasToRenderTo, canvasWithScreenContents) {
  qut.checkInstanceOf("canvasToRenderTo", canvasToRenderTo, HTMLCanvasElement);
  qut.checkInstanceOf("canvasWithScreenContents", canvasWithScreenContents, HTMLCanvasElement);
  qut.log("TV3D: setting up...");
  realCanvas = canvasToRenderTo;
  screenCanvas = canvasWithScreenContents;
  renderer = new THREE.WebGLRenderer({canvas: realCanvas, antialias: true});
  updateRendererSize();
  renderer.setClearColor(new THREE.Color(CONFIG.BG_COLOR || "#000"));
  lastCanvasSize.set(0, 0);
  const size = getDesiredCanvasSize();
  camera = new THREE.PerspectiveCamera(
    CAMERA_FOV, size.width / size.height, CAMERA_NEAR, CAMERA_FAR);
  camera.position.z = CAMERA_Z;
  scene = new THREE.Scene();
  scene.background = new THREE.Color(CONFIG.BG_COLOR || "#000");

  texCanvas = document.createElement("canvas");
  texCanvas.width = screenCanvas.width * SCREEN_TEX_UPSCALE;
  texCanvas.height = screenCanvas.height * SCREEN_TEX_UPSCALE;
  texCanvas.style.width = (screenCanvas.width * SCREEN_TEX_UPSCALE) + "px";
  texCanvas.style.height = (screenCanvas.height * SCREEN_TEX_UPSCALE) + "px";
  texCtx = texCanvas.getContext("2d");
  texCtx.imageSmoothingEnabled = false;

  canvasTexture = new THREE.CanvasTexture(
    texCanvas, THREE.UVMapping, THREE.ClampToEdgeWrapping, THREE.ClampToEdgeWrapping,
    THREE.LinearFilter, THREE.LinearMipmapLinearFilter);

  const geomWidthSegments =
    Math.round(
      (CONFIG.SCREEN_COLS / CONFIG.SCREEN_ROWS) * GEOM_HEIGHT_SEGMENTS);
  const geom = new THREE.PlaneGeometry(1, 1, geomWidthSegments, GEOM_HEIGHT_SEGMENTS);
  deformPlane(geom);
  screenMat = new THREE.ShaderMaterial({
    uniforms: {
      tex: { type: "t", value: canvasTexture },
      time: { value: Date.now() - initTime },
    },
    vertexShader: VERTEX_SHADER,
    fragmentShader: ASHIMA_WEBGL_NOISE + FRAGMENT_SHADER
  });
  screenMesh = new THREE.Mesh(geom, screenMat);
  scene.add(screenMesh);

  maybeFixRenderSize();
  requestAnimationFrame(doFrame);
  qut.log("TV3D: setup done");
}

// NOTE: this can be called before setup(), but in this case the targetCanvas parameter must be
// non-null.
export function getDesiredCanvasSize(targetCanvas = null) {
  targetCanvas = targetCanvas || realCanvas;
  if (!targetCanvas) {
    throw new Error("QX82: tv3d.getDesiredCanvasSize() called without a targetCanvas");
  }
  const autoSize = !CONFIG.CANVAS_SETTINGS || CONFIG.CANVAS_SETTINGS.AUTO_SIZE;
  return autoSize ? {
    width: window.innerWidth,
    // Don't let the canvas be taller than it's wide.
    height: Math.min(window.innerHeight, window.innerWidth)
  } : {
    // If auto-size is off, the desired canvas size is what the canvas size currently is.
    width: targetCanvas.getBoundingClientRect().width,
    height: targetCanvas.getBoundingClientRect().height
  }
}

function updateRendererSize() {
  const s = getDesiredCanvasSize(realCanvas);
  realCanvas.width = s.width;
  realCanvas.height = s.height;
  renderer.setSize(s.width, s.height);
  renderer.setPixelRatio(window.devicePixelRatio);
}

function getShaderTime() {
  return 0.001 * (Date.now() - initTime);
}

export function updateScreen() {
  // Copy screen canvas contents to the texture canvas.
  texCtx.imageSmoothingEnabled = false;
  texCtx.clearRect(0, 0, texCanvas.width, texCanvas.height);
  texCtx.drawImage(screenCanvas, 0, 0, texCanvas.width, texCanvas.height);
  main.cursorRenderer.drawCursor(texCtx, texCanvas.width, texCanvas.height);
  // Mark canvasTexture as needing an update since the underlying canvas was updated.
  canvasTexture.needsUpdate = true;
}

function doFrame() {
  requestAnimationFrame(doFrame);
  maybeFixRenderSize();
  screenMat.uniforms.time.value = getShaderTime();
  if (effectComposer) effectComposer.render();
  else renderer.render(scene, camera);
}

function maybeFixRenderSize() {
  const size = getDesiredCanvasSize();
  if (size.width === lastCanvasSize.x &&
      size.height === lastCanvasSize.y) return;
  lastCanvasSize.set(size.width, size.height);
  updateRendererSize();
  camera.aspect = size.width / size.height;
  camera.updateProjectionMatrix();

  let desiredAspect = CONFIG.SCREEN_COLS / CONFIG.SCREEN_ROWS;
  if (CONFIG.THREE_SETTINGS && CONFIG.THREE_SETTINGS.ASPECT_OVERRIDE) {
    desiredAspect = CONFIG.THREE_SETTINGS.ASPECT_OVERRIDE;
  }

  if (camera.aspect >= desiredAspect) {
    camera.position.z = CAMERA_Z;
  } else {
    const ratio = camera.aspect / desiredAspect;
    // Fix camera distance in a hacky way such that the screen is
    // full visible, especially on mobile devices in portrait
    // orientation.
    camera.position.z = CAMERA_Z + (-1 + 1 / ratio) * 0.65;
  }

  screenMesh.scale.x = desiredAspect;

  // Re-create the effect composer.
  if (CONFIG.THREE_SETTINGS.BLOOM_ENABLED) {
    qut.log("TV3D: setting up post-processing.");
    const renderPass = new RenderPass(scene, camera);
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(size.width, size.height),
      CONFIG.THREE_SETTINGS.BLOOM_STRENGTH,
      CONFIG.THREE_SETTINGS.BLOOM_RADIUS,
      CONFIG.THREE_SETTINGS.BLOOM_THRESH);
    const outputPass = new OutputPass();
    effectComposer = new EffectComposer(renderer);
    effectComposer.addPass(renderPass);
    effectComposer.addPass(bloomPass);
    effectComposer.addPass(outputPass);
  }
}

function deformPlane(geom) {
  const posBuf = geom.getAttribute("position");
  const posBufArray = geom.getAttribute("position").array;
  const p = new THREE.Vector3();
  for (let i = 0; i + 2 < posBufArray.length; i += 3) {
    p.set(posBufArray[i], posBufArray[i + 1], posBufArray[i + 2]);
    const d = p.length();
    posBufArray[i] = p.x;
    posBufArray[i + 1] = p.y;
    posBufArray[i + 2] = -Math.pow(d, SCREEN_CURVATURE_EXP);
  }
  posBuf.needsUpdate = true;
  geom.needsUpdate = true;
}

// Shorthand for 3D settings
const S3D = CONFIG.THREE_SETTINGS;

const VERTEX_SHADER = `
  varying vec3 modelPos;
  varying vec2 varUv;

  void main() {
    modelPos = position;
    varUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const FRAGMENT_SHADER = `
  varying vec3 modelPos;
  varying vec2 varUv;
  uniform sampler2D tex;
  uniform float time;

  float timedNoise(vec3 modelPos, float t) {
    return snoise(vec3(modelPos.x * 500.0, modelPos.y * 500.0, t));
  }

  vec4 addScanLines(vec3 modelPos, vec4 color) {
    // Add 10 so we don't have to deal with negative numbers.
    float t = 10.0 + modelPos.y * float(${SCANLINE_DENSITY});
    
    float distToFloor = fract(t);
    float distToCeil = 1.0 - distToFloor;
    float distToNearestInt = min(distToFloor, distToCeil);

    // Integers are the black bands, so we want the scanline intensity to
    // be 1 there, and quickly fall towards 0 as we get away from them:
    float intensity = 1.0 - smoothstep(0.0, float(${S3D.SCANLINES_THICKNESS}), distToNearestInt);
    float factor = max(0.0, 1.0 - intensity * float(${S3D.SCANLINES_INTENSITY}));
    return color * factor;
  }

  vec4 addNoise(vec3 modelPos, vec4 color) {
    float t = time * float(${S3D.NOISE_SPEED});
    float factor1 = 1.0 - timedNoise(modelPos, t) * float(${S3D.NOISE_INTENSITY});
    vec4 baseColor = vec4(
      timedNoise(modelPos, t),
      timedNoise(modelPos, t * 2.0),
      timedNoise(modelPos, t * 3.0), 1.0) * .1 * float(${S3D.NOISE_INTENSITY});
    
    return baseColor + color * factor1;
  }

  vec4 addTVBorder(vec3 modelPos, vec4 color) {
    float distToBorderH = abs(abs(modelPos.x) - 0.5);
    float distToBorderV = abs(abs(modelPos.y) - 0.5);
    float distToBorder = min(distToBorderH, distToBorderV);
    float f = 1.0 -
      smoothstep(0.0, float(${S3D.BORDER_THICKNESS}), distToBorder);
    return color + vec4(f, f, f, 1.0) * float(${S3D.BORDER_INTENSITY});
  }

  void main() {
    vec4 color = texture2D(tex, varUv);

    color = addScanLines(modelPos, color);
    color = addNoise(modelPos, color);
    color = addTVBorder(modelPos, color);

    gl_FragColor = color;
  }
`;

// Source:
// https://github.com/ashima/webgl-noise/blob/master/src/noise3D.glsl
// (MIT licensed)
const ASHIMA_WEBGL_NOISE = `
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
