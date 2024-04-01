import { define } from '@nvidia-elements/core/internal';
import { SortButton } from '@nvidia-elements/core/sort-button';
import '@nvidia-elements/core/icon/define.js';

define(SortButton);

declare global {
  interface HTMLElementTagNameMap {
    'nve-sort-button': SortButton;
  }
}
