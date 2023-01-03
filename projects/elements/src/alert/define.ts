import { Alert, AlertGroup } from '@elements/elements/alert';
import { defineElement } from '@elements/elements/internal';
import '@elements/elements/icon-button/define.js';
import '@elements/elements/icon/define.js';

defineElement('nve-alert', Alert);
defineElement('nve-alert-group', AlertGroup);

declare global {
  interface HTMLElementTagNameMap {
    'nve-alert': Alert;
    'nve-alert-group': AlertGroup;
  }
}
