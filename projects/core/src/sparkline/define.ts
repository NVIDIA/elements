import { define } from '@nvidia-elements/core/internal';
import { Sparkline } from '@nvidia-elements/core/sparkline';

define(Sparkline);

declare global {
  interface HTMLElementTagNameMap {
    'nve-sparkline': Sparkline;
  }
}
