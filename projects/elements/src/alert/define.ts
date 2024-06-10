import { Alert, AlertGroup, AlertBanner } from '@nvidia-elements/core/alert';
import { define } from '@nvidia-elements/core/internal';
import '@nvidia-elements/core/icon-button/define.js';
import '@nvidia-elements/core/icon/define.js';

define(Alert);
define(AlertGroup);
define(AlertBanner);

declare global {
  interface HTMLElementTagNameMap {
    'nve-alert': Alert;
    'nve-alert-group': AlertGroup;
    'nve-alert': Alert;
    'nve-alert-group': AlertGroup;
    'nve-alert-banner': AlertBanner;
  }
}
