import { define } from '@elements/elements/internal';
import { Input, InputGroup } from '@elements/elements/input';
import '@elements/elements/forms/define.js';

define(Input);
define(InputGroup);

declare global {
  interface HTMLElementTagNameMap {
    'mlv-input': Input;
    'mlv-input-group': InputGroup;
  }
}
