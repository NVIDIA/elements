import { defineElement } from '@elements/elements/internal';
import { Color } from '@elements/elements/color';
import '@elements/elements/icon-button/define.js';
import '@elements/elements/forms/define.js';

defineElement('nve-color', Color);

declare global {
  interface HTMLElementTagNameMap {
    'nve-color': Color;
  }
}
