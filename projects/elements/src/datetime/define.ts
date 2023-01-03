import { defineElement } from '@elements/elements/internal';
import { Datetime } from '@elements/elements/datetime';
import '@elements/elements/icon-button/define.js';
import '@elements/elements/forms/define.js';

defineElement('mlv-datetime', Datetime);

declare global {
  interface HTMLElementTagNameMap {
    'mlv-datetime': Datetime;
  }
}
