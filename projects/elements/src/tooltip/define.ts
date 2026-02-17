import { define } from '@nvidia-elements/core/internal';
import { Tooltip } from '@nvidia-elements/core/tooltip';

define(Tooltip);

declare global {
  interface HTMLElementTagNameMap {
    'nve-tooltip': Tooltip;
  }
}
