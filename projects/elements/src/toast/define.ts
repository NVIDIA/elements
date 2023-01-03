import { defineElement } from '@elements/elements/internal';
import { Toast } from '@elements/elements/toast';
import '@elements/elements/icon-button/define.js';

defineElement('mlv-toast', Toast);

declare global {
  interface HTMLElementTagNameMap {
    'mlv-toast': Toast;
  }
}
