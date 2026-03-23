import { define } from '@nvidia-elements/core/internal';
import { ProgressRing } from '@nvidia-elements/core/progress-ring';

define(ProgressRing);

declare global {
  interface HTMLElementTagNameMap {
    'nve-progress-ring': ProgressRing;
  }
}
