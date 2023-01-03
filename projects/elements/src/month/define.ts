import { defineElement } from '@elements/elements/internal';
import { Month } from '@elements/elements/month';
import '@elements/elements/icon-button/define.js';
import '@elements/elements/forms/define.js';

defineElement('mlv-month', Month);

declare global {
  interface HTMLElementTagNameMap {
    'mlv-month': Month;
  }
}
