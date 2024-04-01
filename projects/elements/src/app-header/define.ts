import { define } from '@nvidia-elements/core/internal';
import { AppHeader } from '@nvidia-elements/core/app-header';
import '@nvidia-elements/core/logo/define.js';

define(AppHeader);

declare global {
  interface HTMLElementTagNameMap {
    'mlv-app-header': AppHeader;
  }
}
