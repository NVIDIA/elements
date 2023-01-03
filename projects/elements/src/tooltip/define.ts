import { defineElement } from '@elements/elements/internal';
import { Tooltip } from '@elements/elements/tooltip';

defineElement('nve-tooltip', Tooltip);

declare global {
  interface HTMLElementTagNameMap {
    'nve-tooltip': Tooltip;
  }
}
