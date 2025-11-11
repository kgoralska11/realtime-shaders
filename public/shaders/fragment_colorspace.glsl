#ifdef GL_ES
precision mediump float;
#endif

uniform float u_time;
uniform float u_hueShift;        // Przesunięcie barwy (-180 do 180)
uniform float u_saturation;     // Nasycenie (0-2)
uniform float u_brightness;     // Jasność (0-2)
uniform float u_contrast;       // Kontrast (0-2)
uniform float u_colorMode;      // Tryb koloru (0-5)
uniform float u_animationSpeed; // Prędkość animacji (0-3)

varying vec2 vUv;

#define PI 3.14159265359

// RGB to HSV conversion
vec3 rgb2hsv(vec3 c) {
    vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
    vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
    vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));
    
    float d = q.x - min(q.w, q.y);
    float e = 1.0e-10;
    return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}

// HSV to RGB conversion
vec3 hsv2rgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

// Enhanced pattern generator with more variety
vec3 generateBasePattern(vec2 uv) {
    float time = u_time * u_animationSpeed;
    
    // Multi-layer wave pattern with enhanced complexity
    float wave1 = sin(uv.x * 8.0 + time * 1.2);
    float wave2 = cos(uv.y * 10.0 + time * 0.9);
    float wave3 = sin((uv.x + uv.y) * 6.0 + time * 0.7);
    float wave4 = cos((uv.x - uv.y) * 4.0 + time * 1.5);
    
    // Enhanced radial components
    float dist = length(uv - 0.5);
    float radial1 = sin(dist * 12.0 + time * 1.3);
    float radial2 = cos(dist * 8.0 + time * 0.6);
    
    // Improved noise patterns
    float noise1 = sin(uv.x * 25.0 + time) * cos(uv.y * 20.0 + time * 0.8);
    float noise2 = sin(uv.x * 15.0 + time * 0.4) * cos(uv.y * 18.0 + time * 1.1);
    
    // Angular pattern
    float angle = atan(uv.y - 0.5, uv.x - 0.5);
    float angular = sin(angle * 6.0 + dist * 8.0 + time);
    
    float combined = (wave1 + wave2 + wave3 + wave4 + radial1 + radial2 + noise1 + noise2 + angular) * 0.12;
    
    // Enhanced base colors with better distribution
    float r = 0.5 + 0.5 * sin(combined + time * 0.4 + uv.x * 2.0);
    float g = 0.5 + 0.5 * cos(combined + time * 0.6 + uv.y * 2.0 + PI * 0.333);
    float b = 0.5 + 0.5 * sin(combined + time * 0.8 + (uv.x + uv.y) + PI * 0.666);
    
    return vec3(r, g, b);
}

// Enhanced color transformation with better parameter handling
vec3 applyColorTransform(vec3 color) {
    int mode = int(round(u_colorMode));
    
    if (mode == 0) {
        // Standard HSV manipulation - enhanced responsiveness
        vec3 hsv = rgb2hsv(color);
        hsv.x = mod(hsv.x + u_hueShift / 360.0, 1.0);
        hsv.y = clamp(hsv.y * u_saturation, 0.0, 1.0);
        hsv.z = clamp(hsv.z * u_brightness, 0.0, 1.0);
        color = hsv2rgb(hsv);
    }
    else if (mode == 1) {
        // RGB channel separation with hue shift influence
        float time = u_time * u_animationSpeed;
        float hueInfluence = u_hueShift / 180.0;
        color.r = color.r * (1.0 + 0.6 * sin(time + hueInfluence));
        color.g = color.g * (1.0 + 0.6 * sin(time + PI * 0.333 + hueInfluence));
        color.b = color.b * (1.0 + 0.6 * sin(time + PI * 0.666 + hueInfluence));
        color *= u_brightness;
        color = mix(vec3(dot(color, vec3(0.299, 0.587, 0.114))), color, u_saturation);
    }
    else if (mode == 2) {
        // Complementary colors with enhanced control
        vec3 hsv = rgb2hsv(color);
        hsv.x = mod(hsv.x + 0.5 + u_hueShift / 360.0, 1.0);
        hsv.y = clamp(hsv.y * u_saturation, 0.0, 1.0);
        hsv.z = clamp(hsv.z * u_brightness, 0.0, 1.0);
        color = hsv2rgb(hsv);
    }
    else if (mode == 3) {
        // Posterize effect with hue shift
        float levels = max(2.0, 3.0 + u_saturation * 6.0);
        vec3 hsv = rgb2hsv(color);
        hsv.x = mod(hsv.x + u_hueShift / 360.0, 1.0);
        color = hsv2rgb(hsv);
        color = floor(color * levels) / levels;
        color *= u_brightness;
    }
    else if (mode == 4) {
        // Color inversion with enhanced twist
        vec3 inverted = 1.0 - color;
        vec3 hsv = rgb2hsv(inverted);
        hsv.x = mod(hsv.x + u_hueShift / 360.0, 1.0);
        hsv.y = clamp(hsv.y * u_saturation, 0.0, 1.0);
        hsv.z = clamp(hsv.z * u_brightness, 0.0, 1.0);
        color = hsv2rgb(hsv);
    }
    else if (mode == 5) {
        // Psychedelic mode with all parameters
        float time = u_time * u_animationSpeed;
        vec3 hsv = rgb2hsv(color);
        
        // Dynamic hue shifting
        hsv.x += sin(time * 2.0) * 0.3 + cos(time * 1.5) * 0.2 + u_hueShift / 360.0;
        hsv.x = mod(hsv.x, 1.0);
        
        // Pulsating saturation
        float satPulse = 1.0 + sin(time * 3.0) * 0.4 + cos(time * 2.0) * 0.3;
        hsv.y = clamp(hsv.y * u_saturation * satPulse, 0.0, 1.0);
        
        // Breathing brightness
        float brightPulse = 1.0 + sin(time * 1.8) * 0.3;
        hsv.z = clamp(hsv.z * u_brightness * brightPulse, 0.0, 1.0);
        
        color = hsv2rgb(hsv);
    }
    
    // Enhanced contrast application
    color = (color - 0.5) * u_contrast + 0.5;
    
    return clamp(color, 0.0, 1.0);
}

void main() {
    // Generate enhanced base pattern
    vec3 color = generateBasePattern(vUv);
    
    // Apply color space transformation
    color = applyColorTransform(color);
    
    // Mode-specific enhancements
    int mode = int(round(u_colorMode));
    
    // Add subtle mode indicators
    if (mode == 1) {
        // RGB mode - add slight channel separation visual
        float time = u_time * u_animationSpeed;
        vec2 offset = vec2(sin(time) * 0.002, cos(time) * 0.002);
        vec3 shifted = generateBasePattern(vUv + offset);
        shifted = applyColorTransform(shifted);
        color = mix(color, shifted, 0.1);
    }
    else if (mode == 5) {
        // Psychedelic mode - add extra glow
        float glow = 1.0 + 0.2 * sin(u_time * u_animationSpeed * 4.0);
        color *= glow;
    }
    
    // Improved vignette that's less aggressive
    float vignette = 1.0 - 0.2 * length(vUv - 0.5);
    color *= vignette;
    
    // Ensure brightness is never too dark
    color = max(color, vec3(0.05));
    
    gl_FragColor = vec4(color, 1.0);
} 