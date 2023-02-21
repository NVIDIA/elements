import { define } from '@elements/elements/internal';
import { Control, ControlGroup, ControlMessage } from '@elements/elements/forms';
import '@elements/elements/alert/define.js';
import '@elements/elements/icon/define.js';

define(Control);
define(ControlGroup);
define(ControlMessage);

declare global {
  interface HTMLElementTagNameMap {
    'nve-control': Control;
    'nve-control-group': ControlGroup;
    'nve-control-message': ControlMessage;
  }
}
