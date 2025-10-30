#version 300 es

precision highp float;

in vec2 v_texCoord;
out vec4 fragColor;

uniform sampler2D u_texture;

void main() {
    vec2 w = max(v_texCoord, 0.0);
    float sumw = w.x + w.y;
    w /= sumw; // 보정(합=1)
    float s = w.x + w.y;
    float u = s * s;
    float v = (s > 0.0) ? (w.y / s) : 0.0;
    vec2 uv = vec2(u, v); // [0,1]^2 전체 사용
    fragColor = texture(u_texture, v_texCoord);
}