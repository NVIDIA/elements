import { define } from '@elements/elements/internal';
import { Button } from '@elements/elements/button';

define(Button);

declare global {
  interface HTMLElementTagNameMap {
    'nve-button': Button;
  }
}
