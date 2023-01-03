import { defineElement } from '@elements/elements/internal';
import { Button } from '@elements/elements/button';

defineElement('mlv-button', Button);

declare global {
  interface HTMLElementTagNameMap {
    'mlv-button': Button;
  }
}
