import { define } from '@nvidia-elements/core/internal';
import { Week } from '@nvidia-elements/core/week';
import { Control, ControlGroup, ControlMessage } from '@nvidia-elements/core/forms';

define(Week);
define(Control);
define(ControlGroup);
define(ControlMessage);

declare global {
  interface HTMLElementTagNameMap {
    'nve-week': Week;
  }
}
