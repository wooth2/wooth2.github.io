/*-------------------------------------------------------------------------
squarePyramid.js
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

    // positions (x, y, z)
    const v = new Float32Array([
      // base (y=0)
      -0.5, 0.0, -0.5,   // 0
       0.5, 0.0, -0.5,   // 1
       0.5, 0.0,  0.5,   // 2
      -0.5, 0.0,  0.5,   // 3
      // apex
       0.0, 1.0,  0.0    // 4
    ]);

    // colors (r, g, b) per-vertex (원하는 대로 가볍게 배색)
    const c = new Float32Array([
      // base verts
      0.7, 0.7, 0.7,   // 0
      0.7, 0.7, 0.7,   // 1
      0.7, 0.7, 0.7,   // 2
      0.7, 0.7, 0.7,   // 3
      // apex
      0.9, 0.3, 0.2    // 4
    ]);

    // indices (6 triangles: 2 for base, 4 for sides)
    const idx = new Uint16Array([
      // base (two triangles, CCW)
      0, 1, 2,
      0, 2, 3,

      // sides (each side: base edge + apex)
      0, 1, 4,   // front
      1, 2, 4,   // right
      2, 3, 4,   // back
      3, 0, 4    // left
    ]);

    // --- VAO ---
    this.vao = gl.createVertexArray();
    gl.bindVertexArray(this.vao);

    // position buffer
    this.vboPos = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vboPos);
    gl.bufferData(gl.ARRAY_BUFFER, v, gl.STATIC_DRAW);

    // attrib: a_pos (location 0 가정)
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);

    // color buffer
    this.vboCol = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vboCol);
    gl.bufferData(gl.ARRAY_BUFFER, c, gl.STATIC_DRAW);

    // attrib: a_col (location 1 가정)
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 0, 0);

    // index buffer
    this.ebo = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ebo);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, idx, gl.STATIC_DRAW);

    gl.bindVertexArray(null);

    this.indexCount = idx.length;
  }

  draw() {
    const gl = this.gl;
    gl.bindVertexArray(this.vao);
    gl.drawElements(gl.TRIANGLES, this.indexCount, gl.UNSIGNED_SHORT, 0);
    gl.bindVertexArray(null);
  }
}
