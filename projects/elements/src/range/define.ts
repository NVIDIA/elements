import { defineElement } from '@elements/elements/internal';
import { Range } from '@elements/elements/range';
import '@elements/elements/forms/define.js';

defineElement('nve-range', Range);

declare global {
  interface HTMLElementTagNameMap {
    'nve-range': Range;
  }
}
