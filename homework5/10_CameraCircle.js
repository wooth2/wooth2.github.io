// 10_CameraCircle.js
import { Shader } from './shader.js';
import { SquarePyramid } from './SquarePyramid.js';
import { Axes } from './util.js';

let gl, shader, pyramid, axes;
const projMatrix = mat4.create();
const viewMatrix = mat4.create();
const modelMatrix = mat4.create();

async function main() {
  const canvas = document.getElementById('glCanvas');

  // 1) 캔버스 크기 고정 (700x700)
  canvas.width = 700;
  canvas.height = 700;

  gl = canvas.getContext('webgl2');
  if (!gl) {
    alert('WebGL2 not supported');
    return;
  }

  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.enable(gl.DEPTH_TEST);
  gl.clearColor(0.11, 0.17, 0.22, 1.0); // 보기 좋은 딥블루 배경

  // 2) 셰이더 로드 (과제 제공 파일과 동일)
  const vertSrc = await fetch('shVert.glsl').then(r => r.text());
  const fragSrc = await fetch('shFrag.glsl').then(r => r.text());
  shader = new Shader(gl, vertSrc, fragSrc); // :contentReference[oaicite:3]{index=3}

  // 3) 객체 생성
  pyramid = new SquarePyramid(gl); // 밑면 1×1, 높이 1, y=0 위에 생성
  axes = new Axes(gl, 0.85);       // 보조축

  // 4) 투영행렬 (FOV 60°, near=0.1, far=20)
  const aspect = canvas.width / canvas.height;
  mat4.perspective(projMatrix, Math.PI / 3, aspect, 0.1, 20.0);

  // 5) 렌더 루프 시작
  requestAnimationFrame(render);
}

function render(timeMs) {
  const t = timeMs * 0.001; // s

  // 5) 카메라 궤적: xz는 반지름 r=3 원운동(90°/s), y는 sin(45°/s)
  const r = 3.0;
  const omegaXZ = Math.PI / 2;  // 90°/s
  const omegaY  = Math.PI / 4;  // 45°/s
  const camX = r * Math.cos(omegaXZ * t);
  const camZ = r * Math.sin(omegaXZ * t);
  const camY = 0.8 + 0.6 * Math.sin(omegaY * t);

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // 원점(사각뿔) 바라보기
  mat4.lookAt(viewMatrix, [camX, camY, camZ], [0, 0.5, 0], [0, 1, 0]);

  // 6) 사각뿔은 고정 (회전 없음)
  mat4.identity(modelMatrix);

  // 파이프라인 바인드 & 그리기
  shader.use();
  shader.setMat4('u_model', modelMatrix);
  shader.setMat4('u_view', viewMatrix);
  shader.setMat4('u_projection', projMatrix);

  pyramid.draw();

  // 7) 축 그리기 (Axes.draw(view, proj))
  axes.draw(viewMatrix, projMatrix); // :contentReference[oaicite:4]{index=4}

  requestAnimationFrame(render);
}

// 모듈로 로드되므로 즉시 호출
main();
