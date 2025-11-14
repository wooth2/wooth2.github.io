#version 300 es
precision mediump float;

in vec3 LightingColor;

out vec4 FragColor;

void main() {
FragColor = vec4(LightingColor, 1.0);
}