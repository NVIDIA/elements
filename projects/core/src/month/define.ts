import { define } from '@nvidia-elements/core/internal';
import { Month } from '@nvidia-elements/core/month';
import { Control, ControlGroup, ControlMessage } from '@nvidia-elements/core/forms';

define(Month);
define(Control);
define(ControlGroup);
define(ControlMessage);

declare global {
  interface HTMLElementTagNameMap {
    'nve-month': Month;
  }
}
