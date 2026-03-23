import { define } from '@nvidia-elements/core/internal';
import { Badge } from '@nvidia-elements/core/badge';

define(Badge);

declare global {
  interface HTMLElementTagNameMap {
    'nve-badge': Badge;
  }
}
