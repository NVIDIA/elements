import { defineElement } from '@elements/elements/internal';
import { Toast } from '@elements/elements/toast';
import '@elements/elements/icon-button/define.js';

defineElement('nve-toast', Toast);

declare global {
  interface HTMLElementTagNameMap {
    'nve-toast': Toast;
  }
}
