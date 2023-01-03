import { defineElement } from '@elements/elements/internal';
import { IconButton } from '@elements/elements/icon-button';
import '@elements/elements/icon/define.js';

defineElement('mlv-icon-button', IconButton);

declare global {
  interface HTMLElementTagNameMap {
    'mlv-icon-button': IconButton;
  }
}
