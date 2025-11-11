# Realtime Shaders

WebGL-based real-time shader visualization system with dynamic performance optimization and adaptive quality management.

## Demo

[📹 Watch Demo Video](https://drive.google.com/file/d/1jyZ2aFdR1PF6yhJQiLnFeiges9mWD-RS/view?usp=drive_link)

## Features

### Core Functionality
- **8 Real-time GLSL Shaders**: Blur, Kaleidoscope, Wave, Noise, Gradient, Glitch, Color Space, Black & White
- **Live Shader Optimization**: Automatic shader code optimization based on real-time performance metrics
- **Adaptive Quality System**: Dynamic resolution and quality adjustment to maintain target FPS
- **Interactive GUI**: Real-time parameter control for all shader effects
- **Performance Monitoring**: Live FPS, frame time, and memory usage tracking
- **WebGL Compatibility Detection**: Automatic feature detection and fallback handling

### Technical Features
- **Three.js Integration**: Modern 3D rendering engine
- **Postprocessing Pipeline**: Custom shader effects with the postprocessing library
- **Dynamic Shader Loading**: Hot-swappable GLSL shaders
- **Performance Analytics**: Detailed optimization reports and metrics export
- **Mobile Support**: Touch controls and performance-optimized rendering

## Installation

```bash
# Clone the repository
git clone https://github.com/kgoralska11/realtime-shaders.git
cd realtime-shaders

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:5173`

## Usage

### Basic Controls
1. **Shader Selection**: Use the dropdown menu to switch between different shaders
2. **Parameter Adjustment**: Each shader has unique parameters controllable via GUI sliders
3. **Performance Monitoring**: View real-time FPS, frame time, and memory usage in the stats panel
4. **Auto-Optimization**: Toggle automatic shader optimization when FPS drops below threshold

### Available Shaders

#### 1. Blur
High-quality blur effect with adjustable intensity and sample count.
- **Parameters**: Intensity (0-10), Samples (4-20)

#### 2. Kaleidoscope
Symmetric pattern generator with adjustable segments.
- **Parameters**: Segments (2-12), Rotation speed, Zoom

#### 3. Wave
Animated wave distortion with customizable amplitude and frequency.
- **Parameters**: Amplitude, Frequency, Speed, Direction

#### 4. Noise
Procedural noise generation with Perlin-style patterns.
- **Parameters**: Scale, Octaves, Persistence

#### 5. Gradient
Smooth color gradients with multiple blend modes.
- **Parameters**: Colors, Angle, Type (linear/radial)

#### 6. Glitch
Digital glitch effect with chromatic aberration and displacement.
- **Parameters**: Intensity, Frequency, Distortion

#### 7. Color Space
Color space transformations and manipulations.
- **Parameters**: Hue, Saturation, Brightness, Contrast

#### 8. Black & White
Grayscale conversion with adjustable contrast and grain.
- **Parameters**: Contrast, Grain, Vignette

## Performance Features

### Live Shader Optimization
The system automatically optimizes shader code when performance drops:
- **Precision Reduction**: Converts `highp` to `mediump` for better performance
- **Loop Optimization**: Reduces sample counts in expensive loops
- **Trigonometric Simplification**: Replaces expensive trig functions with approximations
- **Effect Reduction**: Disables secondary effects on low-end devices
- **Texture Optimization**: Adjusts texture filtering and mipmapping

### Adaptive Quality
Dynamic quality adjustment based on real-time performance:
- **Resolution Scaling**: Reduces render resolution to maintain FPS
- **Quality Levels**: Automatic switching between high/medium/low quality presets
- **Recovery System**: Gradually increases quality when performance improves

### Performance Monitoring
Comprehensive real-time metrics:
- **FPS**: Current, average, and minimum frame rate
- **Frame Time**: Milliseconds per frame
- **Memory**: Heap usage and geometry count
- **Optimization Events**: Live tracking of applied optimizations

## Project Structure

```
realtime-shaders/
├── public/
│   └── shaders/           # GLSL shader files
│       ├── vertexShader.glsl
│       ├── fragment_blur.glsl
│       ├── fragment_kaleidoscope.glsl
│       └── ...
├── src/
│   ├── main-fixed.js      # Main application entry point
│   ├── shaderOptimizer.js # Live shader optimization system
│   ├── adaptiveQuality.js # Dynamic quality management
│   ├── compatibilityMonitor.js # WebGL feature detection
│   ├── shaderLoader.js    # Dynamic shader loading
│   ├── simpleGui.js       # GUI controls
│   ├── CustomEffect.js    # Custom postprocessing effect
│   └── style.css          # Application styles
├── index.html             # Main HTML file
├── package.json           # Dependencies
└── vite.config.js         # Build configuration
```

## Dependencies

- **three.js** (^0.170.0): 3D rendering engine
- **postprocessing** (^6.36.6): Post-processing effects
- **vite** (^6.0.1): Build tool and dev server
- **vite-plugin-glsl** (^1.3.0): GLSL shader import support

## Browser Compatibility

- Chrome/Edge 90+
- Firefox 88+
- Safari 15+
- Mobile browsers with WebGL support

## Development

```bash
# Development server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Troubleshooting

### Low Performance
- Enable auto-optimization in the GUI
- Reduce shader complexity parameters
- Lower the render resolution
- Close other GPU-intensive applications

### WebGL Errors
- Check browser console for specific errors
- Verify WebGL support: visit https://get.webgl.org/
- Update graphics drivers
- Try a different browser

### Shader Not Loading
- Check browser console for compilation errors
- Verify GLSL syntax in shader files
- Ensure shader file paths are correct

## License

MIT License - see [LICENSE](LICENSE) file for details

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## Author

**kgoralska11**

## Acknowledgments

- Three.js community for the excellent 3D library
- postprocessing library for the effect framework
- GLSL shader community for inspiration and techniques
