import { define } from '@nvidia-elements/core/internal';
import { Toolbar } from '@nvidia-elements/core/toolbar';
import '@nvidia-elements/core/icon/define.js';

define(Toolbar);

declare global {
  interface HTMLElementTagNameMap {
    'mlv-toolbar': Toolbar;
  }
}
