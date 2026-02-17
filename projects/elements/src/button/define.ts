import { define } from '@nvidia-elements/core/internal';
import { Button } from '@nvidia-elements/core/button';

define(Button);

declare global {
  interface HTMLElementTagNameMap {
    'nve-button': Button;
  }
}
