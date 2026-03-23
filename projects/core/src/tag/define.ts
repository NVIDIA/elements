import { define } from '@nvidia-elements/core/internal';
import { Tag } from '@nvidia-elements/core/tag';

define(Tag);

declare global {
  interface HTMLElementTagNameMap {
    'nve-tag': Tag;
  }
}
