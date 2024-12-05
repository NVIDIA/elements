import { define } from '@nvidia-elements/core/internal';
import { ProgressBar } from '@nvidia-elements/core/progress-bar';

define(ProgressBar);

declare global {
  interface HTMLElementTagNameMap {
    'nve-progress-bar': ProgressBar;
    'nve-progress-bar': ProgressBar /** @deprecated */;
  }
}
