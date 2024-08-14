import { define } from '@nvidia-elements/core/internal';
import { CopyButton } from '@nvidia-elements/core/copy-button';
import '@nvidia-elements/core/icon/define.js';
import '@nvidia-elements/core/toast/define.js';
import '@nvidia-elements/core/tooltip/define.js';

define(CopyButton);

declare global {
  interface HTMLElementTagNameMap {
    'nve-copy-button': CopyButton;
  }
}
