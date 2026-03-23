import { define } from '@nvidia-elements/core/internal';
import { Dropzone } from '@nvidia-elements/core/dropzone';

define(Dropzone);

declare global {
  interface HTMLElementTagNameMap {
    'nve-dropzone': Dropzone;
  }
}
