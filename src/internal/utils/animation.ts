import { animate } from '@lit-labs/motion';

const defaults = {
  duration: '--mlv-ref-animation-duration-200',
  easing: '--mlv-ref-animation-easing-100'
};

export function animationFade(host: HTMLElement, keyframeOptions = defaults) {
  const styles = getComputedStyle(host);
  const options = {
    duration: parseFloat(styles.getPropertyValue(keyframeOptions.duration)),
    easing: styles.getPropertyValue(keyframeOptions.easing)
  };
  
  return animate({ properties: ['opacity'], keyframeOptions: options });
}
