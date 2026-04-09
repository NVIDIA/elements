import { define } from '@nvidia-elements/core/internal';
import { Datetime } from '@nvidia-elements/core/datetime';
import { Control, ControlGroup, ControlMessage } from '@nvidia-elements/core/forms';

define(Datetime);
define(Control);
define(ControlGroup);
define(ControlMessage);

declare global {
  interface HTMLElementTagNameMap {
    'nve-datetime': Datetime;
  }
}
