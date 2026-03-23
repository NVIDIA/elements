import { define } from '@nvidia-elements/core/internal';
import { Time } from '@nvidia-elements/core/time';
import '@nvidia-elements/core/forms/define.js';

define(Time);

declare global {
  interface HTMLElementTagNameMap {
    'nve-time': Time;
  }
}
