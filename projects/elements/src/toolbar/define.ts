import { define } from '@elements/elements/internal';
import { Toolbar } from '@elements/elements/toolbar';
import '@elements/elements/icon/define.js';

define(Toolbar);

declare global {
  interface HTMLElementTagNameMap {
    'mlv-toolbar': Toolbar;
  }
}
