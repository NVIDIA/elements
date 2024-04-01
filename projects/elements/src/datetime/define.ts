import { define } from '@nvidia-elements/core/internal';
import { Datetime } from '@nvidia-elements/core/datetime';
import '@nvidia-elements/core/icon-button/define.js';
import '@nvidia-elements/core/forms/define.js';

define(Datetime);

declare global {
  interface HTMLElementTagNameMap {
    'nve-datetime': Datetime;
  }
}
