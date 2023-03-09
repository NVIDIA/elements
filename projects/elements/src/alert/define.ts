import { Alert, AlertGroup, AlertBanner } from '@elements/elements/alert';
import { define } from '@elements/elements/internal';
import '@elements/elements/icon-button/define.js';
import '@elements/elements/icon/define.js';

define(Alert);
define(AlertGroup);
define(AlertBanner);

declare global {
  interface HTMLElementTagNameMap {
    'mlv-alert': Alert;
    'mlv-alert-group': AlertGroup;
    'mlv-alert-banner': AlertBanner;
  }
}
