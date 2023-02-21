import { define } from '@elements/elements/internal';
import { Date } from '@elements/elements/date';
import '@elements/elements/icon-button/define.js';
import '@elements/elements/forms/define.js';

define(Date);

declare global {
  interface HTMLElementTagNameMap {
    'mlv-date': Date;
  }
}
