import { defineElement } from '@elements/elements/internal';
import { Week } from '@elements/elements/week';
import '@elements/elements/icon-button/define.js';
import '@elements/elements/forms/define.js';

defineElement('nve-week', Week);

declare global {
  interface HTMLElementTagNameMap {
    'nve-week': Week;
  }
}
