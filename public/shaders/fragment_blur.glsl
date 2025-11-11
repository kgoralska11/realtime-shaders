#ifdef GL_ES
precision mediump float;
#endif

uniform float u_time;
uniform float u_blurIntensity;
uniform float u_blurDirection;
uniform float u_focusPoint;
uniform float u_falloffRange;
uniform float u_animationSpeed;
uniform float u_colorShift;

varying vec2 vUv;

#define PI 3.14159265359
#define SAMPLES 12

vec3 generatePattern(vec2 uv) {
    float time = u_time * u_animationSpeed * 0.4;
    vec2 center = vec2(0.5);
    float dist = length(uv - center);
    
    float rings = smoothstep(0.1, 0.9, sin(dist * 15.0 + time + u_colorShift * 10.0) * 0.5 + 0.5);
    float angle = atan(uv.y - center.y, uv.x - center.x);
    float spiral = smoothstep(0.2, 0.9, sin(angle * 6.0 + dist * 18.0 + time * 2.0) * 0.5 + 0.5);
    
    float gridX = smoothstep(0.1, 0.9, sin(uv.x * 18.0 + time + u_colorShift * 8.0) * 0.5 + 0.5);
    float gridY = smoothstep(0.1, 0.9, sin(uv.y * 18.0 + time * 0.8 + u_colorShift * 6.0) * 0.5 + 0.5);
    float grid = max(gridX, gridY);
    
    float wave1 = smoothstep(0.3, 0.95, sin((uv.x + uv.y) * 22.0 + time * 1.5) * 0.5 + 0.5);
    float wave2 = smoothstep(0.3, 0.95, sin((uv.x - uv.y) * 25.0 + time * 1.2) * 0.5 + 0.5);
    float checker = step(0.5, mod(floor(uv.x * 12.0 + time * 0.5) + floor(uv.y * 12.0 + time * 0.3), 2.0));
    
    float pattern = mix(rings, spiral, 0.5);
    pattern = mix(pattern, grid, 0.4);
    pattern = mix(pattern, max(wave1, wave2), 0.3);
    pattern = mix(pattern, checker, 0.2);
    
    float hue = pattern + time * 0.3 + u_colorShift * 3.0 + dist * 2.0;
    
    vec3 color1 = vec3(
        0.5 + 0.5 * sin(hue * 2.0 * PI),
        0.5 + 0.5 * sin(hue * 2.0 * PI + PI * 0.666),
        0.5 + 0.5 * sin(hue * 2.0 * PI + PI * 1.333)
    );
    
    vec3 color2 = vec3(
        0.6 + 0.4 * cos(hue * 2.5 * PI + time),
        0.3 + 0.6 * cos(hue * 2.5 * PI + time + PI * 0.5),
        0.5 + 0.4 * cos(hue * 2.5 * PI + time + PI)
    );
    
    vec3 finalColor = mix(color1, color2, pattern);
    finalColor = mix(vec3(0.2), finalColor, 1.8);
    finalColor = clamp(finalColor, 0.0, 1.0);
    
    return finalColor;
}

vec3 gaussianBlur(vec2 uv, float intensity, float direction) {
    if (intensity <= 0.01) {
        return generatePattern(uv);
    }
    
    vec3 color = vec3(0.0);
    float totalWeight = 0.0;
    float directionRad = direction * PI / 180.0;
    vec2 blurDirection = vec2(cos(directionRad), sin(directionRad));
    float blurRadius = intensity * 0.012;
    
    for (int i = 0; i < SAMPLES; i++) {
        float offset = (float(i) - float(SAMPLES-1) * 0.5) / float(SAMPLES-1) * 2.0;
        float weight = exp(-0.5 * offset * offset * 2.0);
        vec2 sampleUV = uv + blurDirection * offset * blurRadius;
        sampleUV = fract(sampleUV);
        vec3 sampleColor = generatePattern(sampleUV);
        color += sampleColor * weight;
        totalWeight += weight;
    }
    
    return color / totalWeight;
}

float calculateBlurMask(vec2 uv) {
    vec2 focusCenter = vec2(u_focusPoint, 0.5);
    float distFromFocus = length(uv - focusCenter);
    float adjustedFalloff = u_falloffRange * 1.5;
    float mask = smoothstep(0.0, adjustedFalloff, distFromFocus);
    mask = pow(mask, 0.8);
    return mask;
}

void main() {
    vec2 uv = vUv;
    float blurMask = calculateBlurMask(uv);
    float effectiveBlurIntensity = u_blurIntensity * (0.5 + blurMask * 1.5);
    vec3 sharpColor = generatePattern(uv);
    vec3 blurredColor = gaussianBlur(uv, effectiveBlurIntensity, u_blurDirection);
    vec3 finalColor = mix(sharpColor, blurredColor, blurMask);
    
    if (u_animationSpeed > 0.1) {
        float time = u_time * u_animationSpeed;
        float animatedDirection = u_blurDirection + sin(time * 1.0) * 45.0;
        vec3 animatedBlur = gaussianBlur(uv, effectiveBlurIntensity * 0.8, animatedDirection);
        finalColor = mix(finalColor, animatedBlur, 0.4);
        
        float pulse = 0.5 + 0.5 * sin(time * 2.0);
        vec3 pulseBlur = gaussianBlur(uv, effectiveBlurIntensity * pulse, u_blurDirection + 90.0);
        finalColor = mix(finalColor, pulseBlur, pulse * 0.3);
    }
    
    vec2 focusCenter = vec2(u_focusPoint, 0.5);
    float focusHighlight = 1.0 - smoothstep(0.0, 0.2, length(uv - focusCenter));
    finalColor += focusHighlight * vec3(1.0, 0.8, 0.2) * 0.8;
    
    if (u_colorShift > 0.1) {
        float shift = u_colorShift * 2.5;
        vec3 shiftedColor = vec3(
            finalColor.r * (1.0 + shift * 0.6),
            finalColor.g * (1.0 + shift * 0.4 * sin(u_time * 0.8 + PI * 0.5)),
            finalColor.b * (1.0 + shift * 0.4 * sin(u_time * 0.8 + PI))
        );
        finalColor = mix(finalColor, shiftedColor, 0.6);
    }
    
    if (u_blurIntensity > 1.0) {
        float directionRad = u_blurDirection * PI / 180.0;
        vec3 directionTint = vec3(
            0.5 + 0.3 * cos(directionRad),
            0.5 + 0.3 * sin(directionRad),
            0.5 + 0.3 * cos(directionRad + PI * 0.5)
        );
        finalColor = mix(finalColor, finalColor * directionTint, 0.2);
    }
    
    finalColor = pow(finalColor, vec3(0.85));
    gl_FragColor = vec4(finalColor, 1.0);
} 