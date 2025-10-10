export class Shader {
    constructor(gl, vertexSource, fragmentSource) {
        this.gl = gl;
        this.program = this.initShader(vertexSource, fragmentSource);
        if (!this.program) throw new Error("Failed to initialize shader program");
    }

    initShader(vertexSource, fragmentSource) {
        const gl = this.gl;

        // Compile vertex shader
        const vs = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(vs, vertexSource);
        gl.compileShader(vs);
        if (!gl.getShaderParameter(vs, gl.COMPILE_STATUS)) {
            console.error("Vertex shader error:", gl.getShaderInfoLog(vs));
            gl.deleteShader(vs);
            return null;
        }

        // Compile fragment shader
        const fs = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(fs, fragmentSource);
        gl.compileShader(fs);
        if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) {
            console.error("Fragment shader error:", gl.getShaderInfoLog(fs));
            gl.deleteShader(fs);
            return null;
        }

        // Link program
        const program = gl.createProgram();
        gl.attachShader(program, vs);
        gl.attachShader(program, fs);
        gl.linkProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.error("Shader program linking error:", gl.getProgramInfoLog(program));
            return null;
        }

        return program;
    }

    use() {
        this.gl.useProgram(this.program);
    }

    setMat4(name, mat) {
        const loc = this.gl.getUniformLocation(this.program, name);
        this.gl.uniformMatrix4fv(loc, false, mat);
    }
}