// SquarePyramid.js
// 밑면: y=0에서 xz 크기 1×1 ([-0.5, +0.5])
// 높이: apex y=1.0 (밑면 중심에서 꼭짓점까지 1)
export class SquarePyramid {
  constructor(gl) {
    this.gl = gl;
    this._setup();
  }

  _setup() {
    const gl = this.gl;

    // 2) 정점 (밑면 4개 + 꼭짓점 1개)
    const positions = new Float32Array([
      // base (y=0)
      -0.5, 0.0, -0.5,   // 0
       0.5, 0.0, -0.5,   // 1
       0.5, 0.0,  0.5,   // 2
      -0.5, 0.0,  0.5,   // 3
      // apex
       0.0, 1.0,  0.0    // 4  (height = 1)
    ]);

    // 컬러(각 면을 구분하기 쉽게)
    const colors = new Float32Array([
      // base: 회색
      0.7, 0.7, 0.7, 1.0,
      0.7, 0.7, 0.7, 1.0,
      0.7, 0.7, 0.7, 1.0,
      0.7, 0.7, 0.7, 1.0,
      // apex: 오렌지
      0.95, 0.45, 0.25, 1.0
    ]);

    // 인덱스: 밑면 2삼각형 + 옆면 4삼각형
    const indices = new Uint16Array([
      // base (0,1,2,3)
      0, 1, 2,   0, 2, 3,
      // sides (apex=4)
      0, 1, 4,
      1, 2, 4,
      2, 3, 4,
      3, 0, 4
    ]);

    // VAO
    this.vao = gl.createVertexArray();
    gl.bindVertexArray(this.vao);

    // VBO: position -> layout(location=0)
    const vboPos = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vboPos);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);

    // VBO: color -> layout(location=2)
    const vboCol = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vboCol);
    gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(2);
    gl.vertexAttribPointer(2, 4, gl.FLOAT, false, 0, 0);

    // EBO
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
