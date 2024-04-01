import { define } from '@nvidia-elements/core/internal';
import { Control, ControlGroup, ControlMessage } from '@nvidia-elements/core/forms';
import '@nvidia-elements/core/alert/define.js';
import '@nvidia-elements/core/icon/define.js';

define(Control);
define(ControlGroup);
define(ControlMessage);

declare global {
  interface HTMLElementTagNameMap {
    'mlv-control': Control;
    'mlv-control-group': ControlGroup;
    'mlv-control-message': ControlMessage;
  }
}
