import { define } from '@nvidia-elements/core/internal';
import { Select } from '@nvidia-elements/core/select';
import '@nvidia-elements/core/icon-button/define.js';
import '@nvidia-elements/core/forms/define.js';
import '@nvidia-elements/core/dropdown/define.js';
import '@nvidia-elements/core/menu/define.js';
import '@nvidia-elements/core/tag/define.js';

define(Select);

declare global {
  interface HTMLElementTagNameMap {
    'nve-select': Select;
    'nve-select': Select;
  }
}
