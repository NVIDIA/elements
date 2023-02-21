import { define } from '@elements/elements/internal';
import { IconButton } from '@elements/elements/icon-button';
import '@elements/elements/icon/define.js';

define(IconButton);

declare global {
  interface HTMLElementTagNameMap {
    'mlv-icon-button': IconButton;
  }
}
