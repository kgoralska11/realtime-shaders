#ifdef GL_ES
precision mediump float;
#endif

uniform float uIntensity;

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
  vec4 color = inputColor;
  float offset = sin(uv.y * 10.0) * 0.01 * uIntensity;
  color.r = inputColor.r + offset;
  outputColor = color;
}
