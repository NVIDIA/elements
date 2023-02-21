import { define } from '@elements/elements/internal';
import { Toast } from '@elements/elements/toast';
import '@elements/elements/icon-button/define.js';

define(Toast);

declare global {
  interface HTMLElementTagNameMap {
    'mlv-toast': Toast;
  }
}
