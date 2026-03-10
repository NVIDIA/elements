import { define } from '@nvidia-elements/core/internal';
import { SortButton } from '@nvidia-elements/core/sort-button';

define(SortButton);

declare global {
  interface HTMLElementTagNameMap {
    'nve-sort-button': SortButton;
  }
}
