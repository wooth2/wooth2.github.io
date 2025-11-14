/*--------------------------------------------------------------------------------
Homework08.js : Toon Shading (Cell Shading)

- Viewing a 3D unit cylinder at origin with perspective projection
- Rotating the cylinder by ArcBall interface (by left mouse button dragging)
- Keyboard controls:
- 'a' to switch between camera and model rotation modes in ArcBall interface
- 'r' to reset arcball
- '1', '2', '3', '4', '5' to set the toon shading levels
- Applying Toon Shading (Cell Shading) effect with solid orange color
- Lighting by directional light, Used smooth shading only
----------------------------------------------------------------------------------*/
import { resizeAspectRatio, setupText, updateText, Axes } from '../util/util.js';
import { Shader, readShaderFile } from '../util/shader.js';
import { Arcball } from '../util/arcball.js';
import { Cylinder } from '../util/cylinder.js';

const canvas = document.getElementById('glCanvas');
const gl = canvas.getContext('webgl2');
let shader;
let textOverlay2;
let textOverlay3;
let isInitialized = false;

let viewMatrix = mat4.create();
let projMatrix = mat4.create();
let modelMatrix = mat4.create();
let arcBallMode = 'CAMERA'; // 'CAMERA' or 'MODEL'
let toonLevels = 3; // 기본 3단계

const cylinder = new Cylinder(gl, 32);
const axes = new Axes(gl, 1.5); // create an Axes object with the length of axis 1.5

const cameraPos = vec3.fromValues(0, 0, 3);
const lightDirection = vec3.fromValues(1.0, 0.25, 0.5);
const shininess = 32.0;
const orangeColor = vec3.fromValues(1.0, 0.5, 0.31); // 오렌지색 설정

// Arcball object
const arcball = new Arcball(canvas, 5.0, { rotation: 2.0, zoom: 0.0005 });

document.addEventListener('DOMContentLoaded', () => {
  if (isInitialized) {
    console.log("Already initialized");
    return;
  }

  main().then(success => {
    if (!success) {
    console.log('program terminated');
    return;
    }
  isInitialized = true;
  }).catch(error => {
    console.error('program terminated with error:', error);
  });
});

function setupKeyboardEvents() {
  document.addEventListener('keydown', (event) => {
    if (event.key == 'a') {
      if (arcBallMode == 'CAMERA') {
      arcBallMode = 'MODEL';
    }
    else {
      arcBallMode = 'CAMERA';
    }
    updateText(textOverlay2, "arcball mode: " + arcBallMode);
    }
    else if (event.key == 'r') {
      arcball.reset();
      modelMatrix = mat4.create();
      arcBallMode = 'CAMERA';
      updateText(textOverlay2, "arcball mode: " + arcBallMode);
    }
    else if (event.key >= '1' && event.key <= '5') {
      toonLevels = parseInt(event.key);
      updateText(textOverlay3, "toon levels: " + toonLevels);
      render();
    }
  });
}

function initWebGL() {
  if (!gl) {
    console.error('WebGL 2 is not supported by your browser.');
    return false;
  }

  canvas.width = 700;
  canvas.height = 700;
  resizeAspectRatio(gl, canvas);
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(0.1, 0.1, 0.1, 1.0);

  return true;
}

async function initShader() {
  const vertexShaderSource = await readShaderFile('shVert.glsl');
  const fragmentShaderSource=
  await readShaderFile('shFrag.glsl');
  shader = new Shader(gl, vertexShaderSource, fragmentShaderSource);
}

function render() {
// clear canvas
gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
108 gl.enable(gl.DEPTH_TEST);
109
110 if (arcBallMode == 'CAMERA') {
111 viewMatrix = arcball.getViewMatrix();
112 }
113 else { // arcBallMode == 'MODEL'
114 modelMatrix = arcball.getModelRotMatrix();
115 viewMatrix = arcball.getViewCamDistanceMatrix();
116 }
117
118 // drawing the cylinder
119 shader.use(); // using the cylinder's shader
120 shader.setMat4('u_model', modelMatrix);
121 shader.setMat4('u_view', viewMatrix);
122 shader.setVec3('u_viewPos', cameraPos);
123 shader.setInt('u_levels', toonLevels);
124 cylinder.draw(shader);
125
126 // drawing the axes (using the axes's shader: see util.js)
127 axes.draw(viewMatrix, projMatrix);
128
129 // call the render function the next time for animation
130 requestAnimationFrame(
render);
131 }
132
133 async function main() {
134 try {
135 if (!initWebGL()) {
136 throw new Error('WebGL initialization failed');
137 }
138
139 // View transformation matrix (camera at cameraPos, invariant in the
program)
140 mat4.lookAt(
141 viewMatrix,
142 cameraPos,
143 vec3.fromValues(0, 0, 0),
144 vec3.fromValues(0, 1, 0)
145 );
146
147 // Projection transformation matrix (invariant in the program)
148 mat4.perspective(
149 projMatrix,
150 glMatrix.toRadian(60), // field of view (fov, degree)
151 canvas.width / canvas.height, // aspect ratio
152 0.1, // near
153 100.0 // far
154 );
155
156 // Make render mode to smooth shading
157 cylinder.copyVertexNormalsToNormals();
6/10/25, 12:58 PM Homework08.js
localhost:54210/17781b10-b642-4c5f-bbd4-30f759344cac/ 3/6
158 cylinder.updateNormals();
159
160 // creating shaders
161 await initShader();
162
163 // define the shader
164 shader.use();
165
166 // pass the uniform variables to the shader
167 shader.setMat4("u_projection", projMatrix);
168 shader.setVec3("light.direction", lightDirection);
169 shader.setVec3("light.ambient", vec3.fromValues(0.2, 0.2, 0.2));
170 shader.setVec3("light.diffuse", vec3.fromValues(0.7, 0.7, 0.7));
171 shader.setVec3("light.specular", vec3.fromValues(1.0, 1.0, 1.0));
172 shader.setVec3("material.diffuse", orangeColor); // 오렌지색 설정
173 shader.setVec3("material.specular", vec3.fromValues(0.8, 0.8, 0.8));
174 shader.setFloat("material.shininess", shininess);
175 shader.setVec3("u_viewPos", cameraPos);
176 shader.setInt("u_levels", toonLevels);
177
178 // setup text overlay
179 setupText(canvas, "TOON SHADING", 1);
180 textOverlay2 = setupText(canvas, "arcball mode: " + arcBallMode, 2);
181 textOverlay3 = setupText(canvas, "toon levels: " + toonLevels, 3);
182 setupText(canvas, "press a/r to change/reset arcball mode", 4);
183 setupText(canvas, "press 1 - 5 toa change toon shading levels", 5);
184
185 setupKeyboardEvents();
186
187 // call the render function the first time for animation
188 requestAnimationFrame(
render);
189
190 return true;
191
192 } catch (error) {
193 console.error('Failed to initialize program:', error);
194 alert('Failed to initialize program');
195 return false;
196 }
197 }
198
199 /* Shader
200 # shVert.glsl
201 #version 300 es
202
203 layout(location = 0) in vec3 a_position;
204 layout(location = 1) in vec3 a_normal;
205 layout(location = 2) in vec4 a_color;
206 layout(location = 3) in vec2 a_texCoord;
207
208 uniform mat4 u_model;
209 uniform mat4 u_view;
210 uniform mat4 u_projection;
211
6/10/25, 12:58 PM Homework08.js
localhost:54210/17781b10-b642-4c5f-bbd4-30f759344cac/ 4/6