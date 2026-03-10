import { define } from '@nvidia-elements/core/internal';
import { IconButton } from '@nvidia-elements/core/icon-button';

define(IconButton);

declare global {
  interface HTMLElementTagNameMap {
    'nve-icon-button': IconButton;
  }
}
