import { resizeAspectRatio, setupText, updateText } from '../util/util.js';
import { Shader, readShaderFile } from '../util/shader.js';

const canvas = document.getElementById('glCanvas');
const gl = canvas.getContext('webgl2');
let isInitialized = false;
let shader;   // shader program
let vao;      // vertex array object
let tx = 0.0, ty = 0.0;          // translation 상태
const STEP = 0.01;               // 키 1회당 이동량
const SIDE = 0.2;                // 정사각형 한 변
const HALF = SIDE / 2.0;         // 0.1
const BOUND = 1.0 - HALF;        // 경계(clip space에서 바깥으로 안나가게)

document.addEventListener('DOMContentLoaded', () => {
    if (isInitialized) { // true인 경우는 main이 이미 실행되었다는 뜻이므로 다시 실행하지 않음
        console.log("Already initialized");
        return;
    }

    main().then(success => { // call main function
        if (!success) {
            console.log('프로그램을 종료합니다.');
            return;
        }
        isInitialized = true;
    }).catch(error => {
        console.error('프로그램 실행 중 오류 발생:', error);
    });
});

function initWebGL() {
    if (!gl) {
        console.error('WebGL 2 is not supported by your browser.');
        return false;
    }
    // 1) 처음 실행 시 canvas 크기 600x600
    canvas.width = 600;
    canvas.height = 600;

    window.addEventListener('resize', () => {
        // Calculate new canvas dimensions while maintaining aspect ratio
        const originalWidth = canvas.width;
        const originalHeight = canvas.height;
        const aspectRatio = originalWidth / originalHeight;
        let newWidth = window.innerWidth;
        let newHeight = window.innerHeight;

        if (newWidth / newHeight > aspectRatio) {
            newWidth = newHeight * aspectRatio;
        } else {
            newHeight = newWidth / aspectRatio;
        }

        canvas.width = newWidth;
        canvas.height = newHeight;
        gl.viewport(0, 0, canvas.width, canvas.height);

        render();
    });

    // Initialize WebGL settings
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    
    return true;
}

async function initShader() {
    // 과제: vertex shader에서 uniform으로 이동 적용
    const vertexShaderSource = await readShaderFile('shVert.glsl');
    const fragmentShaderSource = await readShaderFile('shFrag.glsl');
    shader = new Shader(gl, vertexShaderSource, fragmentShaderSource);
}

function clamp(v, lo, hi) {
  return Math.min(hi, Math.max(lo, v));
}

function setupKeyboardEvents() {
  window.addEventListener('keydown', (event) => {
    if (
      event.key === 'ArrowUp'   ||
      event.key === 'ArrowDown' ||
      event.key === 'ArrowLeft' ||
      event.key === 'ArrowRight'
    ) {
      // ±0.01 이동 + 경계 제한
      if (event.key === 'ArrowUp')    ty = clamp(ty + STEP, -BOUND, BOUND);
      if (event.key === 'ArrowDown')  ty = clamp(ty - STEP, -BOUND, BOUND);
      if (event.key === 'ArrowLeft')  tx = clamp(tx - STEP, -BOUND, BOUND);
      if (event.key === 'ArrowRight') tx = clamp(tx + STEP, -BOUND, BOUND);
    }
    render();
  });
}

function setupBuffers() {
  // 정사각형 (중심 기준, 한 변 0.2). index 사용 금지 -> TRIANGLE_FAN
  const vertices = new Float32Array([
    -HALF, -HALF,   // 0
     HALF, -HALF,   // 1
     HALF,  HALF,   // 2
    -HALF,  HALF    // 3
  ]);

  vao = gl.createVertexArray();
  gl.bindVertexArray(vao);

  const vbo = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

  // aPos: vec2
  shader.setAttribPointer('aPos', 2, gl.FLOAT, false, 0, 0);

  gl.bindVertexArray(null);
}

function render() {
  gl.clear(gl.COLOR_BUFFER_BIT);

  shader.use();
  shader.setVec2('uTranslate', [tx, ty]);     // uniform으로 이동 전달

  gl.bindVertexArray(vao);
  gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);       // index 미사용 + TRIANGLE_FAN
}

async function main() {
    if (!initWebGL()) throw new Error('WebGL init failed');

    await initShader();

    // 안내 메시지
    setupText(canvas, "Use arrow keys to move the rectangle", 1);

    setupKeyboardEvents();
    setupBuffers();
    shader.use();

    render();
    return true;
}