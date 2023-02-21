import { define } from '@elements/elements/internal';
import { Month } from '@elements/elements/month';
import '@elements/elements/icon-button/define.js';
import '@elements/elements/forms/define.js';

define(Month);

declare global {
  interface HTMLElementTagNameMap {
    'nve-month': Month;
  }
}
