/*-------------------------------------------------------------------------
12_ArcBall.js

- Viewing a 3D unit cube at origin with perspective projection
- Rotating the cube by ArcBall interface (by left mouse button dragging)
---------------------------------------------------------------------------*/

import { resizeAspectRatio, Axes } from '../util/util.js';
import { Shader, readShaderFile } from '../util/shader.js';
import { SquarePyramid } from './squarePyramid.js';
import { Arcball } from '../util/arcball.js';
import { loadTexture } from '../util/texture.js';

const canvas = document.getElementById('glCanvas');
const gl = canvas.getContext('webgl2');
let shader;
let isInitialized = false;

let viewMatrix = mat4.create();
let projMatrix = mat4.create();
let modelMatrix = mat4.create();

const pyramid = new SquarePyramid(gl);
const axes = new Axes(gl, 2.2); // create an Axes object with the length of axis 2.2
const texture = loadTexture(gl, true, './sunrise.jpg');

// Arcball object: initial distance 5.0, rotation sensitivity 2.0, zoom sensitivity 0.0005
// default of rotation sensitivity = 1.5, default of zoom sensitivity = 0.001
let initialDistance = 5.0; 
const arcball = new Arcball(canvas, initialDistance, { rotation: 2.0, zoom: 0.0005 });

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

function initWebGL() {
    if (!gl) {
        console.error('WebGL 2 is not supported by your browser.');
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
    const vertexShaderSource = await readShaderFile('shVert.glsl');
    const fragmentShaderSource = await readShaderFile('shFrag.glsl');
    shader = new Shader(gl, vertexShaderSource, fragmentShaderSource);
}

function render() {

    // clear canvas
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);

    viewMatrix = arcball.getViewMatrix();

    // drawing the pyramid
    shader.use();  // using the pyramid's shader
    shader.setMat4('u_model', modelMatrix);
    shader.setMat4('u_view', viewMatrix);
    shader.setMat4('u_projection', projMatrix);
    pyramid.draw(shader);

    // drawing the axes (using the axes's shader: see util.js)
    axes.draw(viewMatrix, projMatrix);

    // call the render function the next time for animation
    requestAnimationFrame(render);
}

async function main() {
    try {
        if (!initWebGL()) {
            throw new Error('WebGL initialization failed');
        }
        
        await initShader();

        // Initial view transformation matrix (camera at (0,0,-initialDistance)
        mat4.translate(viewMatrix, viewMatrix, vec3.fromValues(0, 0, -initialDistance));

        // Projection transformation matrix (invariant in the program)
        mat4.perspective(
            projMatrix,
            glMatrix.toRadian(60),  // field of view (fov, degree)
            canvas.width / canvas.height, // aspect ratio
            0.1, // near
            100.0 // far
        );

        pyramid.texCoords[0] = 0.8;  pyramid.texCoords[1] = 0.0;
        pyramid.texCoords[2] = 0.65; pyramid.texCoords[3] = 0.0;
        pyramid.texCoords[4] = 0.5;  pyramid.texCoords[5] = 1.0;
        pyramid.texCoords[6] = 0.65; pyramid.texCoords[7] = 0.0;
        pyramid.texCoords[8] = 0.5;  pyramid.texCoords[9] = 0.0;
        pyramid.texCoords[10] = 0.5; pyramid.texCoords[11] = 1.0;
        pyramid.texCoords[12] = 0.5; pyramid.texCoords[13] = 0.0;
        pyramid.texCoords[14] = 0.35; pyramid.texCoords[15] = 0.0;
        pyramid.texCoords[16] = 0.5;  pyramid.texCoords[17] = 1.0;
        pyramid.texCoords[18] = 0.35; pyramid.texCoords[19] = 0.0;
        pyramid.texCoords[20] = 0.2;  pyramid.texCoords[21] = 0.0;
        pyramid.texCoords[22] = 0.5;  pyramid.texCoords[23] = 1.0;

        // pyramid.texCoords[0] = 0.9;  pyramid.texCoords[1] = 0.0;
        // pyramid.texCoords[2] = 0.7; pyramid.texCoords[3] = 0.0;
        // pyramid.texCoords[4] = 0.8;  pyramid.texCoords[5] = 1.0;
        // pyramid.texCoords[6] = 0.7; pyramid.texCoords[7] = 0.0;
        // pyramid.texCoords[8] = 0.5;  pyramid.texCoords[9] = 0.0;
        // pyramid.texCoords[10] = 0.6; pyramid.texCoords[11] = 1.0;
        // pyramid.texCoords[12] = 0.5; pyramid.texCoords[13] = 0.0;
        // pyramid.texCoords[14] = 0.3; pyramid.texCoords[15] = 0.0;
        // pyramid.texCoords[16] = 0.4;  pyramid.texCoords[17] = 1.0;
        // pyramid.texCoords[18] = 0.3; pyramid.texCoords[19] = 0.0;
        // pyramid.texCoords[20] = 0.1;  pyramid.texCoords[21] = 0.0;
        // pyramid.texCoords[22] = 0.2;  pyramid.texCoords[23] = 1.0;
        pyramid.initBuffers();

        // activate the texture unit 0
        // in fact, we can omit this command
        // when we use the only one texture
        gl.activeTexture(gl.TEXTURE0);

        // bind the texture to the shader
        gl.bindTexture(gl.TEXTURE_2D, texture);

        gl.generateMipmap(gl.TEXTURE_2D);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);

        // pass the u_texture uniform variable to the shader
        // with the texture unit number
        shader.setInt('u_texture', 0);

        // call the render function the first time for animation
        requestAnimationFrame(render);

        return true;

    } catch (error) {
        console.error('Failed to initialize program:', error);
        alert('Failed to initialize program');
        return false;
    }
}