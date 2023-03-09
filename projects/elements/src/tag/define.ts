import { define } from '@elements/elements/internal';
import { Tag } from '@elements/elements/tag';

define(Tag);

declare global {
  interface HTMLElementTagNameMap {
    'mlv-tag': Tag;
  }
}
