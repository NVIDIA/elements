import { define } from '@nvidia-elements/core/internal';
import { Badge } from '@nvidia-elements/core/badge';
import '@nvidia-elements/core/icon/define.js';

define(Badge);

declare global {
  interface HTMLElementTagNameMap {
    'mlv-badge': Badge;
  }
}
