import { define } from '@elements/elements/internal';
import { AppHeader } from '@elements/elements/app-header';

define(AppHeader);

declare global {
  interface HTMLElementTagNameMap {
    'mlv-app-header': AppHeader;
  }
}
