import { defineElement } from '@elements/elements/internal';
import { Range } from '@elements/elements/range';
import '@elements/elements/forms/define.js';

defineElement('mlv-range', Range);

declare global {
  interface HTMLElementTagNameMap {
    'mlv-range': Range;
  }
}
