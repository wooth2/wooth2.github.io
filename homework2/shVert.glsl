#version 300 es

layout(location = 0) in vec2 aPos;
uniform vec2 uTranslate;

void main() {
    vec2 pos = aPos + uTranslate;
    gl_Position = vec4(pos, 0.0, 1.0);
}