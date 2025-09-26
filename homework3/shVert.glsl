#version 300 es
precision highp float;

layout(location = 0) in vec2 a_position; // Shader.setAttribPointer("a_position", ...)

void main() {
    // 입력 좌표는 이미 NDC(-1~1)라고 가정
    gl_Position = vec4(a_position, 0.0, 1.0);
    gl_PointSize = 10.0;
}