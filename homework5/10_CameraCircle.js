/*-------------------------------------------------------------------------
10_CameraCircle.js  (Homework05)

- Viewing a squared pyramid fixed on the ground (no rotation)
- Perspective projection (FOV 60°)
- Camera:
  * rotates in xz-plane on a circle of radius 3 at 90 deg/sec
  * y-position oscillates between 0 and 10 using sin() at 45 deg/sec
  * always looks at the origin (the pyramid center)
---------------------------------------------------------------------------*/

import { resizeAspectRatio, Axes } from '../util/util.js';
import { Shader, readShaderFile } from '../util/shader.js';
import { SquarePyramid } from './squarePyramid.js';

const canvas = document.getElementById('glCanvas');
const gl = canvas.getContext('webgl2');

let shader;
let isInitialized = false;
let startTime, lastFrameTime;

let viewMatrix = mat4.create();
let projMatrix = mat4.create();
let modelMatrix = mat4.create(); // 사각뿔은 고정이므로 항상 identity

// Camera motion params
const CAM_R = 3.0;                 // xz 원운동 반지름
const CAM_SPEED_DEG = 90.0;        // xz 각속도 [deg/sec]
const CAM_Y_SPEED_DEG = 45.0;      // y 사인 각속도 [deg/sec]
const CAM_Y_CENTER = 5.0;          // y 중심값
const CAM_Y_AMP = 5.0;             // y 진폭 (→ 0~10 범위)

const pyramid = new SquarePyramid(gl);   // 밑면 1×1, 높이 1
const axes = new Axes(gl, 1.8);

document.addEventListener('DOMContentLoaded', () => {
  if (isInitialized) return;

  main().then(ok => {
    if (!ok) return;
    isInitialized = true;
  }).catch(err => console.error(err));
});

function initWebGL() {
  if (!gl) {
    console.error('WebGL 2 is not supported by your browser.');
    return false;
  }
  canvas.width = 700;
  canvas.height = 700;
  resizeAspectRatio(gl, canvas);
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(0.7, 0.8, 0.9, 1.0);
  gl.enable(gl.DEPTH_TEST);
  return true;
}

async function initShader() {
  const vsrc = await readShaderFile('shVert.glsl');
  const fsrc = await readShaderFile('shFrag.glsl');
  shader = new Shader(gl, vsrc, fsrc);
}

function render() {
  const now = Date.now();
  const deltaTime = (now - lastFrameTime) / 1000.0;
  const t = (now - startTime) / 1000.0;  // seconds from start
  lastFrameTime = now;

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // 사각뿔은 고정 (model = I). 필요 시 매 프레임 재설정해서 누적오차 방지
  mat4.identity(modelMatrix);

  // --- Camera path ---
  const theta = glMatrix.toRadian(CAM_SPEED_DEG) * t;
  const camX = CAM_R * Math.cos(theta);
  const camZ = CAM_R * Math.sin(theta);

  const phi = glMatrix.toRadian(CAM_Y_SPEED_DEG) * t;
  const camY = CAM_Y_CENTER + CAM_Y_AMP * Math.sin(phi); // 0~10

  mat4.lookAt(
    viewMatrix,
    vec3.fromValues(camX, camY, camZ),
    vec3.fromValues(0, 0.5, 0), // 약간 가운데(밑면 중심과 꼭짓점 중간)로 보도록 해도 OK
    vec3.fromValues(0, 1, 0)
  );

  // --- Draw pyramid ---
  shader.use();
  shader.setMat4('u_model', modelMatrix);
  shader.setMat4('u_view', viewMatrix);
  shader.setMat4('u_projection', projMatrix);
  pyramid.draw();

  // --- Draw axes ---
  axes.draw(viewMatrix, projMatrix);

  requestAnimationFrame(render);
}

async function main() {
  try {
    if (!initWebGL()) throw new Error('WebGL init failed');
    await initShader();

    // Perspective projection
    mat4.perspective(
      projMatrix,
      glMatrix.toRadian(60.0),
      canvas.width / canvas.height,
      0.1,
      100.0
    );

    startTime = lastFrameTime = Date.now();
    requestAnimationFrame(render);
    return true;
  } catch (e) {
    console.error('Initialization error:', e);
    alert('Failed to initialize program');
    return false;
  }
}
