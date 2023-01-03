import { defineElement } from '@elements/elements/internal';
import { Time } from '@elements/elements/time';
import '@elements/elements/icon-button/define.js';
import '@elements/elements/forms/define.js';

defineElement('nve-time', Time);

declare global {
  interface HTMLElementTagNameMap {
    'nve-time': Time;
  }
}
