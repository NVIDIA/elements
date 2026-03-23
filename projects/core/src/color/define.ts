import { define } from '@nvidia-elements/core/internal';
import { Color } from '@nvidia-elements/core/color';
import '@nvidia-elements/core/forms/define.js';

define(Color);

declare global {
  interface HTMLElementTagNameMap {
    'nve-color': Color;
  }
}
