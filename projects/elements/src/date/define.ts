import { define } from '@nvidia-elements/core/internal';
import { Date } from '@nvidia-elements/core/date';
import '@nvidia-elements/core/icon-button/define.js';
import '@nvidia-elements/core/forms/define.js';

define(Date);

declare global {
  interface HTMLElementTagNameMap {
    'nve-date': Date;
    'mlv-date': Date;
  }
}
