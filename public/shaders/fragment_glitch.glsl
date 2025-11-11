#ifdef GL_ES
precision mediump float;
#endif

uniform float u_time;
uniform float u_glitchIntensity;
uniform float u_glitchFrequency;
uniform float u_colorSeparation;
uniform float u_blockSize;
uniform float u_scanlineIntensity;
uniform float u_noiseAmount;
uniform float u_hueShift;
varying vec2 vUv;

void main() {
  vec2 uv = vUv;
  
  // Glitch effect timing - więcej chaotyczności
  float glitchTime = u_time * u_glitchFrequency;
  float glitch = sin(glitchTime) * u_glitchIntensity;
  float glitchPulse = abs(sin(glitchTime * 3.7)) * u_glitchIntensity;
  
  // Zaawansowana dystrorsja bloków
  float blockY = floor(uv.y * u_blockSize) / u_blockSize;
  float blockX = floor(uv.x * u_blockSize * 0.5) / (u_blockSize * 0.5);
  float blockOffset = sin(blockY * 20.0 + blockX * 15.0 + glitchTime) * glitch * 0.15;
  float verticalGlitch = sin(blockX * 25.0 + glitchTime * 2.0) * glitchPulse * 0.05;
  
  // Distorted UV coordinates
  vec2 distortedUV = vec2(uv.x + blockOffset, uv.y + verticalGlitch);
  
  // Enhanced color channel separation
  vec3 color = vec3(0.0);
  
  // Red channel (shifted right) - więcej detalu
  vec2 uvR = vec2(distortedUV.x + u_colorSeparation * glitch * 2.0, distortedUV.y);
  color.r = 0.8 + 0.3 * sin(uvR.x * 15.0 + uvR.y * 8.0 + glitchTime);
  color.r += 0.2 * abs(sin(uvR.x * 50.0 + glitchTime * 3.0)) * glitchPulse;
  
  // Green channel (lekko przesunięty) - base pattern
  vec2 uvG = vec2(distortedUV.x + u_colorSeparation * glitch * 0.5, distortedUV.y);
  color.g = 0.6 + 0.4 * sin(uvG.x * 18.0 + uvG.y * 12.0 + glitchTime * 0.8);
  color.g += 0.3 * cos(uvG.y * 30.0 + glitchTime * 2.0) * glitch;
  
  // Blue channel (shifted left) - przeciwna strona
  vec2 uvB = vec2(distortedUV.x - u_colorSeparation * glitch * 1.5, distortedUV.y);
  color.b = 0.9 + 0.2 * sin(uvB.x * 20.0 + uvB.y * 10.0 + glitchTime * 1.3);
  color.b += 0.25 * sin(uvB.x * 40.0 + uvB.y * 25.0 + glitchTime * 4.0) * glitch;
  
  // Scanlines effect
  float scanlines = sin(uv.y * 800.0) * u_scanlineIntensity * 0.04;
  color *= (1.0 - scanlines);
  
  // Enhanced noise overlay
  float noise1 = fract(sin(dot(uv + glitchTime, vec2(12.9898, 78.233))) * 43758.5453);
  float noise2 = fract(sin(dot(uv * 2.0 + glitchTime * 1.5, vec2(93.9898, 67.345))) * 28734.3421);
  float combinedNoise = (noise1 + noise2 * 0.5) / 1.5;
  color += combinedNoise * u_noiseAmount * glitch * 0.3;
  
  // Digital artifact lines (horizontal tears)
  float tearLine = step(0.995, sin(uv.y * 50.0 + glitchTime * 10.0));
  color += vec3(tearLine * glitch * 0.8, tearLine * glitch * 0.3, tearLine * glitch * 0.1);
  
  // Hue shifting for psychedelic effect
  if (u_hueShift > 0.1) {
    float hueOffset = u_hueShift + glitchTime * 0.5;
    vec3 hueShifted;
    hueShifted.r = color.r * cos(hueOffset) - color.g * sin(hueOffset);
    hueShifted.g = color.r * sin(hueOffset) + color.g * cos(hueOffset);
    hueShifted.b = color.b + sin(hueOffset) * 0.2;
    color = mix(color, hueShifted, clamp(u_hueShift / 3.14, 0.0, 1.0));
  }
  
  // Intensyfikacja kolorów
  color = pow(color, vec3(0.9)); // Gamma correction
  color = clamp(color, 0.0, 1.0);
  
  gl_FragColor = vec4(color, 1.0);
}
