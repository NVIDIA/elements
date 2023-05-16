import { define } from '@elements/elements/internal';
import { AppHeader } from '@elements/elements/app-header';
import '@elements/elements/logo/define.js';

define(AppHeader);

declare global {
  interface HTMLElementTagNameMap {
    'nve-app-header': AppHeader;
  }
}
