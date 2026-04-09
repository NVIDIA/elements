import { define } from '@nvidia-elements/core/internal';
import { Date } from '@nvidia-elements/core/date';
import { Control, ControlGroup, ControlMessage } from '@nvidia-elements/core/forms';

define(Date);
define(Control);
define(ControlGroup);
define(ControlMessage);

declare global {
  interface HTMLElementTagNameMap {
    'nve-date': Date;
  }
}
