/*-----------------------------------------------------------------------------------
13_Texture.js

- Viewing a 3D unit pyramid at origin with perspective projection
- Rotating the pyramid by ArcBall interface (by left mouse button dragging)
- Applying ONE image texture so that it wraps continuously across the 4 side faces
  and the bottom face uses the FULL image (handled in SquarePyramid's texcoords)
-----------------------------------------------------------------------------------*/

import { resizeAspectRatio, Axes } from '../util/util.js';
import { Shader, readShaderFile } from '../util/shader.js';
import { SquarePyramid } from '../util/squarePyramid.js';
import { Arcball } from '../util/arcball.js';
import { loadTexture } from '../util/texture.js';

const canvas = document.getElementById('glCanvas');
const gl = canvas.getContext('webgl2');

let shader;
let isInitialized = false;

let viewMatrix = mat4.create();
let projMatrix = mat4.create();
let modelMatrix = mat4.create();

const axes = new Axes(gl, 1.5); // length 1.5
const pyramid = new SquarePyramid(gl);

// Arcball (rotation & zoom handled internally)
const arcball = new Arcball(canvas, 5.0, { rotation: 2.0, zoom: 0.0005 });

// Load a single texture image
const texture = loadTexture(gl, false, '../images/textures/sunrise.jpg'); // see util/texture.js

document.addEventListener('DOMContentLoaded', () => {
  if (isInitialized) return;

  main().then((ok) => {
    if (!ok) {
      console.log('program terminated');
      return;
    }
    isInitialized = true;
    requestAnimationFrame(render);
  }).catch((err) => {
    console.error('program terminated with error:', err);
  });
});

function initWebGL() {
  if (!gl) {
    console.error('WebGL 2 is not supported by your browser.');
    return false;
  }

  // canvas size & viewport
  canvas.width = 700;
  canvas.height = 700;
  resizeAspectRatio(gl, canvas);
  gl.viewport(0, 0, canvas.width, canvas.height);

  // clear color & basic states
  gl.clearColor(0.1, 0.2, 0.3, 1.0);
  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.CULL_FACE);
  gl.cullFace(gl.BACK);
  gl.frontFace(gl.CCW);

  // handle window resize
  window.addEventListener('resize', () => {
    resizeAspectRatio(gl, canvas);
    gl.viewport(0, 0, canvas.width, canvas.height);
    // update projection on resize
    mat4.perspective(
      projMatrix,
      glMatrix.toRadian(60),
      canvas.width / canvas.height,
      0.1,
      1000.0
    );
  });

  return true;
}

async function initShader() {
  const vs = await readShaderFile('shVert.glsl');
  const fs = await readShaderFile('shFrag.glsl');
  shader = new Shader(gl, vs, fs);

  // set static uniforms that don't change per-frame
  shader.use();
  shader.setMat4('u_model', modelMatrix);
  shader.setMat4('u_projection', projMatrix);

  // assign sampler to texture unit 0 (once is enough)
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  shader.setInt('u_texture', 0);

  // (optional but recommended) texture sampling quality / wrapping
  // if loadTexture already sets these, duplicated calls are fine
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
}

function render() {
  // clear & depth
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // update view from arcball each frame
  viewMatrix = arcball.getViewMatrix();

  // draw pyramid with texture shader
  shader.use();
  shader.setMat4('u_view', viewMatrix);
  // model/projection are static unless you animate them
  shader.setMat4('u_model', modelMatrix);
  shader.setMat4('u_projection', projMatrix);

  // texture is already bound to unit 0; ensure active in case other code changed state
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texture);

  pyramid.draw(shader);

  // draw axes (uses its own internal shader)
  axes.draw(viewMatrix, projMatrix);

  requestAnimationFrame(render);
}

async function main() {
  try {
    if (!initWebGL()) throw new Error('WebGL init failed');

    // View transform: move world -3 in z so pyramid is visible
    mat4.translate(viewMatrix, viewMatrix, vec3.fromValues(0, 0, -3));

    // Projection transform (constant; updated on resize as well)
    mat4.perspective(
      projMatrix,
      glMatrix.toRadian(60),             // fov
      canvas.width / canvas.height,      // aspect
      0.1,                               // near
      1000.0                             // far
    );

    await initShader();
    return true;
  } catch (e) {
    console.error('Failed to initialize program:', e);
    alert('Failed to initialize program');
    return false;
  }
}
