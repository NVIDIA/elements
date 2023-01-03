import { defineElement } from '@elements/elements/internal';
import { Time } from '@elements/elements/time';
import '@elements/elements/icon-button/define.js';
import '@elements/elements/forms/define.js';

defineElement('mlv-time', Time);

declare global {
  interface HTMLElementTagNameMap {
    'mlv-time': Time;
  }
}
