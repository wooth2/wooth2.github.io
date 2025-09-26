
/* Circle + LineSegment intersection
   조건:
   1) canvas 700x700
   2) 첫 입력은 circle (drag: center→radius)
   3) 두 번째 입력은 line segment
   4) 교차점 계산 후 표시 (gl_PointSize=10.0)
*/
import { resizeAspectRatio, setupText, updateText, Axes } from '../util/util.js';
import { Shader, readShaderFile } from '../util/shader.js';

const canvas = document.getElementById('glCanvas');
const gl = canvas.getContext('webgl2');
let shader;
let vao;
let positionBuffer;

let isInitialized = false;
let isDrawing = false;
let startPoint = null, tempEndPoint = null;

let circle = null;   // {center:[x,y], radius:r}
let line = null;     // [x0,y0,x1,y1]
let intersections = [];

let textOverlay, textOverlay2, textOverlay3;
let axes = new Axes(gl, 0.85);

const EPS = 1e-10;

document.addEventListener('DOMContentLoaded', () => {
    if (isInitialized) return;
    main().then(ok => { if (ok) isInitialized = true; })
          .catch(err => console.error(err));
});

function initWebGL() {
    if (!gl) {
        console.error('WebGL2 not supported');
        return false;
    }
    canvas.width = 700;
    canvas.height = 700;
    resizeAspectRatio(gl, canvas);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.1, 0.2, 0.3, 1.0);
    return true;
}

async function initShader() {
    const vs = await readShaderFile('shVert.glsl');
    const fs = await readShaderFile('shFrag.glsl');
    shader = new Shader(gl, vs, fs);
}

function setupBuffers() {
    vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    shader.setAttribPointer('a_position', 2, gl.FLOAT, false, 0, 0);
    gl.bindVertexArray(null);
}

// Canvas → NDC
function toGL(x, y) {
    return [(x / canvas.width) * 2 - 1, -((y / canvas.height) * 2 - 1)];
}

// -------------------------- Mouse Input ----------------------------------
function setupMouseEvents() {
    function onDown(e) {
        e.preventDefault(); e.stopPropagation();
        const rect = canvas.getBoundingClientRect();
        const [gx, gy] = toGL(e.clientX - rect.left, e.clientY - rect.top);
        if (!isDrawing) { startPoint = [gx, gy]; isDrawing = true; }
    }
    function onMove(e) {
        if (!isDrawing) return;
        const rect = canvas.getBoundingClientRect();
        const [gx, gy] = toGL(e.clientX - rect.left, e.clientY - rect.top);
        tempEndPoint = [gx, gy];
        render();
    }
    function onUp() {
        if (!(isDrawing && tempEndPoint)) return;

        if (!circle) {
            // 1st drag → circle
            const dx = tempEndPoint[0] - startPoint[0];
            const dy = tempEndPoint[1] - startPoint[1];
            circle = { center: [...startPoint], radius: Math.hypot(dx, dy) };
            updateText(textOverlay,
                `Circle: center (${circle.center[0].toFixed(2)}, ${circle.center[1].toFixed(2)}) radius = ${circle.radius.toFixed(2)}`);
            updateText(textOverlay2, "Line segment: 클릭-드래그로 입력하세요.");
            updateText(textOverlay3, "");
        } else if (!line) {
            // 2nd drag → line segment
            line = [...startPoint, ...tempEndPoint];
            updateText(textOverlay2,
                `Line segment: (${line[0].toFixed(2)}, ${line[1].toFixed(2)}) ~ (${line[2].toFixed(2)}, ${line[3].toFixed(2)})`);
            computeIntersection();
        } else {
            // Already have both → start fresh on next drag
            circle = null;
            line = null;
            intersections = [];
            updateText(textOverlay,  "No circle");
            updateText(textOverlay2, "Draw circle first (click & drag)");
            updateText(textOverlay3, "");
        }

        isDrawing = false;
        startPoint = null;
        tempEndPoint = null;
        render();
    }

    canvas.addEventListener('mousedown', onDown);
    canvas.addEventListener('mousemove', onMove);
    canvas.addEventListener('mouseup', onUp);
}

// ----------------------- Intersection Math --------------------------------
function computeIntersection() {
    intersections = [];
    if (!circle || !line) { updateText(textOverlay3, ""); return; }

    const [cx, cy] = circle.center;
    const r = circle.radius;
    const [x0, y0, x1, y1] = line;
    const dx = x1 - x0, dy = y1 - y0;
    const fx = x0 - cx, fy = y0 - cy;

    const a = dx*dx + dy*dy;
    if (a === 0) { // zero-length segment
        updateText(textOverlay3, "No intersection");
        return;
    }
    const b = 2.0 * (fx*dx + fy*dy);
    const c = fx*fx + fy*fy - r*r;

    let disc = b*b - 4.0*a*c;
    if (disc < EPS) disc = disc < 0 ? 0 : disc; // stabilize tangent
    if (disc < 0.0) {
        updateText(textOverlay3, "No intersection");
        return;
    }

    const sqrtD = Math.sqrt(disc);
    const t1 = (-b - sqrtD) / (2.0*a);
    const t2 = (-b + sqrtD) / (2.0*a);

    const addIfValid = (t) => {
        if (t >= 0.0 && t <= 1.0) intersections.push([x0 + t*dx, y0 + t*dy]);
    };
    addIfValid(t1);
    addIfValid(t2);

    if (intersections.length === 0) {
        updateText(textOverlay3, "No intersection");
    } else if (intersections.length === 1) {
        const p = intersections[0];
        updateText(textOverlay3,
            `Intersection Points: 1 Point 1: (${p[0].toFixed(2)}, ${p[1].toFixed(2)})`);
    } else {
        const p1 = intersections[0], p2 = intersections[1];
        updateText(textOverlay3,
            `Intersection Points: 2 Point 1: (${p1[0].toFixed(2)}, ${p1[1].toFixed(2)}) Point 2: (${p2[0].toFixed(2)}, ${p2[1].toFixed(2)})`);
    }
}

// ----------------------------- Render -------------------------------------
function render() {
    gl.clear(gl.COLOR_BUFFER_BIT);
    shader.use();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    // circle outline
    if (circle) {
        const N = 100;
        const verts = new Float32Array((N+1)*2);
        for (let i=0;i<=N;i++) {
            const th = 2.0*Math.PI*i/N;
            verts[2*i]   = circle.center[0] + circle.radius*Math.cos(th);
            verts[2*i+1] = circle.center[1] + circle.radius*Math.sin(th);
        }
        shader.setVec4("u_color", [0.85, 0.25, 0.95, 1.0]);
        gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);
        gl.bindVertexArray(vao);
        gl.drawArrays(gl.LINE_STRIP, 0, N+1);
    }

    // final line segment
    if (line) {
        shader.setVec4("u_color", [0.75, 0.85, 1.0, 1.0]);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(line), gl.STATIC_DRAW);
        gl.bindVertexArray(vao);
        gl.drawArrays(gl.LINES, 0, 2);
    }

    // preview stroke
    if (isDrawing && startPoint && tempEndPoint) {
        shader.setVec4("u_color", [0.6, 0.6, 0.6, 1.0]);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([...startPoint, ...tempEndPoint]), gl.STATIC_DRAW);
        gl.bindVertexArray(vao);
        gl.drawArrays(gl.LINES, 0, 2);
    }

    // intersection points
    for (const p of intersections) {
        shader.setVec4("u_color", [1.0, 1.0, 0.0, 1.0]); // yellow
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(p), gl.STATIC_DRAW);
        gl.bindVertexArray(vao);
        gl.drawArrays(gl.POINTS, 0, 1);
    }

    // axes (safe even when glMatrix not loaded)
    const I = (typeof mat4 !== "undefined")
            ? mat4.create()
            : new Float32Array([1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1]);
    axes.draw(I, I);
}

// ----------------------------- Main ---------------------------------------
async function main() {
    if (!initWebGL()) return false;
    await initShader();
    setupBuffers();
    shader.use();

    textOverlay  = setupText(canvas, "No circle", 1);
    textOverlay2 = setupText(canvas, "Draw circle first (click & drag)", 2);
    textOverlay3 = setupText(canvas, "", 3);

    setupMouseEvents();
    render();
    return true;
}