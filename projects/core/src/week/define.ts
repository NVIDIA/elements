import { define } from '@nvidia-elements/core/internal';
import { Week } from '@nvidia-elements/core/week';
import '@nvidia-elements/core/forms/define.js';

define(Week);

declare global {
  interface HTMLElementTagNameMap {
    'nve-week': Week;
  }
}
