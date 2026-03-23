import { define } from '@nvidia-elements/core/internal';
import { AppHeader } from '@nvidia-elements/core/app-header';

define(AppHeader);

declare global {
  interface HTMLElementTagNameMap {
    'nve-app-header': AppHeader;
  }
}
