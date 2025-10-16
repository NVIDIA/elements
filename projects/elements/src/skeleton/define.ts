import { define } from '@nvidia-elements/core/internal';
import { Skeleton } from '@nvidia-elements/core/skeleton';

define(Skeleton);

declare global {
  interface HTMLElementTagNameMap {
    'nve-skeleton': Skeleton;
  }
}
