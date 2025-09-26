/* Circle + LineSegment intersection
   조건: 
   1) canvas 700x700
   2) 첫 입력은 circle (drag: center -> radius)
   3) 두 번째 입력은 line segment
   4) 교차점 계산 후 표시
*/
import { resizeAspectRatio, setupText, updateText, Axes } from '../util/util.js';
import { Shader, readShaderFile } from '../util/shader.js';

const canvas = document.getElementById('glCanvas');
const gl = canvas.getContext('webgl2');
let shader, vao, positionBuffer;

let isInitialized = false;
let isDrawing = false;
let startPoint = null, tempEndPoint = null;

let circle = null;   // {center:[x,y], radius:r}
let line = null;     // [x0,y0,x1,y1]
let intersections = [];

let textOverlay, textOverlay2, textOverlay3;
let axes = new Axes(gl, 0.85);

document.addEventListener('DOMContentLoaded', () => {
    if (isInitialized) return;
    main().then(success => { if (success) isInitialized = true; });
});

function initWebGL() {
    if (!gl) return false;
    canvas.width = 700; canvas.height = 700;
    resizeAspectRatio(gl, canvas);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.1,0.2,0.3,1.0);
    return true;
}

function setupBuffers() {
    vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    shader.setAttribPointer('a_position', 2, gl.FLOAT, false, 0, 0);
    gl.bindVertexArray(null);
}

function convertToWebGLCoordinates(x, y) {
    return [(x/canvas.width)*2 - 1, -((y/canvas.height)*2 - 1)];
}

function setupMouseEvents() {
    function handleMouseDown(e) {
        const rect = canvas.getBoundingClientRect();
        const [glX,glY] = convertToWebGLCoordinates(e.clientX-rect.left, e.clientY-rect.top);
        if (!isDrawing) {
            startPoint=[glX,glY]; isDrawing=true;
        }
    }
    function handleMouseMove(e) {
        if (isDrawing) {
            const rect = canvas.getBoundingClientRect();
            const [glX,glY] = convertToWebGLCoordinates(e.clientX-rect.left, e.clientY-rect.top);
            tempEndPoint=[glX,glY]; render();
        }
    }
    function handleMouseUp() {
        if (isDrawing && tempEndPoint) {
            if (!circle) { // first input: circle
                let dx=tempEndPoint[0]-startPoint[0];
                let dy=tempEndPoint[1]-startPoint[1];
                let r=Math.sqrt(dx*dx+dy*dy);
                circle={center:startPoint,radius:r};
                updateText(textOverlay,
                    `Circle: center (${circle.center[0].toFixed(2)}, ${circle.center[1].toFixed(2)}) radius=${circle.radius.toFixed(2)}`);
                updateText(textOverlay2,"Click+drag to draw line segment");
            } else if (!line) { // second input: line
                line=[...startPoint,...tempEndPoint];
                updateText(textOverlay2,
                    `Line segment: (${line[0].toFixed(2)},${line[1].toFixed(2)}) ~ (${line[2].toFixed(2)},${line[3].toFixed(2)})`);
                computeIntersection();
            }
            isDrawing=false; startPoint=null; tempEndPoint=null; render();
        }
    }
    canvas.addEventListener("mousedown",handleMouseDown);
    canvas.addEventListener("mousemove",handleMouseMove);
    canvas.addEventListener("mouseup",handleMouseUp);
}

function computeIntersection() {
    intersections=[];
    let [cx,cy]=circle.center, r=circle.radius;
    let [x0,y0,x1,y1]=line;
    let dx=x1-x0, dy=y1-y0;
    let fx=x0-cx, fy=y0-cy;

    let a=dx*dx+dy*dy;
    let b=2*(fx*dx+fy*dy);
    let c=fx*fx+fy*fy-r*r;
    let disc=b*b-4*a*c;
    if (disc<0) {
        updateText(textOverlay3,"No intersection"); return;
    }
    disc=Math.sqrt(disc);
    let t1=(-b-disc)/(2*a), t2=(-b+disc)/(2*a);
    function addIfValid(t){
        if (t>=0 && t<=1) intersections.push([x0+t*dx,y0+t*dy]);
    }
    addIfValid(t1); addIfValid(t2);

    if (intersections.length==0) updateText(textOverlay3,"No intersection");
    else if (intersections.length==1) {
        updateText(textOverlay3,`Intersection Points: 1 Point: (${intersections[0][0].toFixed(2)},${intersections[0][1].toFixed(2)})`);
    } else {
        updateText(textOverlay3,`Intersection Points: 2 Point1: (${intersections[0][0].toFixed(2)},${intersections[0][1].toFixed(2)}) Point2: (${intersections[1][0].toFixed(2)},${intersections[1][1].toFixed(2)})`);
    }
}

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT);
    shader.use();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    // circle 그리기
    if (circle) {
        let verts=[];
        let N=100;
        for (let i=0;i<=N;i++){
            let th=2*Math.PI*i/N;
            verts.push(circle.center[0]+circle.radius*Math.cos(th));
            verts.push(circle.center[1]+circle.radius*Math.sin(th));
        }
        shader.setVec4("u_color",[0.8,0.2,1.0,1.0]);
        gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(verts),gl.STATIC_DRAW);
        gl.bindVertexArray(vao);
        gl.drawArrays(gl.LINE_STRIP,0,N+1);
    }

    // line segment 그리기
    if (line) {
        shader.setVec4("u_color",[0.5,0.8,1.0,1.0]);
        gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(line),gl.STATIC_DRAW);
        gl.bindVertexArray(vao);
        gl.drawArrays(gl.LINES,0,2);
    }

    // 임시 드로잉
    if (isDrawing && startPoint && tempEndPoint) {
        shader.setVec4("u_color",[0.5,0.5,0.5,1.0]);
        gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([...startPoint,...tempEndPoint]),gl.STATIC_DRAW);
        gl.bindVertexArray(vao);
        gl.drawArrays(gl.LINES,0,2);
    }

    // 교차점 그리기
    for (let p of intersections) {
        shader.setVec4("u_color",[1.0,1.0,0.0,1.0]);
        gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(p),gl.STATIC_DRAW);
        gl.bindVertexArray(vao);
        gl.drawArrays(gl.POINTS,0,1);
    }

    axes.draw(mat4.create(),mat4.create());
}

async function initShader() {
    const vs=await readShaderFile('shVert.glsl');
    const fs=await readShaderFile('shFrag.glsl');
    shader=new Shader(gl,vs,fs);
}

async function main() {
    if (!initWebGL()) return false;
    await initShader(); setupBuffers(); shader.use();
    textOverlay=setupText(canvas,"No circle",1);
    textOverlay2=setupText(canvas,"Draw circle first",2);
    textOverlay3=setupText(canvas,"",3);
    setupMouseEvents(); render();
    return true;
}