#ifdef GL_ES
precision mediump float;
#endif

uniform float u_time;
uniform float u_noiseIntensity;
uniform float u_noiseScale;
uniform float u_animationSpeed;
uniform float u_colorMix;
uniform float u_hueShift;
varying vec2 vUv;

float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

void main(){
    vec2 st = vUv * u_noiseScale;
    
    // Różne warstwy szumu z lepszym wykorzystaniem u_animationSpeed
    float noise1 = random(st + u_time * u_animationSpeed * 0.5);
    float noise2 = random(st * 2.0 + u_time * u_animationSpeed * 0.3);
    float noise3 = random(st * 4.0 + u_time * u_animationSpeed * 0.7);
    float noise4 = random(st * 8.0 + u_time * u_animationSpeed * 0.2);
    
    // Kombinacja szumów z większym wpływem u_noiseIntensity
    float combinedNoise = (noise1 + noise2 * 0.5 + noise3 * 0.25 + noise4 * 0.125) / 1.875;
    combinedNoise = pow(combinedNoise, 1.0 / max(u_noiseIntensity, 0.1));
    
    // Kolory bazowe i szumowe z większymi kontrastami
    vec3 darkColor = vec3(0.05, 0.02, 0.15);   // Ciemniejszy fiolet
    vec3 brightColor = vec3(0.95, 0.8, 1.0);   // Jaśniejszy fiolet  
    vec3 accentColor = vec3(1.0, 0.2, 0.7);    // Intensywniejszy różowy
    
    // Mix kolorów z lepszą kontrolą u_colorMix
    vec3 baseColor = mix(darkColor, brightColor, combinedNoise);
    vec3 finalColor = mix(baseColor, accentColor, (noise2 + noise3) * u_colorMix * 0.5);
    
    // Aplikuj hue shift do finalnego koloru
    vec3 hueShiftedColor;
    hueShiftedColor.r = finalColor.r * cos(u_hueShift) - finalColor.g * sin(u_hueShift);
    hueShiftedColor.g = finalColor.r * sin(u_hueShift) + finalColor.g * cos(u_hueShift);
    hueShiftedColor.b = finalColor.b;
    
    // Alternatywny sposób - przesunięcie w przestrzeni HSV
    float hueOffset = u_hueShift * 0.5;
    vec3 shiftedFinal = vec3(
        abs(sin(atan(finalColor.g, finalColor.r) + hueOffset)) * length(finalColor.rg),
        abs(cos(atan(finalColor.g, finalColor.r) + hueOffset)) * length(finalColor.rg),
        finalColor.b
    );
    
    // Mix między originalnym a przesunietym kolorem
    vec3 result = mix(finalColor, shiftedFinal, clamp(u_hueShift / 6.28, 0.0, 1.0));
    
    gl_FragColor = vec4(result, 1.0);
}
