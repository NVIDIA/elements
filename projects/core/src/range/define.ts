import { define } from '@nvidia-elements/core/internal';
import { Range } from '@nvidia-elements/core/range';
import { Control, ControlGroup, ControlMessage } from '@nvidia-elements/core/forms';

define(Range);
define(Control);
define(ControlGroup);
define(ControlMessage);

declare global {
  interface HTMLElementTagNameMap {
    'nve-range': Range;
  }
}
