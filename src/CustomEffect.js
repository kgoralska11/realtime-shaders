import { Effect } from 'postprocessing';
import fragment from './CustomEffectFragment.glsl';

export class CustomEffect extends Effect {
  constructor({ intensity = 1.0 } = {}) {
    super('CustomEffect', fragment, {
      uniforms: new Map([
        ['uIntensity', intensity]
      ])
    });
  }

  setIntensity(value) {
    this.uniforms.get('uIntensity').value = value;
  }
}
