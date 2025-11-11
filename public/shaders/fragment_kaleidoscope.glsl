#ifdef GL_ES
precision mediump float;
#endif

uniform float u_time;
uniform float u_segments;        // Liczba segmentów (3-12)
uniform float u_rotationSpeed;   // Prędkość obrotu (0-5)
uniform float u_mirrorIntensity; // Intensywność odbicia (0-1)
uniform float u_centerOffsetX;   // Przesunięcie centrum X (-1 do 1)
uniform float u_centerOffsetY;   // Przesunięcie centrum Y (-1 do 1)
uniform float u_zoom;            // Zoom (0.1-3)

varying vec2 vUv;

#define PI 3.14159265359
#define TWO_PI 6.28318530718

// HSV to RGB conversion
vec3 hsv2rgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

// Enhanced pattern generator with more variety
vec3 generatePattern(vec2 uv) {
    float time = u_time * 0.5;
    
    // Multiple wave layers for rich pattern
    float wave1 = sin(uv.x * 10.0 + time * 0.8);
    float wave2 = cos(uv.y * 8.0 + time * 1.2);
    float wave3 = sin((uv.x + uv.y) * 6.0 + time * 0.4);
    float wave4 = cos((uv.x - uv.y) * 5.0 + time * 0.9);
    
    // Distance from center for radial patterns
    float dist = length(uv);
    float radial1 = sin(dist * 15.0 + time * 1.5);
    float radial2 = cos(dist * 8.0 + time * 0.6);
    
    // Angular patterns
    float angle = atan(uv.y, uv.x);
    float angular = sin(angle * 8.0 + dist * 10.0 + time);
    
    // Combine all patterns with better weighting
    float pattern = (wave1 + wave2 + wave3 + wave4 + radial1 + radial2 + angular) * 0.15;
    
    // Enhanced color generation
    float hue = pattern + time * 0.15 + dist * 0.5;
    float saturation = 0.7 + pattern * 0.3 + sin(time * 0.3) * 0.2;
    float value = 0.6 + pattern * 0.4 + cos(time * 0.4) * 0.2;
    
    // Ensure values are in valid range
    saturation = clamp(saturation, 0.0, 1.0);
    value = clamp(value, 0.0, 1.0);
    
    return hsv2rgb(vec3(hue, saturation, value));
}

void main() {
    // Center coordinates with enhanced offset responsiveness
    vec2 center = vec2(0.5 + u_centerOffsetX * 0.4, 0.5 + u_centerOffsetY * 0.4);
    vec2 uv = vUv - center;
    
    // Apply zoom with better scaling
    uv *= u_zoom;
    
    // Convert to polar coordinates
    float radius = length(uv);
    float angle = atan(uv.y, uv.x);
    
    // Add rotation animation with better speed control
    angle += u_time * u_rotationSpeed * 0.5;
    
    // Ensure we have at least 3 segments, handle edge cases
    float segments = max(u_segments, 3.0);
    float segmentAngle = TWO_PI / segments;
    
    // Improved kaleidoscope math
    float normalizedAngle = mod(angle + PI, TWO_PI);
    float segment = floor(normalizedAngle / segmentAngle);
    float angleInSegment = mod(normalizedAngle, segmentAngle);
    
    // Enhanced mirroring - mirror every other segment
    if (mod(segment, 2.0) > 0.5) {
        angleInSegment = segmentAngle - angleInSegment;
    }
    
    // Reconstruct UV from polar coordinates with better precision
    vec2 kaleidoUv = vec2(
        cos(angleInSegment - PI) * radius,
        sin(angleInSegment - PI) * radius
    );
    
    // Apply mirroring intensity with smoother transition
    kaleidoUv = mix(uv, kaleidoUv, u_mirrorIntensity);
    
    // Generate pattern with the transformed coordinates
    vec3 color = generatePattern(kaleidoUv);
    
    // Enhanced center highlighting that responds to parameters
    float centerGlow = 1.0 - smoothstep(0.0, 0.2 + u_mirrorIntensity * 0.2, radius);
    color += centerGlow * vec3(0.3, 0.4, 0.6) * (0.3 + u_mirrorIntensity * 0.2);
    
    // Improved vignette that works better with zoom
    float vignetteStart = 0.3 / u_zoom;
    float vignetteEnd = 1.0 / u_zoom;
    float vignette = 1.0 - smoothstep(vignetteStart, vignetteEnd, radius);
    color *= vignette;
    
    // Add segment boundaries visualization for high segment counts
    if (segments > 8.0) {
        float segmentBoundary = abs(sin(normalizedAngle * segments * 0.5));
        segmentBoundary = smoothstep(0.98, 1.0, segmentBoundary);
        color += segmentBoundary * vec3(0.2, 0.3, 0.4) * u_mirrorIntensity;
    }
    
    // Brightness enhancement
    color *= 1.1;
    
    gl_FragColor = vec4(color, 1.0);
} 