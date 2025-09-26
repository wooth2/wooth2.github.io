#version 300 es
precision highp float;

uniform vec4 u_color;   // JS에서 shader.setVec4("u_color", ...)로 설정
out vec4 fragColor;

void main() {
    fragColor = u_color;
}