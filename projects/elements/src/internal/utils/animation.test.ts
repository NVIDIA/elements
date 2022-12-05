import { describe, expect, it } from 'vitest';
import { animationFade, getComputedStyleWithFallback } from '@elements/elements/internal';

describe('animationFade', () => {
  it('should return a animation config object for lit animation', () => {
    const element = document.createElement('div');
    element.style.setProperty('--nve-ref-animation-duration-200', '200ms');
    element.style.setProperty('--nve-ref-animation-easing-100', 'ease-in-out');

    const keyframeOptions = (animationFade(element) as any).values[0].keyframeOptions;
    expect(keyframeOptions.duration).toEqual(200);
    expect(keyframeOptions.easing).toEqual('ease-in-out');
  });
});

describe('getComputedStyleWithFallback', () => {
  it('should return inline style value as fallback if no computed style was determined', () => {
    const element = document.createElement('div');
    element.style.setProperty('--test-value', 'hello');
    expect(getComputedStyleWithFallback(element, '--test-value')).toEqual('hello');
  });
});
