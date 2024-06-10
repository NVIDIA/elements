import { define } from '@nvidia-elements/core/internal';
import { Month } from '@nvidia-elements/core/month';
import '@nvidia-elements/core/icon-button/define.js';
import '@nvidia-elements/core/forms/define.js';

define(Month);

declare global {
  interface HTMLElementTagNameMap {
    'nve-month': Month;
    'nve-month': Month;
  }
}
