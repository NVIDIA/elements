import { defineElement } from '@elements/elements/internal';
import { Control, ControlGroup, ControlMessage } from '@elements/elements/forms';
import '@elements/elements/alert/define.js';
import '@elements/elements/icon/define.js';

defineElement('mlv-control', Control);
defineElement('mlv-control-group', ControlGroup);
defineElement('mlv-control-message', ControlMessage);

declare global {
  interface HTMLElementTagNameMap {
    'mlv-control': Control;
    'mlv-control-group': ControlGroup;
    'mlv-control-message': ControlMessage;
  }
}
