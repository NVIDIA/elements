import { define } from '@elements/elements/internal';
import { ProgressBar } from '@elements/elements/progress-bar';

define(ProgressBar);

declare global {
  interface HTMLElementTagNameMap {
    'mlv-progress-bar': ProgressBar;
  }
}
