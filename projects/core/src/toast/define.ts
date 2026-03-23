import { define } from '@nvidia-elements/core/internal';
import { Toast } from '@nvidia-elements/core/toast';

define(Toast);

declare global {
  interface HTMLElementTagNameMap {
    'nve-toast': Toast;
  }
}
