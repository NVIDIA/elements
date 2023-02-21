import { define } from '@elements/elements/internal';
import { Range } from '@elements/elements/range';
import '@elements/elements/forms/define.js';

define(Range);

declare global {
  interface HTMLElementTagNameMap {
    'mlv-range': Range;
  }
}
