import * as THREE from 'three';

import { EffectComposer, RenderPass, EffectPass, BloomEffect } from 'postprocessing';
import { CustomEffect } from './CustomEffect.js';
import { createSimpleGUI } from './simpleGui.js';
import { loadShader } from './shaderLoader.js';
import { createAdaptiveSystem } from './adaptiveQuality.js';
import { createCompatibilityMonitor } from './compatibilityMonitor.js';
import { createShaderOptimizer } from './shaderOptimizer.js';
import { createSolutionSummary } from './problemSolutionSummary.js';
import { benchmarkAllShaders } from './simpleGui.js';
import './style.css';

const shaderPaths = {
  'fragment_gradient': '/shaders/fragment_gradient.glsl',
  'fragment_wave': '/shaders/fragment_wave.glsl',
  'fragment_bw': '/shaders/fragment_bw.glsl',
  'fragment_noise': '/shaders/fragment_noise.glsl',
  'fragment_glitch': '/shaders/fragment_glitch.glsl',
  'fragment_kaleidoscope': '/shaders/fragment_kaleidoscope.glsl',
  'fragment_colorspace': '/shaders/fragment_colorspace.glsl',
  'fragment_blur': '/shaders/fragment_blur.glsl'
};

const currentShaderNameRef = { value: 'fragment_gradient' };
let material;



async function init() {
  try {
    const canvas = document.querySelector('#canvas');
    if (!canvas) {
      throw new Error('Canvas not found!');
    }
    
    const renderer = new THREE.WebGLRenderer({ canvas });
    renderer.setSize(window.innerWidth, window.innerHeight);
    
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x111111);
    
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;
    
    const geometry = new THREE.BoxGeometry(2, 2, 2, 32, 32, 32);
    const cube = new THREE.Mesh(geometry, null);
    scene.add(cube);
    
    let vertexShader, fragmentShader;
    try {
      vertexShader = await loadShader('/shaders/vertexShader.glsl');
      fragmentShader = await loadShader(shaderPaths[currentShaderNameRef.value]);
    } catch (shaderError) {
      console.error('❌ Shader loading failed:', shaderError);
      throw shaderError;
    }
    
    material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        u_time: { value: 0.0 },
        u_colorSpeed: { value: 1.5 },
        u_gradientScale: { value: 0.1 },
        u_brightness: { value: 0.0 },
        u_contrast: { value: 1.1 },
        u_hueShift: { value: 1.0 },
        u_colorPalette: { value: 0.0 },
        u_waveFrequency: { value: 8.0 },
        u_waveAmplitude: { value: 0.6 },
        u_waveSpeed: { value: 1.5 },
        u_waveDirection: { value: 0.3 },
        u_colorIntensity: { value: 1.2 },
        u_noiseIntensity: { value: 1.5 },
        u_noiseScale: { value: 3.0 },
        u_animationSpeed: { value: 0.8 },
        u_colorMix: { value: 0.4 },
        u_glitchIntensity: { value: 0.4 },
        u_glitchFrequency: { value: 3.0 },
        u_colorSeparation: { value: 0.02 },
        u_blockSize: { value: 20.0 },
        u_scanlineIntensity: { value: 1.0 },
        u_noiseAmount: { value: 1.2 },
        u_segments: { value: 6.0 },
        u_rotationSpeed: { value: 1.0 },
        u_mirrorIntensity: { value: 0.8 },
        u_centerOffsetX: { value: 0.0 },
        u_centerOffsetY: { value: 0.0 },
        u_zoom: { value: 1.0 },
        u_saturation: { value: 1.0 },
        u_colorMode: { value: 0.0 },
        u_blurIntensity: { value: 2.0 },
        u_blurDirection: { value: 0.0 },
        u_focusPoint: { value: 0.5 },
        u_falloffRange: { value: 0.5 },
        u_colorShift: { value: 0.0 }
      }
    });
    
    cube.material = material;
    
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    
    const bloomEffect = new BloomEffect({
      intensity: 1.2,
      luminanceThreshold: 0.2
    });
    composer.addPass(new EffectPass(camera, bloomEffect));
    
    const customEffect = new CustomEffect({ intensity: 0.5 });
    composer.addPass(new EffectPass(camera, customEffect));
    
    const clock = new THREE.Clock();
    
    const cubeControls = {
      autoRotate: false,
      rotationSpeed: 1.0,
      resetRotation: () => {
        cube.rotation.set(0, 0, 0);
      }
    };
    
    try {
      createSimpleGUI(material, shaderPaths, loadShader, currentShaderNameRef, cubeControls, camera, cube);
    } catch (guiError) {
      console.warn('⚠️ GUI creation failed:', guiError);
    }

    const adaptiveSystem = createAdaptiveSystem();
    const compatibilityMonitor = createCompatibilityMonitor();
    const shaderOptimizer = createShaderOptimizer(material, loadShader, shaderPaths, currentShaderNameRef);
    const solutionSummary = createSolutionSummary();
    let isDragging = false;
    let isPanning = false;
    let previousMousePosition = { x: 0, y: 0 };

    canvas.addEventListener('mousedown', (event) => {
      if (event.button === 0) {
        isDragging = true;
      } else if (event.button === 2) {
        isPanning = true;
      }
      previousMousePosition = { x: event.clientX, y: event.clientY };
    });

    canvas.addEventListener('mousemove', (event) => {
      const deltaMove = {
        x: event.clientX - previousMousePosition.x,
        y: event.clientY - previousMousePosition.y
      };

      if (isDragging) {
        cube.rotation.y += deltaMove.x * 0.01;
        cube.rotation.x += deltaMove.y * 0.01;
      } else if (isPanning) {
        const panSpeed = 0.005;
        camera.position.x -= deltaMove.x * panSpeed;
        camera.position.y += deltaMove.y * panSpeed;
      }

      previousMousePosition = { x: event.clientX, y: event.clientY };
    });

    canvas.addEventListener('mouseup', (event) => {
      if (event.button === 0) {
        isDragging = false;
      } else if (event.button === 2) {
        isPanning = false;
      }
    });

    canvas.addEventListener('mouseleave', () => {
      isDragging = false;
      isPanning = false;
    });

    canvas.addEventListener('contextmenu', (event) => {
      event.preventDefault();
    });

    canvas.addEventListener('wheel', (event) => {
      event.preventDefault();
      const zoomSpeed = 0.1;
      const zoomFactor = event.deltaY > 0 ? 1 + zoomSpeed : 1 - zoomSpeed;
      camera.position.z *= zoomFactor;
      camera.position.z = Math.max(1, Math.min(20, camera.position.z));
    });
    let frameStartTime = performance.now();
    let previousQualityLevel = adaptiveSystem.manager.qualityLevel;
    
    function animate() {
      requestAnimationFrame(animate);
      
      const currentTime = performance.now();
      const deltaTime = currentTime - frameStartTime;
      frameStartTime = currentTime;
      const currentFPS = 1000 / deltaTime;
      
      adaptiveSystem.manager.updateFPS(currentFPS);
      compatibilityMonitor.trackShaderPerformance(currentShaderNameRef.value, currentFPS, deltaTime);
      
      if (typeof window.updateBenchmark === 'function') {
        window.updateBenchmark(currentFPS, deltaTime);
      }
      
      shaderOptimizer.optimizer.trackShaderPerformance(currentShaderNameRef.value, currentFPS, deltaTime);
      material.uniforms.u_time.value = clock.getElapsedTime();
      
      if (adaptiveSystem.manager.qualityLevel !== previousQualityLevel) {
        adaptiveSystem.manager.applyOptimalSettings(material, currentShaderNameRef.value);
        previousQualityLevel = adaptiveSystem.manager.qualityLevel;
      }
      
      if (cubeControls.autoRotate) {
        cube.rotation.x += 0.01 * cubeControls.rotationSpeed;
        cube.rotation.y += 0.01 * cubeControls.rotationSpeed;
      }
      
      composer.render();
    }
    
    window.addEventListener('resize', () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
      composer.setSize(window.innerWidth, window.innerHeight);
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
    });
    
    animate();
    
  } catch (error) {
    console.error('❌ Initialization failed:', error);
    const fallbackMaterial = new THREE.MeshBasicMaterial({ 
      color: 0xff0000, 
      wireframe: true 
    });
    
    const canvas = document.querySelector('#canvas');
    const renderer = new THREE.WebGLRenderer({ canvas });
    renderer.setSize(window.innerWidth, window.innerHeight);
    
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;
    
    const geometry = new THREE.BoxGeometry(2, 2, 2);
    const cube = new THREE.Mesh(geometry, fallbackMaterial);
    scene.add(cube);
    
    function fallbackAnimate() {
      requestAnimationFrame(fallbackAnimate);
      cube.rotation.x += 0.01;
      cube.rotation.y += 0.01;
      renderer.render(scene, camera);
    }
    fallbackAnimate();
  }
}

init(); 