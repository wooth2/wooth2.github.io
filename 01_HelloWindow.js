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
    gl.clear(gl.COLOR_BUFFER_BIT);    
    // Draw something here
}

// Resize viewport when window size changes
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    gl.viewport(0, 0, canvas.width, canvas.height);
    render();
});

