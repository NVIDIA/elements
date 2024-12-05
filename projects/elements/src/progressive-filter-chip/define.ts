import { define } from '@nvidia-elements/core/internal';
import { ProgressiveFilterChip } from '@nvidia-elements/core/progressive-filter-chip';
import '@nvidia-elements/core/icon-button/define.js';
import '@nvidia-elements/core/forms/define.js';
import '@nvidia-elements/core/input/define.js';
import '@nvidia-elements/core/select/define.js';
import '@nvidia-elements/core/date/define.js';

define(ProgressiveFilterChip);

declare global {
  interface HTMLElementTagNameMap {
    'nve-progressive-filter-chip': ProgressiveFilterChip;
    'nve-progressive-filter-chip': ProgressiveFilterChip /** @deprecated */;
  }
}
