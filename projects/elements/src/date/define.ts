import { defineElement } from '@elements/elements/internal';
import { Date } from '@elements/elements/date';
import '@elements/elements/icon-button/define.js';
import '@elements/elements/forms/define.js';

defineElement('nve-date', Date);

declare global {
  interface HTMLElementTagNameMap {
    'nve-date': Date;
  }
}
