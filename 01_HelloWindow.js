// Global constants
const canvas = document.getElementById('glCanvas'); // Get the canvas element 
const gl = canvas.getContext('webgl2'); // Get the WebGL2 context

if (!gl) {
    console.error('WebGL 2 is not supported by your browser.');
}

// Set canvas size: 처음 실행을 시작했을 때, canvas의 크기는 500 x 500 이어야 합니다.
canvas.width = 500;
canvas.height = 500;

// Initialize WebGL settings: viewport and clear color
gl.viewport(0, 0, canvas.width, canvas.height);
gl.clearColor(0, 0, 0, 1.0);

gl.enable(gl.SCISSOR_TEST); // render() 를 call하기 전 gl.enable(....); 로 무엇인가를 enable 시켜야 합니다.

// Start rendering
render();

// Render loop
function render() {
    gl.clear(gl.COLOR_BUFFER_BIT);
    
    gl.scissor(0, 0, canvas.width/2, canvas.height/2);
    gl.clearColor(0, 0, 1, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);    

    gl.scissor(0, canvas.height/2, canvas.width/2, canvas.height/2);
    gl.clearColor(0, 1, 0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);    

    gl.scissor(canvas.width/2, 0, canvas.width/2, canvas.height/2);
    gl.clearColor(1, 1, 0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);    

    gl.scissor(canvas.width/2, canvas.height/2, canvas.width/2, canvas.height/2);
    gl.clearColor(1, 0, 0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);    
    // Draw something here
}

// Resize viewport when window size changes
window.addEventListener('resize', () => {
    // Window를 resize했을 때, canvas의 가로와 세로의 비율 1:1 유지 (canvas의 크기는 window size에 따라 변할 수 있습니다.)
    const size = Math.min(window.innerWidth, window.innerHeight);
    canvas.width = size;
    canvas.height = size;
    gl.viewport(0, 0, canvas.width, canvas.height);
    render();
});

