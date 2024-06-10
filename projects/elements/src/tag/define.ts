import { define } from '@nvidia-elements/core/internal';
import { Tag } from '@nvidia-elements/core/tag';
import '@nvidia-elements/core/icon/define.js';

define(Tag);

declare global {
  interface HTMLElementTagNameMap {
    'nve-tag': Tag;
    'nve-tag': Tag;
  }
}
