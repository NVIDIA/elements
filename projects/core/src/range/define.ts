import { define } from '@nvidia-elements/core/internal';
import { Range } from '@nvidia-elements/core/range';
import '@nvidia-elements/core/forms/define.js';

define(Range);

declare global {
  interface HTMLElementTagNameMap {
    'nve-range': Range;
  }
}
