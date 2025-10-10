import { Shader } from './shader.js';
import { SquarePyramid } from './SquarePyramid.js';
import { resizeAspectRatio, Axes } from './util.js';

let gl, shader, pyramid, axes;
let projMatrix = mat4.create();
let viewMatrix = mat4.create();
let modelMatrix = mat4.create();

async function main() {
    const canvas = document.getElementById('glCanvas');
    gl = canvas.getContext('webgl2');
    if (!gl) {
        alert('WebGL2 not supported');
        return;
    }

    resizeAspectRatio(gl, canvas);
    gl.enable(gl.DEPTH_TEST);
    gl.clearColor(0.2, 0.2, 0.2, 1.0);

    // Load shaders
    const vertSrc = await fetch('shVert.glsl').then(r => r.text());
    const fragSrc = await fetch('shFrag.glsl').then(r => r.text());
    shader = new Shader(gl, vertSrc, fragSrc);

    // Create objects
    pyramid = new SquarePyramid(gl);
    axes = new Axes(gl, 0.85);

    // Set up projection
    const aspect = canvas.clientWidth / canvas.clientHeight;
    mat4.perspective(projMatrix, Math.PI / 4, aspect, 0.1, 10.0);

    // Start render loop
    requestAnimationFrame(render);
}

function render(time) {
    const t = time * 0.001;
    const r = 2.0;
    const camX = r * Math.cos(t);
    const camZ = r * Math.sin(t);
    const camY = 1.0 + 0.3 * Math.sin(t * 2.0);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    mat4.lookAt(viewMatrix, [camX, camY, camZ], [0, 0.4, 0], [0, 1, 0]);
    mat4.identity(modelMatrix);

    shader.use();
    shader.setMat4('u_model', modelMatrix);
    shader.setMat4('u_view', viewMatrix);
    shader.setMat4('u_projection', projMatrix);

    pyramid.draw();
    axes.draw();

    requestAnimationFrame(render);
}
