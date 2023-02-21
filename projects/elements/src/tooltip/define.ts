import { define } from '@elements/elements/internal';
import { Tooltip } from '@elements/elements/tooltip';

define(Tooltip);

declare global {
  interface HTMLElementTagNameMap {
    'mlv-tooltip': Tooltip;
  }
}
