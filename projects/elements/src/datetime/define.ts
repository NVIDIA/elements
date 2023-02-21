import { define } from '@elements/elements/internal';
import { Datetime } from '@elements/elements/datetime';
import '@elements/elements/icon-button/define.js';
import '@elements/elements/forms/define.js';

define(Datetime);

declare global {
  interface HTMLElementTagNameMap {
    'mlv-datetime': Datetime;
  }
}
