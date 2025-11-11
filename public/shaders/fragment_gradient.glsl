#ifdef GL_ES
precision mediump float;
#endif

uniform float u_time;
uniform float u_colorSpeed;
uniform float u_gradientScale;
uniform float u_brightness;
uniform float u_contrast;
uniform float u_hueShift;
uniform float u_colorPalette; // New uniform for palette selection (0-4)
varying vec2 vUv;

// HSV to RGB conversion
vec3 hsv2rgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

// Sunset palette function
vec3 getSunsetColor(float t) {
    vec3 color1 = vec3(1.0, 0.3, 0.1);  // Deep red
    vec3 color2 = vec3(1.0, 0.6, 0.2);  // Orange
    vec3 color3 = vec3(1.0, 0.8, 0.4);  // Yellow
    
    if (t < 0.5) {
        return mix(color1, color2, t * 2.0);
    } else {
        return mix(color2, color3, (t - 0.5) * 2.0);
    }
}

// Ocean palette function
vec3 getOceanColor(float t) {
    vec3 color1 = vec3(0.0, 0.2, 0.4);  // Deep blue
    vec3 color2 = vec3(0.1, 0.4, 0.7);  // Ocean blue
    vec3 color3 = vec3(0.3, 0.7, 0.9);  // Light blue
    
    if (t < 0.5) {
        return mix(color1, color2, t * 2.0);
    } else {
        return mix(color2, color3, (t - 0.5) * 2.0);
    }
}

// Forest palette function
vec3 getForestColor(float t) {
    vec3 color1 = vec3(0.1, 0.3, 0.1);  // Dark green
    vec3 color2 = vec3(0.2, 0.6, 0.2);  // Forest green
    vec3 color3 = vec3(0.4, 0.8, 0.3);  // Light green
    
    if (t < 0.5) {
        return mix(color1, color2, t * 2.0);
    } else {
        return mix(color2, color3, (t - 0.5) * 2.0);
    }
}

// Fire palette function
vec3 getFireColor(float t) {
    vec3 color1 = vec3(0.8, 0.0, 0.0);  // Deep red
    vec3 color2 = vec3(1.0, 0.4, 0.0);  // Orange fire
    vec3 color3 = vec3(1.0, 1.0, 0.2);  // Hot yellow
    
    if (t < 0.5) {
        return mix(color1, color2, t * 2.0);
    } else {
        return mix(color2, color3, (t - 0.5) * 2.0);
    }
}

// Neon palette function
vec3 getNeonColor(float t) {
    vec3 color1 = vec3(0.8, 0.0, 1.0);  // Purple
    vec3 color2 = vec3(1.0, 0.0, 0.8);  // Magenta
    vec3 color3 = vec3(0.0, 1.0, 1.0);  // Cyan
    
    if (t < 0.5) {
        return mix(color1, color2, t * 2.0);
    } else {
        return mix(color2, color3, (t - 0.5) * 2.0);
    }
}

// Get color based on palette selection
vec3 getPaletteColor(float t, int palette) {
    if (palette == 0) {
        return getSunsetColor(t);
    } else if (palette == 1) {
        return getOceanColor(t);
    } else if (palette == 2) {
        return getForestColor(t);
    } else if (palette == 3) {
        return getFireColor(t);
    } else if (palette == 4) {
        return getNeonColor(t);
    } else {
        // Default HSV fallback
        float hue = mod(t + u_hueShift / 6.28, 1.0);
        return hsv2rgb(vec3(hue, 0.8, 0.9));
    }
}

void main() {
    vec2 st = vUv * u_gradientScale;
    
    // Create base pattern
    float time = u_time * u_colorSpeed;
    float pattern1 = sin(st.x * 3.14159 + time);
    float pattern2 = cos(st.y * 3.14159 + time * 0.8);
    float pattern3 = sin((st.x + st.y) * 2.0 + time * 0.6);
    
    // Combine patterns for gradient parameter
    float combinedPattern = (pattern1 + pattern2 + pattern3) / 3.0;
    float gradientParam = (combinedPattern * 0.5 + 0.5); // Normalize to 0-1
    
    // Get color from selected palette
    int paletteIndex = int(round(u_colorPalette));
    vec3 color = getPaletteColor(gradientParam, paletteIndex);
    
    // Apply brightness and contrast
    color = (color - 0.5) * u_contrast + 0.5 + u_brightness;
    
    // Ensure we don't go out of bounds
    color = clamp(color, 0.0, 1.0);
    
    gl_FragColor = vec4(color, 1.0);
}
