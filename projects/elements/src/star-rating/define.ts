import { define } from '@nvidia-elements/core/internal';
import { StarRating } from '@nvidia-elements/core/star-rating';
import '@nvidia-elements/core/forms/define.js';

define(StarRating);

declare global {
  interface HTMLElementTagNameMap {
    'nve-star-rating': StarRating;
  }
}
