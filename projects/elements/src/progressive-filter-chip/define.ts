import { define } from '@elements/elements/internal';
import { ProgressiveFilterChip } from '@elements/elements/progressive-filter-chip';
import '@elements/elements/icon-button/define.js';
import '@elements/elements/forms/define.js';
import '@elements/elements/input/define.js';
import '@elements/elements/select/define.js';
import '@elements/elements/date/define.js';

define(ProgressiveFilterChip);

declare global {
  interface HTMLElementTagNameMap {
    'nve-progressive-filter-chip': ProgressiveFilterChip;
  }
}
