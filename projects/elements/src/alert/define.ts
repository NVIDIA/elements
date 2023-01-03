import { Alert, AlertGroup } from '@elements/elements/alert';
import { defineElement } from '@elements/elements/internal';
import '@elements/elements/icon-button/define.js';
import '@elements/elements/icon/define.js';

defineElement('mlv-alert', Alert);
defineElement('mlv-alert-group', AlertGroup);

declare global {
  interface HTMLElementTagNameMap {
    'mlv-alert': Alert;
    'mlv-alert-group': AlertGroup;
  }
}
