import { define } from '@nvidia-elements/core/internal';
import { ProgressRing } from '@nvidia-elements/core/progress-ring';
import '@nvidia-elements/core/icon/define.js';

define(ProgressRing);

declare global {
  interface HTMLElementTagNameMap {
    'nve-progress-ring': ProgressRing;
    'nve-progress-ring': ProgressRing /** @deprecated */;
  }
}
