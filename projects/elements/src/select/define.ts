import { define } from '@nvidia-elements/core/internal';
import { Select } from '@nvidia-elements/core/select';
import '@nvidia-elements/core/forms/define.js';

define(Select);

declare global {
  interface HTMLElementTagNameMap {
    'nve-select': Select;
  }
}
