import { define } from '@nvidia-elements/core/internal';
import { CopyButton } from '@nvidia-elements/core/copy-button';

define(CopyButton);

declare global {
  interface HTMLElementTagNameMap {
    'nve-copy-button': CopyButton;
  }
}
