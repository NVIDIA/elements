import { define } from '@nvidia-elements/core/internal';
import { Control, ControlGroup, ControlMessage } from '@nvidia-elements/core/forms';
import '@nvidia-elements/core/icon/define.js';

define(Control);
define(ControlGroup);
define(ControlMessage);

declare global {
  interface HTMLElementTagNameMap {
    'nve-control': Control;
    'nve-control-group': ControlGroup;
    'nve-control-message': ControlMessage;
    'nve-control': Control;
    'nve-control-group': ControlGroup;
    'nve-control-message': ControlMessage;
  }
}
