import { define } from '@nvidia-elements/core/internal';
import { StepsItem, Steps } from '@nvidia-elements/core/steps';
import '@nvidia-elements/core/progress-ring/define.js';
import '@nvidia-elements/core/icon-button/define.js';

define(StepsItem);
define(Steps);

declare global {
  interface HTMLElementTagNameMap {
    'nve-steps-item': StepsItem;
    'nve-steps': Steps;
    'mlv-steps-item': StepsItem;
    'mlv-steps': Steps;
  }
}
