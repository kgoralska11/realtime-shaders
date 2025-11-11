import GUI from 'three/examples/jsm/libs/lil-gui.module.min.js';

class ShaderBenchmark {
  constructor() {
    this.metrics = {
      fps: [],
      frameTime: [],
      shaderSwitchTime: [],
      memoryUsage: []
    };
    
    this.isRecording = false;
    this.startTime = 0;
    this.frameCount = 0;
    this.lastFrameTime = performance.now();
  }

  startBenchmark() {
    this.isRecording = true;
    this.startTime = performance.now();
    this.frameCount = 0;
    this.metrics.fps = [];
    this.metrics.frameTime = [];
  }

  stopBenchmark() {
    this.isRecording = false;
    const duration = (performance.now() - this.startTime) / 1000;
    const avgFPS = this.frameCount / duration;
    
    return this.getResults();
  }

  recordFrame() {
    if (!this.isRecording) return;
    
    const now = performance.now();
    const frameTime = now - this.lastFrameTime;
    const fps = 1000 / frameTime;
    
    this.metrics.fps.push(fps);
    this.metrics.frameTime.push(frameTime);
    this.frameCount++;
    this.lastFrameTime = now;
  }

  measureMemoryUsage() {
    if ('memory' in performance) {
      const memory = performance.memory;
      const usage = {
        used: memory.usedJSHeapSize / (1024 * 1024), // MB
        total: memory.totalJSHeapSize / (1024 * 1024), // MB
        limit: memory.jsHeapSizeLimit / (1024 * 1024) // MB
      };
      
      this.metrics.memoryUsage.push({
        timestamp: Date.now(),
        ...usage
      });
      
      return usage;
    }
    return null;
  }

  getResults() {
    const fps = this.metrics.fps;
    const frameTime = this.metrics.frameTime;
    
    // Handle case when no data was collected
    if (fps.length === 0 || frameTime.length === 0) {
      return {
        fps: { avg: 0, min: 0, max: 0, std: 0 },
        frameTime: { avg: 0, min: 0, max: 0 },
        shaderSwitches: this.metrics.shaderSwitchTime,
        memoryUsage: this.metrics.memoryUsage,
        error: 'No data collected during test'
      };
    }
    
    return {
      fps: {
        avg: fps.reduce((a, b) => a + b, 0) / fps.length,
        min: Math.min(...fps),
        max: Math.max(...fps),
        std: this.calculateStandardDeviation(fps)
      },
      frameTime: {
        avg: frameTime.reduce((a, b) => a + b, 0) / frameTime.length,
        min: Math.min(...frameTime),
        max: Math.max(...frameTime)
      },
      shaderSwitches: this.metrics.shaderSwitchTime,
      memoryUsage: this.metrics.memoryUsage
    };
  }

  calculateStandardDeviation(values) {
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const squaredDiffs = values.map(value => Math.pow(value - avg, 2));
    const avgSquaredDiff = squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
    return Math.sqrt(avgSquaredDiff);
  }

  exportAdvancedResults() {
    const results = this.getResults();
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10);
    const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, '-');
    const fileName = `REAL_Export_Advanced_Report_${dateStr}_${timeStr}.json`;
    
    const reportData = {
      timestamp: now.toISOString(),
      dataValidity: 'REAL_TIME_ADVANCED_BENCHMARK_DATA',
      ...results,
      note: 'Advanced benchmark data with statistical analysis - REAL DATA'
    };
    
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
    
    return results;
  }
}

export function createSimpleGUI(material, shaderPaths, loadShader, currentShaderRef, cubeControls, camera, cube) {
  
  const gui = new GUI();
  gui.title('Realtime Shaders');
  
  // Initialize advanced benchmark system
  const advancedBenchmark = new ShaderBenchmark();
  
  // Benchmark system with enhanced capabilities
  const benchmarkData = {
    fps: 0,
    frameTime: 0,
    avgFps: 0,
    minFps: 999,
    maxFps: 0,
    frameCount: 0,
    startTime: performance.now(),
    shaderSwitchTime: 0,
    currentShader: currentShaderRef.value,
    shaderBenchmarks: {},
    memoryUsage: { used: 0, total: 0, limit: 0 }
  };
  
  // Initialize shader benchmarks
  Object.keys(shaderPaths).forEach(shaderName => {
    benchmarkData.shaderBenchmarks[shaderName] = {
      avgFps: 0,
      minFps: 999,
      maxFps: 0,
      frameCount: 0,
      totalTime: 0
    };
  });
  
  // Performance/Benchmark folder
  const benchmarkFolder = gui.addFolder('📊 Performance Benchmark');
  benchmarkFolder.open();
  
  // Real-time metrics
  const benchmarkControls = {
    currentFPS: benchmarkFolder.add(benchmarkData, 'fps').name('🔥 Current FPS').disable(),
    frameTime: benchmarkFolder.add(benchmarkData, 'frameTime').name('⏱️ Frame Time (ms)').disable(),
    avgFPS: benchmarkFolder.add(benchmarkData, 'avgFps').name('📈 Average FPS').disable(),
    minFPS: benchmarkFolder.add(benchmarkData, 'minFps').name('⬇️ Min FPS').disable(),
    maxFPS: benchmarkFolder.add(benchmarkData, 'maxFps').name('⬆️ Max FPS').disable(),
    
    resetBenchmark: benchmarkFolder.add({
      reset: () => {
        benchmarkData.frameCount = 0;
        benchmarkData.startTime = performance.now();
        benchmarkData.minFps = 999;
        benchmarkData.maxFps = 0;
        benchmarkData.avgFps = 0;
        
        // Reset shader-specific benchmarks
        Object.keys(benchmarkData.shaderBenchmarks).forEach(shaderName => {
          const shader = benchmarkData.shaderBenchmarks[shaderName];
          shader.frameCount = 0;
          shader.totalTime = 0;
          shader.minFps = 999;
          shader.maxFps = 0;
          shader.avgFps = 0;
        });
      }
    }, 'reset').name('🔄 Reset Benchmark'),
    
    exportBenchmark: benchmarkFolder.add({
      export: () => {
        const report = {
          timestamp: new Date().toISOString(),
          dataValidity: 'REAL_TIME_PERFORMANCE_DATA',
          testDuration: (performance.now() - benchmarkData.startTime) / 1000,
          globalStats: {
            avgFps: benchmarkData.avgFps,
            minFps: benchmarkData.minFps,
            maxFps: benchmarkData.maxFps,
            totalFrames: benchmarkData.frameCount,
            dataType: 'REAL_PERFORMANCE_DATA'
          },
          shaderPerformance: benchmarkData.shaderBenchmarks,
          memoryUsage: benchmarkData.memoryUsage,
          note: 'All benchmark data collected from real-time application usage - NO DEMO DATA',
          realDataConfirmation: true
        };
        
        // Format date and time for filename
        const now = new Date();
        const dateStr = now.toISOString().slice(0, 10); // YYYY-MM-DD
        const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, '-'); // HH-MM-SS
        const fileName = `REAL_Export_Basic_Report_${dateStr}_${timeStr}.json`;
        
        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.click();
        URL.revokeObjectURL(url);
      }
    }, 'export').name('💾 Export Basic Report'),
    
    exportAdvanced: benchmarkFolder.add({
      export: () => {
        // Export advanced benchmark with statistical analysis
        return advancedBenchmark.exportAdvancedResults();
      }
    }, 'export').name('📊 Export Advanced Report'),
    
    startAdvancedTest: benchmarkFolder.add({
      test: () => {
        console.log('🧪 Starting 5-second advanced test...');
        
        // Clear previous data and start fresh
        advancedBenchmark.metrics.fps = [];
        advancedBenchmark.metrics.frameTime = [];
        advancedBenchmark.startBenchmark();
        
        // Mark that advanced test is running
        window.advancedTestRunning = true;
        
        // Test current shader for 5 seconds
        setTimeout(() => {
          window.advancedTestRunning = false;
          const results = advancedBenchmark.stopBenchmark();
          
          console.log('📊 Advanced test completed for:', benchmarkData.currentShader);
          
          if (results.error) {
            console.error('❌ Advanced test failed:', results.error);
            alert(`❌ Advanced Test Failed!\n\n${results.error}\n\nTry again - the test should collect data while app is running.`);
            return;
          }
          
          console.log('📈 Results:', {
            avgFPS: results.fps.avg.toFixed(1),
            minFPS: results.fps.min.toFixed(1),
            maxFPS: results.fps.max.toFixed(1),
            stdDeviation: results.fps.std.toFixed(2),
            frameCount: advancedBenchmark.frameCount,
            avgFrameTime: results.frameTime.avg.toFixed(2) + 'ms',
            memorySnapshots: results.memoryUsage.length
          });
          
          // Show results in alert for user feedback
          alert(`🧪 Advanced Test Results (5s):\n\nShader: ${benchmarkData.currentShader}\n\n📊 Performance:\nAvg FPS: ${results.fps.avg.toFixed(1)}\nMin FPS: ${results.fps.min.toFixed(1)}\nMax FPS: ${results.fps.max.toFixed(1)}\nStd Deviation: ${results.fps.std.toFixed(2)}\n\n⏱️ Timing:\nFrames Analyzed: ${advancedBenchmark.frameCount}\nAvg Frame Time: ${results.frameTime.avg.toFixed(2)}ms\n\n💾 Memory Snapshots: ${results.memoryUsage.length}`);
          
        }, 5000);
      }
    }, 'test').name('🧪 5s Advanced Test'),
    
    testAllShaders: benchmarkFolder.add({
      testAll: async () => {
        console.log('🚀 Starting comprehensive test of all shaders...');
        const currentShader = currentShaderRef.value;
        
        try {
          await benchmarkAllShaders(shaderPaths, loadShader, material, 3000);
          
          // Restore original shader
          const fragmentShader = await loadShader(shaderPaths[currentShader]);
          material.fragmentShader = fragmentShader;
          material.needsUpdate = true;
          currentShaderRef.value = currentShader;
          
        } catch (error) {
          console.error('❌ Auto-benchmark failed:', error);
        }
      }
    }, 'testAll').name('🎯 Test All Shaders')
  };
  
  // Add shader performance comparison
  const shaderComparisonFolder = benchmarkFolder.addFolder('⚔️ Shader Comparison');
  const shaderPerformanceControls = {};
  
  Object.keys(shaderPaths).forEach(shaderName => {
    const displayName = shaderName.replace('fragment_', '').toUpperCase();
    shaderPerformanceControls[shaderName] = shaderComparisonFolder
      .add({ value: 0 }, 'value')
      .name(`${displayName} FPS`)
      .disable();
  });

  // Shader selection
  const shaderControl = gui.add(currentShaderRef, 'value', Object.keys(shaderPaths))
    .name('🎨 Shader')
    .onChange(async (shaderName) => {
      const switchStartTime = performance.now();
      
      try {
        const fragmentShader = await loadShader(shaderPaths[shaderName]);
        material.fragmentShader = fragmentShader;
        material.needsUpdate = true;
        
        // Set shader-specific brightness values
        if (shaderName === 'fragment_gradient') {
          material.uniforms.u_brightness.value = 0.0;
        } else if (shaderName === 'fragment_colorspace') {
          material.uniforms.u_brightness.value = 1.0;
        } else if (shaderName === 'fragment_bw') {
          material.uniforms.u_brightness.value = 0.0;
        } else if (shaderName === 'fragment_noise') {
          material.uniforms.u_brightness.value = 0.0;
        } else if (shaderName === 'fragment_glitch') {
          material.uniforms.u_brightness.value = 0.0;
        }
        
        // Update benchmark tracking
        benchmarkData.currentShader = shaderName;
        benchmarkData.shaderSwitchTime = performance.now() - switchStartTime;
        
        // Reset current shader metrics when switching
        const currentShaderBench = benchmarkData.shaderBenchmarks[shaderName];
        currentShaderBench.frameCount = 0;
        currentShaderBench.totalTime = performance.now();
        
        // Update controls visibility
        updateControlsVisibility(shaderName);
        
        // Update GUI displays after changing values
        Object.values(controls).forEach(group => {
          Object.values(group).forEach(control => {
            if (control.updateDisplay) control.updateDisplay();
          });
        });
        
      } catch (error) {
        console.error('❌ Shader switch failed:', error);
      }
    });

  // Cube controls folder
  const cubeFolder = gui.addFolder('🎲 Cube Controls');
  cubeFolder.open();
  
  // Add cube controls
  cubeFolder.add(cubeControls, 'autoRotate').name('🔄 Auto Rotate');
  cubeFolder.add(cubeControls, 'rotationSpeed', 0.1, 5, 0.1).name('⚡ Rotation Speed');
  cubeFolder.add(cubeControls, 'resetRotation').name('🔄 Reset Rotation');
  
  // Add info about mouse controls
  cubeFolder.add({ info: 'Drag with mouse to rotate manually' }, 'info').disable();

  // Camera controls folder
  const cameraFolder = gui.addFolder('📷 Camera Controls');
  cameraFolder.open();
  
  // Add camera controls
  cameraFolder.add({ resetCamera: () => {
    camera.position.set(0, 0, 5);
  }}, 'resetCamera').name('🔄 Reset Camera');

  cameraFolder.add({ resetAll: () => {
    camera.position.set(0, 0, 5);
    cube.rotation.set(0, 0, 0);
  }}, 'resetAll').name('🔄 Reset All');
  
  // Add info about camera controls
  cameraFolder.add({ zoomInfo: 'Mouse wheel: Zoom in/out' }, 'zoomInfo').disable();
  cameraFolder.add({ panInfo: 'Right click + drag: Pan camera' }, 'panInfo').disable();

  // Create all possible controls upfront, but keep them hidden
  const controlsFolder = gui.addFolder('⚙️ Shader Controls');
  controlsFolder.open();
  
  // Create all controls for all shaders
  const controls = {};
  
  controls.gradient = {
    preset: controlsFolder.add({
      preset: 'Custom'
    }, 'preset', ['Custom', '🌅 Sunset Glow', '🌊 Ocean Waves', '🌲 Forest Mist', '🔥 Fire Burst', '⚡ Neon City']).name('🎯 Quick Presets').onChange((presetName) => {
      applyGradientPreset(presetName, material.uniforms);
    }),
    
    colorSpeed: controlsFolder.add(material.uniforms.u_colorSpeed, 'value', 0, 5, 0.1).name('🚀 Color Speed'),
    brightness: controlsFolder.add(material.uniforms.u_brightness, 'value', -0.5, 0.5, 0.05).name('💡 Brightness'),
    contrast: controlsFolder.add(material.uniforms.u_contrast, 'value', 0.1, 3, 0.1).name('⚡ Contrast'),
    hueShift: controlsFolder.add(material.uniforms.u_hueShift, 'value', 0, 6.28, 0.2).name('🌈 Hue Shift'),
    colorPalette: controlsFolder.add(material.uniforms.u_colorPalette, 'value', 0, 5, 1).name('🎨 Color Palette')
  };
  
  controls.wave = {
    preset: controlsFolder.add({
      preset: 'Custom'
    }, 'preset', ['Custom', '🌊 Ocean Waves', '🏄 Surf Rider', '💧 Water Drop', '⚡ Electric Storm', '🎵 Sound Waves']).name('🎯 Quick Presets').onChange((presetName) => {
      applyWavePreset(presetName, material.uniforms);
    }),
    
    waveFrequency: controlsFolder.add(material.uniforms.u_waveFrequency, 'value', 1, 50, 1).name('🌊 Wave Frequency'),
    waveAmplitude: controlsFolder.add(material.uniforms.u_waveAmplitude, 'value', 0, 1, 0.05).name('📈 Wave Amplitude'),
    waveSpeed: controlsFolder.add(material.uniforms.u_waveSpeed, 'value', 0.1, 5, 0.1).name('⚡ Wave Speed'),
    waveDirection: controlsFolder.add(material.uniforms.u_waveDirection, 'value', 0, 1, 0.1).name('🧭 Wave Direction'),
    colorIntensity: controlsFolder.add(material.uniforms.u_colorIntensity, 'value', 0, 2, 0.1).name('🎨 Color Intensity'),
    colorPalette: controlsFolder.add(material.uniforms.u_colorPalette, 'value', 0, 4, 1).name('🎨 Color Palette')
  };
  
  controls.noise = {
    preset: controlsFolder.add({
      preset: 'Custom'
    }, 'preset', ['Custom', '☁️ Cloud Drift', '🌫️ Mist Effect', '🗿 Stone Texture', '⚡ Lightning', '🌀 Plasma Storm']).name('🎯 Quick Presets').onChange((presetName) => {
      applyNoisePreset(presetName, material.uniforms);
    }),
    
    noiseIntensity: controlsFolder.add(material.uniforms.u_noiseIntensity, 'value', 0.1, 5, 0.1).name('🔊 Noise Intensity'),
    noiseScale: controlsFolder.add(material.uniforms.u_noiseScale, 'value', 0.5, 20, 0.5).name('📐 Noise Scale'),
    animationSpeed: controlsFolder.add(material.uniforms.u_animationSpeed, 'value', 0, 5, 0.1).name('⚡ Animation Speed'),
    colorMix: controlsFolder.add(material.uniforms.u_colorMix, 'value', 0, 2, 0.05).name('🎨 Color Mix'),
    hueShift: controlsFolder.add(material.uniforms.u_hueShift, 'value', 0, 6.28, 0.2).name('🌈 Hue Shift')
  };
  
  controls.glitch = {
    preset: controlsFolder.add({
      preset: 'Custom'
    }, 'preset', ['Custom', '📺 TV Static', '🤖 Digital Decay', '⚡ Data Corruption', '🎮 Game Glitch', '🌈 RGB Split']).name('🎯 Quick Presets').onChange((presetName) => {
      applyGlitchPreset(presetName, material.uniforms);
    }),
    
    glitchIntensity: controlsFolder.add(material.uniforms.u_glitchIntensity, 'value', 0, 1, 0.05).name('⚡ Glitch Intensity'),
    glitchFrequency: controlsFolder.add(material.uniforms.u_glitchFrequency, 'value', 0.5, 15, 0.5).name('🔄 Glitch Frequency'),
    colorSeparation: controlsFolder.add(material.uniforms.u_colorSeparation, 'value', 0, 0.1, 0.005).name('🌈 Color Separation'),
    blockSize: controlsFolder.add(material.uniforms.u_blockSize, 'value', 5, 100, 5).name('🧱 Block Size'),
    scanlineIntensity: controlsFolder.add(material.uniforms.u_scanlineIntensity, 'value', 0, 2, 0.1).name('📺 Scanlines'),
    noiseAmount: controlsFolder.add(material.uniforms.u_noiseAmount, 'value', 0, 3, 0.1).name('🔊 Noise Amount'),
    hueShift: controlsFolder.add(material.uniforms.u_hueShift, 'value', 0, 6.28, 0.2).name('🌈 Psychedelic Hue')
  };
  
  controls.bw = {
    preset: controlsFolder.add({
      preset: 'Custom'
    }, 'preset', ['Custom', '📸 Classic Film', '🌀 Hypnotic Spiral', '💍 Ring Pattern', '⚡ Electric Pulse', '🎭 Drama Effect']).name('🎯 Quick Presets').onChange((presetName) => {
      applyBWPreset(presetName, material.uniforms);
    }),
    
    waveSpeed: controlsFolder.add(material.uniforms.u_waveSpeed, 'value', 0.1, 10, 0.1).name('⚡ Wave Speed'),
    waveFrequency: controlsFolder.add(material.uniforms.u_waveFrequency, 'value', 1, 50, 1).name('🌊 Wave Frequency'),
    contrast: controlsFolder.add(material.uniforms.u_contrast, 'value', 0.1, 2, 0.1).name('⚡ Contrast')
  };
  
  controls.kaleidoscope = {
    preset: controlsFolder.add({
      preset: 'Custom'
    }, 'preset', ['Custom', '🌸 Classic 6-fold', '❄️ Snowflake 8-fold', '🌟 Star 12-fold', '🌀 Spinning Vortex', '🎯 Focused Center']).name('🎯 Quick Presets').onChange((presetName) => {
      applyKaleidoscopePreset(presetName, material.uniforms);
    }),
    
    segments: controlsFolder.add(material.uniforms.u_segments, 'value', 3, 12, 1).name('🔷 Segments'),
    rotationSpeed: controlsFolder.add(material.uniforms.u_rotationSpeed, 'value', 0, 5, 0.1).name('🌀 Rotation Speed'),
    mirrorIntensity: controlsFolder.add(material.uniforms.u_mirrorIntensity, 'value', 0, 1, 0.05).name('🪞 Mirror Intensity'),
    centerOffsetX: controlsFolder.add(material.uniforms.u_centerOffsetX, 'value', -1, 1, 0.05).name('↔️ Center X'),
    centerOffsetY: controlsFolder.add(material.uniforms.u_centerOffsetY, 'value', -1, 1, 0.05).name('↕️ Center Y'),
    zoom: controlsFolder.add(material.uniforms.u_zoom, 'value', 0.1, 3, 0.1).name('🔍 Zoom')
  };
  
  controls.colorspace = {
    preset: controlsFolder.add({ 
      preset: 'Custom',
      presets: {
        'Custom': 'custom',
        '🌈 Standard HSV': 'standard',
        '🎮 RGB Separation': 'rgb',
        '🔄 Complementary': 'complementary', 
        '🎪 Posterize': 'posterize',
        '🔍 Color Inversion': 'inversion',
        '🌀 Psychedelic': 'psychedelic'
      }
    }, 'preset', ['Custom', '🌈 Standard HSV', '🎮 RGB Separation', '🔄 Complementary', '🎪 Posterize', '🔍 Color Inversion', '🌀 Psychedelic']).name('🎯 Quick Presets').onChange((presetName) => {
      console.log(`🎯 Color Space preset selected: ${presetName}`);
      applyColorSpacePreset(presetName, material.uniforms);
    }),
    
    // Manual controls
    hueShift: controlsFolder.add(material.uniforms.u_hueShift, 'value', -180, 180, 5).name('🌈 Hue Shift'),
    saturation: controlsFolder.add(material.uniforms.u_saturation, 'value', 0, 2, 0.05).name('🎨 Saturation'),
    brightness: controlsFolder.add(material.uniforms.u_brightness, 'value', 0, 2, 0.05).name('💡 Brightness'),
    contrast: controlsFolder.add(material.uniforms.u_contrast, 'value', 0, 2, 0.05).name('⚡ Contrast'),
    colorMode: controlsFolder.add(material.uniforms.u_colorMode, 'value', 0, 5, 1).name('🎭 Color Mode'),
    animationSpeed: controlsFolder.add(material.uniforms.u_animationSpeed, 'value', 0, 3, 0.1).name('⚡ Animation Speed')
  };
  
  controls.blur = {
    preset: controlsFolder.add({
      preset: 'Custom'
    }, 'preset', ['Custom', '📷 Portrait Mode', '🏃 Motion Blur', '🌊 Depth of Field', '🌀 Radial Blur', '🎨 Artistic Blur']).name('🎯 Quick Presets').onChange((presetName) => {
      applyBlurPreset(presetName, material.uniforms);
    }),
    
    blurIntensity: controlsFolder.add(material.uniforms.u_blurIntensity, 'value', 0, 10, 0.1).name('🌫️ Blur Intensity'),
    blurDirection: controlsFolder.add(material.uniforms.u_blurDirection, 'value', 0, 360, 5).name('🧭 Blur Direction'),
    focusPoint: controlsFolder.add(material.uniforms.u_focusPoint, 'value', 0, 1, 0.05).name('🎯 Focus Point'),
    falloffRange: controlsFolder.add(material.uniforms.u_falloffRange, 'value', 0.1, 1, 0.05).name('📏 Falloff Range'),
    animationSpeed: controlsFolder.add(material.uniforms.u_animationSpeed, 'value', 0, 3, 0.1).name('⚡ Animation Speed'),
    colorShift: controlsFolder.add(material.uniforms.u_colorShift, 'value', 0, 1, 0.05).name('🌈 Color Shift')
  };
  
  controls.info = {
    test: controlsFolder.add({ info: 'Test shader - animated red channel' }, 'info').disable(),
    unknown: controlsFolder.add({ error: 'Unknown shader' }, 'error').disable()
  };
  
  function hideAllControls() {
    Object.values(controls).forEach(group => {
      Object.values(group).forEach(control => {
        control.domElement.style.display = 'none';
      });
    });
  }
  
  function showControls(groupName) {
    if (controls[groupName]) {
      Object.values(controls[groupName]).forEach(control => {
        control.domElement.style.display = '';
      });
    }
  }
  
  function applyColorSpacePreset(presetName, uniforms) {
    
    switch(presetName) {
      case '🌈 Standard HSV':
        uniforms.u_colorMode.value = 0;
        uniforms.u_hueShift.value = 45;
        uniforms.u_saturation.value = 1.5;
        uniforms.u_brightness.value = 0.8;
        uniforms.u_contrast.value = 1.3;
        uniforms.u_animationSpeed.value = 1.0;
        break;
        
      case '🎮 RGB Separation':
        uniforms.u_colorMode.value = 1;
        uniforms.u_hueShift.value = 60;
        uniforms.u_saturation.value = 1.8;
        uniforms.u_brightness.value = 0.7;
        uniforms.u_contrast.value = 1.0;
        uniforms.u_animationSpeed.value = 2.5;
        break;
        
      case '🔄 Complementary':
        uniforms.u_colorMode.value = 2;
        uniforms.u_hueShift.value = 90;
        uniforms.u_saturation.value = 1.4;
        uniforms.u_brightness.value = 0.6;
        uniforms.u_contrast.value = 1.2;
        uniforms.u_animationSpeed.value = 1.2;
        break;
        
      case '🎪 Posterize':
        uniforms.u_colorMode.value = 3;
        uniforms.u_hueShift.value = 30;
        uniforms.u_saturation.value = 2.0;
        uniforms.u_brightness.value = 0.9;
        uniforms.u_contrast.value = 1.1;
        uniforms.u_animationSpeed.value = 0.8;
        break;
        
      case '🔍 Color Inversion':
        uniforms.u_colorMode.value = 4;
        uniforms.u_hueShift.value = 120;
        uniforms.u_saturation.value = 1.6;
        uniforms.u_brightness.value = 0.5;
        uniforms.u_contrast.value = 1.4;
        uniforms.u_animationSpeed.value = 1.5;
        break;
        
      case '🌀 Psychedelic':
        uniforms.u_colorMode.value = 5;
        uniforms.u_hueShift.value = 180;
        uniforms.u_saturation.value = 2.0;
        uniforms.u_brightness.value = 0.7;
        uniforms.u_contrast.value = 1.2;
        uniforms.u_animationSpeed.value = 3.0;
        break;
    }
    
    Object.values(controls.colorspace).forEach(control => {
      if (control.updateDisplay) control.updateDisplay();
    });
  }
  
  function applyKaleidoscopePreset(presetName, uniforms) {
    
    switch(presetName) {
      case '🌸 Classic 6-fold':
        uniforms.u_segments.value = 6;
        uniforms.u_rotationSpeed.value = 1.0;
        uniforms.u_mirrorIntensity.value = 0.8;
        uniforms.u_centerOffsetX.value = 0.0;
        uniforms.u_centerOffsetY.value = 0.0;
        uniforms.u_zoom.value = 1.0;
        break;
        
      case '❄️ Snowflake 8-fold':
        uniforms.u_segments.value = 8;
        uniforms.u_rotationSpeed.value = 0.5;
        uniforms.u_mirrorIntensity.value = 1.0;
        uniforms.u_centerOffsetX.value = 0.0;
        uniforms.u_centerOffsetY.value = 0.0;
        uniforms.u_zoom.value = 1.2;
        break;
        
      case '🌟 Star 12-fold':
        uniforms.u_segments.value = 12;
        uniforms.u_rotationSpeed.value = 2.0;
        uniforms.u_mirrorIntensity.value = 0.6;
        uniforms.u_centerOffsetX.value = 0.0;
        uniforms.u_centerOffsetY.value = 0.0;
        uniforms.u_zoom.value = 0.8;
        break;
        
      case '🌀 Spinning Vortex':
        uniforms.u_segments.value = 6;
        uniforms.u_rotationSpeed.value = 4.0;
        uniforms.u_mirrorIntensity.value = 0.4;
        uniforms.u_centerOffsetX.value = 0.0;
        uniforms.u_centerOffsetY.value = 0.0;
        uniforms.u_zoom.value = 1.5;
        break;
        
      case '🎯 Focused Center':
        uniforms.u_segments.value = 8;
        uniforms.u_rotationSpeed.value = 1.5;
        uniforms.u_mirrorIntensity.value = 0.9;
        uniforms.u_centerOffsetX.value = 0.2;
        uniforms.u_centerOffsetY.value = 0.1;
        uniforms.u_zoom.value = 2.0;
        break;
    }
    
    Object.values(controls.kaleidoscope).forEach(control => {
      if (control.updateDisplay) control.updateDisplay();
    });
  }
  
  function applyGradientPreset(presetName, uniforms) {
    
    switch(presetName) {
      case '🌅 Sunset Glow':
        uniforms.u_colorSpeed.value = 1.2;
        uniforms.u_brightness.value = 0.1;
        uniforms.u_contrast.value = 1.4;
        uniforms.u_colorPalette.value = 0.0; // Sunset palette
        break;
        
      case '🌊 Ocean Waves':
        uniforms.u_colorSpeed.value = 0.8;
        uniforms.u_brightness.value = -0.05;
        uniforms.u_contrast.value = 1.2;
        uniforms.u_colorPalette.value = 1.0; // Ocean palette
        break;
        
      case '🌲 Forest Mist':
        uniforms.u_colorSpeed.value = 0.6;
        uniforms.u_brightness.value = -0.1;
        uniforms.u_contrast.value = 1.1;
        uniforms.u_colorPalette.value = 2.0; // Forest palette
        break;
        
      case '🔥 Fire Burst':
        uniforms.u_colorSpeed.value = 2.8;
        uniforms.u_brightness.value = 0.15;
        uniforms.u_contrast.value = 1.8;
        uniforms.u_colorPalette.value = 3.0; // Fire palette
        break;
        
      case '⚡ Neon City':
        uniforms.u_colorSpeed.value = 2.2;
        uniforms.u_brightness.value = 0.05;
        uniforms.u_contrast.value = 1.6;
        uniforms.u_colorPalette.value = 4.0; // Neon palette
        break;
    }
    
    Object.values(controls.gradient).forEach(control => {
      if (control.updateDisplay) control.updateDisplay();
    });
  }

  function applyWavePreset(presetName, uniforms) {
    
    switch(presetName) {
      case '🌊 Ocean Waves':
        uniforms.u_waveFrequency.value = 12.0;
        uniforms.u_waveAmplitude.value = 0.4;
        uniforms.u_waveSpeed.value = 1.2;
        uniforms.u_waveDirection.value = 0.3;
        uniforms.u_colorIntensity.value = 1.0;
        uniforms.u_colorPalette.value = 0.0; // Ocean palette
        break;
        
      case '🏄 Surf Rider':
        uniforms.u_waveFrequency.value = 8.0;
        uniforms.u_waveAmplitude.value = 0.8;
        uniforms.u_waveSpeed.value = 2.5;
        uniforms.u_waveDirection.value = 0.7;
        uniforms.u_colorIntensity.value = 1.5;
        uniforms.u_colorPalette.value = 1.0; // Surf palette
        break;
        
      case '💧 Water Drop':
        uniforms.u_waveFrequency.value = 25.0;
        uniforms.u_waveAmplitude.value = 0.4;  // Increased from 0.2 to 0.4
        uniforms.u_waveSpeed.value = 0.8;
        uniforms.u_waveDirection.value = 0.0;
        uniforms.u_colorIntensity.value = 1.2; // Increased from 0.8 to 1.2
        uniforms.u_colorPalette.value = 2.0; // Water Drop palette
        break;
        
      case '⚡ Electric Storm':
        uniforms.u_waveFrequency.value = 35.0;
        uniforms.u_waveAmplitude.value = 0.9;
        uniforms.u_waveSpeed.value = 4.0;
        uniforms.u_waveDirection.value = 0.5;
        uniforms.u_colorIntensity.value = 2.0;
        uniforms.u_colorPalette.value = 3.0; // Electric palette
        break;
        
      case '🎵 Sound Waves':
        uniforms.u_waveFrequency.value = 18.0;
        uniforms.u_waveAmplitude.value = 0.6;
        uniforms.u_waveSpeed.value = 1.8;
        uniforms.u_waveDirection.value = 0.1;
        uniforms.u_colorIntensity.value = 1.3;
        uniforms.u_colorPalette.value = 4.0; // Sound palette
        break;
    }
    
    Object.values(controls.wave).forEach(control => {
      if (control.updateDisplay) control.updateDisplay();
    });
  }

  function applyNoisePreset(presetName, uniforms) {
    
    switch(presetName) {
      case '☁️ Cloud Drift':
        uniforms.u_noiseIntensity.value = 1.2;
        uniforms.u_noiseScale.value = 2.5;
        uniforms.u_animationSpeed.value = 0.3;
        uniforms.u_colorMix.value = 0.6;
        uniforms.u_hueShift.value = 4.0;
        break;
        
      case '🌫️ Mist Effect':
        uniforms.u_noiseIntensity.value = 0.8;
        uniforms.u_noiseScale.value = 5.0;
        uniforms.u_animationSpeed.value = 0.5;
        uniforms.u_colorMix.value = 0.3;
        uniforms.u_hueShift.value = 3.5;
        break;
        
      case '🗿 Stone Texture':
        uniforms.u_noiseIntensity.value = 2.5;
        uniforms.u_noiseScale.value = 8.0;
        uniforms.u_animationSpeed.value = 0.1;
        uniforms.u_colorMix.value = 0.2;
        uniforms.u_hueShift.value = 1.5;
        break;
        
      case '⚡ Lightning':
        uniforms.u_noiseIntensity.value = 3.5;
        uniforms.u_noiseScale.value = 15.0;
        uniforms.u_animationSpeed.value = 2.5;
        uniforms.u_colorMix.value = 1.8;
        uniforms.u_hueShift.value = 5.8;
        break;
        
      case '🌀 Plasma Storm':
        uniforms.u_noiseIntensity.value = 4.0;
        uniforms.u_noiseScale.value = 6.0;
        uniforms.u_animationSpeed.value = 3.0;
        uniforms.u_colorMix.value = 1.5;
        uniforms.u_hueShift.value = 2.0;
        break;
    }
    
    Object.values(controls.noise).forEach(control => {
      if (control.updateDisplay) control.updateDisplay();
    });
  }

  function applyGlitchPreset(presetName, uniforms) {
    
    switch(presetName) {
      case '📺 TV Static':
        uniforms.u_glitchIntensity.value = 0.3;
        uniforms.u_glitchFrequency.value = 8.0;
        uniforms.u_colorSeparation.value = 0.01;
        uniforms.u_blockSize.value = 40.0;
        uniforms.u_scanlineIntensity.value = 1.5;
        uniforms.u_noiseAmount.value = 2.0;
        uniforms.u_hueShift.value = 0.5;
        break;
        
      case '🤖 Digital Decay':
        uniforms.u_glitchIntensity.value = 0.7;
        uniforms.u_glitchFrequency.value = 4.0;
        uniforms.u_colorSeparation.value = 0.05;
        uniforms.u_blockSize.value = 15.0;
        uniforms.u_scanlineIntensity.value = 0.8;
        uniforms.u_noiseAmount.value = 1.5;
        uniforms.u_hueShift.value = 2.5;
        break;
        
      case '⚡ Data Corruption':
        uniforms.u_glitchIntensity.value = 0.9;
        uniforms.u_glitchFrequency.value = 12.0;
        uniforms.u_colorSeparation.value = 0.08;
        uniforms.u_blockSize.value = 8.0;
        uniforms.u_scanlineIntensity.value = 0.5;
        uniforms.u_noiseAmount.value = 2.8;
        uniforms.u_hueShift.value = 4.0;
        break;
        
      case '🎮 Game Glitch':
        uniforms.u_glitchIntensity.value = 0.5;
        uniforms.u_glitchFrequency.value = 6.0;
        uniforms.u_colorSeparation.value = 0.03;
        uniforms.u_blockSize.value = 25.0;
        uniforms.u_scanlineIntensity.value = 1.2;
        uniforms.u_noiseAmount.value = 1.0;
        uniforms.u_hueShift.value = 1.8;
        break;
        
      case '🌈 RGB Split':
        uniforms.u_glitchIntensity.value = 0.4;
        uniforms.u_glitchFrequency.value = 2.0;
        uniforms.u_colorSeparation.value = 0.1;
        uniforms.u_blockSize.value = 50.0;
        uniforms.u_scanlineIntensity.value = 0.3;
        uniforms.u_noiseAmount.value = 0.5;
        uniforms.u_hueShift.value = 6.0;
        break;
    }
    
    Object.values(controls.glitch).forEach(control => {
      if (control.updateDisplay) control.updateDisplay();
    });
  }

  function applyBWPreset(presetName, uniforms) {
    
    switch(presetName) {
      case '📸 Classic Film':
        uniforms.u_waveSpeed.value = 0.5;   // Very slow, cinematic
        uniforms.u_waveFrequency.value = 3.0; // Large, soft patterns
        uniforms.u_contrast.value = 0.8;    // Soft contrast like old film
        break;
        
      case '🌀 Hypnotic Spiral':
        uniforms.u_waveSpeed.value = 3.0;   // Fast hypnotic motion
        uniforms.u_waveFrequency.value = 40.0; // Very tight spiral
        uniforms.u_contrast.value = 2.0;    // High contrast for hypnotic effect
        break;
        
      case '💍 Ring Pattern':
        uniforms.u_waveSpeed.value = 0.2;   // Very slow, like ripples
        uniforms.u_waveFrequency.value = 12.0; // Clear ring separation
        uniforms.u_contrast.value = 1.8;    // Sharp ring definition
        break;
        
      case '⚡ Electric Pulse':
        uniforms.u_waveSpeed.value = 8.0;   // Very fast pulsing
        uniforms.u_waveFrequency.value = 25.0; // Tight electric patterns
        uniforms.u_contrast.value = 1.9;    // High contrast for electric feel
        break;
        
      case '🎭 Drama Effect':
        uniforms.u_waveSpeed.value = 1.0;   // Moderate dramatic timing
        uniforms.u_waveFrequency.value = 6.0; // Bold, theatrical patterns
        uniforms.u_contrast.value = 1.5;    // Strong but not extreme contrast
        break;
    }
    
    Object.values(controls.bw).forEach(control => {
      if (control.updateDisplay) control.updateDisplay();
    });
  }

  function applyBlurPreset(presetName, uniforms) {
    
    switch(presetName) {
      case '📷 Portrait Mode':
        uniforms.u_blurIntensity.value = 3.0;
        uniforms.u_blurDirection.value = 0;
        uniforms.u_focusPoint.value = 0.5;
        uniforms.u_falloffRange.value = 0.3;
        uniforms.u_animationSpeed.value = 0.5;
        uniforms.u_colorShift.value = 0.0;
        break;
        
      case '🏃 Motion Blur':
        uniforms.u_blurIntensity.value = 7.0;
        uniforms.u_blurDirection.value = 45;
        uniforms.u_focusPoint.value = 0.7;
        uniforms.u_falloffRange.value = 0.8;
        uniforms.u_animationSpeed.value = 2.0;
        uniforms.u_colorShift.value = 0.3;
        break;
        
      case '🌊 Depth of Field':
        uniforms.u_blurIntensity.value = 5.0;
        uniforms.u_blurDirection.value = 0;
        uniforms.u_focusPoint.value = 0.3;
        uniforms.u_falloffRange.value = 0.5;
        uniforms.u_animationSpeed.value = 1.0;
        uniforms.u_colorShift.value = 0.1;
        break;
        
      case '🌀 Radial Blur':
        uniforms.u_blurIntensity.value = 6.0;
        uniforms.u_blurDirection.value = 180;
        uniforms.u_focusPoint.value = 0.5;
        uniforms.u_falloffRange.value = 0.7;
        uniforms.u_animationSpeed.value = 1.5;
        uniforms.u_colorShift.value = 0.5;
        break;
        
      case '🎨 Artistic Blur':
        uniforms.u_blurIntensity.value = 8.0;
        uniforms.u_blurDirection.value = 90;
        uniforms.u_focusPoint.value = 0.8;
        uniforms.u_falloffRange.value = 0.4;
        uniforms.u_animationSpeed.value = 2.5;
        uniforms.u_colorShift.value = 0.8;
        break;
    }
    
    Object.values(controls.blur).forEach(control => {
      if (control.updateDisplay) control.updateDisplay();
    });
  }

  function updateControlsVisibility(shaderName) {
    hideAllControls();
    if (shaderName === 'fragment_gradient') {
      showControls('gradient');
    } else if (shaderName === 'fragment_wave') {
      showControls('wave');
    } else if (shaderName === 'fragment_noise') {
      showControls('noise');
    } else if (shaderName === 'fragment_glitch') {
      showControls('glitch');
    } else if (shaderName === 'fragment_bw') {
      showControls('bw');
    } else if (shaderName === 'fragment_kaleidoscope') {
      showControls('kaleidoscope');
    } else if (shaderName === 'fragment_colorspace') {
      showControls('colorspace');
    } else if (shaderName === 'fragment_blur') {
      showControls('blur');
    } else {
      showControls('info');
    }
  }
  
  updateControlsVisibility(currentShaderRef.value);
  window.updateBenchmark = function(currentFps, frameTime) {
    benchmarkData.fps = parseFloat(currentFps.toFixed(1));
    benchmarkData.frameTime = parseFloat(frameTime.toFixed(2));
    benchmarkData.frameCount++;
    benchmarkData.isRealData = true;
    benchmarkData.lastUpdate = Date.now();
    
    if (advancedBenchmark.isRecording) {
      const now = performance.now();
      advancedBenchmark.metrics.fps.push(currentFps);
      advancedBenchmark.metrics.frameTime.push(frameTime);
      advancedBenchmark.frameCount++;
      advancedBenchmark.lastFrameTime = now;
      
      if (advancedBenchmark.frameCount % 30 === 0) {
        advancedBenchmark.measureMemoryUsage();
      }
    }
    
    if (benchmarkData.frameCount % 60 === 0) {
      const memUsage = advancedBenchmark.measureMemoryUsage();
      if (memUsage) {
        benchmarkData.memoryUsage = memUsage;
      }
    }
    
    if (currentFps < benchmarkData.minFps && currentFps > 0) {
      benchmarkData.minFps = parseFloat(currentFps.toFixed(1));
    }
    if (currentFps > benchmarkData.maxFps) {
      benchmarkData.maxFps = parseFloat(currentFps.toFixed(1));
    }
    
    const elapsedTime = (performance.now() - benchmarkData.startTime) / 1000;
    benchmarkData.avgFps = parseFloat((benchmarkData.frameCount / elapsedTime).toFixed(1));
    
    const currentShaderBench = benchmarkData.shaderBenchmarks[benchmarkData.currentShader];
    if (currentShaderBench) {
      currentShaderBench.frameCount++;
      currentShaderBench.isRealData = true;
      currentShaderBench.lastUpdate = Date.now();
      
      if (currentFps < currentShaderBench.minFps && currentFps > 0) {
        currentShaderBench.minFps = parseFloat(currentFps.toFixed(1));
      }
      if (currentFps > currentShaderBench.maxFps) {
        currentShaderBench.maxFps = parseFloat(currentFps.toFixed(1));
      }
      
      const shaderElapsedTime = (performance.now() - currentShaderBench.totalTime) / 1000;
      if (shaderElapsedTime > 0) {
        currentShaderBench.avgFps = parseFloat((currentShaderBench.frameCount / shaderElapsedTime).toFixed(1));
      }
    }
    
    if (benchmarkData.frameCount % 10 === 0) {
      benchmarkControls.currentFPS.updateDisplay();
      benchmarkControls.frameTime.updateDisplay();
      benchmarkControls.avgFPS.updateDisplay();
      benchmarkControls.minFPS.updateDisplay();
      benchmarkControls.maxFPS.updateDisplay();
      
      Object.keys(shaderPerformanceControls).forEach(shaderName => {
        const shaderBench = benchmarkData.shaderBenchmarks[shaderName];
        if (shaderBench && shaderBench.frameCount > 0) {
          shaderPerformanceControls[shaderName].object.value = shaderBench.avgFps;
          shaderPerformanceControls[shaderName].updateDisplay();
        }
      });
    }
  };
  
  return gui;
}
export async function benchmarkAllShaders(shaderPaths, loadShader, material, testDuration = 3000) {
  const benchmark = new ShaderBenchmark();
  const results = {};
  
  console.log('🧪 Starting automatic benchmark of all shaders...');
  
  for (const [shaderName, shaderPath] of Object.entries(shaderPaths)) {
    console.log(`📊 Testing shader: ${shaderName}`);
    
    // Switch to shader and measure switch time
    const startSwitch = performance.now();
    const fragmentShader = await loadShader(shaderPath);
    material.fragmentShader = fragmentShader;
    material.needsUpdate = true;
    const switchTime = performance.now() - startSwitch;
    
    // Start benchmark for this shader
    benchmark.startBenchmark();
    
    // Test for specified duration
    await new Promise(resolve => {
      const startTime = performance.now();
      
      function testFrame() {
        benchmark.recordFrame();
        
        if (performance.now() - startTime < testDuration) {
          requestAnimationFrame(testFrame);
        } else {
          resolve();
        }
      }
      
      testFrame();
    });
    
    // Get results for this shader
    const shaderResults = benchmark.stopBenchmark();
    results[shaderName] = {
      ...shaderResults,
      switchTime: switchTime,
      testDuration: testDuration / 1000
    };
    
    console.log(`✅ ${shaderName} tested - Avg FPS: ${shaderResults.fps.avg.toFixed(1)}`);
  }
  
  // Export comprehensive results
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10);
  const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, '-');
  const fileName = `REAL_Test_All_Shaders_${dateStr}_${timeStr}.json`;
  
  const report = {
    timestamp: now.toISOString(),
    dataValidity: 'REAL_TIME_AUTO_BENCHMARK_DATA',
    testDuration: testDuration / 1000,
    shadersTestedCount: Object.keys(shaderPaths).length,
    results: results,
    note: 'Automatic benchmark of all shaders - REAL PERFORMANCE DATA'
  };
  
  const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
  
  console.log('🎯 Auto-benchmark completed and exported!');
  return results;
} 