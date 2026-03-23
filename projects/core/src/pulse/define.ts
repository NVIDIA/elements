import { define } from '@nvidia-elements/core/internal';
import { Pulse } from '@nvidia-elements/core/pulse';

define(Pulse);

declare global {
  interface HTMLElementTagNameMap {
    'nve-pulse': Pulse;
  }
}
