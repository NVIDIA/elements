import { defineElement } from '@elements/elements/internal';
import { Tooltip } from '@elements/elements/tooltip';

defineElement('mlv-tooltip', Tooltip);

declare global {
  interface HTMLElementTagNameMap {
    'mlv-tooltip': Tooltip;
  }
}
