import { define } from '@elements/elements/internal';
import { Week } from '@elements/elements/week';
import '@elements/elements/icon-button/define.js';
import '@elements/elements/forms/define.js';

define(Week);

declare global {
  interface HTMLElementTagNameMap {
    'mlv-week': Week;
  }
}
