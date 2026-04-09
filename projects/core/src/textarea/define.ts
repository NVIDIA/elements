import { define } from '@nvidia-elements/core/internal';
import { Textarea } from '@nvidia-elements/core/textarea';
import { Control, ControlGroup, ControlMessage } from '@nvidia-elements/core/forms';

define(Textarea);
define(Control);
define(ControlGroup);
define(ControlMessage);

declare global {
  interface HTMLElementTagNameMap {
    'nve-textarea': Textarea;
  }
}
