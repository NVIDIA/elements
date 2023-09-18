import { define } from '@elements/elements/internal';
import { ProgressRing } from '@elements/elements/progress-ring';
import '@elements/elements/icon/define.js';

define(ProgressRing);

declare global {
  interface HTMLElementTagNameMap {
    'mlv-progress-ring': ProgressRing;
  }
}
