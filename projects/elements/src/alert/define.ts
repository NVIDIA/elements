import { Alert, AlertGroup } from '@elements/elements/alert';
import { define } from '@elements/elements/internal';
import '@elements/elements/icon-button/define.js';
import '@elements/elements/icon/define.js';

define(Alert);
define(AlertGroup);

declare global {
  interface HTMLElementTagNameMap {
    'nve-alert': Alert;
    'nve-alert-group': AlertGroup;
  }
}
