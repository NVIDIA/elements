import { define } from '@nvidia-elements/core/internal';
import { ResizeHandle } from '@nvidia-elements/core/resize-handle';

define(ResizeHandle);

declare global {
  interface HTMLElementTagNameMap {
    'nve-resize-handle': ResizeHandle;
  }
}
