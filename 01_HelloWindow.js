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
gl.viewport(0, 0, canvas.width/2, canvas.height/2);
gl.clearColor(0, 0, 1, 1.0);

gl.viewport(0, canvas.height/2, canvas.width/2, canvas.height/2);
gl.clearColor(0, 1, 0, 1.0);

gl.viewport(canvas.width/2, 0, canvas.width/2, canvas.height/2);
gl.clearColor(1, 1, 0, 1.0);

gl.viewport(canvas.width/2, canvas.height/2, canvas.width/2, canvas.height/2);
gl.clearColor(1, 0, 0, 1.0);

// Start rendering
render();

// Render loop
function render() {
    gl.viewport(0, 0, canvas.width/2, canvas.height/2);
    gl.clearColor(0, 0, 1, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);    

    gl.viewport(0, canvas.height/2, canvas.width/2, canvas.height/2);
    gl.clearColor(0, 1, 0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);    

    gl.viewport(canvas.width/2, 0, canvas.width/2, canvas.height/2);
    gl.clearColor(1, 1, 0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);    

    gl.viewport(canvas.width/2, canvas.height/2, canvas.width/2, canvas.height/2);
    gl.clearColor(1, 0, 0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);    
    // Draw something here
}

// Resize viewport when window size changes
window.addEventListener('resize', () => {
        // 창 크기 중 작은 면을 기준으로 정사각형 유지
    const size = Math.min(window.innerWidth, window.innerHeight);
    canvas.width = size;
    canvas.height = size;
    gl.viewport(0, 0, canvas.width, canvas.height);
    render();
});

