import { animate } from '@lit-labs/motion';

const defaults = {
  duration: '--mlv-ref-animation-duration-200',
  easing: '--mlv-ref-animation-easing-100'
};

export function animationFade(host: HTMLElement, keyframeOptions = defaults) {
  const value = parseFloat(getComputedStyleWithFallback(host, keyframeOptions.duration));
  const duration = value < 1 ? value * 1000 : value;
  const easing = getComputedStyleWithFallback(host, keyframeOptions.easing);

  return animate({
    skipInitial: true,
    properties: ['opacity'],
    keyframeOptions: {
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
