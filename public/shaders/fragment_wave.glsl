#ifdef GL_ES
precision mediump float;
#endif

uniform float u_time;
uniform float u_waveFrequency;
uniform float u_waveAmplitude;
uniform float u_waveSpeed;
uniform float u_waveDirection;
uniform float u_colorIntensity;
uniform float u_colorPalette; // New uniform for palette selection (0-4)
varying vec2 vUv;

// Ocean Waves palette function - deep ocean blues
vec3 getOceanColor(float t) {
    vec3 color1 = vec3(0.0, 0.2, 0.4);  // Deep ocean blue
    vec3 color2 = vec3(0.1, 0.4, 0.7);  // Ocean blue
    vec3 color3 = vec3(0.3, 0.7, 0.9);  // Light ocean blue
    
    if (t < 0.5) {
        return mix(color1, color2, t * 2.0);
    } else {
        return mix(color2, color3, (t - 0.5) * 2.0);
    }
}

// Surf Rider palette function - energetic surf colors
vec3 getSurfColor(float t) {
    vec3 color1 = vec3(0.0, 0.3, 0.5);  // Deep water
    vec3 color2 = vec3(0.2, 0.8, 0.9);  // Surf blue
    vec3 color3 = vec3(0.8, 1.0, 1.0);  // Foam white
    
    if (t < 0.5) {
        return mix(color1, color2, t * 2.0);
    } else {
        return mix(color2, color3, (t - 0.5) * 2.0);
    }
}

// Water Drop palette function - clear water with better contrast
vec3 getWaterDropColor(float t) {
    vec3 color1 = vec3(0.2, 0.5, 0.8);  // Deeper blue for contrast
    vec3 color2 = vec3(0.5, 0.8, 1.0);  // Medium blue
    vec3 color3 = vec3(0.8, 0.95, 1.0); // Light blue
    
    if (t < 0.5) {
        return mix(color1, color2, t * 2.0);
    } else {
        return mix(color2, color3, (t - 0.5) * 2.0);
    }
}

// Electric Storm palette function - electric energy colors
vec3 getElectricColor(float t) {
    vec3 color1 = vec3(0.2, 0.0, 0.6);  // Deep purple
    vec3 color2 = vec3(0.4, 0.2, 1.0);  // Electric blue
    vec3 color3 = vec3(0.8, 0.9, 1.0);  // Electric white
    
    if (t < 0.5) {
        return mix(color1, color2, t * 2.0);
    } else {
        return mix(color2, color3, (t - 0.5) * 2.0);
    }
}

// Sound Waves palette function - colorful audio spectrum
vec3 getSoundColor(float t) {
    vec3 color1 = vec3(1.0, 0.2, 0.2);  // Red
    vec3 color2 = vec3(0.2, 1.0, 0.2);  // Green
    vec3 color3 = vec3(0.2, 0.2, 1.0);  // Blue
    
    if (t < 0.333) {
        return mix(color1, color2, t * 3.0);
    } else if (t < 0.666) {
        return mix(color2, color3, (t - 0.333) * 3.0);
    } else {
        return mix(color3, color1, (t - 0.666) * 3.0);
    }
}

// Get color based on palette selection
vec3 getPaletteColor(float t, int palette) {
    if (palette == 0) {
        return getOceanColor(t);
    } else if (palette == 1) {
        return getSurfColor(t);
    } else if (palette == 2) {
        return getWaterDropColor(t);
    } else if (palette == 3) {
        return getElectricColor(t);
    } else if (palette == 4) {
        return getSoundColor(t);
    } else {
        // Default ocean color fallback
        return getOceanColor(t);
    }
}

void main() {
    vec2 st = vUv;
    
    // Kierunek fali (mix między poziomą a pionową)
    vec2 waveDir = mix(vec2(1.0, 0.0), vec2(0.0, 1.0), u_waveDirection);
    float wavePos = dot(st, waveDir);
    
    // Główna fala z kontrolą prędkości
    float waveX = sin(u_time * u_waveSpeed + wavePos * u_waveFrequency) * u_waveAmplitude;
    float waveY = cos(u_time * u_waveSpeed * 0.8 + st.y * u_waveFrequency * 0.7) * u_waveAmplitude;
    
    // Create wave parameter for color palette (0-1 range)
    float waveParam = (waveX + waveY + 2.0) * 0.25; // Normalize to 0-1
    waveParam = clamp(waveParam, 0.0, 1.0);
    
    // Get base color from selected palette
    int paletteIndex = int(round(u_colorPalette));
    vec3 baseColor = getPaletteColor(waveParam, paletteIndex);
    
    // Apply wave modulation with color intensity control
    vec3 waveColor = baseColor + vec3(
        waveX * u_colorIntensity * 0.3,
        waveY * u_colorIntensity * 0.2,
        (waveX * waveY) * u_colorIntensity * 0.4
    );
    
    // Ensure colors stay in valid range
    waveColor = clamp(waveColor, 0.0, 1.0);
    
    gl_FragColor = vec4(waveColor, 1.0);
}
