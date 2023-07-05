import { define } from '@elements/elements/internal';
import { FilterChip } from '@elements/elements/filter-chip';
import '@elements/elements/icon-button/define.js';
import '@elements/elements/forms/define.js';
import '@elements/elements/input/define.js';
import '@elements/elements/select/define.js';
import '@elements/elements/date/define.js';

define(FilterChip);

declare global {
  interface HTMLElementTagNameMap {
    'mlv-filter-chip': FilterChip;
  }
}
