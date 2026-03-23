import { define } from '@nvidia-elements/core/internal';
import { ProgressiveFilterChip } from '@nvidia-elements/core/progressive-filter-chip';

define(ProgressiveFilterChip);

declare global {
  interface HTMLElementTagNameMap {
    'nve-progressive-filter-chip': ProgressiveFilterChip;
  }
}
