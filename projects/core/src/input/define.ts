import { define } from '@nvidia-elements/core/internal';
import { Input, InputGroup } from '@nvidia-elements/core/input';
import { Control, ControlGroup, ControlMessage } from '@nvidia-elements/core/forms';

define(Input);
define(InputGroup);
define(Control);
define(ControlGroup);
define(ControlMessage);

declare global {
  interface HTMLElementTagNameMap {
    'nve-input': Input;
    'nve-input-group': InputGroup;
  }
}
