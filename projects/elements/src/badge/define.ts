import { define } from '@elements/elements/internal';
import { Badge } from '@elements/elements/badge';
import '@elements/elements/icon/define.js';

define(Badge);

declare global {
  interface HTMLElementTagNameMap {
    'nve-badge': Badge;
  }
}
