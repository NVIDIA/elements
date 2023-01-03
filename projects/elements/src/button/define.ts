import { defineElement } from '@elements/elements/internal';
import { Button } from '@elements/elements/button';

defineElement('nve-button', Button);

declare global {
  interface HTMLElementTagNameMap {
    'nve-button': Button;
  }
}
