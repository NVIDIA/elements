import type { DirectiveResult } from 'lit/directive';
import { Animate, animate, Options } from '@lit-labs/motion';

export function animationFade(host: HTMLElement, options?: Options): DirectiveResult<typeof Animate> {
  const defaultOptions = {
    skipInitial: true,
    properties: ['opacity'],
    keyframeOptions: {
      duration: '--mlv-ref-animation-duration-200',
      easing: '--mlv-ref-animation-easing-100'
    },
    ...options
  };

  const value = parseFloat(getComputedStyleWithFallback(host, defaultOptions.keyframeOptions.duration as string));
  const duration = value < 1 ? value * 1000 : value;
  const easing = getComputedStyleWithFallback(host, defaultOptions.keyframeOptions.easing);

  return animate({
    ...defaultOptions,
    keyframeOptions: {
      ...defaultOptions.keyframeOptions,
      duration,
      easing
    }
  });
}

export function getComputedStyleWithFallback(element: HTMLElement, property: string) {
  const styles = getComputedStyle(element);
  const computedValue = styles.getPropertyValue(property);
  return computedValue?.length ? computedValue : element.style.getPropertyValue(property);
}
