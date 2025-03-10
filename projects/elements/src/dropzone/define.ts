import { define } from '@nvidia-elements/core/internal';
import { Dropzone } from '@nvidia-elements/core/dropzone';
import '@nvidia-elements/core/icon/define.js';

define(Dropzone);

declare global {
  interface HTMLElementTagNameMap {
    'nve-dropzone': Dropzone;
  }
}
