import { define } from '@nvidia-elements/core/internal';
import { IconButton } from '@nvidia-elements/core/icon-button';
import '@nvidia-elements/core/icon/define.js';

define(IconButton);

declare global {
  interface HTMLElementTagNameMap {
    'nve-icon-button': IconButton;
    'nve-icon-button': IconButton;
  }
}
