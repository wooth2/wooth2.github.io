/*-------------------------------------------------------------------------
SquarePyramid.js
- 밑면: xz-plane (y=0), 중심 (0,0,0), size 1x1  → (-0.5,0,-0.5) ~ (0.5,0,0.5)
- 꼭짓점: (0, 1, 0)  → 높이 1
- 인덱스 드로우 (밑면 2 tri + 옆면 4 tri = 6 tri)
---------------------------------------------------------------------------*/

export class SquarePyramid {
  constructor(gl) {
    this.gl = gl;
    this._setup();
  }

  _setup() {
    const gl = this.gl;

    const vertices = new Float32Array([
      // base (y=0)
      -0.5, 0.0, -0.5,   // 0
       0.5, 0.0, -0.5,   // 1
       0.5, 0.0,  0.5,   // 2
      -0.5, 0.0,  0.5,   // 3
       0.0, 1.0,  0.0    // 4 apex
    ]);

    const colors = new Float32Array([
      // base (4개) + apex(1개) → 모두 RGBA
      0.7, 0.7, 0.7, 1.0,
      0.7, 0.7, 0.7, 1.0,
      0.7, 0.7, 0.7, 1.0,
      0.7, 0.7, 0.7,1.0,
      0.95, 0.45, 0.25, 1.0
    ]);

    const indices = new Uint16Array([
      // base (2 triangles)
      0, 1, 2,
      0, 2, 3,
      // sides (4 triangles)
      0, 1, 4,
      1, 2, 4,
      2, 3, 4,
      3, 0, 4
    ]);

    this.vao = gl.createVertexArray();
    gl.bindVertexArray(this.vao);

    // position buffer
    this.vboPos = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vboPos);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);

    // color buffer
    this.vboCol = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vboCol);
    gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(2);
    gl.vertexAttribPointer(2, 4, gl.FLOAT, false, 0, 0);

    // index buffer
    this.ebo = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ebo);
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
