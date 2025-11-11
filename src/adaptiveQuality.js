// Adaptive Quality System - Real-world problem solver
// Automatically adjusts shader complexity based on device performance

export class AdaptiveQualityManager {
  constructor() {
    this.performanceProfile = this.detectDeviceCapabilities();
    this.qualityLevel = 'high'; // high, medium, low
    this.fpsHistory = [];
    this.targetFPS = 60;
    this.adjustmentThreshold = 10; // frames to analyze before adjustment
    
    console.log('🔧 Adaptive Quality initialized:', this.performanceProfile);
  }
  
  detectDeviceCapabilities() {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    
    if (!gl) {
      return { level: 'low', reason: 'No WebGL support' };
    }
    
    // Test device capabilities
    const profile = {
      maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE),
      maxViewportDims: gl.getParameter(gl.MAX_VIEWPORT_DIMS),
      maxFragmentUniforms: gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_VECTORS),
      renderer: gl.getParameter(gl.RENDERER),
      vendor: gl.getParameter(gl.VENDOR),
      isMobile: /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
      memory: navigator.deviceMemory || 4, // GB, defaults to 4 if not available
      cores: navigator.hardwareConcurrency || 4
    };
    
    // Determine quality level based on capabilities
    if (profile.isMobile || profile.memory < 4 || profile.cores < 4) {
      profile.level = 'low';
    } else if (profile.maxTextureSize < 4096 || profile.memory < 8) {
      profile.level = 'medium';
    } else {
      profile.level = 'high';
    }
    
    return profile;
  }
  
  updateFPS(currentFPS) {
    this.fpsHistory.push(currentFPS);
    
    // Keep only recent history
    if (this.fpsHistory.length > this.adjustmentThreshold) {
      this.fpsHistory.shift();
    }
    
    // Analyze performance every N frames
    if (this.fpsHistory.length === this.adjustmentThreshold) {
      this.analyzeAndAdjust();
    }
  }
  
  analyzeAndAdjust() {
    const avgFPS = this.fpsHistory.reduce((a, b) => a + b) / this.fpsHistory.length;
    const previousQuality = this.qualityLevel;
    
    console.log(`📊 Performance analysis: ${avgFPS.toFixed(1)} FPS (target: ${this.targetFPS})`);
    
    // Performance-based quality adjustment
    if (avgFPS < this.targetFPS * 0.8) { // Below 80% of target
      if (this.qualityLevel === 'high') {
        this.qualityLevel = 'medium';
      } else if (this.qualityLevel === 'medium') {
        this.qualityLevel = 'low';
      }
    } else if (avgFPS > this.targetFPS * 0.95) { // Above 95% of target
      if (this.qualityLevel === 'low') {
        this.qualityLevel = 'medium';
      } else if (this.qualityLevel === 'medium') {
        this.qualityLevel = 'high';
      }
    }
    
    if (previousQuality !== this.qualityLevel) {
      console.log(`🔄 Quality adjusted: ${previousQuality} → ${this.qualityLevel}`);
      this.onQualityChange?.(this.qualityLevel, avgFPS);
    }
    
    // Reset history for next cycle
    this.fpsHistory = [];
  }
  
  getOptimalShaderSettings(shaderName) {
    const baseSettings = this.getBaseSettings(shaderName);
    
    switch (this.qualityLevel) {
      case 'low':
        return {
          ...baseSettings,
          animationSpeed: baseSettings.animationSpeed * 0.5,
          complexity: baseSettings.complexity * 0.6,
          effects: baseSettings.effects * 0.4,
          samples: Math.max(4, baseSettings.samples * 0.5),
          resolution: 0.75 // Render at 75% resolution
        };
        
      case 'medium':
        return {
          ...baseSettings,
          animationSpeed: baseSettings.animationSpeed * 0.8,
          complexity: baseSettings.complexity * 0.8,
          effects: baseSettings.effects * 0.7,
          samples: Math.max(6, baseSettings.samples * 0.75),
          resolution: 0.9 // Render at 90% resolution
        };
        
      case 'high':
      default:
        return {
          ...baseSettings,
          resolution: 1.0 // Full resolution
        };
    }
  }
  
  getBaseSettings(shaderName) {
    const settings = {
      gradient: {
        animationSpeed: 1.5,
        complexity: 1.0,
        effects: 1.0,
        samples: 8
      },
      kaleidoscope: {
        animationSpeed: 1.0,
        complexity: 1.2,
        effects: 1.5,
        samples: 12
      },
      blur: {
        animationSpeed: 1.0,
        complexity: 1.8,
        effects: 2.0,
        samples: 12
      },
      colorspace: {
        animationSpeed: 1.0,
        complexity: 1.1,
        effects: 1.3,
        samples: 8
      },
      glitch: {
        animationSpeed: 2.0,
        complexity: 1.4,
        effects: 1.8,
        samples: 10
      },
      default: {
        animationSpeed: 1.0,
        complexity: 1.0,
        effects: 1.0,
        samples: 8
      }
    };
    
    const shaderKey = shaderName.replace('fragment_', '');
    return settings[shaderKey] || settings.default;
  }
  
  // Apply settings to shader uniforms
  applyOptimalSettings(material, shaderName) {
    const settings = this.getOptimalShaderSettings(shaderName);
    const uniforms = material.uniforms;
    
    // Apply animation speed scaling
    if (uniforms.u_animationSpeed) {
      uniforms.u_animationSpeed.value *= settings.animationSpeed;
    }
    
    // Apply complexity scaling for blur
    if (shaderName === 'fragment_blur' && uniforms.u_blurIntensity) {
      uniforms.u_blurIntensity.value *= settings.complexity;
    }
    
    // Apply effects scaling for kaleidoscope
    if (shaderName === 'fragment_kaleidoscope') {
      if (uniforms.u_segments) {
        uniforms.u_segments.value = Math.max(3, uniforms.u_segments.value * settings.complexity);
      }
    }
    
    console.log(`⚙️ Applied ${this.qualityLevel} quality settings to ${shaderName}`);
    return settings;
  }
  
  // Generate performance report
  generatePerformanceReport() {
    return {
      deviceProfile: this.performanceProfile,
      currentQuality: this.qualityLevel,
      recommendedSettings: {
        targetFPS: this.targetFPS,
        quality: this.qualityLevel,
        reasons: this.getQualityReasons()
      },
      optimizations: this.getOptimizationSuggestions()
    };
  }
  
  getQualityReasons() {
    const reasons = [];
    const profile = this.performanceProfile;
    
    if (profile.isMobile) reasons.push('Mobile device detected');
    if (profile.memory < 4) reasons.push('Limited RAM (<4GB)');
    if (profile.cores < 4) reasons.push('Limited CPU cores');
    if (profile.maxTextureSize < 4096) reasons.push('Limited GPU texture support');
    
    return reasons.length ? reasons : ['High-end device capabilities'];
  }
  
  getOptimizationSuggestions() {
    const suggestions = [];
    
    if (this.qualityLevel === 'low') {
      suggestions.push('Consider reducing shader complexity');
      suggestions.push('Use simpler animation patterns');
      suggestions.push('Limit concurrent effects');
    } else if (this.qualityLevel === 'medium') {
      suggestions.push('Balance between quality and performance');
      suggestions.push('Monitor FPS during intensive scenes');
    } else {
      suggestions.push('Full quality mode - all features enabled');
      suggestions.push('Perfect for demonstrations and development');
    }
    
    return suggestions;
  }
}

// Usage example and integration helper
export function createAdaptiveSystem() {
  const qualityManager = new AdaptiveQualityManager();
  
  // Create UI for quality control
  const qualityDisplay = document.createElement('div');
  qualityDisplay.style.cssText = `
    position: fixed;
    bottom: 10px;
    left: 10px;
    background: rgba(0,0,0,0.8);
    color: white;
    padding: 10px;
    border-radius: 5px;
    font-family: monospace;
    font-size: 12px;
    z-index: 1000;
  `;
  
  function updateQualityDisplay() {
    const profile = qualityManager.performanceProfile;
    qualityDisplay.innerHTML = `
      <strong>🔧 Adaptive Quality System</strong><br>
      📱 Device: ${profile.isMobile ? 'Mobile' : 'Desktop'}<br>
      🎛️ Quality: <span style="color: ${
        qualityManager.qualityLevel === 'high' ? '#4CAF50' : 
        qualityManager.qualityLevel === 'medium' ? '#FF9800' : '#F44336'
      }">${qualityManager.qualityLevel.toUpperCase()}</span><br>
      🔢 Cores: ${profile.cores} | 💾 RAM: ${profile.memory}GB<br>
      🎯 Target: ${qualityManager.targetFPS} FPS
    `;
  }
  
  updateQualityDisplay();
  document.body.appendChild(qualityDisplay);
  
  // Update display when quality changes
  qualityManager.onQualityChange = (newQuality, fps) => {
    updateQualityDisplay();
    console.log(`🔄 Quality auto-adjusted to ${newQuality} (${fps.toFixed(1)} FPS)`);
  };
  
  return {
    manager: qualityManager,
    display: qualityDisplay,
    remove: () => document.body.removeChild(qualityDisplay)
  };
} 