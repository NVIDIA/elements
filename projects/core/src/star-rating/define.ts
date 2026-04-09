import { define } from '@nvidia-elements/core/internal';
import { StarRating } from '@nvidia-elements/core/star-rating';
import { Control, ControlGroup, ControlMessage } from '@nvidia-elements/core/forms';

define(StarRating);
define(Control);
define(ControlGroup);
define(ControlMessage);

declare global {
  interface HTMLElementTagNameMap {
    'nve-star-rating': StarRating;
  }
}
