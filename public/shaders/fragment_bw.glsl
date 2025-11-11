#ifdef GL_ES
precision mediump float;
#endif

uniform float u_time;
uniform float u_waveSpeed;
uniform float u_waveFrequency;
uniform float u_contrast;
varying vec2 vUv;

void main() {
  // Przesuwamy UV tak, by środek (0.5, 0.5) był w punkcie (0.0, 0.0)
  vec2 uv = vUv - 0.5;

  // Obliczamy odległość od środka
  float dist = length(uv);

  // Tworzymy falę sinusoidalną z kontrolowalnymi parametrami
  float wave = sin(u_time * u_waveSpeed + dist * u_waveFrequency);

  // Normalizujemy zakres z kontrolą kontrastu
  float grey = 0.5 + 0.5 * wave * u_contrast;

  gl_FragColor = vec4(vec3(grey), 1.0);
}
