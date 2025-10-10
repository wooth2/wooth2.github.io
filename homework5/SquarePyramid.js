export class SquarePyramid {
    constructor(gl) {
        this.gl = gl;
        this._setup();
    }

    _setup() {
        const gl = this.gl;

        const positions = new Float32Array([
            // base
            -0.5, 0.0, -0.5,
             0.5, 0.0, -0.5,
             0.5, 0.0,  0.5,
            -0.5, 0.0,  0.5,
            // apex
             0.0, 0.8,  0.0
        ]);

        // RGBA colors
        const colors = new Float32Array([
            0.7, 0.7, 0.7, 1.0,
            0.7, 0.7, 0.7, 1.0,
            0.7, 0.7, 0.7, 1.0,
            0.7, 0.7, 0.7, 1.0,
            0.95, 0.45, 0.25, 1.0
        ]);

        const indices = new Uint16Array([
            // base
            0, 1, 2, 0, 2, 3,
            // sides
            0, 1, 4,
            1, 2, 4,
            2, 3, 4,
            3, 0, 4
        ]);

        this.vao = gl.createVertexArray();
        gl.bindVertexArray(this.vao);

        // Position
        const vboPos = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vboPos);
        gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
        gl.enableVertexAttribArray(0);
        gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);

        // Color
        const vboCol = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vboCol);
        gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
        gl.enableVertexAttribArray(2); // shader layout(location=2)
        gl.vertexAttribPointer(2, 4, gl.FLOAT, false, 0, 0);

        // Index buffer
        const ebo = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ebo);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

        gl.bindVertexArray(null);
        this.indexCount = indices.length;
    }

    draw() {
        const gl = this.gl;
        gl.bindVertexArray(this.vao);
        gl.drawElements(gl.TRIANGLES, this.indexCount, gl.UNSIGNED_SHORT, 0);
        gl.bindVertexArray(null);
    }
}
