import { define } from '@elements/elements/internal';
import { Tag } from '@elements/elements/tag';
import '@elements/elements/icon/define.js';

define(Tag);

declare global {
  interface HTMLElementTagNameMap {
    'mlv-tag': Tag;
  }
}
